// Assemble the designer hand-off package from the brand system.
//
//   node brand/scripts/build_kit.mjs        (or `npm run brand:kit` in front/)
//
// Writes brand/exports/motif/*.svg and brand/exports/tokens/palette.csv (committed),
// then builds brand/dist/juan-lara-brand-kit-v<version>/ and a .zip of it
// (git-ignored; attached to GitHub Releases).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { motifSVG, MOTIF_STORIES } from '../motifs/motifs.mjs';

const BRAND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(fs.readFileSync(path.join(BRAND, 'tokens.json'), 'utf8'));
const { night, day } = T.color;
const write = (file, text) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text.replace(/\r\n/g, '\n')); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');

// 1. Motif stills, night and day, on transparent background
for (const id of T.motif.family) {
  for (const [mode, c] of [['night', night], ['day', day]]) {
    const pal = { primary: c.primary, harmonic: c.harmonic, contrast: c.contrast, muted: c.muted };
    write(path.join(BRAND, 'exports', 'motif', `${id}-${mode}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="800" height="800" role="img" aria-label="${MOTIF_STORIES[id].name}"><title>${MOTIF_STORIES[id].name}</title>${motifSVG(id, pal)}</svg>\n`);
  }
}

// 2. Palette as CSV, for Figma, Adobe and slides
const rows = [['role', 'night_hex', 'night_rgb', 'day_hex', 'day_rgb', 'use']];
for (const k of Object.keys(T.roles)) rows.push([k, night[k], `"${rgb(night[k])}"`, day[k], `"${rgb(day[k])}"`, `"${T.roles[k].use}"`]);
write(path.join(BRAND, 'exports', 'tokens', 'palette.csv'), rows.map((r) => r.join(',')).join('\n') + '\n');

// 3. The package
const name = `juan-lara-brand-kit-v${T.version}`;
const DIST = path.join(BRAND, 'dist');
const OUT = path.join(DIST, name);
fs.rmSync(OUT, { recursive: true, force: true });
const copy = (from, to) => { const dest = path.join(OUT, to); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(path.join(BRAND, from), dest); };
const copyDir = (from, to, filter = () => true) => fs.readdirSync(path.join(BRAND, from)).filter(filter).forEach((f) => copy(path.join(from, f), path.join(to, f)));

copy('guidelines/brand-book.pdf', '01-brand-guidelines.pdf');
copyDir('logo', '02-logo/svg', (f) => !f.startsWith('icon-') && f !== 'favicon.svg');
copyDir('exports/logo', '02-logo/png');
copyDir('exports/icons', '03-icons');
copyDir('exports/social', '04-social');
copy('exports/tokens/palette.csv', '05-color/palette.csv');
copy('exports/tokens/brand.css', '05-color/brand.css');
copy('exports/tokens/contrast.md', '05-color/contrast.md');
copy('tokens.json', '05-color/tokens.json');
copy('fonts/IBMPlexSerif-Medium.ttf', '06-type/IBMPlexSerif-Medium.ttf');
copy('fonts/OFL.txt', '06-type/OFL.txt');
copyDir('exports/motif', '07-motif');
copyDir('templates', '08-templates');

write(path.join(OUT, '06-type', 'fonts.md'), `# Typography: IBM Plex

One superfamily, three roles. Free under the SIL Open Font License (see OFL.txt).

| Family | Role | Weights used | Download |
|---|---|---|---|
| IBM Plex Serif | Voice and name: titles (italic 600), sections (600), the name (500, never italic) | 400, 500, 600 · italic 400, 600 | https://fonts.google.com/specimen/IBM+Plex+Serif |
| IBM Plex Sans | Reading and interface | 400, 500, 600, 700 · italic 400, 600 | https://fonts.google.com/specimen/IBM+Plex+Sans |
| IBM Plex Mono | Code, labels and metadata (labels uppercase, +12% tracking) | 400, 500, 600 · italic 400 | https://fonts.google.com/specimen/IBM+Plex+Mono |

The type scale is plate 11 of the brand guidelines and the \`type\` list in \`05-color/tokens.json\`.
`);

const sw = (k) => `| ${k} | \`${night[k]}\` | \`${day[k]}\` | ${T.roles[k].use} |`;
write(path.join(OUT, 'README.md'), `# Juan Lara · brand kit v${T.version}

Everything needed to design for the Juan Lara brand. Start with **01-brand-guidelines.pdf**: it shows how each file is used and what never to do. The guidelines are in English; this README is in English and Spanish.

*Todo lo necesario para diseñar para la marca Juan Lara. Empieza por **01-brand-guidelines.pdf**: muestra cómo se usa cada archivo y qué no hacer nunca.*

## Contents · Contenido

| Folder | What it holds · Qué contiene |
|---|---|
| \`01-brand-guidelines.pdf\` | The brand book, 17 plates · El manual de marca |
| \`02-logo/svg\` | Lockup (symbol + name), wordmark (name + period), symbol, one-ink versions. Outlined, no font needed · Firma, nombre, símbolo y versiones a una tinta, en curvas |
| \`02-logo/png\` | The same at 2x and 512 px, for tools that do not take SVG · Lo mismo en PNG |
| \`03-icons\` | Favicon (ICO, SVG, PNG), app icons, maskable icon · Íconos |
| \`04-social\` | Share card, post card example, LinkedIn banner, GitHub preview · Imágenes sociales |
| \`05-color\` | \`palette.csv\` (HEX and RGB, both modes), \`brand.css\`, \`tokens.json\`, contrast table · Paleta |
| \`06-type\` | IBM Plex: roles, weights, download links, licence · Tipografía |
| \`07-motif\` | The graph motif and its family, night and day · El motivo y su familia |
| \`08-templates\` | HTML sources of the social images, for reference · Fuentes HTML de las imágenes |

## Palette · Paleta

| Role | Night | Day | Use |
|---|---|---|---|
${Object.keys(T.roles).map(sw).join('\n')}

## Five rules · Cinco reglas

1. **One period per signature.** Next to the symbol the name has no period; alone, it carries the amber one. · *Un solo punto por firma.*
2. **The name is never italic.** IBM Plex Serif Medium, upright. Italic is for the tagline and titles. · *El nombre nunca va en itálica.*
3. **Amber is for one thing.** The logo node and the period that closes a title. Never a background, a button or decoration. · *El ámbar es para una sola cosa.*
4. **Three hues with fixed jobs.** Cyan primary, cobalt harmonic, amber contrast. No other colours except UI states. · *Tres colores con roles fijos.*
5. **Night is near-black, day is pure white.** The icon always sits on its night tile. · *La noche es casi negra, el día blanco puro.*

## Source · Fuente

Every file here is generated from \`brand/tokens.json\` in https://github.com/JuanLara18/portfolio (folder \`brand/\`). To change the brand, change the tokens there and regenerate; do not edit these files by hand. · *Todo se genera desde \`brand/tokens.json\`; no edites estos archivos a mano.*
`);

// 4. Zip
const zip = path.join(DIST, `${name}.zip`);
fs.rmSync(zip, { force: true });
const py = `import os,sys,zipfile\nsrc,dst=sys.argv[1],sys.argv[2]\nwith zipfile.ZipFile(dst,'w',zipfile.ZIP_DEFLATED) as z:\n  for r,_,fs in os.walk(src):\n    for f in sorted(fs):\n      p=os.path.join(r,f); z.write(p, os.path.relpath(p, os.path.dirname(src)))\n`;
let res = spawnSync('python', ['-c', py, OUT, zip], { stdio: 'inherit' });
if (res.status !== 0) res = spawnSync('python3', ['-c', py, OUT, zip], { stdio: 'inherit' });
if (res.status !== 0) throw new Error('zip failed: Python is required');
const count = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(d, e.name)) : 1), 0);
console.log('brand:kit    ', path.relative(path.resolve(BRAND, '..'), zip), `(${count(OUT)} files, ${(fs.statSync(zip).size / 1048576).toFixed(1)} MB)`);
