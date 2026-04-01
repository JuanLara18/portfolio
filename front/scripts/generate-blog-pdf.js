#!/usr/bin/env node
'use strict';

/**
 * generate-blog-pdf.js
 *
 * Compiles every blog post into a single, professionally formatted PDF.
 *
 * Usage:  node scripts/generate-blog-pdf.js
 * npm:    npm run generate-pdf
 * Output: output/blog-compilation.pdf
 *
 * Architecture (designed for incremental improvement):
 *   1. loadPosts()        – reads .md files, parses front-matter
 *   2. tokenizeBlocks()   – lightweight Markdown → block-token array
 *   3. tokenizeInline()   – inline spans (bold, italic, code, links)
 *   4. render*()          – PDFKit drawing for each token type
 *   5. add*()             – high-level page builders (cover, TOC, chapters)
 *
 * Future improvements you can plug in:
 *   - Embed actual images (resolve from /blog/images/...)
 *   - Render LaTeX math via KaTeX → SVG → PDFKit .svg()
 *   - Render Mermaid diagrams via headless browser → SVG
 *   - Use custom fonts (Inter, JetBrains Mono) via .registerFont()
 *   - Two-pass TOC for multi-page table of contents
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const matter = require('gray-matter');

let PDFDocument, hljs, htmlEntities;
let mathjax, TeX, SVG, liteAdaptor, RegisterHTMLHandler;
try {
  PDFDocument = require('pdfkit');
  hljs = require('highlight.js');
  htmlEntities = require('html-entities');
  const mj = require('mathjax-full/js/mathjax.js');
  mathjax = mj.mathjax;
  TeX = require('mathjax-full/js/input/tex.js').TeX;
  SVG = require('mathjax-full/js/output/svg.js').SVG;
  liteAdaptor = require('mathjax-full/js/adaptors/liteAdaptor.js').liteAdaptor;
  RegisterHTMLHandler = require('mathjax-full/js/handlers/html.js').RegisterHTMLHandler;
} catch (e) {
  console.error('Missing dependencies. Run: npm install --save-dev pdfkit mathjax-full html-entities sharp');
  console.error(e);
  process.exit(1);
}

// ─── MathJax init ─────────────────────────────────────────────────────────────
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const texInput = new TeX({ packages: ['base', 'ams'] });
const svgOutput = new SVG({ fontCache: 'local' });
const htmlMath = mathjax.document('', { InputJax: texInput, OutputJax: svgOutput });

function renderMathSVG(mathStr, display) {
  try {
    const node = htmlMath.convert(mathStr, { display });
    return adaptor.innerHTML(node);
  } catch (e) {
    return null;
  }
}

// Rasterize MathJax SVG with sharp — svg-to-pdfkit mis-handles MathJax (black bars).
let G_MATH_DISPLAY = new Map();
let G_MATH_INLINE = new Map();

function sanitizeSvgXmlForSharp(svg) {
  // libxml2 (used by sharp/librsvg) rejects bare "&" in SVG; MathJax sometimes emits them.
  return svg.replace(
    /&(?!#(?:[0-9]+|[xX][0-9a-fA-F]+);|(?:amp|lt|gt|quot|apos);)/g,
    '&amp;',
  );
}

async function rasterizeMathSvg(svgString, opts = {}) {
  const sharp = require('sharp');
  const {
    maxWidthPx,
    paddingPx = 16,
    density = 320,
  } = opts;
  let svg = svgString.replace(/currentColor/g, '#1a1a1a');
  svg = sanitizeSvgXmlForSharp(svg);
  return sharp(Buffer.from(svg, 'utf8'), { density })
    .resize({ width: maxWidthPx, height: null, fit: 'inside', withoutEnlargement: false })
    .trim({ threshold: 1, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: paddingPx,
      right: paddingPx,
      bottom: paddingPx,
      left: paddingPx,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function prerenderMath(posts) {
  const display = new Set();
  const inline = new Set();
  for (const post of posts) {
    for (const t of tokenizeBlocks(post.content)) {
      if (t.type === 'math') display.add(t.text.trim());
    }
    const noBlock = post.content.replace(/\$\$[\s\S]*?\$\$/g, '');
    const re = /\$([^$]+)\$/g;
    let m;
    while ((m = re.exec(noBlock)) !== null) {
      const s = m[1].trim();
      if (s) inline.add(s);
    }
  }
  const displayMap = new Map();
  const inlineMap = new Map();
  if (display.size || inline.size) {
    console.log(`  Rasterizing ${display.size} display + ${inline.size} inline math expression(s)...`);
  }
  for (const s of display) {
    const svg = renderMathSVG(s, true);
    if (svg) {
      try {
        displayMap.set(s, await rasterizeMathSvg(svg, { maxWidthPx: 2400, paddingPx: 22, density: 240 }));
      } catch (e) {
        console.warn(`  ⚠ Display math rasterize failed: ${e.message}`);
      }
    }
  }
  for (const s of inline) {
    const svg = renderMathSVG(s, false);
    if (svg) {
      try {
        inlineMap.set(s, await rasterizeMathSvg(svg, { maxWidthPx: 960, paddingPx: 14, density: 240 }));
      } catch (e) {
        console.warn(`  ⚠ Inline math rasterize failed: ${e.message}`);
      }
    }
  }
  return { display: displayMap, inline: inlineMap };
}

// ─── Mermaid via Kroki.io ─────────────────────────────────────────────────────
const MERMAID_CACHE_DIR = path.join(__dirname, '..', 'output', '.mermaid-cache');

function mermaidCacheKey(code) {
  // Simple hash for the cache filename
  let h = 0;
  for (let i = 0; i < code.length; i++) { h = (Math.imul(31, h) + code.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

// Fetch a Mermaid diagram as a PNG buffer directly from Kroki's /mermaid/png endpoint.
// Kroki renders with a headless browser, so foreignObject HTML labels render correctly.
async function fetchMermaidPNG(code) {
  fs.mkdirSync(MERMAID_CACHE_DIR, { recursive: true });
  const key = mermaidCacheKey(code);
  const pngCachePath = path.join(MERMAID_CACHE_DIR, `${key}.png`);

  if (fs.existsSync(pngCachePath)) {
    return fs.readFileSync(pngCachePath);
  }

  const body = Buffer.from(code, 'utf8');
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'kroki.io',
        path: '/mermaid/png',
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'Content-Length': body.length },
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          if (res.statusCode === 200) {
            const png = Buffer.concat(chunks);
            fs.writeFileSync(pngCachePath, png);
            resolve(png);
          } else {
            console.warn(`  ⚠ Kroki ${res.statusCode}: ${Buffer.concat(chunks).toString('utf8').slice(0, 120)}`);
            resolve(null);
          }
        });
      }
    );
    req.on('error', (e) => { console.warn(`  ⚠ Mermaid fetch failed: ${e.message}`); resolve(null); });
    req.on('timeout', () => { req.destroy(); console.warn('  ⚠ Mermaid fetch timed out'); resolve(null); });
    req.write(body);
    req.end();
  });
}

async function prerenderMermaid(posts) {
  // cache stores PNG Buffers keyed by diagram source code
  const cache = new Map();
  const allCodes = [];
  for (const post of posts) {
    for (const token of tokenizeBlocks(post.content)) {
      if (token.type === 'code' && token.lang === 'mermaid'
          && !cache.has(token.text) && !allCodes.includes(token.text)) {
        allCodes.push(token.text);
      }
    }
  }
  if (!allCodes.length) return cache;

  console.log(`  Rendering ${allCodes.length} Mermaid diagram(s) via Kroki.io...`);
  fs.mkdirSync(MERMAID_CACHE_DIR, { recursive: true });

  for (const code of allCodes) {
    // Fetch PNG directly from Kroki (handles caching internally)
    try {
      const png = await fetchMermaidPNG(code);
      cache.set(code, png || null);
    } catch (e) {
      console.warn(`  ⚠ Mermaid fetch failed: ${e.message}`);
      cache.set(code, null);
    }
  }
  return cache;
}

// ─── Paths ─────────────────────────────────────────────────────────────────────

const BLOG_DIR = path.join(__dirname, '..', 'public', 'blog', 'posts');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'blog-compilation.pdf');

// ─── Style Configuration ───────────────────────────────────────────────────────
// Change any value here to adjust the entire PDF look in one place.

const M = { top: 72, bottom: 72, left: 72, right: 72 };

const DEFAULT_FONTS = {
  h: 'Helvetica-Bold',
  b: 'Helvetica',
  B: 'Helvetica-Bold',
  i: 'Helvetica-Oblique',
  bi: 'Helvetica-BoldOblique',
  m: 'Courier',
  mB: 'Courier-Bold',
};

let F = { ...DEFAULT_FONTS };

function fontCandidates(...parts) {
  return parts.filter(Boolean);
}

const PDF_FONT_FILES = {
  h: {
    name: 'PdfHeading',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'arialbd.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Arial Bold.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ),
  },
  b: {
    name: 'PdfBody',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'arial.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Arial.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ),
  },
  B: {
    name: 'PdfBodyBold',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'arialbd.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Arial Bold.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ),
  },
  i: {
    name: 'PdfBodyItalic',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'ariali.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Arial Italic.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf',
    ),
  },
  bi: {
    name: 'PdfBodyBoldItalic',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'arialbi.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf',
    ),
  },
  m: {
    name: 'PdfMono',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'consola.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Courier New.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
    ),
  },
  mB: {
    name: 'PdfMonoBold',
    paths: fontCandidates(
      process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', 'consolab.ttf') : null,
      process.platform === 'darwin' ? '/System/Library/Fonts/Supplemental/Courier New Bold.ttf' : null,
      '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
    ),
  },
};

function resolveExistingFontPath(paths) {
  return paths.find((p) => fs.existsSync(p)) || null;
}

function registerPdfFonts(doc) {
  const resolvedFonts = { ...DEFAULT_FONTS };
  const embedded = [];

  for (const [key, config] of Object.entries(PDF_FONT_FILES)) {
    const fontPath = resolveExistingFontPath(config.paths);
    if (!fontPath) continue;
    doc.registerFont(config.name, fontPath);
    resolvedFonts[key] = config.name;
    embedded.push(path.basename(fontPath));
  }

  if (embedded.length) {
    console.log(`  Embedded PDF fonts: ${embedded.join(', ')}`);
  } else {
    console.warn('  Warning: no embeddable system fonts found, falling back to PDF core fonts.');
  }

  return resolvedFonts;
}

const S = {
  coverTitle: 36, coverSub: 14, coverDate: 11,
  catTitle: 28,
  postTitle: 24, postMeta: 10,
  h2: 18, h3: 15, h4: 13, h5: 11, h6: 10.5,
  body: 11, code: 9, quote: 11, li: 11,
  tocCat: 14, tocEntry: 11,
  footer: 9,
};

const C = {
  dark: '#0f172a',
  heading: '#111827',
  body: '#374151',
  muted: '#6b7280',
  link: '#2563eb',
  code: '#1f2937',
  codeBg: '#f3f4f6',
  codeBorder: '#d1d5db',
  qBorder: '#3b82f6',
  qText: '#4b5563',
  accent: '#2563eb',
  white: '#ffffff',
  hr: '#e5e7eb',
};

const CATEGORIES = {
  order: ['field-notes', 'research', 'curiosities'],
  labels: {
    'field-notes': 'Field Notes',
    research: 'Research',
    curiosities: 'Curiosities',
  },
  descriptions: {
    'field-notes':
      'Practical engineering notes, guides, and real-world implementation experiences.',
    research:
      'Deep dives into research papers, architectures, and theoretical foundations.',
    curiosities:
      'Mathematical curiosities, thought experiments, and explorations.',
  },
};

// ─── Blog Post Loading ─────────────────────────────────────────────────────────

function loadPosts() {
  const posts = [];
  if (!fs.existsSync(BLOG_DIR)) return posts;

  for (const entry of fs.readdirSync(BLOG_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const category = entry.name;
    const catPath = path.join(BLOG_DIR, category);

    for (const file of fs.readdirSync(catPath).filter((f) => f.endsWith('.md'))) {
      try {
        const raw = fs.readFileSync(path.join(catPath, file), 'utf8');
        const { data, content } = matter(raw);
        if (!data.title) continue;
        posts.push({
          ...data,
          content,
          slug: file.replace('.md', ''),
          category,
          readingTime: Math.ceil(content.trim().split(/\s+/).length / 200),
        });
      } catch (e) {
        console.warn(`  ⚠ Skipping ${file}: ${e.message}`);
      }
    }
  }

  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return posts;
}

// ─── Markdown Block Tokenizer ──────────────────────────────────────────────────

function tokenizeBlocks(md) {
  const lines = md.split('\n');
  const tokens = [];
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') { i++; continue; }

    // ── Code fence ──
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const buf = [];
      i++;
      while (i < n && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++; }
      if (i < n) i++;
      tokens.push({ type: 'code', lang, text: buf.join('\n') });
      continue;
    }

    // ── Display math ($$…$$) ──
    if (trimmed.startsWith('$$')) {
      if (trimmed.endsWith('$$') && trimmed.length > 4) {
        tokens.push({ type: 'math', text: trimmed.slice(2, -2).trim() });
        i++; continue;
      }
      const buf = [];
      i++;
      while (i < n && !lines[i].trim().startsWith('$$')) { buf.push(lines[i]); i++; }
      if (i < n) i++;
      tokens.push({ type: 'math', text: buf.join('\n').trim() });
      continue;
    }

    // ── Heading ──
    const hm = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hm) { tokens.push({ type: 'heading', level: hm[1].length, text: hm[2] }); i++; continue; }

    // ── HR ──
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { tokens.push({ type: 'hr' }); i++; continue; }

    // ── Standalone image ──
    const imgM = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgM) { tokens.push({ type: 'image', alt: imgM[1], src: imgM[2] }); i++; continue; }

    // ── Blockquote ──
    if (trimmed.startsWith('>')) {
      const buf = [];
      while (i < n && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({ type: 'blockquote', text: buf.join(' ').trim() });
      continue;
    }

    // ── Table (GFM) ──
    if (trimmed.includes('|') && i + 1 < n && /^\s*\|?\s*[-:]+/.test(lines[i + 1])) {
      const rows = [];
      while (i < n && lines[i].trim().includes('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        rows.push(cells);
        i++;
      }
      if (rows.length > 1) rows.splice(1, 1); // remove separator row
      tokens.push({ type: 'table', rows });
      continue;
    }

    // ── Unordered list ──
    if (/^\s*[-*+]\s/.test(line)) {
      const items = [];
      while (i < n && /^\s*[-*+]\s/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*+]\s+/, '');
        i++;
        while (i < n && lines[i].trim() !== '' && /^\s{2,}/.test(lines[i]) && !/^\s*[-*+]\s/.test(lines[i])) {
          item += ' ' + lines[i].trim(); i++;
        }
        items.push(item.trim());
      }
      tokens.push({ type: 'list', ordered: false, items });
      continue;
    }

    // ── Ordered list ──
    if (/^\s*\d+[.)]\s/.test(line)) {
      const items = [];
      while (i < n && /^\s*\d+[.)]\s/.test(lines[i])) {
        let item = lines[i].replace(/^\s*\d+[.)]\s+/, '');
        i++;
        while (i < n && lines[i].trim() !== '' && /^\s{2,}/.test(lines[i]) && !/^\s*\d+[.)]\s/.test(lines[i])) {
          item += ' ' + lines[i].trim(); i++;
        }
        items.push(item.trim());
      }
      tokens.push({ type: 'list', ordered: true, items });
      continue;
    }

    // ── Paragraph (collect until blank line or block element) ──
    const buf = [];
    while (
      i < n &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('$$') &&
      !lines[i].trim().match(/^#{1,6}\s/) &&
      !lines[i].trim().startsWith('>') &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^\s*[-*+]\s/.test(lines[i]) &&
      !/^\s*\d+[.)]\s/.test(lines[i]) &&
      !(lines[i].trim().includes('|') && i + 1 < n && /^\s*\|?\s*[-:]+/.test(lines[i + 1] || ''))
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    if (buf.length) tokens.push({ type: 'paragraph', text: buf.join(' ') });
  }

  return tokens;
}

// ─── Inline Tokenizer ──────────────────────────────────────────────────────────

function tokenizeInline(text) {
  text = text.replace(/<[^>]+>/g, ''); // strip HTML tags
  const re =
    /!\[([^\]]*)\]\([^)]+\)|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)/g;
  const segs = [];
  let last = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ t: text.slice(last, m.index) });
    if (m[1] != null)    segs.push({ t: `[Image: ${m[1] || 'figure'}]`, italic: true });
    else if (m[2])       segs.push({ t: m[2], bold: true, italic: true });
    else if (m[3])       segs.push({ t: m[3], bold: true });
    else if (m[4])       segs.push({ t: m[4], italic: true });
    else if (m[5])       segs.push({ t: m[5], code: true });
    else if (m[6])       segs.push({ t: m[6], link: m[7] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ t: text.slice(last) });

  return segs.filter((s) => s.t);
}

function stripInline(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

// ─── PDF Helpers ───────────────────────────────────────────────────────────────

function cw(doc) {
  return doc.page.width - M.left - M.right;
}

function ensure(doc, pts = 80) {
  if (doc.y + pts > doc.page.height - M.bottom) doc.addPage();
}

/** Split `$...$` inside a styled segment (paragraphs, lists, etc.). */
function expandSegsWithMath(segs) {
  const out = [];
  for (const seg of segs) {
    if (!seg.t) continue;
    const re = /\$([^$]+)\$/g;
    let last = 0;
    let m;
    let found = false;
    while ((m = re.exec(seg.t)) !== null) {
      found = true;
      if (m.index > last) {
        const chunk = seg.t.slice(last, m.index);
        if (chunk) out.push({ ...seg, t: chunk });
      }
      const lx = m[1].trim();
      if (lx) out.push({ math: true, latex: lx });
      last = m.index + m[0].length;
    }
    if (!found) out.push(seg);
    else if (last < seg.t.length) out.push({ ...seg, t: seg.t.slice(last) });
  }
  return out.filter((s) => s.math || (s.t && s.t.length));
}

