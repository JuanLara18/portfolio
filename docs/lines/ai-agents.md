# Line: Agents

Second line audited. Rows with reasons are in `docs/blog-inventory.csv`
(`line = agents`). Proposals came from outlines, links, and prerequisites, then
were checked against the section overlap measurement (`tools/restructure/`).
None of the three proposed merges held up.

## Scope

48 posts considered: 44 belong to the line; the Claude Code guide goes to
Engineering Craft and the three Claude exam guides to the new Certifications
section.

| Disposition | Posts |
|---|---|
| canon | 13 |
| keep | 20 |
| archive | 11 |
| move to Craft | 1 |
| to Certifications | 3 |

## Canon, in reading order

About 90,000 words, roughly 7.5 hours.

1. `foundations-of-agentic-ai-llms-to-agents`
2. `agent-architecture-and-orchestration`, receiving the failure-modes section
   of `production-llm-agents-patterns`
3. `adk-graph-workflows-deterministic-orchestration` (author decision)
4. `agent-integration-protocols-mcp-and-a2a`
5. `mcp-production-enterprise`
6. `operating-agents-eval-observability-scale`
7. `agent-guardrails-field-guide`
8. `enterprise-agent-governance-lifecycle`
9. `bank-grade-agent-security-iam-gateways`
10. `finops-llm-agents-token-economics`
11. `agent-platform-control-plane-data-plane`
12. `mcp-registry-gateway-tool-plane`
13. `agent-golden-paths-multi-tenancy`

The arc: what an agent is → how it is built and connected → how it is operated
→ how a regulated company governs, secures, and pays for it → the platform that
hosts everyone's agents.

## Chapters

| Chapter | Posts | Change |
|---|---|---|
| Agent engineering (the six-part arc) | 8 | the two pattern posts archived; `agent-engineering-disciplines` and `llm-as-a-judge` attached as standalone reads |
| MCP | 3 | the registry lives in the platform series |
| Security, governance, cost | 5 | was a five-post series built around a two-part one |
| The Agent Platform | 5 | unchanged |
| Google ADK | 5 | graph workflows in the canon; migration guide archived |
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

## What the measurement changed

- `adk-advanced-evolution-of-agent-engineering` shares no section with the ADK
  reference post; it is the history of why ADK looks as it does. It stays.
- `agent-architectures-productive-patterns` and `production-llm-agents-patterns`
  are surveys: each section has a closer match somewhere else in the line, so a
  merge would move nothing. They are archived; the one section without a match
  (failure modes) moves into the architecture post.

## Decided

- ADK enters the canon with `adk-graph-workflows-deterministic-orchestration`.
- Certifications become their own section: the three Claude guides, the Google
  Cloud roadmap, and the two ML exam reviews (out of `foundations-of-ml`).
- `magnifica-humanitas` is archived.
