// Mermaid theme for blog diagrams, built on the visual identity
// (docs/brand.md › 10. Visual identity) and read from BRAND_COLORS, so the
// diagrams change when the brand does.
//
// A diagram is a graph, and the identity already says how graphs look:
// neutral nodes, harmonic (cobalt) edges, primary (cyan) for the one thing the
// paragraph is about. Contrast (amber) never appears: it belongs to the logo
// node and the period that closes a title. Authors mark emphasis with
// `:::accent` / `:::muted`, never with hex colours.
//
// Mermaid's `base` theme is the only one that honours every variable, and
// every diagram type gets a value so none falls back to Mermaid's pastels.

import { BRAND_COLORS, BRAND_FONTS } from '../../../../data/brand.js';

export const FONT_FAMILY = `"${BRAND_FONTS.sans}", system-ui, sans-serif`;
const MONO_FAMILY = `"${BRAND_FONTS.mono}", ui-monospace, monospace`;

// Series colours, for data charts only (pie, xychart, radar, git branches).
// Cyan and cobalt are neighbours by design, too close to tell two series
// apart, so charts get their own set: brand cyan and cobalt kept, separated by
// rose, with green as the fourth. Amber stays out. Checked for colour-vision
// deficiency on each surface. Four is the maximum: more series is a table.
const SERIES = {
  day: ['#0E7FA0', '#E11D48', '#3557D0', '#0E9A6E'],
  night: ['#0E9DBB', '#E8506A', '#5B7CF0', '#16A37A'],
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mix colour `a` into `b` by `t` (0 = b, 1 = a). */
const mix = (a, b, t) =>
  `#${hex(a).map((v, i) => Math.round(v * t + hex(b)[i] * (1 - t)).toString(16).padStart(2, '0')).join('')}`;

const palette = (isDark) => {
  const c = BRAND_COLORS[isDark ? 'night' : 'day'];
  return {
    ...c,
    // Nodes sit one lightness step above the canvas at night; by day they are
    // white on a white page and the hairline carries them.
    node: isDark ? c.surface : c.bg,
    cluster: isDark ? mix(c.surface, c.bg, 0.5) : c.surface,
    // The brand hairline is for dividers; node outlines need a little more.
    outline: mix(c.muted, c.border, isDark ? 0.3 : 0.25),
    accentFill: mix(c.primary, c.bg, isDark ? 0.14 : 0.08),
    harmonicFill: mix(c.harmonic, c.bg, isDark ? 0.14 : 0.08),
    series: SERIES[isDark ? 'night' : 'day'],
  };
};

/** First keyword of a Mermaid source, e.g. `flowchart`, `timeline`, `radar-beta`. */
export const diagramType = (source) => {
  const line = source
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('%%'));
  return line ? line.split(/\s/)[0] : '';
};

const indexed = (prefix, values, count = values.length) =>
  Object.fromEntries(Array.from({ length: count }, (_, i) => [`${prefix}${i}`, values[i % values.length]]));

const themeCss = (p) => `
  .node rect, .node polygon, .node path, .node circle { stroke-width: 1px; }
  .node rect { rx: 8px; ry: 8px; }
  .cluster rect { rx: 12px; ry: 12px; stroke-width: 1px; }
  .cluster-label .nodeLabel, .cluster span { font-family: ${MONO_FAMILY}; font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: ${p.muted} !important; }
  .edgeLabel, .edgeLabel p, .edgeLabel span { font-size: 12px; color: ${p.muted}; }
  .edgeLabel rect { fill: ${p.bg} !important; opacity: 1 !important; }
  .labelBkg, .edgeLabel p { background-color: ${p.bg} !important; }
  .flowchart-link { stroke-width: 1.25px; }
  .nodeLabel small { font-size: 12px; color: ${p.muted}; }
  .node.accent rect, .node.accent polygon, .node.accent circle, .node.accent path { fill: ${p.accentFill} !important; stroke: ${p.primary} !important; }
  .node.accent .nodeLabel { color: ${p.text} !important; }
  .node.muted rect, .node.muted polygon { fill: ${p.cluster} !important; stroke-dasharray: 4 3; }
  .node.muted .nodeLabel { color: ${p.muted} !important; }
  .actor { stroke-width: 1px; }
  .messageText { fill: ${p.text}; font-size: 13px; }
  .timeline-node .node-bkg { rx: 8px; }
  .nodeLabel > div[style*="flex"] { flex-direction: column; gap: 2px; }
  .nodeLabel .katex-display { margin: 0; }
  .nodeLabel .katex { font-size: 1.05em; }
`;

/**
 * Mermaid config for one colour mode and one diagram type.
 * @param {boolean} isDark
 * @param {string} type  result of diagramType()
 */
