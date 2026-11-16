# Brand system

The source of every brand asset: the site, share cards, LinkedIn, GitHub, documents and slides. Nothing visual is designed outside this folder; everything else consumes what it produces.

The rules (what to do and what never to do) are in [`docs/brand.md`](../docs/brand.md) §10, and in the brand book: [`guidelines/brand-book.pdf`](guidelines/brand-book.pdf) (also [`brand-book.html`](guidelines/brand-book.html)). This file explains how the system works.

## Layout

```
brand/
  tokens.json        single source: colours (night, day), roles, fonts, type scale, logo geometry, motif, formats, copy
  motifs/            the graph motifs: geometry and motion as pure functions of time, plus SVG renderers
  fonts/             IBM Plex Serif Medium (OFL) used to outline the name in the logo
  logo/              SVG masters, generated from tokens.json
  templates/         HTML templates, one per channel, rendered at native size
  scripts/           generators (see below)
  exports/           ready-to-upload files: icons, logo PNGs, social images, token files
  guidelines/        the brand book, generated
```

## Commands

Run from `front/`:

| Command | Does |
|---|---|
| `npm run brand` | Everything below, in order |
| `npm run brand:logo` | `tokens.json` → `logo/*.svg` (Python, needs `fontTools`) |
| `npm run brand:tokens` | `tokens.json` → `front/src/styles/brand-tokens.css`, `front/src/data/brandTokens.json`, `exports/tokens/`; copies `motifs/motifs.mjs` to `front/src/brand/motifs.js` |
| `npm run brand:render` | `logo/` + `templates/` → `exports/` (Puppeteer), then copies site icons, `og-default.png` and logo SVGs into `front/public/` |
| `npm run brand:book` | Builds `guidelines/brand-book.html` and `.pdf` from tokens, masters and exports |

Generated files are committed, so the site build and CI never run these. Run `npm run brand` after any change to `tokens.json`, a template or a script, and commit the results together.

## Where each value is used

| Value in `tokens.json` | Consumed by |
|---|---|
| `color`, `font` | `brand-tokens.css` (CSS variables, `.type-*` classes), `tailwind.config.js` (reads the JSON directly), `brandTokens.json` (React), every template, the brand book |
| `categories` | `categoryToneClass()` in `front/src/utils/blogUtils.js` |
| `duotone` | The `#brand-duotone` SVG filter in `front/src/App.js` |
| `motif` | `HeroVisual.jsx` (live), `brandGraph()` in every template (still frame), the motif plate of the brand book |
| `logo` | `build_logo.py` (masters) and `front/src/components/ui/Logo.jsx` (inline symbol; keep its geometry in sync) |
| `verbal` | Templates (tagline, strap, URL). The full verbal layer lives in `docs/brand.md` and `front/src/data/brand.js` |
| `formats` | Render sizes of icons and social images |

## Channels

| File in `exports/` | Where it goes |
|---|---|
| `icons/*` | Copied to `front/public/` by `brand:render`; referenced from `index.html` and `manifest.json` |
| `social/og-default.png` | Share image of every page that is not a post |
| `social/og-post-example.png` | Reference for the per-post share card (template `og-post.html`) |
| `social/linkedin-banner.png` | LinkedIn → profile → edit intro → background photo. Text stays inside the safe zone; the lower-left corner is covered by the profile photo |
| `social/github-social.png` | GitHub → repository → Settings → General → Social preview |
| `logo/*.png` | Documents, slides and tools that do not accept SVG |
| `tokens/brand.css` | Plain hex variables for slides, documents and anything outside the site |
| `tokens/contrast.md` | WCAG contrast of every text role in both modes |

## The motif

`motifs/motifs.mjs` holds four graphs: `icosian` (Hamilton's Icosian game, active), `heawood`, `fano`, `paley`. Each is `frame(t)`: a pure function from seconds to the look of every node and edge, so the browser, Puppeteer and the book draw identical frames. Two renderers share it: `motifSVG(id, palette, t)` returns static markup, `mountMotif(svg, id, palette, options)` animates an `<svg>`.

- Switch the motif: set `motif.active` in `tokens.json` to any id in `motif.family`, run `npm run brand`, commit.
- Use another member in one place: templates accept `?motif=<id>`; React takes `<HeroVisual motif="heawood" />`.
- Add a member: write a builder in `motifs.mjs` returning `{ nodes, edges, frame, still, period }`, add its story to `MOTIF_STORIES`, its id to `motif.family`. Keep the rules: harmonic edges, primary nodes, one amber node per frame.

## Adding a piece

1. Create `templates/<name>.html`. Include `_base.css` and `_brand.js`; read colours from CSS variables (`var(--primary)`), fonts from `var(--serif)`, copy from `BRAND.verbal`. Use `brandGraph()`, `lockupImg()` and `tagline()` instead of redrawing them.
2. Add its size to `formats` in `tokens.json` and a line to the `social` list in `scripts/render.mjs`.
3. `npm run brand:render`, review the PNG, commit template and export together.

Never hard-code a colour, a font name or the tagline in a template or a component.

## Pending pieces

- Per-post share cards, generated from `og-post.html` at build time.
- Knowledge graph page and print PDFs moved onto the palette and IBM Plex.
- CV header and slide template.
