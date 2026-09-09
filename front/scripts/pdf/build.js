#!/usr/bin/env node
'use strict';

/**
 * build.js — compiles one series (or reading path) into a print-ready PDF.
 *
 *   node scripts/pdf/build.js the-shape-of-a-problem
 *   node scripts/pdf/build.js the-shape-of-a-problem --layout=all
 *   node scripts/pdf/build.js --list
 *
 * Pipeline: manifest → markdown assembly (Mermaid pre-rendered to vector PDF)
 * → pandoc + a Lua layout filter → XeLaTeX → output/series/.
 *
 * The design premise is that the typesetting belongs to LaTeX. This file only
 * decides *what* goes on the page and hands LaTeX the numbers; it never
 * measures a string or breaks a line itself. That is the whole difference
 * from the PDFKit generator it replaces.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const matter = require('gray-matter');
const { execFileSync } = require('child_process');

const { parseManifests, getManifest } = require('./manifests');
const { getLayout, LAYOUTS, wideWidth, textHeight } = require('./layouts');
const { renderDiagram } = require('./mermaid');

const FRONT_DIR = path.join(__dirname, '..', '..');
const REPO_DIR = path.join(FRONT_DIR, '..');
const POSTS_JSON = path.join(REPO_DIR, 'knowledge-base', 'posts.json');
const OUT_DIR = path.join(FRONT_DIR, 'output', 'series');
const WORK_ROOT = path.join(FRONT_DIR, 'output', 'pdf-cache', 'build');
const FILTER = path.join(__dirname, 'filters', 'series.lua');

// ─── External tools ───────────────────────────────────────────────────────────

function resolveTool(name, candidates) {
  for (const c of candidates) if (c && fs.existsSync(c)) return c;
  return name; // fall back to PATH lookup
}

const PANDOC = resolveTool('pandoc', [
  path.join(os.homedir(), 'AppData', 'Local', 'Pandoc', 'pandoc.exe'),
  'C:\\Program Files\\Pandoc\\pandoc.exe',
]);

const XELATEX = resolveTool('xelatex', [
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64', 'xelatex.exe'),
  'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\xelatex.exe',
]);

// ─── Typeface stack ───────────────────────────────────────────────────────────
// Libertinus is the reason this reads as a book: a serif with a matching
// OpenType math font, so prose and equations share one voice instead of the
// Arial-plus-rasterized-MathJax mismatch of the old generator.

const FONTS = {
  main: `\\setmainfont{LibertinusSerif-Regular.otf}[
  ItalicFont     = LibertinusSerif-Italic.otf,
  BoldFont       = LibertinusSerif-Bold.otf,
  BoldItalicFont = LibertinusSerif-BoldItalic.otf,
  Numbers        = OldStyle]`,
  sans: `\\setsansfont{LibertinusSans-Regular.otf}[
  ItalicFont = LibertinusSans-Italic.otf,
  BoldFont   = LibertinusSans-Bold.otf]`,
  math: `\\setmathfont{LibertinusMath-Regular.otf}`,
  mono: `\\setmonofont{Consolas}[Scale=MatchLowercase]`,
};

// ─── Post loading ─────────────────────────────────────────────────────────────

let postIndexCache = null;

/**
 * Maps slug → { file, meta }. `posts.json` records `source_path` for every
 * post, which is authoritative; the directory scan is only a fallback for a
 * post added since the last knowledge-base build.
 */
function postIndex() {
  if (postIndexCache) return postIndexCache;
  const index = new Map();

  if (fs.existsSync(POSTS_JSON)) {
    const kb = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
    for (const [slug, meta] of Object.entries(kb.posts || {})) {
      if (meta.source_path) index.set(slug, { file: path.join(REPO_DIR, meta.source_path), meta });
    }
  }

  const postsDir = path.join(FRONT_DIR, 'public', 'blog', 'posts');
  for (const category of fs.readdirSync(postsDir)) {
    const dir = path.join(postsDir, category);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const slug = file.replace(/\.md$/, '');
      if (!index.has(slug)) index.set(slug, { file: path.join(dir, file), meta: {} });
    }
  }

  postIndexCache = index;
  return index;
}

function loadPost(slug) {
  const entry = postIndex().get(slug);
  if (!entry) throw new Error(`No post found for slug "${slug}"`);
  const { data, content } = matter(fs.readFileSync(entry.file, 'utf8'));
  return { slug, ...entry.meta, ...data, body: content };
}