export const getMermaidConfig = (isDark, type = '') => {
  const p = palette(isDark);
  // Filled regions (mindmap branches, kanban, treemap, journey): the two
  // brand hues in turn, as tints, so text on top keeps full contrast.
  let sections = [p.accentFill, p.harmonicFill];
  // Timeline: one hue that deepens with time.
  if (type === 'timeline') {
    sections = Array.from({ length: 8 }, (_, i) => mix(p.primary, p.bg, (isDark ? 0.08 : 0.05) + i * 0.035));
  }
  if (type === 'radar-beta') sections = p.series;

  const themeVariables = {
    darkMode: isDark,
    background: p.bg,
    fontFamily: FONT_FAMILY,
    fontSize: '14px',
    primaryColor: p.node, primaryTextColor: p.text, primaryBorderColor: p.outline,
    secondaryColor: p.cluster, secondaryTextColor: p.text, secondaryBorderColor: p.outline,
    tertiaryColor: p.cluster, tertiaryTextColor: p.text, tertiaryBorderColor: p.border,
    mainBkg: p.node, nodeBorder: p.outline, nodeTextColor: p.text, textColor: p.text,
    lineColor: p.harmonic, defaultLinkColor: p.harmonic, arrowheadColor: p.harmonic,
    clusterBkg: p.cluster, clusterBorder: p.border, titleColor: p.muted,
    edgeLabelBackground: p.bg,
    // sequence
    actorBkg: p.node, actorBorder: p.outline, actorTextColor: p.text, actorLineColor: p.border,
    signalColor: p.harmonic, signalTextColor: p.text, labelBoxBkgColor: p.cluster, labelBoxBorderColor: p.outline,
    labelTextColor: p.text, loopTextColor: p.muted, noteBkgColor: p.accentFill, noteBorderColor: p.primary,
    noteTextColor: p.text, activationBkgColor: p.accentFill, activationBorderColor: p.primary,
    sequenceNumberColor: p.bg,
    // state, class, er
    labelColor: p.text, altBackground: p.cluster, compositeBackground: p.cluster, compositeTitleBackground: p.cluster,
    specialStateColor: p.muted, innerEndBackground: p.muted,
    transitionColor: p.harmonic, transitionLabelColor: p.muted,
    classText: p.text, attributeBackgroundColorOdd: p.node, attributeBackgroundColorEven: p.cluster,
    relationColor: p.harmonic, relationLabelColor: p.muted, relationLabelBackground: p.bg,
    // sections: timeline, mindmap, kanban, treemap, radar
    ...indexed('cScale', sections, 12),
    ...indexed('cScaleLabel', [p.text], 12),
    ...indexed('cScalePeer', [p.outline], 12),
    ...indexed('cScaleInv', [p.primary], 12),
    // pie
    ...Object.fromEntries(p.series.map((c, i) => [`pie${i + 1}`, c])),
    pieStrokeColor: p.bg, pieStrokeWidth: '2px', pieOuterStrokeColor: p.border, pieOuterStrokeWidth: '1px',
    pieTitleTextColor: p.text, pieSectionTextColor: '#FFFFFF', pieLegendTextColor: p.text,
    // git
    ...indexed('git', p.series, 8),
    ...indexed('gitBranchLabel', ['#FFFFFF'], 8),
    commitLabelColor: p.text, commitLabelBackground: p.cluster,
    tagLabelColor: p.text, tagLabelBackground: p.cluster, tagLabelBorder: p.outline,
    // quadrant: the first quadrant is the one that matters
    quadrant1Fill: p.accentFill, quadrant2Fill: p.cluster, quadrant3Fill: p.cluster, quadrant4Fill: p.cluster,
    quadrant1TextFill: p.text, quadrant2TextFill: p.muted, quadrant3TextFill: p.muted, quadrant4TextFill: p.muted,
    quadrantPointFill: p.primary, quadrantPointTextFill: p.text,
    quadrantXAxisTextFill: p.muted, quadrantYAxisTextFill: p.muted,
    quadrantInternalBorderStrokeFill: p.outline, quadrantExternalBorderStrokeFill: p.outline, quadrantTitleFill: p.text,
    // journey
    ...indexed('fillType', sections, 8),
    xyChart: {
      backgroundColor: p.bg, titleColor: p.text,
      xAxisLabelColor: p.muted, xAxisTitleColor: p.muted, xAxisTickColor: p.border, xAxisLineColor: p.border,
      yAxisLabelColor: p.muted, yAxisTitleColor: p.muted, yAxisTickColor: p.border, yAxisLineColor: p.border,
      plotColorPalette: p.series.join(','),
    },
    radar: { curveOpacity: 0.12, curveStrokeWidth: 2, graticuleColor: p.border, graticuleOpacity: 0.8, axisColor: p.outline, axisStrokeWidth: 1 },
    packet: { startByteColor: p.muted, endByteColor: p.muted, labelColor: p.text, titleColor: p.muted, blockStrokeColor: p.outline, blockFillColor: p.accentFill },
  };

  return {
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: FONT_FAMILY,
    // KaTeX HTML output, styled by the same katex.css as the post's own math.
    forceLegacyMathML: true,
    themeVariables,
    themeCSS: themeCss(p),
    flowchart: { htmlLabels: true, curve: 'basis', padding: 16, nodeSpacing: 40, rankSpacing: 48, wrappingWidth: 220 },
    sequence: { mirrorActors: false, actorMargin: 60, messageFontSize: 13, noteFontSize: 13, boxMargin: 8 },
    sankey: { showValues: true, linkColor: 'gradient', nodeAlignment: 'justify' },
    xyChart: { width: 720, height: 360 },
    quadrantChart: { chartWidth: 520, chartHeight: 520, pointRadius: 6, pointLabelFontSize: 12, quadrantLabelFontSize: 14 },
  };
};