function segWords(seg) {
  if (seg.math) return [seg];
  if (!seg.t) return [];
  return seg.t
    .split(/(\s+)/)
    .filter((w) => w.length)
    .map((t) => ({ ...seg, t, link: /^\s+$/.test(t) ? undefined : seg.link }));
}

function splitTextToWidth(doc, text, maxWidth) {
  if (!text) return ['', ''];
  if (doc.widthOfString(text) <= maxWidth) return [text, ''];

  let lo = 1;
  let hi = text.length;
  let best = 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const chunk = text.slice(0, mid);
    if (doc.widthOfString(chunk) <= maxWidth) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best < text.length) {
    const ws = text.slice(0, best).match(/^.*(?=\s(?!.*\s))/);
    if (ws && ws[0].trim()) best = ws[0].length;
  }

  return [text.slice(0, best), text.slice(best)];
}

function fitTextWithEllipsis(doc, text, maxWidth) {
  if (!text) return '';
  if (doc.widthOfString(text) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  let best = '...';
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = `${text.slice(0, mid).trimEnd()}...`;
    if (doc.widthOfString(candidate) <= maxWidth) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function wrapCodeLineTokens(doc, lineTokens, maxWidth) {
  const wrapped = [[]];
  let lineIdx = 0;
  let lineWidth = 0;

  for (const tok of lineTokens) {
    let remaining = tok.text.replace(/\t/g, '  ');
    while (remaining) {
      let room = maxWidth - lineWidth;
      if (room <= 0) {
        wrapped.push([]);
        lineIdx++;
        lineWidth = 0;
        room = maxWidth;
      }

      const [chunk, rest] = splitTextToWidth(doc, remaining, room);
      wrapped[lineIdx].push({ ...tok, text: chunk });
      lineWidth += doc.widthOfString(chunk);
      remaining = rest;

      if (remaining) {
        wrapped.push([]);
        lineIdx++;
        lineWidth = 0;
      }
    }
  }

  return wrapped;
}

function measureItemWidth(doc, item, size, color) {
  if (item.math) {
    const buf = G_MATH_INLINE.get(item.latex);
    if (!buf) {
      doc.font(F.m).fontSize(size - 1);
      return doc.widthOfString(`$${item.latex ?? ''}$`);
    }
    const info = doc.openImage(buf);
    const h = size * 1.15;
    return (info.width / info.height) * h + 1;
  }
  const chunk = item.t != null ? String(item.t) : '';
  if (!chunk) return 0;
  if (item.code) {
    doc.font(F.m).fontSize(size - 1).fillColor(C.code);
  } else if (item.link) {
    doc.font(F.b).fontSize(size).fillColor(C.link);
  } else {
    const font = item.bold && item.italic ? F.bi : item.bold ? F.B : item.italic ? F.i : F.b;
    doc.font(font).fontSize(size).fillColor(color);
  }
  return doc.widthOfString(chunk);
}

function drawLineItems(doc, items, x, y, size, color, maxW) {
  let cx = x;
  for (const it of items) {
    if (!it) continue;
    if (it.math) {
      const buf = G_MATH_INLINE.get(it.latex);
      if (buf) {
        const info = doc.openImage(buf);
        const h = size * 1.5;
        const iw = (info.width / info.height) * h;
        doc.image(buf, cx, y - size * 0.95, { width: iw, height: h });
        cx += iw + 1;
      } else {
        doc.font(F.m).fontSize(size - 1).fillColor(C.code);
        const itemW = measureItemWidth(doc, it, size, color);
        doc.text(`$${it.latex}$`, cx, y, {
          lineBreak: false,
          align: 'left',
          width: Math.max(40, maxW - (cx - x)),
        });
        cx += itemW;
      }
    } else if (it.code) {
      const t = it.t != null ? String(it.t) : '';
      if (!t) continue;
      doc.font(F.m).fontSize(size - 1).fillColor(C.code);
      const itemW = measureItemWidth(doc, it, size, color);
      // No `width`: LineWrapper + inherited align (e.g. right) would shift glyphs off-page.
      doc.text(t, cx, y, { lineBreak: false, align: 'left' });
      cx += itemW;
    } else if (it.link) {
      const t = it.t != null ? String(it.t) : '';
      if (!t) continue;
      doc.font(F.b).fontSize(size).fillColor(C.link);
      const itemW = measureItemWidth(doc, it, size, color);
      doc.text(t, cx, y, { lineBreak: false, align: 'left' });
      cx += itemW;
    } else {
      const t = it.t != null ? String(it.t) : '';
      if (!t) continue;
      const font = it.bold && it.italic ? F.bi : it.bold ? F.B : it.italic ? F.i : F.b;
      doc.font(font).fontSize(size).fillColor(color);
      const itemW = measureItemWidth(doc, it, size, color);
      doc.text(t, cx, y, { lineBreak: false, align: 'left' });
      cx += itemW;
    }
  }
}

/** Render inline-formatted text at the current doc.y position (incl. `$...$` via PNG). */
function renderInline(doc, text, opts = {}) {
  const segs = tokenizeInline(text);
  if (!segs.length) return;

  const { size = S.body, color = C.body, indent = 0 } = opts;
  const x0 = M.left + indent;
  const maxW = cw(doc) - indent;

  const expanded = expandSegsWithMath(segs);
  const items = expanded.flatMap(segWords);
  if (!items.length) return;

  const lines = [];
  let cur = [];
  let lineW = 0;

  for (const it of items) {
    if (!it) continue;
    const w = measureItemWidth(doc, it, size, color);
    const onlyWs = it.t != null && /^\s+$/.test(String(it.t));
    if (onlyWs && !cur.length) continue;

    if (lineW + w > maxW && cur.length) {
      if (onlyWs) continue;
      lines.push(cur);
      cur = [];
      lineW = 0;
    }
    cur.push(it);
    lineW += w;
  }
  if (cur.length) lines.push(cur);

  doc.font(F.b).fontSize(size).fillColor(color);
  const lineHeight = doc.currentLineHeight() + 5;
  for (const line of lines) {
    ensure(doc, lineHeight + 8);
    drawLineItems(doc, line, x0, doc.y, size, color, maxW);
    doc.y += lineHeight;
  }
}

function splitTableCellMathParts(cell) {
  const parts = [];
  const re = /\$([^$]+)\$/g;
  let last = 0;
  let m;
  while ((m = re.exec(cell)) !== null) {
    if (m.index > last) parts.push({ k: 't', s: cell.slice(last, m.index) });
    parts.push({ k: 'm', latex: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < cell.length) parts.push({ k: 't', s: cell.slice(last) });
  if (!parts.length) parts.push({ k: 't', s: cell });
  return parts;
}

function renderTableCellWithMath(doc, cell, x, y, maxInnerW, isHeader) {
  const fs = S.body - 0.5;
  let cx = x;
  for (const p of splitTableCellMathParts(cell)) {
    if (p.k === 't') {
      const t = stripInline(p.s);
      if (!t) continue;
      doc.font(isHeader ? F.B : F.b).fontSize(fs).fillColor(C.body);
      doc.text(t, cx, y, {
        lineBreak: false,
        align: 'left',
        width: Math.max(24, x + maxInnerW - cx),
      });
      cx = doc.x;
    } else {
      const buf = G_MATH_INLINE.get(p.latex);
      if (buf) {
        const info = doc.openImage(buf);
        const h = fs * 1.45;
        let iw = (info.width / info.height) * h;
        const room = x + maxInnerW - cx - 2;
        if (iw > room) iw = Math.max(4, room);
        const ih = (info.height / info.width) * iw;
        doc.image(buf, cx, y - fs * 0.92, { width: iw, height: ih });
        cx += iw + 2;
      } else {
        doc.font(F.m).fontSize(fs).fillColor(C.body);
        doc.text(`$${p.latex}$`, cx, y, {
          lineBreak: false,
          align: 'left',
          width: Math.max(24, x + maxInnerW - cx),
        });
        cx = doc.x;
      }
    }
    if (cx > x + maxInnerW) break;
  }
}

// ─── Block Renderers ───────────────────────────────────────────────────────────

function renderBlock(doc, token) {
  switch (token.type) {
    case 'heading': {
      const lvl = Math.max(2, Math.min(6, token.level));
      const size = S[`h${lvl}`] || S.body;
      ensure(doc, size + 36);
      doc.moveDown(1.5);
      doc.font(F.h).fontSize(size).fillColor(C.heading)
        .text(stripInline(token.text), M.left, doc.y, { width: cw(doc), lineGap: 3 });
      doc.moveDown(0.5);
      break;
    }

    case 'paragraph':
      ensure(doc, 30);
      renderInline(doc, token.text);
      doc.moveDown(0.8);
      break;

    case 'code': {
      const pad = 14;
      const w = cw(doc);
      const isMermaid = token.lang === 'mermaid';
      // Strip carriage returns (Windows line endings produce a visible glyph in PDFKit)
      const display = isMermaid ? null : token.text.replace(/\r/g, '');

      if (isMermaid) {
        const pngBuf = token._png;
        if (pngBuf) {
          const info = doc.openImage(pngBuf);
          const ratio = info.height / info.width;
          const maxPageH = doc.page.height - M.top - M.bottom;
          let imgW = cw(doc);
          let imgH = imgW * ratio;
          if (imgH > maxPageH) {
            imgH = maxPageH;
            imgW = imgH / ratio;
          }
          ensure(doc, imgH + 14);
          const y0 = doc.y;
          const xImg = M.left + (cw(doc) - imgW) / 2;
          doc.image(pngBuf, xImg, y0, { width: imgW, height: imgH });
          doc.y = y0 + imgH + 14;
        } else {
          ensure(doc, 40);
          doc.font(F.i).fontSize(S.body).fillColor(C.muted)
            .text('[Mermaid diagram — available in the online version]', M.left, doc.y, { width: w, align: 'center' });
          doc.y += 36;
        }
        break;
      }

      // ── Syntax-highlighted code block ──────────────────────────────────────
      let lines = [];
      if (token.lang && hljs.getLanguage(token.lang)) {
        const highlighted = hljs.highlight(display, { language: token.lang }).value;
        const tagRegex = /<\/?span[^>]*>|[^<]+/g;
        let match;
        let classes = [];
        let currentTokens = [];
        while ((match = tagRegex.exec(highlighted)) !== null) {
          const str = match[0];
          if (str.startsWith('<span')) {
            const clsMatch = str.match(/class="([^"]+)"/);
            classes.push(clsMatch ? clsMatch[1] : '');
          } else if (str === '</span>') {
            classes.pop();
          } else {
            const text = htmlEntities.decode(str);
            text.split('\n').forEach((l, idx) => {
              if (idx > 0) { lines.push(currentTokens); currentTokens = []; }
              if (l) currentTokens.push({ text: l, classes: [...classes] });
            });
          }
        }
        if (currentTokens.length) lines.push(currentTokens);
      } else {
        lines = display.split('\n').map(l => [{ text: l, classes: [] }]);
      }
      doc.font(F.m).fontSize(S.code);
      const maxCodeW = w - pad * 2;
      const wrappedLines = lines.flatMap((lineTokens) => wrapCodeLineTokens(doc, lineTokens, maxCodeW));
      while (wrappedLines.length && !wrappedLines[wrappedLines.length - 1].length) wrappedLines.pop();
      const lineH = doc.currentLineHeight() + 3;
      const boxH = (wrappedLines.length * lineH) + pad * 2;

      ensure(doc, boxH + 20);
      const y0 = doc.y;

      // Light background + subtle border (GitHub-style)
      doc.save();
      doc.roundedRect(M.left, y0, w, boxH, 4).fill('#f6f8fa');
      doc.roundedRect(M.left, y0, w, boxH, 4).lineWidth(0.75).stroke('#d0d7de');
      doc.restore();

      // Language label — small, right-aligned, muted
      if (token.lang) {
        doc.font(F.b).fontSize(7).fillColor('#57606a')
          .text(token.lang.toLowerCase(), M.left + pad, y0 + pad * 0.6,
                { width: w - pad * 2, align: 'right', lineBreak: false });
      }

      // Code lines with GitHub-light syntax colours
      let curY = y0 + pad;
      wrappedLines.forEach((lineTokens) => {
        let curX = M.left + pad;
        lineTokens.forEach((tok) => {
          let color = '#24292f'; // default: near-black body text
          const c = tok.classes.join(' ');
          if      (c.includes('keyword'))                               color = '#cf222e'; // red
          else if (c.includes('string'))                                color = '#0a3069'; // dark blue
          else if (c.includes('comment'))                               color = '#6e7781'; // gray
          else if (c.includes('number') || c.includes('literal'))      color = '#0550ae'; // blue
          else if (c.includes('title.function') || c.includes('function')) color = '#6639ba'; // purple
          else if (c.includes('title.class') || c.includes('class'))   color = '#953800'; // brown
          else if (c.includes('built_in'))                              color = '#0550ae'; // blue
          else if (c.includes('variable') || c.includes('attr'))       color = '#116329'; // green
          else if (c.includes('property'))                              color = '#0550ae'; // blue
          else if (c.includes('tag'))                                   color = '#116329'; // green
          doc.font(F.m).fontSize(S.code).fillColor(color);
          const cleanText = tok.text;
          doc.text(cleanText, curX, curY, { lineBreak: false });
          curX += doc.widthOfString(cleanText);
        });
        curY += lineH;
      });

      doc.y = y0 + boxH + 16;
      break;
    }

    case 'list': {
      ensure(doc, 30);
      token.items.forEach((item, idx) => {
        ensure(doc, 16);
        const bullet = token.ordered ? `${idx + 1}.` : '\u2022';
        const y0 = doc.y;
        doc.font(F.b).fontSize(S.li).fillColor(C.muted)
          .text(bullet, M.left, y0, { width: 20, align: 'right' });
        doc.y = y0;
        renderInline(doc, item, { size: S.li, indent: 30 });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.8);
      break;
    }

    case 'blockquote': {
      ensure(doc, 40);
      doc.moveDown(0.5);
      const y0 = doc.y;
      renderInline(doc, token.text, { size: S.quote, color: C.qText, indent: 20 });
      const y1 = doc.y;
      
      doc.save();
      // Background
      doc.rect(M.left, y0 - 4, cw(doc), y1 - y0 + 8).fill('#f8fafc');
      // Left border
      doc.rect(M.left, y0 - 4, 3, y1 - y0 + 8).fill(C.qBorder);
      doc.restore();
      
      // Re-render text on top of background
      doc.y = y0;
      renderInline(doc, token.text, { size: S.quote, color: C.qText, indent: 20 });
      
      doc.y = y1 + 4;
      doc.moveDown(0.8);
      break;
    }

    case 'hr':
      ensure(doc, 20);
      doc.moveDown(0.5);
      doc.save();
      doc.moveTo(M.left + 40, doc.y).lineTo(doc.page.width - M.right - 40, doc.y)
        .lineWidth(0.5).strokeColor(C.hr).stroke();
      doc.restore();
      doc.moveDown(0.8);
      break;

    case 'image':
      ensure(doc, 20);
      doc.font(F.i).fontSize(S.body).fillColor(C.muted)
        .text(`[Image: ${token.alt || 'figure'}]`, M.left, doc.y, { width: cw(doc), align: 'center' });
      doc.moveDown(0.5);
      break;

    case 'math': {
      const key = token.text.trim();
      const pngBuf = G_MATH_DISPLAY.get(key);
      if (pngBuf) {
        const info = doc.openImage(pngBuf);
        const maxW = cw(doc) * 0.88;
        const maxH = doc.page.height - M.top - M.bottom;
        let drawW = Math.min(maxW, info.width);
        let drawH = (info.height / info.width) * drawW;
        if (drawH > maxH * 0.92) {
          drawH = maxH * 0.92;
          drawW = (info.width / info.height) * drawH;
        }
        ensure(doc, drawH + 10);
        const y0 = doc.y;
        const x0 = M.left + (cw(doc) - drawW) / 2;
        doc.image(pngBuf, x0, y0, { width: drawW, height: drawH });
        doc.y = y0 + drawH + 12;
      } else {
        doc.font(F.m).fontSize(S.code).fillColor(C.body)
          .text(token.text, M.left + 20, doc.y, { width: cw(doc) - 40, align: 'center', lineGap: 1.5 });
        doc.moveDown(0.5);
      }
      break;
    }

    case 'table': {
      ensure(doc, 40);
      const { rows } = token;
      if (!rows.length) break;
      const cols = rows[0].length;
      const tableW = cw(doc);
      const colW = tableW / cols;

      rows.forEach((row, ri) => {
        ensure(doc, 16);
        const isHeader = ri === 0;
        const y0 = doc.y;

        // Measure max cell height
        let maxH = 12;
        row.forEach((cell) => {
          doc.font(isHeader ? F.B : F.b).fontSize(S.body - 0.5);
          let h = doc.heightOfString(stripInline(cell), { width: colW - 8 });
          if (cell.includes('$')) h = Math.max(h, (S.body - 0.5) * 1.35);
          if (h > maxH) maxH = h;
        });

        row.forEach((cell, ci) => {
          const xCell = M.left + ci * colW + 4;
          const innerW = colW - 8;
          if (cell.includes('$')) {
            renderTableCellWithMath(doc, cell, xCell, y0, innerW, isHeader);
          } else {
            doc.font(isHeader ? F.B : F.b).fontSize(S.body - 0.5).fillColor(C.body)
              .text(stripInline(cell), xCell, y0, { width: innerW });
          }
        });

        doc.y = y0 + maxH + 4;
        if (isHeader) {
          doc.save();
          doc.moveTo(M.left, doc.y).lineTo(M.left + tableW, doc.y)
            .lineWidth(0.5).strokeColor(C.hr).stroke();
          doc.restore();
          doc.y += 3;
        }
      });
      doc.moveDown(0.5);
      break;
    }

    default:
      break;
  }
}

// ─── Page Builders ─────────────────────────────────────────────────────────────

function addCover(doc, posts, totalCats) {
  doc.addPage();
  const pw = doc.page.width;
  const ph = doc.page.height;

  // ── Image grid collage ────────────────────────────────────────────────────
  const HEADERS_DIR = path.join(__dirname, '..', 'public', 'blog', 'headers');
  const imgPaths = posts
    .filter(p => p.headerImage)
    .map(p => {
      const name = path.basename(p.headerImage);
      const jpgName = name.replace(/\.(webp)$/, '.jpg');
      const full = path.join(HEADERS_DIR, jpgName);
      return fs.existsSync(full) ? full : null;
    })
    .filter(Boolean);

  if (imgPaths.length) {
    const cols = Math.ceil(Math.sqrt(imgPaths.length * (pw / ph)));
    const rows = Math.ceil(imgPaths.length / cols);
    const cellW = pw / cols;
    const cellH = ph / rows;

    imgPaths.forEach((imgPath, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      try {
        doc.image(imgPath, col * cellW, row * cellH, {
          width: cellW + 1,   // +1 px to avoid hairline gaps
          height: cellH + 1,
          cover: [cellW + 1, cellH + 1],
        });
      } catch (_) { /* skip unreadable images silently */ }
    });
  }

  // ── Dark gradient overlay ─────────────────────────────────────────────────
  doc.save();
  doc.rect(0, 0, pw, ph).fill('#0a0f1a');
  doc.restore();
  // We fake opacity via fillOpacity
  doc.save();
  doc.fillOpacity(0.68);
  doc.rect(0, 0, pw, ph).fill('#0a0f1a');
  doc.fillOpacity(1);
  doc.restore();

  // ── Text ──────────────────────────────────────────────────────────────────
  const textY = ph * 0.36;

  // Accent bar
  doc.rect(M.left, textY, 56, 3).fill(C.accent);

  doc.font(F.h).fontSize(S.coverTitle).fillColor(C.white)
    .text('Blog Compilation', M.left, textY + 18, { width: pw - M.left * 2 });

  doc.moveDown(0.6);
  doc.font(F.b).fontSize(S.coverSub).fillColor('#94a3b8')
    .text(
      'A curated collection of technical articles on AI engineering,\nresearch, and mathematical curiosities.',
      M.left, doc.y, { width: pw - M.left * 2, lineGap: 4 },
    );

  doc.moveDown(2.5);
  doc.font(F.B).fontSize(S.coverSub).fillColor(C.white).text('Juan Lara', M.left);
  doc.moveDown(0.4);
  doc.font(F.b).fontSize(S.coverDate).fillColor('#64748b')
    .text(`${posts.length} articles  \u00B7  ${totalCats} categories`, M.left);
  doc.moveDown(0.4);
  const now = new Date();
  doc.font(F.b).fontSize(S.coverDate).fillColor('#64748b')
    .text(
      `Generated ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      M.left,
    );
}

function addCategoryDivider(doc, category) {
  doc.addPage();
  const ph = doc.page.height;
  const label = CATEGORIES.labels[category] || category;
  const desc = CATEGORIES.descriptions[category] || '';

  doc.rect(M.left, ph * 0.38, 40, 2.5).fill(C.accent);
  doc.font(F.h).fontSize(S.catTitle).fillColor(C.heading)
    .text(label, M.left, ph * 0.38 + 14, { width: cw(doc) });

  if (desc) {
    doc.moveDown(0.5);
    doc.font(F.b).fontSize(S.body).fillColor(C.muted)
      .text(desc, M.left, doc.y, { width: cw(doc) * 0.7, lineGap: 2 });
  }
}

function postDestId(post) {
  return `post-${post.slug}`;
}

function addPostHeader(doc, post) {
  doc.addPage();

  // Named destination for PDF navigation (TOC links target this)
  doc.addNamedDestination(postDestId(post));

  doc.font(F.h).fontSize(S.postTitle).fillColor(C.heading)
    .text(post.title, M.left, M.top, { width: cw(doc), lineGap: 2 });

  doc.moveDown(0.4);
  const parts = [];
  if (post.date) {
    parts.push(new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }));
  }
  if (post.readingTime) parts.push(`${post.readingTime} min read`);
  if (post.tags?.length) parts.push(post.tags.join(' \u00B7 '));
  doc.font(F.b).fontSize(S.postMeta).fillColor(C.muted)
    .text(parts.join('  \u2014  '), M.left, doc.y, { width: cw(doc) });

  // Separator
  doc.moveDown(0.5);
  doc.save();
  doc.moveTo(M.left, doc.y).lineTo(M.left + cw(doc), doc.y)
    .lineWidth(0.5).strokeColor(C.hr).stroke();
  doc.restore();
  doc.moveDown(0.8);

  // Excerpt callout
  if (post.excerpt) {
    const y0 = doc.y;
    doc.font(F.i).fontSize(S.body).fillColor(C.qText)
      .text(post.excerpt, M.left + 14, y0, { width: cw(doc) - 16, lineGap: 2 });
    const y1 = doc.y;
    doc.save();
    doc.rect(M.left, y0, 2.5, y1 - y0).fill(C.accent);
    doc.restore();
    doc.moveDown(0.8);
  }
}

function addToc(doc, tocPageIdx, entries) {
  const pageIndices = Array.isArray(tocPageIdx) ? tocPageIdx : [tocPageIdx];
  let pageCursor = 0;
  doc.switchToPage(pageIndices[pageCursor]);
  let y = M.top;
  const W = cw(doc);
  const pgNumW = 34;
  const indent = 12;
  const entryH = S.tocEntry + 8;  // row height
  const titleMaxW = W - indent - pgNumW - 20;

  function nextTocPage() {
    pageCursor += 1;
    if (pageCursor >= pageIndices.length) {
      throw new Error('Not enough TOC pages reserved.');
    }
    doc.switchToPage(pageIndices[pageCursor]);
    y = M.top;
  }

  // Title
  doc.font(F.h).fontSize(20).fillColor(C.heading)
    .text('Table of Contents', M.left, y, { width: W });
  y = doc.y + 20;

  let currentCat = '';
  for (const entry of entries) {
    // Category header
    if (entry.category !== currentCat) {
      currentCat = entry.category;
      const gap = currentCat === entries[0].category ? 0 : 18;
      if (y + gap + 28 > doc.page.height - M.bottom) {
        nextTocPage();
      } else {
        y += gap;
      }
      // Category label with accent left-bar
      doc.save();
      doc.rect(M.left, y, 3, 18).fill(C.accent);
      doc.restore();
      doc.font(F.B).fontSize(S.tocCat).fillColor(C.heading)
        .text(CATEGORIES.labels[currentCat] || currentCat, M.left + 10, y, { width: W - 10 });
      y = doc.y + 8;
    }

    // Overflow to new page
    if (y + entryH > doc.page.height - M.bottom) {
      nextTocPage();
    }

    doc.font(F.b).fontSize(S.tocEntry).fillColor(C.body);
    const titleStr = fitTextWithEllipsis(doc, entry.title, titleMaxW);

    // Clickable title text → jumps to named destination in PDF
    doc.text(titleStr, M.left + indent, y, {
      width: titleMaxW,
      lineBreak: false,
      goTo: entry.destId,
      underline: false,
    });

    // Dot leaders between title and page number
    doc.font(F.b).fontSize(S.tocEntry).fillColor(C.hr);
    const titleRenderedW = doc.widthOfString(titleStr);
    const dotAreaX = M.left + indent + titleRenderedW + 6;
    const dotAreaW = W - indent - pgNumW - titleRenderedW - 16;
    if (dotAreaW > 10) {
      doc.text('. '.repeat(80), dotAreaX, y, { width: dotAreaW, lineBreak: false, ellipsis: true });
    }

    // Page number (also a link)
    doc.font(F.B).fontSize(S.tocEntry).fillColor(C.muted)
      .text(`${entry.page}`, M.left + W - pgNumW, y, {
        width: pgNumW,
        align: 'right',
        goTo: entry.destId,
      });

    y += entryH;
  }
}

function estimateTocPageCount(doc, entries) {
  if (!entries.length) return 1;
  let pages = 1;
  let y = M.top;
  const entryH = S.tocEntry + 8;
  doc.font(F.h).fontSize(20);
  y += doc.heightOfString('Table of Contents', { width: cw(doc) }) + 20;
  let currentCat = '';
  for (const entry of entries) {
    if (entry.category !== currentCat) {
      currentCat = entry.category;
      const gap = currentCat === entries[0].category ? 0 : 18;
      if (y + gap + 28 > doc.page.height - M.bottom) {
        pages += 1;
        y = M.top;
      } else {
        y += gap;
      }
      y += 26;
    }
    if (y + entryH > doc.page.height - M.bottom) {
      pages += 1;
      y = M.top;
    }
    y += entryH;
  }
  return pages;
}

function addDocumentOutlines(doc, tocPageIndices, entries) {
  const root = doc.outline;
  root.addItem('Table of Contents', { pageNumber: tocPageIndices[0], expanded: true });
  const categories = new Map();
  for (const entry of entries) {
    let categoryNode = categories.get(entry.category);
    if (!categoryNode) {
      categoryNode = root.addItem(CATEGORIES.labels[entry.category] || entry.category, {
        pageNumber: entry.page,
        expanded: true,
      });
      categories.set(entry.category, categoryNode);
    }
    categoryNode.addItem(entry.title, { pageNumber: entry.page });
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Loading blog posts...');
  const posts = loadPosts();
  if (!posts.length) {
    console.error('No posts found in', BLOG_DIR);
    process.exit(1);
  }

  const grouped = {};
  for (const p of posts) (grouped[p.category] ??= []).push(p);
  const catCount = Object.keys(grouped).length;
  console.log(`Found ${posts.length} posts in ${catCount} categories.\n`);

  const mathMaps = await prerenderMath(posts);
  G_MATH_DISPLAY = mathMaps.display;
  G_MATH_INLINE = mathMaps.inline;

  const mermaidCache = await prerenderMermaid(posts);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const doc = new PDFDocument({
    bufferPages: true,
    autoFirstPage: false,
    size: 'A4',
    margins: M,
    info: {
      Title: 'Blog Compilation — Juan Lara',
      Author: 'Juan Lara',
      Subject: 'Technical blog posts compilation',
      Creator: 'generate-blog-pdf.js',
    },
  });
  F = registerPdfFonts(doc);
  const stream = fs.createWriteStream(OUTPUT_FILE);
  doc.pipe(stream);

  // Cover with image collage
  addCover(doc, posts, catCount);

  // Reserve TOC pages before content so they do not get appended at the end.
  const tocSeedEntries = CATEGORIES.order.flatMap((cat) =>
    (grouped[cat] || []).map((post) => ({ title: post.title, category: cat })),
  );
  const tocPageCount = estimateTocPageCount(doc, tocSeedEntries);
  const tocPageIdx = [];
  for (let i = 0; i < tocPageCount; i++) {
    doc.addPage();
    tocPageIdx.push(doc.bufferedPageRange().count - 1);
  }

  // Render all posts
  const tocEntries = [];

  for (const cat of CATEGORIES.order) {
    const catPosts = grouped[cat];
    if (!catPosts?.length) continue;

    addCategoryDivider(doc, cat);

    for (const post of catPosts) {
      addPostHeader(doc, post);
      const pageNum = doc.bufferedPageRange().count - 1;
      tocEntries.push({ title: post.title, category: cat, page: pageNum, destId: postDestId(post) });

      console.log(`  [${cat}] ${post.title}`);

      // Inject pre-rendered PNG buffers into mermaid tokens
      const tokens = tokenizeBlocks(post.content);
      for (const t of tokens) {
        if (t.type === 'code' && t.lang === 'mermaid') {
          t._png = mermaidCache.get(t.text) || null;
        }
        renderBlock(doc, t);
      }
    }
  }

  // Backfill TOC and running headers/footers
  addToc(doc, tocPageIdx, tocEntries);
  addDocumentOutlines(doc, tocPageIdx, tocEntries);

  const totalPages = doc.bufferedPageRange().count;
  doc.end();

  stream.on('finish', () => {
    const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
    console.log(`\n  PDF generated: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
    console.log(`  ${posts.length} posts | ${totalPages} pages | ${sizeMB} MB\n`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
