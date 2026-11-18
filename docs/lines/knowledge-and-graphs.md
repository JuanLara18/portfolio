# Line: Knowledge & Graphs

First line audited. Rows with reasons are in `docs/blog-inventory.csv`
(`line = knowledge-graphs`). Proposals came from each post's outline, links, and
prerequisites, then were checked against a section-by-section overlap
measurement (`tools/restructure/`). Two of the three proposed merges did not
hold up and became keeps.

## Scope

41 posts considered: 36 belong to the line, 5 move to another line and stay
linked from here.

| Disposition | Posts |
|---|---|
| canon | 12 |
| keep | 20 |
| merge | 1 |
| archive | 3 |
| move | 5 |

## Canon, in reading order

About 82,000 words, roughly 7 hours.

1. `knowledge-as-a-product`, with `defining-the-knowledge-stack` as its companion
2. `ontologies-building-knowledge-bases`, rewritten as the intro and absorbing
   `knowledge-graphs-practice`
3. `tbox-abox-schema-facts-distinction`
4. `modular-ontologies-core-domains-pattern`
5. `ontology-production-pipeline-gcp`
6. `populating-knowledge-graph-llms-banking`
7. `apache-ossie-open-semantic-stack`
8. `knowledge-catalog-vs-ontologies`, made standalone
9. `graph-engine-internals-index-free-adjacency`
10. `choosing-a-graph-engine-2026`, retitled without the year
11. `ontology-to-agent-toolbox`
12. `enterprise-graph-mcp-architecture-gcp`

The arc: what a knowledge base is → how to model meaning → how to run the model
in production → where it is stored → how agents use it.

## Chapters (the series inside the line)

| Chapter | Posts | Change |
|---|---|---|
| The knowledge layer | 8 | `data-silos` archived |
| Ontologies | 9 | intro rewritten; `ontology-grounded-rag` moves to Retrieval |
| Graph Engines Under the Hood | 4 | `spanner-graph` joins (orphan today) |
| Graph Analytics in Production | 6 | split from `graph-engineering`; ONA added as part 4, as its prose says |
| The Graph Layer for Agents | 7 | the two production graph posts join (orphans today) |
| Google Knowledge Catalog | 2 | product tour archived |

Foundations from Curiosities, listed on the line page: graph theory, network
science, PageRank.

## Findings outside the dispositions

- `series.js` joins two prose series into `graph-engineering` (Graph Engines
  Under the Hood, 3 parts; Graph Analytics in Production, 5 parts), includes the
  GNN post that neither claims, and leaves out ONA, which calls itself part 4.
- Seven posts carry 10 or more year mentions, against the rule that dates are
  release slots. The canon ones get de-dated as part of their review.
- `knowledge-graphs-practice` is a prerequisite of 8 posts, so its redirect and
  the prerequisite graph in `KNOWLEDGE_BASE.md` must change together.

## What the measurement changed

- `defining-the-knowledge-stack` shares one section of eight with
  `knowledge-as-a-product` (the knowledge product layer). It stays as the
  companion read, with that section replaced by a pointer.
- `production-graph-stack-agents-mcp-ontologies` shares no section with the GCP
  blueprint. Both stay.
- `knowledge-graphs-practice` still merges into the rewritten intro: the reason
  is that both are introductions for the same reader, not that they repeat.

## Open questions for this line

- Should one applied case (`graph-fraud-detection`) join the canon?
- Does `enterprise-knowledge-bases` live here or in Retrieval?
- Does `graph-neural-networks` live here or in Machine Learning?
