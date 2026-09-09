'use strict';

/**
 * mermaid.js — Mermaid source → vector PDF, content-hash cached.
 *
 * Replaces the Kroki round-trip the old PDFKit generator used. Two things
 * change and both matter for print:
 *
 *   1. Output is a vector PDF, not a 2800px PNG. Diagram text stays crisp at
 *      any scale and the compiled book drops from ~135 MB to single-digit MB.
 *   2. mmdc renders in a real Chromium, so Mermaid's default HTML labels work.
 *      The `htmlLabels: false` workaround the Kroki path needed (librsvg does
 *      not paint `foreignObject`) is gone, and so are the diagrams it broke.
 *
 * The cache is keyed on a hash of the source plus the render config, so it
 * survives edits elsewhere in a post and invalidates when styling changes.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const FRONT_DIR = path.join(__dirname, '..', '..');
const CACHE_DIR = path.join(FRONT_DIR, 'output', 'pdf-cache', 'mermaid');
// Invoke mmdc's JS entry point through node rather than the `.bin` shim:
// Node 20+ refuses to `spawn` a Windows `.cmd` without a shell (EINVAL), and
// going through a shell would mean quoting paths that contain spaces.
const MMDC_CLI = path.join(FRONT_DIR, 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js');

/**
 * Print-oriented Mermaid config. The web theme is tuned for a dark-capable
 * screen; on paper we want black-on-white line art with generous type.
 */
const MERMAID_CONFIG = {
  theme: 'neutral',
  themeVariables: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '15px',
    primaryColor: '#f4f4f2',
    primaryTextColor: '#111111',
    primaryBorderColor: '#333333',
    lineColor: '#333333',
    secondaryColor: '#e8e8e4',
    tertiaryColor: '#fbfbfa',
    // Mermaid reads the xychart palette from themeVariables in some versions
    // and from the chart config in others; set both so the plot line is dark.
    xyChart: {
      backgroundColor: '#ffffff',
      titleColor: '#111111',
      xAxisLabelColor: '#111111',
      xAxisTitleColor: '#111111',
      xAxisLineColor: '#333333',
      yAxisLabelColor: '#111111',
      yAxisTitleColor: '#111111',
      yAxisLineColor: '#333333',
      plotColorPalette: '#1a1a1a',
    },
  },
  flowchart: { curve: 'basis', nodeSpacing: 40, rankSpacing: 46, padding: 12 },
  sequence: { actorMargin: 44, boxMargin: 10 },

  // quadrantChart and xychart size themselves from their own config, not from
  // mmdc's --width, and their defaults (500px and 700px) are too cramped for
  // the sentence-length labels the posts use: quadrant titles overlap across
  // the centre line and clip at the frame. Widening the chart is the only
  // lever that re-lays them out; scaling the figure on the page just scales
  // the overlap. Label font sizes rise with it so the text still lands legibly
  // once the figure is fitted to the measure.
  // Font sizes here are not scale-invariant the way a flowchart's are. A
  // flowchart sizes its nodes to their text, so raising the font enlarges the
  // whole drawing and the on-page result is unchanged after it is fitted to
  // the measure. These two charts have a fixed canvas, so a larger font really
  // does land larger on the page — which is why the point labels, the part a
  // reader actually needs, are set well above the chart's own defaults.
  // chartWidth is set per diagram by `quadrantChartWidth` below; the value
  // here is only the floor. Point labels are centred on their point with no
  // clamping to the frame, so they cannot go much above the quadrant label
  // size without the ones near an edge sliding outside the chart.
  quadrantChart: {
    chartWidth: 800, chartHeight: 620,
    titleFontSize: 26, quadrantLabelFontSize: 20,
    xAxisLabelFontSize: 22, yAxisLabelFontSize: 22, pointLabelFontSize: 20,
    quadrantTextTopPadding: 14, pointTextPadding: 12,
  },
  xyChart: {
    width: 1100, height: 560,
    titleFontSize: 26,
    xAxis: { labelFontSize: 22, titleFontSize: 24 },
    yAxis: { labelFontSize: 22, titleFontSize: 24 },
    // The default plot palette is a pale tint that all but disappears in print
    // — the data line was lighter than the axis rules on paper.
    plotColorPalette: '#1a1a1a',
  },
};

/**
 * Render profiles. `width` is the canvas Mermaid lays out on, and it is a
 * layout decision rather than a resolution one: the output is vector, so a
 * bigger canvas does not buy sharpness, it buys room. Chart kinds that place
 * unwrapped sentences as labels — quadrant titles above all — overlap and clip
 * on a narrow canvas, so they get a wide one plus a proportionally larger
 * font, to land at a readable size once the figure is scaled onto the page.
 */
const PROFILES = {
  default: { width: 800, fontSize: 15 },
  wide: { width: 1500, fontSize: 27 },
};

const WIDE_CANVAS_KINDS = new Set([
  'quadrantChart', 'timeline', 'gantt', 'journey', 'gitGraph', 'xychart-beta',
]);

function profileFor(kind) {
  return WIDE_CANVAS_KINDS.has(kind) ? 'wide' : 'default';
}

