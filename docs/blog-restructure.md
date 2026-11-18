# Blog restructure

Long-lived branch `feat/blog-restructure`. No PR until the new structure is complete.
`main` keeps shipping meanwhile; merge `main` into this branch at least weekly.

## Why

The blog has 185 posts, about 1.26 million words: roughly 105 hours of reading at
200 words a minute. Nobody reads that. Dates only give the posts an order, and the
index presents everything as one flat feed of cards that look alike: every header
image goes through the same cyan duotone, so the page reads as a wall of blue.

The work is good; the presentation is a feed. The goal is a body of work: a few
lines of expertise, each with a curated canon that is kept current, and an archive
for everything else.

## Inventory (as of e89ed6cb)

| | Count |
|---|---|
| Posts | 185 (field-notes 138, research 31, curiosities 16) |
| Series | 23, from 3 to 15 posts |
| Posts in no series | 37 |
| Tags | 258 (many used once or twice) |
| Typical length | 5,000 to 9,000 words; a few at 12,000 to 18,000 |

Visible overlap, before any reading:

- **Agents**, about 45 posts over 7 series plus orphans. Architecture is covered at
  least four times (`foundations-of-agentic-ai-llms-to-agents`,
  `agent-architecture-and-orchestration`, `agent-architectures-productive-patterns`,
  `production-llm-agents-patterns`). Governance three times
  (`enterprise-agents-governance-security-business`,
  `enterprise-agent-governance-lifecycle`, `bank-grade-agent-security-iam-gateways`).
  Memory three times.
- **Graphs and knowledge**, about 30 posts over 4 series plus 4 orphans that
  repeat the production graph stack (`production-graph-stack-agents-mcp-ontologies`,
  `enterprise-graph-mcp-architecture-gcp`, `spanner-graph-for-knowledge-and-agents`).
- **Dated pieces**: certification guides (6), conference recaps, tool comparisons
  tied to a version (OpenClaw, Hermes, ADK 1.x to 2.x), the 100-post retrospective
  and stack recommendations.

## Proposed model

```
Line            a field of expertise, its own landing page
  Canon         5 to 10 posts a newcomer should read, in order, kept current
  Series        the existing arcs, now chapters inside a line
  Archive       everything else: still online, same URL, marked as archived
```

### Lines (first cut)

| Line | Draws from | Rough size today |
|---|---|---|
| Knowledge & Graphs | knowledge-systems, ontology-engineering, graph-engineering, graph-layer-for-agents, Knowledge Catalog | ~30 |
| Retrieval | production-rag, embeddings-and-retrieval | ~14 |
| Agents | agentic-ai-foundations, agent-platform, agent-security-finops, mcp-in-depth, adk-in-depth, agent-tooling-ecosystem | ~45 |
| Machine Learning | foundations-of-ml, deep-learning-architectures, reinforcement-learning, why-learning-works, shape-of-a-problem | ~40 |
| Engineering Craft | Python, data-engineering-stack, devops-infra-for-ml, senior-judgment-ai-era, cloud | ~30 |
| Curiosities | algebraic-number-theory, mathematical-curiosities, the rest of curiosities | ~16 |

Knowledge & Graphs leads: it is the profile the About page now states.

### Disposition of each post

Every post gets one of:

- **canon**: in a line's reading order; reviewed, updated, and maintained.
- **keep**: stays inside its series, not in the canon.
- **merge**: folded into a stronger post; the URL redirects there.
- **archive**: stays online with an archived banner; out of the index, related,
  and the knowledge base reading paths; kept in the sitemap or not (to decide).

A 2028 date stays as a release slot; the line, not the date, orders the reading.

## What the overlap measurement showed

Every post was split into its `##` sections (1,707 of them) and compared with
every section of every other post, by wording (TF-IDF) and by meaning (local
embeddings). Tools and thresholds: `tools/restructure/README.md`.

- **There is almost no repeated text.** No two sections share more than about
  half their wording, and the closest pairs by meaning, read side by side, are
  the same topic told from different angles.
- **The excess is breadth, not duplication.** The blog revisits topics with
  fresh writing each time. Curation is therefore mostly selection and order
  (canon, keep, archive), not merging.
- **A merge needs a reader's reason.** Two posts merge when they do the same job
  for the same reader (two introductions to one subject), not because they cover
  the same topic. Of six merges proposed from outlines, one survived.

## Sections outside the lines

- **Certifications**: exam guides and reviews (Anthropic, Google Cloud). A
  section of its own, not a line and not archived.

## Phases

1. **Audit.** One row per post in `docs/blog-inventory.csv`: line, series, words,
   overlap with, freshness, proposed disposition, reason. Decided line by line with
   the author, starting with Knowledge & Graphs.
2. **Information architecture.** Blog landing as a set of line landings; a line
   page (canon, series, archive); what the post page shows about its line; routes
   and redirects for merged posts.
3. **Visual system.** Replace the uniform duotone wall (see below).
4. **Curation.** Merges and rewrites of canon posts, line by line.
5. **Migration.** Redirects, sitemap, RSS, knowledge base (`KNOWLEDGE_BASE.md`
   reading paths), print PDFs, related posts, the graph page, tags cut to a small
   controlled set.

## Open decisions

- **D1. Lines.** The six above, or a different cut.
- **D2. Archive.** Visible with a banner (recommended: no broken links, and search
  still finds them), or hidden from the site entirely.
- **D3. Images.** The brand forbids per-line colours, so colour cannot separate
  the cards. Options: neutral ink duotone instead of cyan; generated covers per
  line and series (like the series covers) on the index, photos only inside a
  post; or typographic cards with no images on the index.
- **D4. Size of the canon.** Target about 60 maintained posts in total.
- **D5. Posts on `main` meanwhile.** New posts keep going to `main` and are placed
  here when merging, or they wait.