// ─── Markdown assembly ────────────────────────────────────────────────────────

/**
 * Diagram kinds that lay their labels out relative to the chart box rather
 * than to the text, so a narrow column clips them no matter the aspect ratio.
 */
const WIDE_BY_NATURE = new Set([
  'quadrantChart', 'timeline', 'gantt', 'journey', 'gitGraph', 'xychart-beta',
]);

/**
 * Swaps every Mermaid fence for a pre-rendered vector figure. The diagram's
 * aspect ratio and kind ride along as attributes so the Lua filter can decide
 * between the text column, the wide measure, and a turned page.
 */
function embedDiagrams(body, figuresDir, stats) {
  let n = 0;
  return body.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_, source) => {
    const rendered = renderDiagram(source);
    stats.total += 1;
    if (!rendered) {
      stats.failed += 1;
      return '';
    }
    n += 1;
    const name = `fig-${stats.total}.pdf`;
    fs.copyFileSync(rendered.pdfPath, path.join(figuresDir, name));
    if (rendered.aspect >= 5.0) stats.landscape += 1;
    else if (rendered.aspect >= 1.55 || WIDE_BY_NATURE.has(rendered.kind)) stats.wide += 1;
    stats.kinds[rendered.kind] = (stats.kinds[rendered.kind] || 0) + 1;
    return `\n![](figures/${name}){.diagram data-aspect=${rendered.aspect.toFixed(3)}`
      + ` data-kind=${rendered.kind}}\n`;
  });
}