/**
 * A quadrant chart's canvas has to be wide enough for its longest quadrant
 * label, because Mermaid never wraps them: too narrow and the four titles
 * collide across the centre line and clip at the frame. But the canvas is also
 * the divisor for everything else — the figure gets fitted to the measure, so
 * a wider canvas means smaller text on the page. Sizing it per diagram lets a
 * chart with short labels keep a small canvas and read large, instead of every
 * chart paying for the longest label in the blog.
 */
function quadrantChartWidth(source) {
  const base = MERMAID_CONFIG.quadrantChart;
  const labels = [...source.matchAll(/^\s*quadrant-[1-4]\s+(.+)$/gm)].map((m) => m[1].trim());
  if (!labels.length) return base.chartWidth;
  const longest = Math.max(...labels.map((l) => l.length));
  // ~0.55em per character in the serif face, two quadrants across, plus padding.
  const needed = Math.ceil(longest * base.quadrantLabelFontSize * 0.55) * 2 + 120;
  return Math.min(1600, Math.max(base.chartWidth, needed));
}

function configFor(name, source) {
  const profile = PROFILES[name];
  const config = {
    ...MERMAID_CONFIG,
    themeVariables: { ...MERMAID_CONFIG.themeVariables, fontSize: `${profile.fontSize}px` },
  };
  if (source && diagramKind(source) === 'quadrantChart') {
    config.quadrantChart = { ...MERMAID_CONFIG.quadrantChart, chartWidth: quadrantChartWidth(source) };
  }
  return config;
}

/**
 * The diagram keyword, e.g. `flowchart`, `quadrantChart`, `sequenceDiagram`.
 * Some kinds carry long labels laid out relative to the chart box rather than
 * to the text, so they need the wide measure regardless of aspect ratio.
 */
function diagramKind(source) {
  for (const line of source.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('%%')) continue;
    return (t.match(/^([A-Za-z][\w-]*)/) || [])[1] || 'unknown';
  }
  return 'unknown';
}

/** Cache identity: the source plus the exact config it will be rendered with. */
function cacheKey(source, profileName) {
  return crypto
    .createHash('sha1')
    .update(source + JSON.stringify(configFor(profileName, source)) + PROFILES[profileName].width)
    .digest('hex')
    .slice(0, 24);
}

/**
 * Aspect ratio (width / height) read from the PDF MediaBox. The builder uses
 * it to decide whether a diagram sits in the text column, overhangs into the
 * margin, or gets a rotated page of its own — the single biggest factor in
 * whether a diagram is legible on paper.
 */
function aspectFromPdf(pdfPath) {
  const buf = fs.readFileSync(pdfPath, 'latin1');
  const m = buf.match(/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*\]/);
  if (!m) return null;
  const w = parseFloat(m[3]) - parseFloat(m[1]);
  const h = parseFloat(m[4]) - parseFloat(m[2]);
  if (!(w > 0 && h > 0)) return null;
  return { width: w, height: h, aspect: w / h };
}

/** One config file per distinct config, named by the cache key that produced it. */
function ensureConfigFile(name, source, key) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `config-${key}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(configFor(name, source), null, 2));
  }
  return file;
}

/**
 * Renders one diagram, returning `{ pdfPath, aspect, width, height }`, or null
 * if Mermaid could not parse it. A broken diagram must not abort a 15-post
 * book, so failures are reported and skipped.
 */
function renderDiagram(source, { quiet = false } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const kind = diagramKind(source);
  const profileName = profileFor(kind);
  const key = cacheKey(source, profileName);
  const pdfPath = path.join(CACHE_DIR, `${key}.pdf`);
  const metaPath = path.join(CACHE_DIR, `${key}.json`);

  if (fs.existsSync(pdfPath) && fs.existsSync(metaPath)) {
    try {
      return { pdfPath, kind, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) };
    } catch (_) { /* corrupt meta — fall through and re-render */ }
  }

  const srcPath = path.join(CACHE_DIR, `${key}.mmd`);
  fs.writeFileSync(srcPath, source, 'utf8');

  try {
    execFileSync(process.execPath, [
      MMDC_CLI,
      '--input', srcPath,
      '--output', pdfPath,
      '--configFile', ensureConfigFile(profileName, source, key),
      '--width', String(PROFILES[profileName].width),
      '--backgroundColor', 'white',
      '--pdfFit',
      '--quiet',
    ], { stdio: quiet ? 'ignore' : ['ignore', 'ignore', 'pipe'], timeout: 90_000 });
  } catch (e) {
    const detail = (e.stderr || '').toString().trim().split('\n').slice(-2).join(' ');
    console.warn(`  ! Mermaid render failed: ${detail || e.message}`);
    return null;
  }

  const dims = aspectFromPdf(pdfPath);
  if (!dims) {
    console.warn('  ! Mermaid PDF produced no readable MediaBox; skipping diagram');
    return null;
  }
  const meta = { ...dims, kind };
  fs.writeFileSync(metaPath, JSON.stringify(meta));
  fs.unlinkSync(srcPath);
  return { pdfPath, ...meta };
}

module.exports = { renderDiagram, diagramKind, quadrantChartWidth, CACHE_DIR };
