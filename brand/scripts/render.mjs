// Render every brand export from the logo masters and the HTML templates.
//
//   node brand/scripts/render.mjs          (or `npm run brand:render` in front/)
//
// Writes brand/exports/{icons,logo,social}/ and copies the files the site
// serves into front/public/. Uses the Puppeteer install in front/node_modules
// and IBM Plex from Google Fonts (network needed while rendering).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { motifBrowserScript } from './motif-browser.mjs';
import { getMotif, motifSVG } from '../motifs/motifs.mjs';

const BRAND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(BRAND, '..');
const PUBLIC = path.join(ROOT, 'front', 'public');
const T = JSON.parse(fs.readFileSync(path.join(BRAND, 'tokens.json'), 'utf8'));
const puppeteer = createRequire(path.join(ROOT, 'front', 'package.json'))('puppeteer');

const out = (...p) => {
  const f = path.join(BRAND, 'exports', ...p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  return f;
};
const svgUri = (file) => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(BRAND, 'logo', file)).toString('base64');

// ICO container with PNG payloads (supported by every browser since IE Vista era).
function writeIco(pngFiles, dest) {
  const imgs = pngFiles.map((f) => fs.readFileSync(f));
  const header = Buffer.alloc(6 + 16 * imgs.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
  let offset = header.length;
  imgs.forEach((buf, i) => {
    const size = buf.readUInt32BE(16); // PNG IHDR width
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(buf.length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  fs.writeFileSync(dest, Buffer.concat([header, ...imgs]));
}

export async function openRenderer() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const lockup = svgUri('lockup-night.svg');
  const lockupDay = svgUri('lockup-day.svg');
  await page.evaluateOnNewDocument((tokens, lock, lockDay) => { window.BRAND = tokens; window.LOCKUP = lock; window.LOCKUP_DAY = lockDay; }, T, lockup, lockupDay);
  await page.evaluateOnNewDocument(motifBrowserScript());
  return {
    browser,
    /** Render one template (brand/templates/<name>.html) to a PNG at its native size. */
    async template(name, dest, [w, h], query = {}, { scale = 1, transparent = false } = {}) {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
      const url = pathToFileURL(path.join(BRAND, 'templates', `${name}.html`)).href + '?' + new URLSearchParams(query);
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      return page.screenshot({ path: dest, clip: { x: 0, y: 0, width: w, height: h }, omitBackground: transparent });
    },
    /** Rasterize a logo master at an exact pixel size. */
    async svg(file, dest, px, scale = 1) {
      await page.setViewport({ width: px, height: px, deviceScaleFactor: scale });
      await page.setContent(`<html><body style="margin:0;background:transparent"><img src="${svgUri(file)}" width="${px}" height="${px}" style="display:block"></body></html>`);
      await page.evaluate(() => document.querySelector('img').decode());
      await page.screenshot({ path: dest, omitBackground: true });
    },
    async svgNatural(file, dest, scale = 2) {
      const src = fs.readFileSync(path.join(BRAND, 'logo', file), 'utf8');
      const [, w, h] = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
      await page.setViewport({ width: Math.ceil(w), height: Math.ceil(h), deviceScaleFactor: scale });
      await page.setContent(`<html><body style="margin:0;background:transparent"><img src="${svgUri(file)}" style="display:block;width:${w}px;height:${h}px"></body></html>`);
      await page.evaluate(() => document.querySelector('img').decode());
      await page.screenshot({ path: dest, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    },
  };
}

/**
 * GitHub profile README banner, night and day. An SVG, not a PNG, so the motif
 * stays vector and alive on GitHub: the tile, the active motif at its still frame,
 * and the typography (template github-readme.html, rendered transparent at 2x)
 * as an embedded image. For the Icosian game one light runs the solved tour, then
 * hides so the amber start node rests clean. Viewers without SMIL show the still frame.
 * The profile repository (JuanLara18/JuanLara18) copies these files into assets/brand/.
 */
async function readmeBanner(r, mode) {
  const [W, H] = T.formats.githubReadme;
  const c = T.color[mode];
  const id = T.motif.active;
  const m = getMotif(id);
  const pal = { primary: c.primary, harmonic: c.harmonic, contrast: c.contrast, muted: c.muted };
  const text = await r.template('github-readme', undefined, [W, H], { mode }, { scale: 2, transparent: true });

  let lap = '';
  if (id === 'icosian') {
    const fr = m.frame(m.still);
    const start = fr.nodes.findIndex((n) => n.c === 'contrast');
    const adj = m.nodes.map(() => []);
    fr.edges.forEach((e, i) => { if (e.c === 'primary') { const [a, b] = m.edges[i]; adj[a].push(b); adj[b].push(a); } });
    if (!adj.every((l) => l.length === 2)) throw new Error('icosian still frame is not a single tour');
    const order = [start];
    for (let prev = -1, v = start; order.length < m.nodes.length;) { const nx = adj[v][0] === prev ? adj[v][1] : adj[v][0]; prev = v; v = nx; order.push(v); }
    const d = order.map((k, i) => `${i ? 'L' : 'M'}${m.nodes[k][0].toFixed(2)} ${m.nodes[k][1].toFixed(2)}`).join('') + 'Z';
    lap = `<circle class="lap" r="3.6" fill="${c.primary}" stroke="${c.bg}" stroke-width="1.8" opacity="0"><animate attributeName="opacity" begin="0s" dur="5s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.04;0.36;0.4;1"/><animateMotion begin="0s" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.4;1" keyPoints="0;1;1" keySplines="0.65 0 0.35 1;0 0 1 1" path="${d}"/></circle>`;
  }

  const s = 1.02, cx = W - 130, cy = H / 2;
  const label = `Juan Lara. ${T.verbal.tagline.join('. ')}. ${T.verbal.strap.replace(/ · /g, ', ')}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
  <title>${label}</title>
  <style>@media (prefers-reduced-motion: reduce){.lap{display:none}}</style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${c.bg}" stroke="${c.border}"/>
  <g class="motif" transform="translate(${(cx - 100 * s).toFixed(1)} ${(cy - 100 * s).toFixed(1)}) scale(${s})">${motifSVG(id, pal)}${lap}</g>
  <image href="data:image/png;base64,${Buffer.from(text).toString('base64')}" x="0" y="0" width="${W}" height="${H}"/>
</svg>
`;
}

async function main() {
  const r = await openRenderer();
  const log = (f) => console.log('brand:render ', path.relative(ROOT, f));

  // Icons
  const fav = [];
  for (const px of T.formats.favicon) { const f = out('icons', `favicon-${px}.png`); await r.svg('favicon.svg', f, px); fav.push(f); log(f); }
  writeIco(fav, out('icons', 'favicon.ico')); log(out('icons', 'favicon.ico'));
  fs.copyFileSync(path.join(BRAND, 'logo', 'favicon.svg'), out('icons', 'favicon.svg'));
  for (const [file, name, px] of [['icon-master.svg', 'apple-touch-icon.png', T.formats.appleTouch], ['icon-master.svg', 'icon-192.png', 192], ['icon-master.svg', 'icon-512.png', 512], ['icon-maskable-master.svg', 'icon-maskable-512.png', 512]]) {
    const f = out('icons', name); await r.svg(file, f, px); log(f);
  }

  // Logo rasters (for documents, slides and tools that do not take SVG)
  for (const m of ['night', 'day']) {
    const f = out('logo', `lockup-${m}@2x.png`); await r.svgNatural(`lockup-${m}-bg.svg`, f, 2); log(f);
    const g = out('logo', `lockup-${m}-transparent@2x.png`); await r.svgNatural(`lockup-${m}.svg`, g, 2); log(g);
    const s = out('logo', `symbol-${m}-512.png`); await r.svg(`symbol-${m}.svg`, s, 512); log(s);
  }

  // Social
  const social = [
    ['og-default', 'og-default.png', T.formats.og, {}],
    ['og-post', 'og-post-example.png', T.formats.og, { cat: 'Field notes', min: 53, tone: 'primary', title: 'Apache Ossie: Ontologies, Semantic Models, and Data Contracts as One Open Stack' }],
    ['linkedin-banner', 'linkedin-banner.png', T.formats.linkedinBanner, {}],
    ['github-social', 'github-social.png', T.formats.githubSocial, {}],
  ];
  for (const [tpl, name, size, q] of social) { const f = out('social', name); await r.template(tpl, f, size, q); log(f); }
  for (const mode of ['night', 'day']) { const f = out('social', `github-readme-${mode}.svg`); fs.writeFileSync(f, await readmeBanner(r, mode)); log(f); }
  await r.browser.close();

  // Sync what the site serves
  const sync = [
    ['icons/favicon.ico', 'favicon.ico'], ['icons/favicon.svg', 'favicon.svg'], ['icons/apple-touch-icon.png', 'apple-touch-icon.png'],
    ['icons/icon-192.png', 'icon-192.png'], ['icons/icon-512.png', 'icon-512.png'], ['icons/icon-maskable-512.png', 'icon-maskable-512.png'],
    ['social/og-default.png', 'og-default.png'],
  ];
  for (const [from, to] of sync) fs.copyFileSync(path.join(BRAND, 'exports', from), path.join(PUBLIC, to));
  fs.mkdirSync(path.join(PUBLIC, 'brand'), { recursive: true });
  for (const f of ['lockup-night', 'lockup-day', 'wordmark-night', 'wordmark-day', 'symbol-night', 'symbol-day', 'symbol-mono-black', 'symbol-mono-white']) {
    fs.copyFileSync(path.join(BRAND, 'logo', `${f}.svg`), path.join(PUBLIC, 'brand', `${f}.svg`));
  }
  console.log('brand:render  synced site assets into front/public');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
