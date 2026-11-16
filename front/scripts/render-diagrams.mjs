#!/usr/bin/env node
// Render a post's Mermaid diagrams (or loose .mmd files) to PNG with the
// site's own theme, in light and dark, and report what a reader would see.
//
//   npm run diagrams:render -- <slug | path.mmd> [...] [--theme light|dark|both] [--out dir]
//
// For each diagram it prints the type, the scale it renders at inside the
// post's diagram frame (desktop and phone), the effective label size at that scale, and any
// label that overflows its box. Images land in front/.diagram-preview/ (git
// ignored) so an author, or an agent, can look at them before publishing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
import { getMermaidConfig, diagramType } from '../src/components/features/blog/MarkdownRenderer/mermaidTheme.js';
import { BRAND_COLORS } from '../src/data/brand.js';

const FRONT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(FRONT, 'public/blog/posts');
// Inner width of the diagram frame on the post page, measured on the site.
const DESKTOP = 846;         // px, any viewport from 1280 up
const PHONE = 330;           // px, a 390 px phone
const BASE_FONT = 14;        // label size in the theme, px
const MIN_FONT = 11;         // below this on desktop, a label is hard to read
const MIN_FONT_PHONE = 8;    // below this on a phone, readers must open fullscreen

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args.splice(i, 2)[1];
};
const out = path.resolve(opt('out', path.join(FRONT, '.diagram-preview')));
const themeArg = opt('theme', 'both');
const themes = themeArg === 'both' ? ['light', 'dark'] : [themeArg];
const targets = args.filter((a) => !a.startsWith('--'));

if (!targets.length) {
  console.error('usage: npm run diagrams:render -- <slug | file.mmd> [...] [--theme light|dark|both] [--out dir]');
  process.exit(2);
}

const findPost = (slug) => {
  for (const cat of fs.readdirSync(POSTS)) {
    const f = path.join(POSTS, cat, `${slug}.md`);
    if (fs.existsSync(f)) return f;
  }
  return null;
};

// Diagrams in source order, with the line where each starts.
const extract = (target) => {
  if (target.endsWith('.mmd')) {
    return [{ name: path.basename(target, '.mmd'), line: 1, src: fs.readFileSync(target, 'utf8') }];
  }
  const file = findPost(target);
  if (!file) throw new Error(`no post with slug "${target}"`);
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const blocks = [];
  const re = /^```mermaid\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(text))) {
    blocks.push({ name: `${target}-${blocks.length + 1}`, line: text.slice(0, m.index).split('\n').length, src: m[1] });
  }
  return blocks;
};

// Same normalisation as MarkdownRenderer: literal \n in labels is a line break.
const normalize = (src) => src.trim().replace(/\\n/g, '<br/>');

const katexCss = fs
  .readFileSync(path.join(FRONT, 'node_modules/katex/dist/katex.min.css'), 'utf8')
  .replace(/url\(fonts\//g, `url(${pathToFileURL(path.join(FRONT, 'node_modules/katex/dist/fonts')).href}/`);

const page = (bg) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>${katexCss}
body{margin:0;background:${bg}}
#frame{width:${DESKTOP}px;box-sizing:content-box;padding:24px}
#frame svg{max-width:100%;height:auto;display:block;margin:auto}
.mermaid-diagram p{margin:0}
</style></head><body><div id="frame" class="mermaid-diagram"></div></body></html>`;

const main = async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new' });
  const tab = await browser.newPage();
  await tab.setViewport({ width: DESKTOP + 80, height: 900, deviceScaleFactor: 2 });
  let problems = 0;

  for (const target of targets) {
    const blocks = extract(target);
    if (!blocks.length) console.log(`${target}: no Mermaid diagrams`);
    for (const block of blocks) {
      const src = normalize(block.src);
      const type = diagramType(src);
      const notes = [];
      for (const theme of themes) {
        const isDark = theme === 'dark';
        const html = path.join(out, '.page.html');
        fs.writeFileSync(html, page(BRAND_COLORS[isDark ? 'night' : 'day'].bg));
        await tab.goto(pathToFileURL(html).href, { waitUntil: 'networkidle0' });
        await tab.addScriptTag({ path: path.join(FRONT, 'node_modules/mermaid/dist/mermaid.min.js') });
        await tab.evaluate(() => Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 14px "IBM Plex Sans"`))));

        const result = await tab.evaluate(async (src, cfg) => {
          try {
            window.mermaid.initialize(cfg);
            const { svg } = await window.mermaid.render('d', src);
            const frame = document.getElementById('frame');
            frame.innerHTML = svg;
            // Same label-bounds adjustment as MarkdownRenderer.
            frame.querySelectorAll('foreignObject').forEach((fo) => {
              if (!fo.querySelector('div')) return;
              const h = parseFloat(fo.getAttribute('height')); const y = parseFloat(fo.getAttribute('y'));
              if (Number.isFinite(h)) fo.setAttribute('height', h + 8);
              if (Number.isFinite(y)) fo.setAttribute('y', y - 4);
              fo.style.overflow = 'visible';
            });
            await new Promise((r) => setTimeout(r, 150));
            const el = frame.querySelector('svg');
            const natural = el.viewBox.baseVal && el.viewBox.baseVal.width ? el.viewBox.baseVal.width : el.getBBox().width;
            const shown = el.getBoundingClientRect().width; // capped at the frame by max-width
            const overflow = [];
            el.querySelectorAll('foreignObject').forEach((fo) => {
              const d = fo.firstElementChild; if (!d || fo.closest('.cluster-label')) return;
              const box = fo.getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(d);
              const t = r.getBoundingClientRect();
              if (!d.querySelector('.katex') && (t.width > box.width + 2 || t.height > box.height + 2)) overflow.push(d.textContent.trim().slice(0, 40));
            });
            return { scale: shown / natural, natural, overflow, nodes: el.querySelectorAll('.node').length };
          } catch (e) {
            return { error: String(e.message || e).split('\n').slice(0, 3).join(' ') };
          }
        }, src, getMermaidConfig(isDark, type));

        if (result.error) { notes.push(`ERROR ${result.error}`); problems++; break; }
        const file = path.join(out, `${block.name}-${theme}.png`);
        await (await tab.$('#frame')).screenshot({ path: file });
        if (theme === themes[0]) {
          const desk = Math.min(1, result.scale);
          const phone = Math.min(1, (result.natural ? PHONE / result.natural : desk * PHONE / DESKTOP));
          const px = BASE_FONT * desk; const ppx = BASE_FONT * phone;
          notes.push(`desktop ${Math.round(desk * 100)}% (${px.toFixed(1)} px)  phone ${Math.round(phone * 100)}% (${ppx.toFixed(1)} px)`);
          if (px < MIN_FONT) { notes.push(`TOO WIDE: labels shrink below ${MIN_FONT} px on desktop; go vertical, split it, or shorten labels`); problems++; }
          else if (ppx < MIN_FONT_PHONE) notes.push(`phone readers need fullscreen (labels under ${MIN_FONT_PHONE} px)`);
          if (result.nodes) notes.push(`${result.nodes} nodes`);
          if (result.overflow.length) { notes.push(`OVERFLOW: ${result.overflow.join(' | ')}`); problems++; }
        }
      }
      console.log(`${block.name}  line ${block.line}  ${type}  ${notes.join('  ·  ')}`);
    }
  }
  fs.rmSync(path.join(out, '.page.html'), { force: true });
  await browser.close();
  console.log(`\nImages: ${out}`);
  if (problems) { console.log(`${problems} problem(s) found.`); process.exitCode = 1; }
};

main().catch((e) => { console.error(e.message); process.exit(1); });