/** Posts open with their own `# Title`; the builder supplies the chapter head. */
function stripLeadingH1(body) {
  return body.replace(/^\s*#\s+.+?\r?\n/, '');
}

function assembleMarkdown(manifest, posts, figuresDir, stats) {
  const chunks = [];

  for (const post of posts) {
    const meta = [];
    if (post.reading_minutes || post.readingTimeMinutes) {
      meta.push(`${post.reading_minutes || post.readingTimeMinutes} min`);
    }
    if (Array.isArray(post.tags) && post.tags.length) meta.push(post.tags.slice(0, 5).join(' · '));

    chunks.push(`# ${post.title}\n`);
    if (meta.length) chunks.push(`::: {.postmeta}\n${meta.join('  ·  ')}\n:::\n`);
    if (post.excerpt) chunks.push(`::: {.excerpt}\n${post.excerpt}\n:::\n`);
    chunks.push(embedDiagrams(stripLeadingH1(post.body), figuresDir, stats));
    chunks.push('\n');
  }

  return chunks.join('\n');
}

// ─── LaTeX generation ─────────────────────────────────────────────────────────

function preamble(layout) {
  const g = layout.geometry;
  const wide = wideWidth(layout);
  const overhang = Math.max(0, wide - g.textwidth);
  // KOMA sets leading from the font size; \linespread scales it to the value
  // the layout actually asked for.
  const linespread = (layout.body.leading / (layout.body.size * 1.2)).toFixed(4);

  // adjustwidth* mirrors on even pages, which is right for a bound two-sided
  // book and wrong for a one-sided one, where every page has the same shape.
  const starred = layout.twoside ? '*' : '';

  const srcnote = layout.notes === 'margin'
    ? `\\newcommand{\\srcnote}[1]{\\marginnote{\\RaggedRight\\scriptsize\\color{notecolor}\\url{#1}}}`
    : `\\newcommand{\\srcnote}[1]{\\footnote{\\scriptsize\\url{#1}}}`;

  return `
% ── Typefaces ────────────────────────────────────────────────────────────────
\\usepackage{unicode-math}
${FONTS.main}
${FONTS.sans}
${FONTS.math}
${FONTS.mono}
\\linespread{${linespread}}

% ── Microtypography: the protrusion and expansion that make a TeX page ───────
% pandoc's template already loads microtype, so configure rather than reload.
% Font expansion is a pdfTeX feature; XeTeX offers protrusion only.
\\microtypesetup{protrusion=true,final}
\\usepackage{ragged2e}
\\usepackage[english]{babel}
\\hyphenpenalty=200
\\tolerance=1200
\\emergencystretch=2em
\\widowpenalty=10000
\\clubpenalty=10000

% ── Graphics ─────────────────────────────────────────────────────────────────
% Required explicitly: the Lua filter emits diagrams as raw LaTeX, so pandoc
% never sees an Image in the AST and never loads graphicx itself. Without this
% \\includegraphics resolves to the bounding-box form from the plain graphics
% package, which does not understand width=.
\\usepackage{graphicx}

% ── Colour ───────────────────────────────────────────────────────────────────
\\usepackage{xcolor}
\\definecolor{notecolor}{HTML}{5A5A55}
\\definecolor{rulecolor}{HTML}{9A9A94}
\\definecolor{accent}{HTML}{1F4E79}
\\definecolor{codebg}{HTML}{F7F7F4}

% ── Wide content: code and diagrams overhang toward the outer margin ─────────
% Two mechanisms, because the two kinds of content have different needs.
% Code must be able to break across pages, so it uses a list-based environment.
% A figure must not — a list inside a float breaks graphicx's argument scan —
% so it gets an unbreakable box, shifted on verso pages so the overhang always
% runs toward the outer edge rather than into the binding.
% Only changepage: it already provides \\checkoddpage and \\ifoddpage, and
% loading ifoddpage as well silently overwrites them, which leaves the verso
% overhang running off the outer edge instead of into the margin.
\\usepackage{changepage}
\\strictpagecheck
\\newlength{\\seriesoverhang}
\\setlength{\\seriesoverhang}{${overhang}mm}
\\newenvironment{widecontent}
  {\\par\\begin{adjustwidth${starred}}{0mm}{-\\seriesoverhang}}
  {\\end{adjustwidth${starred}}\\par}
\\newcommand{\\widebox}[1]{%
  ${layout.twoside ? '\\checkoddpage' : ''}
  \\noindent\\makebox[\\linewidth][l]{%
    ${layout.twoside ? '\\ifoddpage\\else\\hspace*{-\\seriesoverhang}\\fi' : ''} #1}%
}

% Titles must never hyphenate; a broken word in 30pt type is the first thing
% the eye lands on.
\\newcommand{\\nohyphens}{\\hyphenpenalty=10000 \\exhyphenpenalty=10000 \\sloppy}

% ── Notes carrying link targets ──────────────────────────────────────────────
\\usepackage{marginnote}
\\renewcommand*{\\marginfont}{\\scriptsize}
\\usepackage{xurl}
${srcnote}

% ── Code: long lines wrap instead of running off the measure ────────────────
\\usepackage{fvextra}
\\usepackage{mdframed}
\\AtBeginDocument{%
  \\DefineVerbatimEnvironment{Highlighting}{Verbatim}{%
    commandchars=\\\\\\{\\},%
    breaklines,breakanywhere,breaknonspaceingroup,%
    breaksymbolleft=\\raisebox{0.5ex}{\\tiny\\ensuremath{\\hookrightarrow}},%
    breaksymbolindentleft=0pt,breaksymbolsepleft=3pt,%
    fontsize=\\fontsize{${layout.code.size}pt}{${layout.code.leading}pt}\\selectfont%
  }%
  \\renewenvironment{Shaded}%
    {\\begin{mdframed}[backgroundcolor=codebg,linewidth=0.4pt,linecolor=rulecolor,%
       innerleftmargin=7pt,innerrightmargin=7pt,innertopmargin=6pt,innerbottommargin=6pt,%
       skipabove=0.7\\baselineskip,skipbelow=0.7\\baselineskip]}%
    {\\end{mdframed}}%
}

% ── Tables and figures ───────────────────────────────────────────────────────
\\usepackage{booktabs}
\\usepackage{pdflscape}
\\setlength{\\intextsep}{1.1\\baselineskip}
\\setlength{\\textfloatsep}{1.3\\baselineskip}
\\renewcommand{\\topfraction}{0.85}
\\renewcommand{\\bottomfraction}{0.7}
\\renewcommand{\\floatpagefraction}{0.7}

% ── Running heads ────────────────────────────────────────────────────────────
\\usepackage[automark,headsepline=0.4pt]{scrlayer-scrpage}
\\clearpairofpagestyles
\\automark[section]{chapter}
\\ihead{\\normalfont\\sffamily\\scriptsize\\color{notecolor}\\headmark}
\\ofoot*{\\normalfont\\sffamily\\small\\pagemark}
\\setkomafont{pagehead}{\\normalfont\\sffamily\\scriptsize\\color{notecolor}}

% ── Chapter openers carry the part number ────────────────────────────────────
\\newcommand{\\seriesparttext}{}
\\newcommand{\\seriespart}[2]{\\renewcommand{\\seriesparttext}{Part #1 of #2}}
\\renewcommand*{\\chapterformat}{}
\\renewcommand*{\\chapterlinesformat}[3]{%
  \\parbox{\\linewidth}{%
    \\RaggedRight\\nohyphens
    {\\normalfont\\sffamily\\footnotesize\\color{accent}\\MakeUppercase{\\seriesparttext}\\strut}\\par
    \\vskip 0.35\\baselineskip
    {\\color{rulecolor}\\rule{28mm}{0.7pt}}\\par
    \\vskip 0.9\\baselineskip
    #3%
  }%
}
\\setkomafont{chapter}{\\normalfont\\bfseries\\Huge}
\\setkomafont{section}{\\normalfont\\bfseries\\Large}
\\setkomafont{subsection}{\\normalfont\\bfseries\\large}
\\RedeclareSectionCommand[beforeskip=-1sp,afterskip=1.6\\baselineskip]{chapter}

% ── Per-post metadata line and excerpt ───────────────────────────────────────
\\newenvironment{postmeta}
  {\\par\\normalfont\\sffamily\\scriptsize\\color{notecolor}}
  {\\par\\medskip}
\\newenvironment{postexcerpt}
  {\\par\\medskip\\begin{adjustwidth}{3mm}{0mm}\\itshape\\color{notecolor}\\small}
  {\\end{adjustwidth}\\par\\medskip
   \\noindent{\\color{rulecolor}\\rule{22mm}{0.4pt}}\\par\\medskip}

% ── Lists and quotes ─────────────────────────────────────────────────────────
\\usepackage{enumitem}
\\setlist{itemsep=0.15\\baselineskip,parsep=0pt,topsep=0.4\\baselineskip}
\\renewenvironment{quote}
  {\\par\\medskip\\begin{adjustwidth}{5mm}{5mm}\\small\\itshape}
  {\\end{adjustwidth}\\par\\medskip}

\\setcounter{secnumdepth}{0}
\\raggedbottom
`;
}

/** Markdown → a LaTeX fragment, so blurbs keep their emphasis and dashes. */
function md2tex(markdown) {
  if (!markdown || !markdown.trim()) return '';
  return execFileSync(PANDOC, ['-f', 'markdown-raw_tex', '-t', 'latex'], {
    input: markdown,
    encoding: 'utf8',
  }).trim();
}

function frontMatter(manifest, posts, prereqs) {
  const kind = manifest.isSeries ? 'Series' : 'Reading Path';
  const parts = posts
    .map((p, i) => `\\item[\\textnormal{\\sffamily\\footnotesize ${i + 1}}] ${md2tex(p.title)}`)
    .join('\n');

  const prereqBlock = prereqs.length
    ? `
\\vspace{1.5\\baselineskip}
{\\normalfont\\sffamily\\footnotesize\\color{accent}\\MakeUppercase{What this assumes}}\\par\\smallskip
{\\small\\color{notecolor}Written as if you have already met these. Each is a post on the blog outside this ${kind.toLowerCase()}.}\\par\\smallskip
\\begin{itemize}[leftmargin=1.2em,itemsep=0.1\\baselineskip]
${prereqs.map((p) => `\\item {\\small ${md2tex(p)}}`).join('\n')}
\\end{itemize}`
    : '';

  return `
\\begin{titlepage}
\\thispagestyle{empty}
\\RaggedRight
\\vspace*{28mm}

{\\color{rulecolor}\\rule{\\linewidth}{0.7pt}}\\par\\smallskip
{\\normalfont\\sffamily\\footnotesize\\color{accent}\\MakeUppercase{${kind} \\quad ${posts.length} parts}}\\par

\\vspace{20mm}
{\\nohyphens\\bfseries\\fontsize{30}{34}\\selectfont ${md2tex(manifest.title)}\\par}

\\vspace{10mm}
{\\color{rulecolor}\\rule{34mm}{1pt}}\\par

\\vfill
{\\normalfont\\sffamily\\small Juan Lara}\\par\\smallskip
{\\normalfont\\sffamily\\scriptsize\\color{notecolor}juanlara18.github.io/portfolio}\\par
{\\color{rulecolor}\\rule{\\linewidth}{0.4pt}}
\\end{titlepage}

\\thispagestyle{empty}
\\vspace*{10mm}
{\\normalfont\\sffamily\\footnotesize\\color{accent}\\MakeUppercase{About this ${kind.toLowerCase()}}}\\par
\\vspace{1.2\\baselineskip}
{\\large ${md2tex(manifest.blurb)}}

\\vspace{2\\baselineskip}
{\\normalfont\\sffamily\\footnotesize\\color{accent}\\MakeUppercase{The parts}}\\par\\smallskip
\\begin{description}[leftmargin=2.2em,itemsep=0.25\\baselineskip,font=\\normalfont]
${parts}
\\end{description}
${prereqBlock}
\\cleardoublepage
`;
}

/** Prerequisites that live outside this compilation — the honest "read first". */
function externalPrereqs(manifest) {
  if (!fs.existsSync(POSTS_JSON)) return [];
  const kb = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
  const inside = new Set(manifest.slugs);
  const seen = new Set();
  const out = [];
  for (const slug of manifest.slugs) {
    for (const pre of (kb.posts[slug] || {}).prereqs || []) {
      if (inside.has(pre) || seen.has(pre)) continue;
      seen.add(pre);
      const title = (kb.posts[pre] || {}).title || pre;
      out.push(title);
    }
  }
  return out;
}

// ─── Build ────────────────────────────────────────────────────────────────────

function run(cmd, args, cwd, label) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`;
    throw new Error(`${label} failed:\n${out.split('\n').slice(-40).join('\n')}`);
  }
}

function buildOne(manifest, posts, layoutName, markdown, figuresDir) {
  const layout = getLayout(layoutName);
  const work = path.join(WORK_ROOT, `${manifest.id}--${layoutName}`);
  // OneDrive and stray shells hold handles on Windows; retry rather than abort.
  fs.rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  fs.mkdirSync(path.join(work, 'figures'), { recursive: true });

  for (const f of fs.readdirSync(figuresDir)) {
    fs.copyFileSync(path.join(figuresDir, f), path.join(work, 'figures', f));
  }

  fs.writeFileSync(path.join(work, 'preamble.tex'), preamble(layout), 'utf8');
  fs.writeFileSync(path.join(work, 'front.tex'), frontMatter(manifest, posts, externalPrereqs(manifest)), 'utf8');
  fs.writeFileSync(path.join(work, 'body.md'), markdown, 'utf8');

  const partmap = {};
  posts.forEach((p, i) => { partmap[p.slug] = i + 1; });

  const g = layout.geometry;
  const geometryOpts = [
    layout.paper,
    layout.twoside ? 'twoside' : 'oneside',
    `inner=${g.inner}mm`, `top=${g.top}mm`, `bottom=${g.bottom}mm`,
    `textwidth=${g.textwidth}mm`,
    `marginparsep=${g.marginparsep}mm`, `marginparwidth=${g.marginparwidth}mm`,
    'headsep=7mm', 'footskip=12mm',
  ];

  run(PANDOC, [
    'body.md',
    '--from', 'markdown-raw_tex',
    '--to', 'latex',
    '--standalone',
    '--lua-filter', FILTER,
    '--include-in-header', 'preamble.tex',
    '--include-before-body', 'front.tex',
    '--toc', '--toc-depth=2',
    '--syntax-highlighting', 'tango',
    '--top-level-division=chapter',
    '-V', 'documentclass=scrbook',
    '-V', `classoption=fontsize=${layout.body.size}pt`,
    // scrbook is two-sided by default; geometry's own oneside does not change
    // the class's idea of parity, so the class option has to be set too.
    '-V', `classoption=${layout.twoside ? 'twoside' : 'oneside'}`,
    '-V', `classoption=open=${layout.twoside ? 'right' : 'any'}`,
    '-V', 'classoption=numbers=noenddot',
    '-V', 'has-frontmatter=true',
    '-V', 'colorlinks=true',
    '-V', 'linkcolor=accent',
    '-V', 'urlcolor=accent',
    '-V', 'toc-title=Contents',
    ...geometryOpts.flatMap((o) => ['-V', `geometry=${o}`]),
    '-M', `notes=${layout.notes}`,
    '-M', `textwidth=${g.textwidth}`,
    '-M', `widewidth=${wideWidth(layout)}`,
    '-M', `textheight=${textHeight(layout)}`,
    '-M', `totalparts=${posts.length}`,
    '-M', `partmap=${JSON.stringify(partmap)}`,
    '-o', 'series.tex',
  ], work, 'pandoc');

  // Three passes: TOC, then page references, then the page-parity check that
  // decides which side wide content overhangs into.
  //
  // Exit status is not the signal here: nonstopmode returns non-zero for
  // recoverable conditions too (longtable's "ignored error" among them), so
  // the log is the authority and a missing PDF is the only hard failure.
  for (let pass = 1; pass <= 3; pass++) {
    try {
      run(XELATEX, [
        '-interaction=nonstopmode', '--enable-installer', '-file-line-error', 'series.tex',
      ], work, `xelatex pass ${pass}`);
    } catch (_) { /* judged from the log below */ }
  }

  const produced = path.join(work, 'series.pdf');
  if (!fs.existsSync(produced)) {
    const log = fs.existsSync(path.join(work, 'series.log'))
      ? fs.readFileSync(path.join(work, 'series.log'), 'latin1').split('\n').slice(-40).join('\n')
      : '(no log)';
    throw new Error(`XeLaTeX produced no PDF:\n${log}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dest = path.join(OUT_DIR, `${manifest.id}--${layoutName}.pdf`);
  fs.copyFileSync(produced, dest);

  const log = fs.readFileSync(path.join(work, 'series.log'), 'latin1');
  const overfull = (log.match(/Overfull \\hbox/g) || []).length;
  const pages = (log.match(/Output written on .*?\((\d+) pages?/) || [])[1] || '?';
  // "ignored error" lines are recovered by eTeX and leave the page intact;
  // anything else on a `file:line:` prefix is a real problem worth surfacing.
  const errors = (log.match(/^series\.tex:\d+: (?!ignored error)/gm) || []).length;

  return {
    dest, pages, overfull, errors, work,
    sizeMB: (fs.statSync(dest).size / 1048576).toFixed(2),
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || !args.length) {
    for (const m of parseManifests()) {
      console.log(`${m.isSeries ? '[series]' : '[path]  '} ${m.id.padEnd(46)} ${String(m.slugs.length).padStart(2)} posts`);
    }
    console.log(`\nLayouts: ${Object.entries(LAYOUTS).map(([k, v]) => `\n  ${k.padEnd(12)} ${v.label}`).join('')}`);
    return;
  }

  const id = args.find((a) => !a.startsWith('--'));
  const layoutArg = (args.find((a) => a.startsWith('--layout=')) || '--layout=a4-margin').slice(9);
  const layoutNames = layoutArg === 'all' ? Object.keys(LAYOUTS) : layoutArg.split(',');

  const manifest = getManifest(id);
  const posts = manifest.slugs.map(loadPost);
  console.log(`\n${manifest.title} — ${posts.length} parts\n`);

  const figuresDir = path.join(WORK_ROOT, `${manifest.id}--figures`);
  fs.rmSync(figuresDir, { recursive: true, force: true });
  fs.mkdirSync(figuresDir, { recursive: true });

  const stats = { total: 0, failed: 0, wide: 0, landscape: 0, kinds: {} };
  console.log('  Rendering diagrams...');
  const markdown = assembleMarkdown(manifest, posts, figuresDir, stats);
  const kinds = Object.entries(stats.kinds).map(([k, v]) => `${k} ${v}`).join(', ');
  console.log(`  ${stats.total} diagrams (${stats.wide} wide, ${stats.landscape} turned, ${stats.failed} failed)`);
  if (kinds) console.log(`  ${kinds}\n`);

  const results = [];
  for (const name of layoutNames) {
    process.stdout.write(`  ${name.padEnd(12)} `);
    const t0 = Date.now();
    try {
      const r = buildOne(manifest, posts, name, markdown, figuresDir);
      console.log(
        `${String(r.pages).padStart(4)} pp  ${r.sizeMB.padStart(6)} MB  ` +
        `${String(r.overfull).padStart(3)} overfull  ${String(r.errors).padStart(2)} errors  ` +
        `${((Date.now() - t0) / 1000).toFixed(0)}s`,
      );
      results.push(r);
    } catch (e) {
      console.log('FAILED');
      console.error(`\n${e.message}\n`);
    }
  }

  if (results.length) {
    console.log(`\n  → ${path.relative(process.cwd(), OUT_DIR)}\n`);
  }
  process.exitCode = results.length === layoutNames.length ? 0 : 1;
}

if (require.main === module) main();
module.exports = { buildOne, assembleMarkdown };
