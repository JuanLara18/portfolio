# Knowledge base

The blog has a second reader: AI assistants. `knowledge-base/` gives them a map of 180+ posts so they can answer "what has Juan written about X", "what should I read before Y", or "where does he use Neo4j" without opening every file.

## Two files, two jobs

| File | Written by | Shape | Best for |
|---|---|---|---|
| [`KNOWLEDGE_BASE.md`](../knowledge-base/KNOWLEDGE_BASE.md) | the author, plus a generated catalog | prose map: scope, reading paths, cross-cutting views, author context, the full post catalog | loading whole into a Claude Project as context |
| [`posts.json`](../knowledge-base/posts.json) | `build-knowledge-base.js` | structured index (about 250 KB) | targeted `jq` queries from an agent with a shell |

`posts.json` holds, for every post, its title, date, category, tags, excerpt, canonical URL, source path, reading time, word count, concepts, prerequisites, what it teaches, technologies, depth, and whether narration exists. On top of that it derives four indexes: `concept_index`, `tech_index`, `tag_index`, `category_index`, and a `prereq_graph`.

## Querying it

```bash
# Which posts cover a concept?
jq '.concept_index["rag"]' knowledge-base/posts.json

# Which posts use a technology?
jq '.tech_index["neo4j"]' knowledge-base/posts.json

# Everything known about one post
jq '.posts["query-routing-agent-decisions"]' knowledge-base/posts.json

# What should I read before this post?
jq '.posts["ontology-to-agent-toolbox"].prereqs' knowledge-base/posts.json

# Which posts build on this one?
jq '.prereq_graph.edges[] | select(.from=="model-context-protocol")' knowledge-base/posts.json
```

The repository's [`CLAUDE.md`](../CLAUDE.md) tells Claude Code to start here for any question about the blog's content.

## How it stays current

Every `npm run build` and every `npm run sync` regenerates `posts.json` from `blogData.json` and re-injects the catalog into `KNOWLEDGE_BASE.md` between its `<!-- AUTO-CATALOG:START -->` and `<!-- AUTO-CATALOG:END -->` markers. Nothing outside those markers is touched, so the hand-written sections survive every rebuild.

## Enriching a post

Without an entry, a post gets defaults: concepts from its tags, no prerequisites, depth inferred from word count. To describe it properly, add an entry to the YAML block under `## Augmentation` in `KNOWLEDGE_BASE.md`:

```yaml
agent-platform-control-plane-data-plane:
  concepts: [agent platform, control plane versus data plane, non-human identity]
  prereqs: [agent-architecture-and-orchestration, model-context-protocol]
  teaches: [separate control plane from data plane for agents]
  tech: [model-armor, vertex-agent-engine, mcp]
  depth: deep
```

`prereqs` are slugs and become edges in `prereq_graph`. `depth` is `intro`, `working`, or `deep`. Then run `npm run build-knowledge-base`.

## Reading paths

`## Reading Paths` in `KNOWLEDGE_BASE.md` lists curated sequences ("Learn RAG from zero to production", "Build your first LLM agent"). They serve two purposes: agents recommend them, and the PDF builder compiles any of them into a print edition.
