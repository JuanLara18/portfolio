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
const matter = require('gray-matter');

let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch {
  console.error('pdfkit is not installed. Run:  npm install --save-dev pdfkit');
  process.exit(1);
}

// ─── Paths ─────────────────────────────────────────────────────────────────────

const BLOG_DIR = path.join(__dirname, '..', 'public', 'blog', 'posts');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'blog-compilation.pdf');

// ─── Style Configuration ───────────────────────────────────────────────────────
// Change any value here to adjust the entire PDF look in one place.

const M = { top: 72, bottom: 72, left: 72, right: 72 };

const F = {
  h: 'Helvetica-Bold',
  b: 'Helvetica',
  B: 'Helvetica-Bold',
  i: 'Helvetica-Oblique',
  bi: 'Helvetica-BoldOblique',
  m: 'Courier',
  mB: 'Courier-Bold',
};

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

/** Render inline-formatted text at the current doc.y position. */
function renderInline(doc, text, opts = {}) {
  const segs = tokenizeInline(text);
  if (!segs.length) return;

  const { size = S.body, color = C.body, align, indent = 0 } = opts;
  const x = M.left + indent;
  const w = cw(doc) - indent;

  segs.forEach((seg, i) => {
    const last = i === segs.length - 1;
    const o = { continued: !last, width: w, lineGap: 5 };
    if (i === 0 && align) o.align = align;

    if (seg.code) {
      doc.font(F.m).fontSize(size - 1).fillColor(C.code);
      o.underline = false;
    } else if (seg.link) {
      doc.font(F.b).fontSize(size).fillColor(C.link);
      o.link = seg.link;
      o.underline = true;
    } else {
      const font = seg.bold && seg.italic ? F.bi : seg.bold ? F.B : seg.italic ? F.i : F.b;
      doc.font(font).fontSize(size).fillColor(color);
      o.underline = false;
    }

    if (i === 0) {
      doc.text(seg.t, x, doc.y, o);
    } else {
      doc.text(seg.t, o);
    }
  });
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
      ensure(doc, 40);
      const pad = 8;
      const w = cw(doc);
      const isMermaid = token.lang === 'mermaid';
      const display = isMermaid ? '[Mermaid diagram — see online version]' : token.text;

      doc.font(F.m).fontSize(S.code);
      const textH = doc.heightOfString(display, { width: w - pad * 2 - 4, lineGap: 1.5 });
      const boxH = textH + pad * 2;

      if (doc.y + boxH + 4 > doc.page.height - M.bottom) doc.addPage();
      const y0 = doc.y;

      // Background + left accent
      doc.save();
      doc.roundedRect(M.left, y0, w, boxH, 3).fill(C.codeBg);
      doc.roundedRect(M.left, y0, 3, boxH, 1.5).fill(C.codeBorder);
      doc.restore();

      // Language label
      if (token.lang && !isMermaid) {
        doc.font(F.m).fontSize(6.5).fillColor(C.muted)
          .text(token.lang, M.left + w - pad - 40, y0 + 3, { width: 40, align: 'right' });
      }

      // Code text
      doc.font(F.m).fontSize(S.code).fillColor(isMermaid ? C.muted : C.code)
        .text(display, M.left + pad + 4, y0 + pad, { width: w - pad * 2 - 4, lineGap: 1.5 });

      doc.y = y0 + boxH + 6;
      doc.moveDown(0.3);
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

    case 'math':
      ensure(doc, 30);
      doc.font(F.m).fontSize(S.code).fillColor(C.body)
        .text(token.text, M.left + 20, doc.y, { width: cw(doc) - 40, align: 'center', lineGap: 1.5 });
      doc.moveDown(0.5);
      break;

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
          const h = doc.heightOfString(stripInline(cell), { width: colW - 8 });
          if (h > maxH) maxH = h;
        });

        // Render cells
        row.forEach((cell, ci) => {
          doc.font(isHeader ? F.B : F.b).fontSize(S.body - 0.5).fillColor(C.body)
            .text(stripInline(cell), M.left + ci * colW + 4, y0, { width: colW - 8 });
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

function addCover(doc, totalPosts, totalCats) {
  doc.addPage();
  const pw = doc.page.width;
  const ph = doc.page.height;

  doc.rect(0, 0, pw, ph).fill(C.dark);

  // Accent line
  doc.rect(M.left, ph * 0.36, 60, 3).fill(C.accent);

  // Title
  doc.font(F.h).fontSize(S.coverTitle).fillColor(C.white)
    .text('Blog Compilation', M.left, ph * 0.36 + 18, { width: cw(doc) });

  doc.moveDown(0.5);
  doc.font(F.b).fontSize(S.coverSub).fillColor(C.muted)
    .text(
      'A curated collection of technical articles on AI engineering,\nresearch, and mathematical curiosities.',
      M.left, doc.y, { width: cw(doc), lineGap: 3 },
    );

  doc.moveDown(2);
  doc.font(F.B).fontSize(S.coverSub).fillColor(C.white).text('Juan Lara', M.left);
  doc.font(F.b).fontSize(S.coverDate).fillColor(C.muted)
    .text(`${totalPosts} articles  \u00B7  ${totalCats} categories`, M.left);

  doc.moveDown(0.5);
  const now = new Date();
  doc.font(F.b).fontSize(S.coverDate).fillColor(C.muted)
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

function addPostHeader(doc, post) {
  doc.addPage();

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
  doc.switchToPage(tocPageIdx);
  let y = M.top;

  doc.font(F.h).fontSize(20).fillColor(C.heading)
    .text('Table of Contents', M.left, y, { width: cw(doc) });
  y = doc.y + 24;

  let currentCat = '';
  for (const entry of entries) {
    if (entry.category !== currentCat) {
      currentCat = entry.category;
      if (y + 36 > doc.page.height - M.bottom) {
        doc.addPage();
        y = M.top;
      } else {
        y += currentCat === entries[0].category ? 0 : 16;
      }
      doc.font(F.B).fontSize(S.tocCat).fillColor(C.accent)
        .text(CATEGORIES.labels[currentCat] || currentCat, M.left, y);
      y = doc.y + 8;
    }

    if (y + 16 > doc.page.height - M.bottom) {
      doc.addPage();
      y = M.top;
    }

    const titleMaxW = cw(doc) - 60;
    doc.font(F.b).fontSize(S.tocEntry).fillColor(C.body);
    
    // Title
    doc.text(entry.title, M.left + 10, y, { width: titleMaxW, lineBreak: false, ellipsis: true });
    
    // Page number
    doc.font(F.B).fontSize(S.tocEntry).fillColor(C.muted)
      .text(`${entry.page}`, M.left + cw(doc) - 30, y, { width: 30, align: 'right' });
      
    // Dot leaders
    const titleW = doc.widthOfString(entry.title.length > 70 ? entry.title.slice(0, 70) + '...' : entry.title);
    if (titleW < titleMaxW - 10) {
      doc.font(F.b).fontSize(S.tocEntry).fillColor(C.hr)
        .text('. '.repeat(50), M.left + 10 + titleW + 5, y, { width: titleMaxW - titleW - 10, lineBreak: false, ellipsis: true });
    }
    
    y = Math.max(doc.y, y + 16);
  }
}

function addHeadersAndFooters(doc, posts) {
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(i);
    
    // Header
    doc.save();
    doc.moveTo(M.left, M.top - 20).lineTo(M.left + cw(doc), M.top - 20)
      .lineWidth(0.5).strokeColor(C.hr).stroke();
    doc.restore();
    
    doc.font(F.b).fontSize(S.footer).fillColor(C.muted)
      .text('JUAN LARA', M.left, M.top - 32, { width: cw(doc) / 2, align: 'left' });
    doc.font(F.i).fontSize(S.footer).fillColor(C.muted)
      .text('Blog Compilation 2026', M.left + cw(doc) / 2, M.top - 32, { width: cw(doc) / 2, align: 'right' });

    // Footer
    doc.font(F.b).fontSize(S.footer).fillColor(C.muted)
      .text(
        `${i}`,
        M.left,
        doc.page.height - M.bottom + 20,
        { width: cw(doc), align: 'center' },
      );
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main() {
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

  const stream = fs.createWriteStream(OUTPUT_FILE);
  doc.pipe(stream);

  // Cover
  addCover(doc, posts.length, catCount);

  // TOC placeholder (we'll fill it later with switchToPage)
  doc.addPage();
  const tocPageIdx = doc.bufferedPageRange().count - 1;

  // Render all posts grouped by category
  const tocEntries = [];

  for (const cat of CATEGORIES.order) {
    const catPosts = grouped[cat];
    if (!catPosts?.length) continue;

    addCategoryDivider(doc, cat);

    for (const post of catPosts) {
      addPostHeader(doc, post);
      const pageNum = doc.bufferedPageRange().count - 1;
      tocEntries.push({ title: post.title, category: cat, page: pageNum });

      console.log(`  [${cat}] ${post.title}`);

      const tokens = tokenizeBlocks(post.content);
      for (const t of tokens) renderBlock(doc, t);
    }
  }

  // Backfill TOC and add page numbers
  addToc(doc, tocPageIdx, tocEntries);
  addHeadersAndFooters(doc, posts);

  const totalPages = doc.bufferedPageRange().count;
  doc.end();

  stream.on('finish', () => {
    const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
    console.log(`\n  PDF generated: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
    console.log(`  ${posts.length} posts | ${totalPages} pages | ${sizeMB} MB\n`);
  });
}

main();
