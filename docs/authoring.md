# Authoring

Everything a post needs, from the file name to the last section. The build enforces the rules marked **enforced**. The rest are conventions that keep the blog coherent.

## Where a post lives

```
front/public/blog/posts/<category>/<slug>.md
```

| Category | Folder | Use it for |
|---|---|---|
| Field Notes | `field-notes/` | Production practice: systems, tools, platforms, operations |
| Research Notes | `research/` | Papers and theorems, read closely and tied back to production |
| Mathematical Curiosities | `curiosities/` | Results that break intuition |

**The file name is the slug**, and the slug is the post's permanent identifier. Links, series, audio, and the knowledge base all key on it. Choose it once, in kebab-case, and do not rename it. Moving a post to another category folder is safe: old links redirect.

## Frontmatter

```yaml
---
title: "Double Descent: Where the Classical Theory Runs Out"
date: "2029-03-01"
excerpt: "One to three sentences. Shown on cards, in search results, and as the social preview text."
tags: ["Statistical Learning Theory", "Machine Learning", "Deep Learning", "Optimization"]
headerImage: "/blog/headers/mountain-pass-road-header.jpg"
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Also used for the page title and social previews. |
| `date` | yes | `YYYY-MM-DD`. Orders the feed and is shown to readers. It is a publication slot, not a writing date: never write "as of 2027" in the body. Anchor claims to versions instead ("as of ADK 2.6"). |
| `excerpt` | yes | Without it, the first 160 characters of the body are used. |
| `tags` | yes | 8 to 12. Tags build the topic graph, so reuse existing names exactly. Check `src/data/blogData.json` before inventing one; a tag used by a single post adds a node with no connections. |
| `headerImage` | yes | A JPEG under `/blog/headers/`. `npm run optimize-images` (part of `sync`) creates its WebP twin. Credit the source in `front/public/blog/headers/ATTRIBUTIONS.md`. |
| `estimatedWordCount` | no | Computed when absent. Feeds the depth estimate in the knowledge base. |

Reading time is computed from the body (words / 200, code included). A `readingTimeMinutes` field is ignored. A `slug` field is ignored too; the file name wins.

## Body

Start with a single `# Title` matching the frontmatter. The page strips it and renders the title in the header, and every `##` and `###` heading becomes an entry in the table of contents.

### Links to other posts (enforced)

```markdown
See [the embeddings post](/blog/embeddings-geometry-of-meaning) first.
Jump to a section with [this](/blog/double-descent#the-double-descent-curve).
```

Write `/blog/<slug>`, slug only. The app resolves the category and renders the canonical URL. `npm run validate-links` runs before every build and fails it on:

- a slug that does not exist,
- any other form: the absolute site URL, `#/blog/...`, `./slug`, or `/blog/<category>/<slug>`.

`npm run validate-links -- --fix` rewrites every link whose target exists. Unknown slugs need a human: look the right one up in `knowledge-base/posts.json`.

Category pages and the other blog pages are linked directly: `/blog/category/research`, `/blog/series`.

### Math

Inline math uses single dollars: `$O(n \log n)$`.

Display math must have its delimiters **on their own lines**. On one line, `$$x$$` renders inline, and `$$\begin{aligned}` on the opening line corrupts the whole block.

```markdown
$$
\mathbb{E}[\hat{f}(x)] = f(x)
$$
```

Inside a blockquote, keep `> ` on every line, including both `$$` lines.

### Diagrams (enforced)

Mermaid blocks always open with ` ```mermaid `, never with the diagram type (` ```flowchart ` renders as a code block). Use two to four diagrams per post, of at least two different kinds. `npm run validate-mermaid` rejects anything Mermaid 11 cannot parse. Avoid `<`, `>`, and unbalanced quotes in labels, and parentheses or colons in `quadrantChart` items.

Every diagram type is styled by the site's theme (`mermaidTheme.js`), in light and dark. The `blog-diagrams` skill (`.claude/skills/blog-diagrams/`) has the full workflow and verified syntax for every type. Two commands check a post:

```bash
npm run diagrams:lint -- <slug>     # the rules below; CI runs it with --strict on posts a PR changes
npm run diagrams:render -- <slug>   # PNGs in front/.diagram-preview/, with size on desktop and phone
```

Work with the theme:

