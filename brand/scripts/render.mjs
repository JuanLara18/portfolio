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
  await page.evaluateOnNewDocument((tokens, lock) => { window.BRAND = tokens; window.LOCKUP = lock; }, T, lockup);
  return {
    browser,
    /** Render one template (brand/templates/<name>.html) to a PNG at its native size. */
    async template(name, dest, [w, h], query = {}) {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      const url = pathToFileURL(path.join(BRAND, 'templates', `${name}.html`)).href + '?' + new URLSearchParams(query);
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: dest, clip: { x: 0, y: 0, width: w, height: h } });
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
