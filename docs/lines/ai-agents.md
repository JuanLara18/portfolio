# Line: Agents

Second line audited. Rows with reasons are in `docs/blog-inventory.csv`
(`line = agents`). As with Knowledge & Graphs, proposals come from outlines, links,
and prerequisites; merges are confirmed by a full read first.

## Scope

48 posts considered: 44 belong to the line, 4 go elsewhere (a tool guide to
Engineering Craft, three exam guides to a certifications shelf).

| Disposition | Posts |
|---|---|
| canon | 12 |
| keep | 20 |
| merge | 3 |
| archive | 9 |
| move | 4 |

## Canon, in reading order

About 83,000 words before the merge, roughly 7 hours.

1. `foundations-of-agentic-ai-llms-to-agents`
2. `agent-architecture-and-orchestration`, absorbing
   `agent-architectures-productive-patterns` and `production-llm-agents-patterns`
3. `agent-integration-protocols-mcp-and-a2a`
4. `mcp-production-enterprise`
5. `operating-agents-eval-observability-scale`
6. `agent-guardrails-field-guide`
7. `enterprise-agent-governance-lifecycle`
8. `bank-grade-agent-security-iam-gateways`
9. `finops-llm-agents-token-economics`
10. `agent-platform-control-plane-data-plane`
11. `mcp-registry-gateway-tool-plane`
12. `agent-golden-paths-multi-tenancy`

The arc: what an agent is → how it is built and connected → how it is operated
→ how a regulated company governs, secures, and pays for it → the platform that
hosts everyone's agents.

## Chapters

| Chapter | Posts | Change |
|---|---|---|
| Agent engineering (the six-part arc) | 8 | two interlopers merged; `agent-engineering-disciplines` and `llm-as-a-judge` attached as standalone reads |
| MCP | 3 | the registry lives in the platform series |
| Security, governance, cost | 5 | was a five-post series built around a two-part one |
| The Agent Platform | 5 | unchanged |
| Google ADK | 4 | history post merged, migration guide archived |
| Build, buy, adopt | 7 | new chapter: composition, harnesses, frameworks, PoCs, platform selection |

## Findings outside the dispositions

- `series.js` lists 8 posts in `agentic-ai-foundations`; the first post calls
  it a six-part series and the six are consecutive. The two extra posts are the
  earlier pattern posts proposed for merge.
- `agent-security-finops` has 5 posts; the prose series is two parts
  (authentication, bank-grade). Guardrails, lifecycle and FinOps are separate
  posts that the series gathered.
- Year mentions are worse here than in Knowledge & Graphs: 15 posts have 10 or
  more, led by `agent-engineering-disciplines` (36) and
  `adk-advanced-evolution-of-agent-engineering` (31).
- Memory appears in four posts across two lines: series part 3, ADK continuity,
  graph memory, and the patterns post. After the merges, three remain, each
  with a distinct angle (retrieval, product continuity, temporal facts).

## Open questions for this line

- Does ADK get one canon post (`adk-graph-workflows-deterministic-orchestration`
  is the candidate), given it is the stack the author runs?
- Certification guides: a separate shelf (proposed, with the GCP roadmap and the
  ML cert reviews joining later), or archive?
- `magnifica-humanitas`: archive, or keep as a standalone essay?
