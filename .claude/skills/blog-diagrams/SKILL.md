---
name: blog-diagrams
description: Plan, write, render-check and upgrade the Mermaid diagrams of a blog post so they carry the explanation. Use whenever a post needs diagrams (new-blog-post and batch-blog-posts hand this step here), when revising or reviewing a post's diagrams, when upgrading old posts' diagrams, or when the user asks for a better visual explanation of something in the blog.
---

# Blog diagrams

A diagram earns its place when the reader understands the mechanism faster from it than from the paragraph around it. The blog's diagrams are where it comes alive, and they make it read as technical. The bar is the best diagram for that paragraph, not a valid one.

The site styles every diagram with its brand theme (`front/src/components/features/blog/MarkdownRenderer/mermaidTheme.js`, spec in `docs/brand.md` › 10.6). Never fight the theme: no colours in posts.

## Workflow

### 1. Find the visual moments

Read the post (or its outline) section by section and ask, for each claim: *what does the reader need to see that prose cannot show?* Name the moment by its question:

| The reader needs to see | Question the diagram answers |
|---|---|
| Structure | What connects to what? What runs where? |
| Order | Who talks to whom, in what sequence? |
| Change | What states does it move through, and what moves it? |
| Quantity | How does a total split? How does a value evolve? |
| Hierarchy | What contains what? What sits on what? |
| Comparison | How do these options differ, on which axes? |
| Cause | Why did it fail? |

Keep the two to four moments where a picture beats the prose. Use at least two different types per post. **A post about a production system always includes an `architecture-beta` diagram** of its deployed shape; it is usually the first diagram.

Write the list down before drafting: `section → question → type → the one node or element that is the point`.

### 2. Choose the type

From the question, with `reference/types.md` (picker table at the top of each entry: "When"). Defaults to resist:

- A flowchart whose arrows only mean "sits on" is a `block-beta`.
- A flowchart of services and data stores is an `architecture-beta`.
- A flowchart of an agent loop is a `stateDiagram-v2`.
- A quadrant with invented positions is a table.
- A pie with more than four slices is a bar chart or a table.

### 3. Draft

Follow the type's entry in `reference/types.md`, which holds syntax verified against the site's Mermaid and the pitfalls already hit. Then the grammar:

1. **No colours.** `:::accent` on the node the paragraph is about (one, at most two), `:::muted` for context. Never `style … fill:#` or `classDef` colours.
2. **Short title, detail in small.** Up to four words, then `<br/><small>detail</small>`.
3. **Nine nodes at most.** More is two diagrams, or a `subgraph` per boundary.
4. **Vertical by default.** `TD` flowcharts, `timeline TD`. `LR` only for four nodes or fewer.
5. **Math is LaTeX.** `$$…$$` inside the label, `\lt` / `\gt` instead of `<` / `>`. Flowcharts and sequence diagrams only. Never `theta_t`.
6. **The post's vocabulary.** Node names match the words the prose uses, and the same thing has the same name in every diagram of the post.
7. **One idea per diagram.** If the lead-in sentence needs "and", it is two diagrams.

### 4. Lint

```bash
cd front && npm run diagrams:lint -- <slug>
```

Errors break the grammar and must be fixed. Warnings are judgment calls: fix them, or be able to say why the diagram is better as it is.

### 5. Render and look

```bash
cd front && npm run diagrams:render -- <slug>
```

It renders each diagram with the site's theme, in light and dark, into `front/.diagram-preview/<slug>-<n>-<theme>.png`, and prints for each one the scale it shows at on desktop and on a phone, the label size at that scale, and any label that overflows its box. **Open the PNGs with Read and look at them.** A diagram that parses can still be bad. Check:

- Desktop labels at 11 px or more. Under that the script says TOO WIDE: go vertical, split, or shorten.
- The accent lands on the subject of the paragraph, and the eye goes there first.
- Reading order matches the prose: top to bottom, left to right.
- Nothing collides: edge labels over lines, crossing edges that could be avoided by reordering nodes.
- Dark mode reads as well as light.

Loose drafts can be checked before they are in a post: save the block as `draft.mmd` and pass the path instead of a slug.

### 6. Frame it in prose

The sentence before the diagram says what to look at ("follow the cyan node: ..."). The paragraph after interprets it. A chart without a legend (`xychart-beta`) names its series by colour in that sentence.

### 7. Iterate

Repeat 3 to 5 until the lint has no errors and the images are ones you would put in a talk.

## Upgrading existing posts

The old diagrams predate the grammar. To improve them:

```bash
cd front && npm run diagrams:lint -- --all     # where the problems are, worst posts first
```

Per post: render the current diagrams, keep what each one means, rewrite it with the grammar (often a better type), render again and compare. Do not change the claims, and do not touch the prose beyond the lead-in sentence. One post per commit, `post/` branch, as in `docs/workflow.md`.

## Quality bar

Before finishing, every diagram in the post passes all of these:

- [ ] It answers a question the prose raises, and the lead-in sentence says which.
- [ ] The type is the most specific one for that question.
- [ ] Lint has no errors; every warning is fixed or justified.
- [ ] Rendered PNGs looked at, light and dark. Desktop labels at 11 px or more.
- [ ] One or two accent nodes, on the subject of the paragraph.
- [ ] Names match the prose and the other diagrams.
- [ ] Math in LaTeX. No invented data in charts or quadrants.
- [ ] A production-system post has its `architecture-beta`.

## Not Mermaid's job

Some explanations need more than Mermaid draws well: real data charts with legends and tooltips, step-through animations, explorable graphs. Mermaid's `xychart-beta` is a stopgap for the first. When a post's central explanation needs one of these, say so to the user instead of forcing a Mermaid diagram: it calls for a dedicated chart block or React component, which is planned work, not something to improvise inside a post.
