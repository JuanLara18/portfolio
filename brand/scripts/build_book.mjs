// Build the brand book from the brand system itself.
//
//   node brand/scripts/build_book.mjs        (or `npm run brand:book` in front/)
//
// Reads tokens.json, logo/*.svg and exports/, writes a self-contained
// guidelines/brand-book.html (16:9 plates, scaled to the screen) and
// guidelines/brand-book.pdf (one 1280 x 720 page per plate).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BRAND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(BRAND, '..');
const T = JSON.parse(fs.readFileSync(path.join(BRAND, 'tokens.json'), 'utf8'));
const N = T.color.night, D = T.color.day;
const read = (...p) => fs.readFileSync(path.join(...p));
const svg = (f) => read(BRAND, 'logo', f).toString().replace(/<title>.*?<\/title>/, '').replace(/ width="[\d.]+" height="[\d.]+"/, '');
const img = (p, type = 'image/png') => `data:${type};base64,${read(p).toString('base64')}`;
const exp = (...p) => img(path.join(BRAND, 'exports', ...p));
const photo = img(path.join(ROOT, 'front/public/blog/headers/wallaby-joey-pouch-header.webp'), 'image/webp');
const portrait = img(path.join(ROOT, 'front/public/images/Profile.webp'), 'image/webp');

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const c = rgb(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hue = (h) => { const [r, g, b] = rgb(h).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; const x = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round((x * 60 + 360) % 360); };
const mix = (a, b, t) => rgb(a).map((v, i) => +((v + (rgb(b)[i] - v) * t) / 255).toFixed(3));
const duo = [rgb(N.bg).map((v) => +(v / 255).toFixed(3)), mix(N.bg, N.harmonic, T.duotone.midMix), mix(N.primary, '#FFFFFF', T.duotone.highlightMix)];

// Symbol drawn from tokens, for construction and misuse plates.
const sym = (g, ink, node, extra = '') => `<svg viewBox="0 0 48 48" ${extra}><path d="${g.path}" fill="none" stroke="${ink}" stroke-width="${g.stroke}"/><circle cx="${g.top[0]}" cy="${g.top[1]}" r="${g.inkRadius}" fill="${ink}"/><circle cx="${g.end[0]}" cy="${g.end[1]}" r="${g.inkRadius}" fill="${ink}"/><circle cx="${g.node[0]}" cy="${g.node[1]}" r="${g.nodeRadius}" fill="${node}"/></svg>`;
const R = T.logo.regular, S = T.logo.small;
const grid = Array.from({ length: 13 }, (_, i) => i * 4).map((v) => `<line x1="${v}" y1="0" x2="${v}" y2="48"/><line x1="0" y1="${v}" x2="48" y2="${v}"/>`).join('');
const plate = (n, kicker, title, body, cls = '') => `<section class="plate ${cls}"><header class="ph"><span class="pn">${String(n).padStart(2, '0')}</span><span class="pk">${kicker}</span></header>${title ? `<h2>${title}</h2>` : ''}${body}<footer class="pf"><span>Juan Lara · Brand guidelines</span><span>v${T.version}</span></footer></section>`;

const sw = (mode, k, label) => { const m = T.color[mode]; const r = ['bg', 'surface', 'border'].includes(k) ? 'layer' : `${ratio(m[k], m.bg).toFixed(1)}:1`; return `<div class="sw"><i style="background:${m[k]}"></i><b>${label}</b><code>${m[k]}</code><span>${r}</span></div>`; };
const roleRows = ['bg', 'surface', 'border', 'text', 'muted', 'primary', 'harmonic', 'contrast'];
const typeRow = (t) => {
  const fam = `'${T.font[t.font].family}'`;
  const sample = { display: 'Frontier AI. Engineered for production.', title: 'Apache Ossie: one open semantic stack', section: 'Three layers, three questions', name: 'Juan Lara', body: 'Ask three systems in the same bank how much money customers hold in deposits and you will get three numbers.', ui: 'Home · About · Projects · Blog · Read the post →', label: 'Field notes · 53 min read', code: 'docs = retriever.search("saldo total", k=8)' }[t.name];
  const size = { display: 27, title: 22, section: 19, name: 19, body: 15, ui: 14, label: 12, code: 13 }[t.name];
  return `<div class="tr"><div class="tm"><b>${t.name}</b><span>${T.font[t.font].family} ${t.style === 'italic' ? 'Italic ' : ''}${t.weight}</span><span>${t.size === 'inherit' ? '—' : t.size} / ${t.leading} · ${t.tracking}</span></div><div class="ts" style="font-family:${fam};font-style:${t.style};font-weight:${t.weight};letter-spacing:${t.tracking};font-size:${size}px;${t.uppercase ? 'text-transform:uppercase;' : ''}">${sample}</div></div>`;
};
const misuse = (art, text) => `<figure class="mu"><div class="mx">${art}</div><figcaption><span class="no">✕</span>${text}</figcaption></figure>`;
const lockN = svg('lockup-night.svg');

const plates = [
  // 1 cover
  `<section class="plate cover"><div class="cv-lock">${lockN}</div><div class="cv-t"><h1>Brand guidelines<span class="dot">.</span></h1><p>${T.verbal.strap}</p></div><footer class="pf"><span>Version ${T.version} · approved ${T.approved}</span><span>${T.verbal.url}</span></footer></section>`,
  // 2 principles
  plate(2, 'Foundations', 'Frontier AI<span class="dot">.</span> Engineered for production<span class="dot">.</span>', `<div class="cols3">
    <div><h3>Engineer first</h3><p>The brand speaks as an engineer who takes state-of-the-art research to production at enterprise scale. Engineering leads; research is the proof of depth.</p></div>
    <div><h3>Facts over adjectives</h3><p>Concrete systems, numbers and outcomes. No hype words, no self-praise. The visual system follows the same restraint: few colours, one accent per role.</p></div>
    <div><h3>One system, every surface</h3><p>The site, share cards, LinkedIn, GitHub, documents and slides come from one source: <code>brand/tokens.json</code>. Nothing is redrawn by hand.</p></div></div>
    <p class="note">Positioning, voice, bios and the forbidden-phrase list: <code>docs/brand.md</code> §1–9. This book covers the visual identity (§10).</p>`),
  // 3 signature
  plate(3, 'Signature', 'A J drawn as a graph, closed by a full stop<span class="dot">.</span>', `<div class="sig2"><div class="pn-d">${lockN}</div><div class="pn-l">${svg('lockup-day.svg')}</div></div>
    <div class="cols3"><div><h3>The symbol</h3><p>One edge and two ink nodes form the J. The amber node sits where a full stop would: the sentence is finished, the system is shipped.</p></div>
    <div><h3>The full stop</h3><p>It is the brand's recurring device. It closes the tagline, every page and post title, and is the single amber node in any graph.</p></div>
    <div><h3>The name</h3><p>IBM Plex Serif Medium, upright, tracking −1.2 %, outlined in the files. Never italic: italic belongs to the voice, the name is a fact.</p></div></div>`),
  // 4 construction
  plate(4, 'Construction', 'Built on a 48-unit grid', `<div class="cons"><div class="gridbox"><svg viewBox="0 0 48 48" class="g"><g stroke="#2A3448" stroke-width=".14">${grid}</g></svg>${sym(R, N.text, N.contrast, 'class="s"')}</div>
    <div class="gridbox small"><svg viewBox="0 0 48 48" class="g"><g stroke="#2A3448" stroke-width=".14">${grid}</g></svg>${sym(S, N.text, N.contrast, 'class="s"')}</div>
    <dl class="spec"><dt>Regular cut</dt><dd>Stroke ${R.stroke} · ink nodes r ${R.inkRadius} · amber node r ${R.nodeRadius}. Lockups and anything above 32 px.</dd>
    <dt>Small cut</dt><dd>Stroke ${S.stroke} · nodes r ${S.inkRadius} · wider gaps. Favicon and icons from 16 to 32 px, where the regular cut would close up.</dd>
    <dt>Stroke weight</dt><dd>Matched to the stem of Plex Serif Medium so symbol and name read as one weight.</dd>
    <dt>Edge</dt><dd><code>${R.path}</code></dd></dl></div>`),
  // 5 clear space and minimum size
  plate(5, 'Clear space and size', 'Room to breathe, and a floor', `<div class="cs"><div class="csbox"><div class="csin">${lockN}</div><span class="cslab">x = diameter of the amber node, on every side</span></div>
    <div class="mins"><div><div class="minrow"><span style="height:18px;display:inline-block">${lockN.replace('<svg', '<svg style="height:18px;width:auto"')}</span></div><p>Lockup: 18 px tall minimum</p></div>
    <div><div class="minrow"><img src="${exp('icons', 'favicon-16.png')}" width="16" height="16" alt=""><img src="${exp('icons', 'favicon-32.png')}" width="32" height="32" alt=""></div><p>Below that, the small-cut symbol alone: 16 px minimum</p></div>
    <div><p class="rule"><b>One period per signature.</b> Next to the symbol the name has no period; alone, it carries the amber one.</p></div></div></div>`),
  // 6 variants
  plate(6, 'Variants', 'Files for every background', `<div class="vars">
    <figure class="vd">${lockN}<figcaption>lockup-night</figcaption></figure><figure class="vl">${svg('lockup-day.svg')}<figcaption>lockup-day</figcaption></figure>
    <figure class="vd">${svg('wordmark-night.svg')}<figcaption>wordmark-night</figcaption></figure><figure class="vl">${svg('wordmark-day.svg')}<figcaption>wordmark-day</figcaption></figure>
    <figure class="vd sq">${svg('symbol-night.svg')}<figcaption>symbol-night</figcaption></figure><figure class="vl sq">${svg('symbol-day.svg')}<figcaption>symbol-day</figcaption></figure>
    <figure class="vl sq">${svg('symbol-mono-black.svg')}<figcaption>symbol-mono-black</figcaption></figure><figure class="vd sq">${svg('symbol-mono-white.svg')}<figcaption>symbol-mono-white</figcaption></figure></div>
    <p class="note">SVG masters in <code>brand/logo/</code>, PNG exports in <code>brand/exports/logo/</code>. Day files on light backgrounds, night files on dark ones, one-ink files for print and embossing.</p>`),
  // 7 misuse
  plate(7, 'Misuse', 'What never happens to the signature', `<div class="mus">
    ${misuse(`<span class="ml">${sym(R, N.text, N.contrast, 'width="40" height="40"')}<i style="font:italic 500 34px/1 'IBM Plex Serif',serif;color:${N.text}">Juan Lara</i></span>`, 'The name in italic')}
    ${misuse(`<span class="ml">${sym(R, N.text, N.primary, 'width="40" height="40"')}<b style="font:500 34px/1 'IBM Plex Serif',serif;color:${N.text}">Juan Lara</b></span>`, 'The node in any colour but amber')}
    ${misuse(`<span class="ml">${sym(R, N.text, N.contrast, 'width="40" height="40"')}<b style="font:500 34px/1 'IBM Plex Serif',serif;color:${N.text}">Juan Lara<span style="color:${N.contrast}">.</span></b></span>`, 'Two periods in one signature')}
    ${misuse(`<span class="ml" style="transform:scaleX(1.45)">${lockN.replace('<svg', '<svg style="height:44px;width:auto"')}</span>`, 'Stretched or condensed')}
    ${misuse(`<span class="ml" style="filter:drop-shadow(0 0 10px ${N.primary})">${lockN.replace('<svg', '<svg style="height:44px;width:auto"')}</span>`, 'Glows, shadows, outlines, gradients')}
    ${misuse(`<span class="ml photo" style="background-image:url(${photo})">${lockN.replace('<svg', '<svg style="height:44px;width:auto"').replace(/<rect[^>]*\/>/, '')}</span>`, 'On a photo without the night tile')}</div>`),
  // 8 colour
  plate(8, 'Colour', 'Instrumento: three hues with fixed jobs', `<div class="pal"><div><h4>Night</h4>${roleRows.map((k) => sw('night', k, k)).join('')}</div><div><h4>Day</h4>${roleRows.map((k) => sw('day', k, k)).join('')}</div></div>
    <div class="share"><i style="width:60%;background:${N.border}"></i><i style="width:25%;background:${N.primary}"></i><i style="width:10%;background:${N.harmonic}"></i><i style="width:5%;background:${N.contrast}"></i></div>
    <p class="note">Base 60 % · primary 25 % · harmonic 10 % · contrast 5 % max. Ratios are WCAG contrast against the background of each mode; every text role passes AA in both.</p>`),
  // 9 colour roles
  plate(9, 'Colour roles', 'Each colour has one job', `<div class="roles">${['primary', 'harmonic', 'contrast', 'muted'].map((k) => `<div class="role"><i style="background:${N[k]}"></i><div><b>${k}</b> <span class="hue">${['primary', 'harmonic', 'contrast'].includes(k) ? hue(N[k]) + '°' : ''}</span><p>${T.roles[k].use}</p></div></div>`).join('')}</div>
    <div class="cols3"><div><h3>Why three hues</h3><p>Cyan and cobalt are neighbours (${hue(N.primary)}° and ${hue(N.harmonic)}°), so they harmonise; amber sits opposite (${hue(N.contrast)}°) and pulls the eye to one thing at a time.</p></div>
    <div><h3>Categories</h3><p>Field Notes in primary, Research Notes in harmonic, Curiosities in muted. Colour follows the positioning weight.</p></div>
    <div><h3>Never</h3><p>Per-company, per-pillar or decorative colours. Red, amber-500 and green exist only as UI states. No hex values in components.</p></div></div>`),
  // 10 typography
  plate(10, 'Typography', 'IBM Plex: one superfamily, three roles', `<div class="fams">
    <div><span class="big" style="font-family:'IBM Plex Serif';font-style:italic;font-weight:600">Aa</span><b>IBM Plex Serif</b><p>Voice and name. Titles in italic 600, sections upright 600, the name upright 500.</p></div>
    <div><span class="big" style="font-family:'IBM Plex Sans';font-weight:500">Aa</span><b>IBM Plex Sans</b><p>Reading and interface. 400 for text at 18 px / 1.7, 500 for controls.</p></div>
    <div><span class="big" style="font-family:'IBM Plex Mono';font-weight:500">Aa</span><b>IBM Plex Mono</b><p>Code, labels and metadata. Labels in uppercase with +12 % tracking.</p></div></div>
    <p class="note">Serif, Sans and Mono share one skeleton: measured x-heights 0.520 / 0.520 / 0.515 of the em, so they sit on one line without adjustment. Plex has no optical-size axis; large titles are tuned with weight and negative tracking. Licence: SIL Open Font License.</p>`),
  // 11 type scale
  plate(11, 'Type scale', 'Eight roles, no others', `<div class="scale">${T.type.map(typeRow).join('')}</div>`),
  // 12 imagery
  plate(12, 'Imagery', 'Photos join the palette; the graph is the motif', `<div class="img2"><figure><img src="${photo}" alt=""><figcaption>Source photo</figcaption></figure><figure><img src="${photo}" alt="" style="filter:url(#duo)"><figcaption>Brand duotone: shadows to night, mid-tones to cobalt, highlights to light cyan</figcaption></figure>
    <figure class="gm"><svg viewBox="0 0 170 190">${[[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [3, 6], [6, 7], [4, 7], [5, 7]].map(([a, b]) => { const P = [[18, 30], [92, 14], [140, 52], [36, 92], [104, 98], [146, 140], [24, 150], [92, 168]]; return `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${N.harmonic}" stroke-width="1" opacity=".55"/>`; }).join('')}${[[18, 30], [92, 14], [140, 52], [36, 92], [104, 98], [146, 140], [24, 150], [92, 168]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 4 ? 5.4 : 3.2}" fill="${i === 4 ? N.contrast : N.primary}"/>`).join('')}</svg><figcaption>Graph motif: harmonic edges, primary nodes, exactly one amber node</figcaption></figure></div>
    <p class="note">The filter is applied in code to every blog photo; source files are never modified. Share cards are typographic, never a photo.</p>`),
  // 13 web
  plate(13, 'Applications · web', 'Tab, home screen, app', `<div class="web"><div class="tabs"><div class="tabbar lt"><div class="tab"><img src="${exp('icons', 'favicon-16.png')}" width="16" height="16" alt=""><span>Juan Lara · AI Engineer</span><span class="x">×</span></div></div><div class="tabbar dk"><div class="tab"><img src="${exp('icons', 'favicon-16.png')}" width="16" height="16" alt=""><span>Juan Lara · AI Engineer</span><span class="x">×</span></div></div><p class="cap">favicon.svg + favicon.ico (16, 32, 48)</p></div>
    <div class="apps"><figure><img src="${exp('icons', 'apple-touch-icon.png')}" style="border-radius:22%" width="120" alt=""><figcaption>apple-touch-icon 180, opaque</figcaption></figure><figure><img src="${exp('icons', 'icon-512.png')}" style="border-radius:22%" width="120" alt=""><figcaption>icon-192 / icon-512</figcaption></figure><figure><img src="${exp('icons', 'icon-maskable-512.png')}" style="border-radius:50%" width="120" alt=""><figcaption>maskable 512, 80 % safe zone</figcaption></figure></div></div>
    <p class="note">The icon always sits on its night tile, so it reads the same in light and dark browsers. <code>theme-color</code> is declared per colour scheme.</p>`),
  // 14 share cards
  plate(14, 'Applications · sharing', 'What people see when a link is shared', `<div class="og2"><figure><img src="${exp('social', 'og-default.png')}" alt=""><figcaption>og-default · every page that is not a post</figcaption></figure><figure><img src="${exp('social', 'og-post-example.png')}" alt=""><figcaption>og-post · one per post: category, title, signature</figcaption></figure></div>`),
  // 15 linkedin + github
  plate(15, 'Applications · profiles', 'LinkedIn and GitHub', `<div class="li"><div class="liframe"><img src="${exp('social', 'linkedin-banner.png')}" alt=""><span class="liphoto" style="background-image:url(${portrait})"></span><span class="safe"></span></div></div>
    <div class="gh"><div class="cap">linkedin-banner 1584 × 396, shown with a simulated profile photo. The dashed area is the text safe zone: the photo covers the lower left on desktop and the mobile app crops the sides.<br><br>github-social 1280 × 640 → repository Settings → Social preview.</div><img src="${exp('social', 'github-social.png')}" alt=""></div>`),
  // 16 files
  plate(16, 'The system', 'Where everything lives', `<div class="tree"><pre>brand/
  tokens.json      single source: colour, type, logo geometry, formats
  fonts/           IBM Plex Serif Medium (OFL)
  logo/            SVG masters
  templates/       one HTML template per channel
  scripts/         build_logo · build_tokens · render · build_book
  exports/         icons · logo PNGs · social images · token files
  guidelines/      this book (HTML + PDF)</pre>
    <dl class="spec"><dt>Regenerate</dt><dd><code>npm run brand</code> in <code>front/</code>, then commit the results</dd><dt>Rules</dt><dd><code>docs/brand.md</code> §10</dd><dt>Site</dt><dd>reads the tokens through <code>brand-tokens.css</code> and <code>tailwind.config.js</code></dd><dt>New piece</dt><dd>add a template, a size in <code>formats</code>, a line in <code>render.mjs</code></dd></dl></div>`),
];

const css = `
:root{--bg:${N.bg};--surface:${N.surface};--border:${N.border};--text:${N.text};--muted:${N.muted};--primary:${N.primary};--harmonic:${N.harmonic};--contrast:${N.contrast};
--serif:"IBM Plex Serif",Georgia,serif;--sans:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;color-scheme:dark}
*{box-sizing:border-box}html,body{margin:0;background:#000}body{font:400 16px/1.55 var(--sans);color:var(--text);-webkit-font-smoothing:antialiased}
.deck{display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px 0 48px}
.frame{width:var(--fw);height:var(--fh);overflow:hidden}
.plate{width:1280px;height:720px;position:relative;background:var(--bg);padding:56px 72px 64px;overflow:hidden;transform-origin:0 0;transform:scale(var(--k));display:flex;flex-direction:column;gap:22px}
.ph{display:flex;gap:16px;align-items:baseline;font:500 12px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase}.pn{color:var(--contrast)}.pk{color:var(--muted)}
h1,h2{margin:0;font-family:var(--serif);font-style:italic;font-weight:600;letter-spacing:-.02em;text-wrap:balance}h2{font-size:40px;line-height:1.1}
h3{margin:0 0 6px;font:600 17px/1.3 var(--serif)}h4{margin:0 0 8px;font:500 12px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
p{margin:0;color:var(--muted);font-size:15px}code{font:400 .88em var(--mono);color:var(--primary)}.dot{color:var(--contrast)}
.note{font-size:13.5px;margin-top:auto}.cap{font:400 12px/1.4 var(--mono);color:var(--muted)}
.pf{position:absolute;left:72px;right:72px;bottom:26px;display:flex;justify-content:space-between;font:400 11px/1 var(--mono);letter-spacing:.08em;color:var(--muted);opacity:.7}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:36px}
.cover{justify-content:center;gap:56px;padding:96px}.cv-lock svg{height:96px;width:auto}.cover h1{font-size:72px}.cover .cv-t p{font:500 15px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;margin-top:18px}
.sig2{display:grid;grid-template-columns:1fr 1fr;gap:0;height:250px}.sig2>div{display:grid;place-items:center}.pn-d{background:var(--bg);border:1px solid var(--border)}.pn-l{background:#fff}.sig2 svg{height:76px;width:auto}
.cons{display:grid;grid-template-columns:400px 200px 1fr;gap:40px;align-items:start}.gridbox{position:relative;width:400px;height:400px;border:1px solid var(--border)}.gridbox.small{width:200px;height:200px}.gridbox svg{position:absolute;inset:0;width:100%;height:100%}
.spec{margin:0;display:grid;grid-template-columns:150px 1fr;gap:12px 18px;font-size:14px}.spec dt{font:500 12px/1.5 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--primary)}.spec dd{margin:0;color:var(--muted)}
.cs{display:grid;grid-template-columns:620px 1fr;gap:48px;align-items:center}.csbox{position:relative;border:1px dashed var(--harmonic);padding:34px;display:grid;place-items:center}.csin{outline:1px solid var(--border)}.csin svg{height:110px;width:auto;display:block}.cslab{position:absolute;bottom:-26px;left:0;font:400 12px var(--mono);color:var(--harmonic)}
.mins{display:grid;gap:26px}.minrow{display:flex;gap:16px;align-items:end;margin-bottom:8px}.rule b{color:var(--text)}
.vars{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.vars figure{margin:0;height:150px;display:grid;place-items:center;position:relative;padding:20px}.vars svg{max-height:46px;max-width:100%;width:auto}.vars .sq svg{height:76px;max-height:76px}.vd{background:var(--bg);border:1px solid var(--border)}.vl{background:#fff}
.vars figcaption{position:absolute;bottom:8px;left:10px;font:400 11px var(--mono);color:#8b93a3}
.mus{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.mu{margin:0;display:grid;gap:10px}.mx{height:150px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--border);overflow:hidden}
.ml{display:inline-flex;align-items:center;gap:12px}.ml.photo{width:100%;height:100%;justify-content:center;background-size:cover;background-position:center}.mu figcaption{font-size:14px;color:var(--text);display:flex;gap:10px;align-items:center}.no{color:#F87171;font-weight:600}
.pal{display:grid;grid-template-columns:1fr 1fr;gap:40px}.sw{display:grid;grid-template-columns:26px 120px 90px 1fr;gap:12px;align-items:center;font-size:13.5px;padding:4px 0}.sw i{width:26px;height:18px;box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)}.sw b{font-weight:500}.sw code{color:var(--muted)}.sw span{font:400 12px var(--mono);color:var(--muted)}
.share{display:flex;height:14px;gap:2px}.share i{display:block}
.roles{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 40px}.role{display:grid;grid-template-columns:40px 1fr;gap:16px;align-items:start}.role i{width:40px;height:40px;border-radius:50%}.role b{font:600 16px var(--serif)}.hue{font:400 12px var(--mono);color:var(--muted)}
.fams{display:grid;grid-template-columns:repeat(3,1fr);gap:36px}.fams .big{display:block;font-size:110px;line-height:1;margin-bottom:12px;color:var(--text)}.fams b{display:block;font:600 17px var(--sans);margin-bottom:6px}
.scale{display:grid;gap:0;border-top:1px solid var(--border)}.tr{display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:baseline;padding:3px 0;border-bottom:1px solid var(--border)}.tm{display:grid;gap:1px;font:400 11px/1.3 var(--mono);color:var(--muted)}.tm b{font:500 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--primary)}.ts{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.img2{display:grid;grid-template-columns:1fr 1fr 280px;gap:22px}.img2 figure{margin:0;display:grid;gap:8px}.img2 img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}.img2 figcaption{font:400 12px/1.4 var(--mono);color:var(--muted)}.gm svg{width:100%;aspect-ratio:16/10;background:var(--bg);border:1px solid var(--border)}
.web{display:grid;grid-template-columns:420px 1fr;gap:56px;align-items:center}.tabs{display:grid;gap:10px}.tabbar{padding:8px 8px 0}.tabbar.lt{background:#DFE1E5}.tabbar.dk{background:#202124}.tab{display:flex;align-items:center;gap:9px;padding:10px 13px;border-radius:8px 8px 0 0;font:400 13px var(--sans)}.tabbar.lt .tab{background:#fff;color:#1F2937}.tabbar.dk .tab{background:#35363A;color:#E8EAED}.tab .x{margin-left:auto;opacity:.5}
.apps{display:flex;gap:36px;flex-wrap:wrap}.apps figure{margin:0;display:grid;gap:10px;justify-items:center}.apps img{box-shadow:0 0 0 1px var(--border)}.apps figcaption{font:400 12px var(--mono);color:var(--muted);text-align:center;max-width:150px}
.og2{display:grid;grid-template-columns:1fr 1fr;gap:28px}.og2 figure{margin:0;display:grid;gap:10px}.og2 img{width:100%;display:block;border:1px solid var(--border)}.og2 figcaption{font:400 12px var(--mono);color:var(--muted)}
.li{display:grid;gap:8px}.liframe{position:relative;border:1px solid var(--border)}.liframe img{width:100%;display:block}.liphoto{position:absolute;left:3%;bottom:-24%;width:17%;aspect-ratio:1;border-radius:50%;background-size:cover;background-position:center;border:4px solid #1B1F23}.safe{position:absolute;left:37.9%;right:12.9%;top:10%;bottom:10%;border:1px dashed var(--harmonic)}
.gh{display:grid;grid-template-columns:1fr 300px;gap:32px;align-items:start;margin-top:44px}.gh img{width:100%;border:1px solid var(--border)}
.tree{display:grid;grid-template-columns:1fr 1fr;gap:48px}.tree pre{margin:0;font:400 14px/1.75 var(--mono);color:var(--text);background:var(--surface);border:1px solid var(--border);padding:22px}
@media print{html,body{background:var(--bg)}.deck{display:block;padding:0}.frame{width:1280px!important;height:720px!important;break-after:page}.plate{transform:none}}
@page{size:1280px 720px;margin:0}
`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Juan Lara Brand Guidelines</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${T.font.googleFontsQuery}">
<style>${css}</style></head><body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="duo" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${duo.map((s) => s[0]).join(' ')}"/><feFuncG type="table" tableValues="${duo.map((s) => s[1]).join(' ')}"/><feFuncB type="table" tableValues="${duo.map((s) => s[2]).join(' ')}"/></feComponentTransfer></filter></svg>
<main class="deck">${plates.map((p) => `<div class="frame">${p}</div>`).join('\n')}</main>
<script>
  // Scale each 1280x720 plate to the viewport width; print and PDF use native size.
  function fit(){const w=Math.min(1280,document.documentElement.clientWidth-32);const k=w/1280;document.documentElement.style.setProperty('--k',k);document.documentElement.style.setProperty('--fw',w+'px');document.documentElement.style.setProperty('--fh',(720*k)+'px');}
  fit();addEventListener('resize',fit);
</script>
</body></html>
`;

const outDir = path.join(BRAND, 'guidelines');
fs.mkdirSync(outDir, { recursive: true });
const htmlFile = path.join(outDir, 'brand-book.html');
fs.writeFileSync(htmlFile, html);
console.log('brand:book   ', path.relative(ROOT, htmlFile), `(${plates.length} plates)`);

const puppeteer = createRequire(path.join(ROOT, 'front', 'package.json'))('puppeteer');
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1312, height: 800 });
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.emulateMediaType('print');
const pdfFile = path.join(outDir, 'brand-book.pdf');
await page.pdf({ path: pdfFile, width: '1280px', height: '720px', printBackground: true, pageRanges: '' });
// Plate previews for review (--plates): written to guidelines/plates/, which is git-ignored.
if (process.argv.includes('--plates')) {
  fs.mkdirSync(path.join(outDir, 'plates'), { recursive: true });
  await page.emulateMediaType('screen');
  const frames = await page.$$('.frame');
  for (let i = 0; i < frames.length; i++) await frames[i].screenshot({ path: path.join(outDir, 'plates', `${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
console.log('brand:book   ', path.relative(ROOT, pdfFile));
