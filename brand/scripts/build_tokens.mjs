// Generate code tokens from brand/tokens.json.
//
//   node brand/scripts/build_tokens.mjs        (or `npm run brand:tokens` in front/)
//
// Writes:
//   front/src/styles/brand-tokens.css   CSS variables for both modes + type role classes (imported by the app)
//   front/src/data/brandTokens.json     colours, duotone and category roles for React code
//   brand/exports/tokens/brand.css      the same variables as plain hex, for anything outside the site
//   brand/exports/tokens/contrast.md    WCAG contrast of every text role in both modes
//   front/src/brand/motifs.js           copy of brand/motifs/motifs.mjs (CRA cannot import outside src/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BRAND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(BRAND, '..');
const T = JSON.parse(fs.readFileSync(path.join(BRAND, 'tokens.json'), 'utf8'));
const { night, day } = T.color;

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const channels = (h) => rgb(h).join(' ');
const lum = (h) => {
  const c = rgb(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, t) => rgb(a).map((v, i) => +((v + (rgb(b)[i] - v) * t) / 255).toFixed(3));
const write = (rel, text) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text.replace(/\r\n/g, '\n'));
  console.log('brand:tokens ', rel);
};

const ROLES = ['bg', 'surface', 'border', 'text', 'muted', 'primary', 'primaryHover', 'harmonic', 'contrast'];
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const block = (mode) => ROLES.map((k) => `  --brand-${kebab(k)}: ${channels(mode[k])}; /* ${mode[k]} */`).join('\n');
const fontStack = (f) => `"${T.font[f].family}", ${T.font[f].fallback}`;

const duotone = [rgb(night.bg).map((v) => +(v / 255).toFixed(3)), mix(night.bg, night.harmonic, T.duotone.midMix), mix(night.primary, '#FFFFFF', T.duotone.highlightMix)];
const duotoneTables = [0, 1, 2].map((i) => duotone.map((s) => s[i]).join(' '));

const typeCss = T.type
  .map((t) => `.type-${t.name}{font-family:var(--font-${t.font});font-style:${t.style};font-weight:${t.weight};letter-spacing:${t.tracking};${t.uppercase ? 'text-transform:uppercase;' : ''}}`)
  .join('\n');

const header = `/* Generated from brand/tokens.json by brand/scripts/build_tokens.mjs. Do not edit by hand. */\n`;

write('front/src/styles/brand-tokens.css', `${header}/* Colour roles as RGB channels so Tailwind opacity modifiers work: rgb(var(--brand-primary) / .4).
   Day on :root, night on .dark (Tailwind darkMode: 'class'). */
:root{
${block(day)}
  --font-serif: ${fontStack('serif')};
  --font-sans: ${fontStack('sans')};
  --font-mono: ${fontStack('mono')};
}
.dark{
${block(night)}
}

/* Type roles. Size and leading stay with the layout; these fix family, style, weight and tracking.
   Loaded before Tailwind's utilities, so a utility on the same element wins. */
${typeCss}
.brand-duotone{filter:url(#brand-duotone)}
`);

write('front/src/data/brandTokens.json', JSON.stringify({
  generatedFrom: 'brand/tokens.json',
  version: T.version,
  color: T.color,
  font: Object.fromEntries(Object.entries(T.font).filter(([k]) => k !== 'googleFontsQuery').map(([k, v]) => [k, v.family])),
  categories: T.categories,
  motif: T.motif,
  duotone: { r: duotoneTables[0], g: duotoneTables[1], b: duotoneTables[2] },
}, null, 2) + '\n');

const hexBlock = (mode) => ROLES.map((k) => `  --brand-${kebab(k)}: ${mode[k]};`).join('\n');
write('brand/exports/tokens/brand.css', `${header}/* Plain hex variables for slides, documents and any surface outside the site. */
:root{
${hexBlock(day)}
  --font-serif: ${fontStack('serif')};
  --font-sans: ${fontStack('sans')};
  --font-mono: ${fontStack('mono')};
}
@media (prefers-color-scheme: dark){:root{
${hexBlock(night)}
}}
`);

const rows = ['| Token | Use | Night | Ratio | Day | Ratio |', '|---|---|---|---|---|---|'];
for (const k of Object.keys(T.roles)) {
  const layer = ['bg', 'surface', 'border'].includes(k);
  const r = (m) => (layer ? '—' : `${ratio(m[k], m.bg).toFixed(1)}:1`);
  rows.push(`| \`${k}\` | ${T.roles[k].use} | \`${night[k]}\` | ${r(night)} | \`${day[k]}\` | ${r(day)} |`);
}
write('brand/exports/tokens/contrast.md', `<!-- Generated from brand/tokens.json. WCAG contrast against the page background of each mode. -->\n${rows.join('\n')}\n`);

const motifSrc = fs.readFileSync(path.join(BRAND, 'motifs', 'motifs.mjs'), 'utf8');
if (!T.motif.family.includes(T.motif.active)) throw new Error(`motif.active "${T.motif.active}" is not in motif.family`);
write('front/src/brand/motifs.js', `/* Copied from brand/motifs/motifs.mjs by brand/scripts/build_tokens.mjs. Edit the original. */
/* eslint-disable */
${motifSrc}`);
