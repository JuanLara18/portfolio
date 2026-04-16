# Portfolio Repository

Personal portfolio + technical blog (~90 posts on RAG, agents, knowledge graphs, data engineering, ML internals, math curiosities). React app under `front/`, blog content under `front/public/blog/posts/`.

## Knowledge base for blog content

When the user asks about blog topics — what they have written about, what to read on a topic, where to cite their own work, what concepts a post covers, prerequisites between posts — use the knowledge base in `knowledge-base/`.

**Always start with `knowledge-base/KNOWLEDGE_BASE.md`.** It contains the manifest, reading paths, cross-cutting views (by stack / audience / depth / format), author context, and the full post catalog (slug + 1-line + concepts for every post).

**For structured queries, use `knowledge-base/posts.json` via `jq`.** Examples:

```bash
# What does the blog cover about a concept?
jq '.concept_index["rag"]' knowledge-base/posts.json

# Posts that use a specific tech?
jq '.tech_index["neo4j"]' knowledge-base/posts.json

# Full metadata for one post (concepts, prereqs, teaches, depth, audio):
jq '.posts["query-routing-agent-decisions"]' knowledge-base/posts.json

# What posts depend on this one?
jq '.prereq_graph.edges[] | select(.from=="model-context-protocol")' knowledge-base/posts.json

# What should I read before this post?
jq '.posts["ontology-to-agent-toolbox"].prereqs' knowledge-base/posts.json
```

`posts.json` is ~250K — never `cat` it whole, always `jq` to extract the section you need.

**To read the full text of a post**, open the file at `front/public/blog/posts/<category>/<slug>.md`. Slugs are stable canonical IDs.

When citing a post to the user, link as `https://juanlara18.github.io/portfolio/#/blog/<slug>`.

## Build pipeline

Blog content flows through `npm run prebuild` (in `front/`):

1. `build-blog-data` — scans `posts/*.md`, parses frontmatter, writes `front/src/data/blogData.json`.
2. `build-knowledge-base` — reads `blogData.json` + the YAML augmentation block in `KNOWLEDGE_BASE.md`, regenerates `knowledge-base/posts.json` and re-injects the auto-catalog into `KNOWLEDGE_BASE.md` (between `<!-- AUTO-CATALOG:* -->` markers).
3. `build-sitemap`, `build-rss` — site metadata.

To enrich a post's metadata (concepts, prereqs, teaches, tech, depth), edit the YAML block under `## Augmentation` in `KNOWLEDGE_BASE.md` and re-run `npm run build-knowledge-base`. Posts without an augmentation entry get sensible defaults (concepts ← tags, depth ← word count).

## Authoring posts

Use the `new-blog-post` skill for the full workflow (frontmatter, header image, audio generation). The post becomes available to the knowledge base on the next build.