- **No colours in posts.** Do not write `style X fill:#…` or `classDef` colours. Mark a node with `:::accent` for what the paragraph is about, or `:::muted` for context; everything else stays neutral.
- **Short title, detail in small.** Up to four words of title, then the detail: `P["Data contract<br/><small>schema, quality, SLA</small>"]`.
- **Nine nodes at most.** More than that is two diagrams or a `subgraph`.
- **Vertical by default.** The diagram frame is about 850 px wide on desktop and 330 px on a phone. Use `LR` only for four nodes or fewer in a row, and always `timeline TD`.
- **Math is LaTeX.** Write `$$…$$` inside the label, never `theta_t`: `E["<b>E step</b><br/>$$q \leftarrow p(z \mid x, \theta_t)$$"]`. The title and the formula stack on two lines. Write `\lt` and `\gt`, not `<` and `>`.
- **Production systems get an `architecture-beta` diagram.** Any post about a deployed system shows its shape: services, data stores, and the boundaries between them.

Pick the type by the question the diagram answers:

| The diagram shows | Type |
|---|---|
| How the pieces of a system connect | `architecture-beta` |
| How a budget splits (tokens, latency, rows) | `sankey-beta` |
| Stacked layers where position matters | `block-beta` |
| The bits of a number format or protocol | `packet-beta` |
| A few options compared on several axes | `radar-beta` |
| Parts of a whole, with hierarchy | `treemap-beta` |
| The map of a series | `mindmap` |
| Versions, branches, lineage | `gitGraph` |
| Why something failed | `ishikawa-beta` |
| Who talks to whom, in order | `sequenceDiagram` |
| States and transitions | `stateDiagram-v2` |
| A process with decisions | `flowchart` |

A `quadrantChart` needs real positions. If the coordinates are not measured, use a table or a list. Charts carry at most four series (a `pie` at most four slices); more data than that is a table.

### Code

Fence every block with its language. These are highlighted: `python`, `bash`, `sql`, `yaml`, `json`, `hcl`, `cypher`, `dockerfile`, `go`, `toml`, `scala`, `sparql`, `rego`, `powershell`, `makefile`, `javascript`, `typescript`, `markdown`, `turtle`, `graphql`, `gitignore`. Anything else renders as plain monospace. To add a language, register its grammar at the top of `MarkdownRenderer.jsx`.

Write code that runs in context: the first block carries its imports, and later blocks state what they continue from.

### Figures

Put images under `front/public/blog/figures/` and reference them with an absolute path, `![Alt text](/blog/figures/<topic>/figure.png)`. Always write alt text.

### Going Deeper (last section)

Every post ends with a `## Going Deeper` section. The books index is built from it, so keep the headings exact:

```markdown
## Going Deeper

**Books:**
- Author. (Year). *Title.* Publisher.
  - Why it matters here.

**Online Resources:**
- [Name](https://example.com) - What it covers.

**Videos:**
- [Title](https://www.youtube.com/watch?v=...) by Creator - What it covers.

**Academic Papers:**
- Author. (Year). ["Title."](https://arxiv.org/abs/...) *Venue*.
  - Why it matters here.

**Questions to Explore:**
- An open question the post leaves on the table.
```

Never cite a paper, ID, or video you have not verified.

## Series and reading paths

- **Reading series** shown on `/blog/series` are ordered slug lists in `front/src/data/series.js`. A series needs at least two existing posts to appear.
- **Reading paths** live under `## Reading Paths` in `knowledge-base/KNOWLEDGE_BASE.md`. Anything listed there can be compiled into a print PDF (`npm run pdf:series:list`).

## Knowledge base metadata

Posts get default metadata automatically (concepts from tags, depth from word count). To describe a post properly for agents, add an entry to the YAML block under `## Augmentation` in `knowledge-base/KNOWLEDGE_BASE.md`: concepts, prerequisites, what it teaches, technologies. See [knowledge-base.md](knowledge-base.md).

## Before you commit

```bash
cd front
npm run sync          # narration, images, Mermaid check, data rebuild
npm run build         # link check, indexes, production build
```

- The post renders locally, with its header, table of contents, diagrams, and math.
- `validate-links` and `validate-mermaid` pass.
- New tags were checked against existing ones.
- The header image is credited.
- No sentence claims a year for the present state of a tool.
