# Series PDFs

Compiles one series — or any reading path — into a print-ready PDF.

```bash
npm run pdf:series:list                                  # what can be built
npm run pdf:series -- the-shape-of-a-problem             # default layout
npm run pdf:series -- why-learning-works --layout=all    # every geometry
npm run pdf:series -- the-agent-platform --layout=b5-book,a5-pocket
```

Output lands in `front/output/series/<manifest-id>--<layout>.pdf` (gitignored).

## Why this exists alongside `generate-blog-pdf.js`

The older script hand-writes a typesetting engine on PDFKit: its own Markdown
tokenizer, binary-search line breaking, manual code-block pagination, MathJax
rasterized to 320 dpi PNGs, Mermaid fetched from Kroki and rasterized at 2800px.
It works, and the full compilation it produces is 135 MB, because everything a
PDF should draw as vectors is a bitmap.

This pipeline gives the typesetting to LaTeX and keeps only the decisions:
what goes on the page, how wide, and in what order. Equations and diagrams stay
vector, so a 268-page series is 2.2 MB.

## Pipeline

```
KNOWLEDGE_BASE.md  →  manifests.js   ordered slug lists + blurbs
posts/*.md         →  build.js       assembly, Mermaid → vector PDF (cached)
                   →  series.lua     layout decisions on the pandoc AST
                   →  pandoc         Markdown → LaTeX
                   →  xelatex ×3     TOC, references, page-parity check
```

Three passes are required: the first writes the TOC, the second resolves page
references, the third settles the page-parity check that decides which side
wide content overhangs into.

## The pieces

| File | Responsibility |
| --- | --- |
| `manifests.js` | Parses `## Reading Paths` in `knowledge-base/KNOWLEDGE_BASE.md`. Ten named series and fourteen reading paths are the same shape, so one builder covers both. |
| `layouts.js` | Page geometries. Trim size, measure, leading, overhang, note style. |
| `mermaid.js` | Mermaid → vector PDF via a local Chromium, content-hash cached. Records each diagram's aspect ratio and kind. |
| `filters/series.lua` | Diagram sizing, code overhang, link handling, part numbering. |
| `build.js` | Assembly, LaTeX preamble generation, the pandoc and XeLaTeX runs. |

## Decisions worth knowing

**Diagram sizing comes from the aspect ratio.** Under 1.55 a diagram sits in
the text column; above it, or for kinds that carry sentence-length labels
(`quadrantChart`, `timeline`, `gantt`, …), it takes the wide measure; above 5.0
it gets a turned page of its own.

**Diagram font size is scale-invariant for a flowchart, and not for a chart.**
A flowchart sizes its nodes to their text, so raising the font enlarges the
whole drawing and the on-page result is unchanged once it is fitted to the
measure — the only levers are page width and the diagram's own complexity. A
`quadrantChart` or `xychart` has a fixed canvas, so its font sizes really do
land larger on the page, which is why theirs are set well above the defaults.

**`quadrantChart` canvas width is computed per diagram.** Mermaid never wraps
quadrant labels, so the canvas must be wide enough for the longest one or the
four titles collide across the centre line and clip at the frame. But the
canvas is also the divisor for everything else, so a wider one means smaller
text on the page. Sizing it per diagram lets a chart with short labels keep a
small canvas and read large, instead of every chart paying for the longest
label in the blog. A 49-character label needs ~1200px; a 22-character one
fits the 800px floor and reads about 1.5× larger.

**`graphicx` is loaded explicitly.** The Lua filter emits diagrams as raw
LaTeX, so pandoc never sees an `Image` in the AST and never loads graphicx
itself. Without it `\includegraphics` resolves to the bounding-box form from
the plain `graphics` package, which does not understand `width=`.

**XeTeX cannot honour `keepaspectratio` with both a width and a height on a
PDF graphic**, so the filter resolves the fit itself from the recorded aspect
ratio and emits a single dimension.

**Links become notes, not blue underlines.** In `a4-margin` an external link
puts its URL in the margin; elsewhere it becomes a footnote. Inside a list — a
"Going Deeper" block — the URL goes inline instead, because twenty stacked
margin notes would overflow the page. A link pointing at another part of the
same compilation becomes a "(Part 3)" cross-reference.

**`a4-margin` is one-sided on purpose.** Its 56mm overhang has to know which
side the outer margin is on, and `adjustwidth*` fixes that when the environment
opens, not where it lands — so a code block starting on a recto and breaking
onto the next page runs off the edge. One-sided puts the margin column on the
same side on every page.

**Code overhangs through an environment, diagrams through a box.** Code must
break across pages, so it needs a list-based environment; a list inside a float
derails graphicx's argument scanning, so figures get an unbreakable `\widebox`
instead.

## Known rough edges

- `longtable` emits a recovered "Infinite glue shrinkage" for tables that split
  across a page. eTeX recovers and the page is intact; the cause has not been
  isolated.
- A handful of overfull `\hbox`es per hundred pages, mostly long inline code
  spans and URLs that cannot break.
- Diagrams wider than about 5:1 read poorly at any size. The turned page is a
  mitigation, not a fix; the real fix is authoring them narrower.
- Quadrant labels longer than about 22 characters force a wide canvas and
  shrink the whole chart. At 49 characters — the longest in the blog — the
  chart's own labels land near 6.5pt on B5 and under 6pt on A5. Shortening
  them is worth more than any pipeline change.
- Mermaid centres a point label on its point with no clamping, so a point
  sitting on a quadrant boundary has its label bisected by the divider, and
  one near an edge will overhang the frame if the font is raised much further.

## Checking legibility

`findpage.js` reports which page of a built PDF holds a phrase, so the same
content can be compared across geometries without guessing an offset. Diagram
labels are searchable too — Mermaid output carries real vector text.

```bash
node scripts/pdf/findpage.js output/series/x--b5-book.pdf "default_rng(0)"
pdftoppm -f 26 -l 26 -r 150 -png output/series/x--b5-book.pdf /tmp/page
```

Render every layout at the *same* dpi: a smaller trim size then produces a
smaller image, which is the honest comparison for print.
