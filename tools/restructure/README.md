# Restructure tools

Overlap measurement used to audit the blog lines (`docs/blog-restructure.md`).
Every script runs from the repo root and writes into a scratch directory.

| Script | What it measures |
|---|---|
| `overlap_lexical.py <root> <out>` | TF-IDF cosine between `##` sections; finds shared wording |
| `embed_sections.py <root> <out>` | Embeds every section with `nomic-embed-text` on a local Ollama |
| `overlap_semantic.py <root> <out> [HI]` | Cosine between section embeddings; finds shared topics |

Sections under 120 words and boilerplate sections (Going Deeper, Prerequisites,
Gotchas, Testing, closings) are left out. Thresholds are percentiles of each
section's best match in another post: the top 5% is reported as SAME, the top
20% as topic.

## How to read the numbers

- Even the top 5% of embedding matches are posts on the same topic from
  different angles, not repeated text (checked by reading the pairs). Lexical
  similarity never passes 0.56 for any two sections.
- So a merge has to be justified by a reader (two posts doing the same job),
  not by duplication. The scripts tell you which sections of a post are its own,
  which is what a merge or an archive would lose.
