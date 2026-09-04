# Blog Knowledge Base

This file is the human-curated map of the blog. Its companion `posts.json` is auto-generated and machine-queryable. Together they let an agent answer questions about the blog without loading every post.

## For Agents: How to Use This Knowledge Base

- Load **this file first** for the high-level map: scope, reading paths, cross-cutting views, author context.
- Load **`knowledge-base/posts.json`** when you need structured queries: post metadata by slug, posts that cover a concept, prerequisite walks, tech filters.
- To open the full text of a post, read `front/public/blog/posts/<category>/<slug>.md`. Slugs are stable; treat them as canonical IDs.
- When citing a post to the user, link it as `https://juanlara18.github.io/portfolio/#/blog/<slug>`.
- This is a personal knowledge base, not a tutorial site. Posts are how the author thinks through topics — treat them as primary sources written by the user themselves.

## What the Blog Covers

Three top-level lanes (this is the file-system category, kept because it is also how the site is organized):

- **field-notes** — practical engineering walkthroughs from the author's work: RAG, agents, data infra, GCP stack, ML tooling, MLOps. The largest lane. Production-oriented.
- **research** — paper readings and conceptual deep-dives: Transformers, BERT, Mamba, RAG paper, scaling laws, manifold hypothesis, embeddings.
- **curiosities** — math and theory adjacent to ML: graph theory, algebraic number theory, PageRank, group theory, Gödel, Fourier.

The blog is dense. Most posts are 4,000–7,000 words and assume working knowledge of software engineering and basic ML.

## Reading Paths

Curated sequences for common goals. Each path is a slug list in the suggested order. These are the paths the author would actually recommend; they are not exhaustive.

### Learn RAG from zero to production
1. embeddings-geometry-of-meaning
2. rag-retrieval-augmented-generation
3. rag-building-production-systems
4. rag-advanced-patterns
5. ragas-evaluating-rag
6. query-routing-agent-decisions

### Build your first LLM agent
The builder's path. For the operator's counterpart — hosting other teams' agents — see "Run an agent platform" below.
1. model-context-protocol
2. production-llm-agents-patterns
3. langgraph-multi-agent-workflows
4. ontology-to-agent-toolbox
5. query-routing-agent-decisions
6. mcp-production-enterprise

### Stand up a knowledge base or knowledge graph
1. enterprise-knowledge-bases
2. knowledge-base-curation
3. ontologies-building-knowledge-bases
4. knowledge-graphs-practice
5. choosing-a-graph-engine-2026
6. ontology-to-agent-toolbox

### Modern data engineering stack
1. data-engineering-fundamentals
2. dimensional-modeling-kimball
3. lakehouse-architecture
4. dbt-analytics-engineering
5. lookml-semantic-layer-data-modeling
6. apache-airflow-orchestration
7. dama-dmbok-data-governance

### From ML basics to production
1. ml-libraries-under-the-hood
2. structuring-ml-projects
3. experiment-tracking-mlops
4. ml-metrics-evaluation-monitoring
5. cloud-ml-infrastructure
6. working-with-ml-models

### Fine-tuning and alignment
1. fine-tuning-embeddings
2. fine-tuning-gemma4-lora-qlora
3. rlhf-dpo-alignment
4. reinforcement-learning-first-principles
5. reinforcement-learning-in-practice

### Embeddings and vector search
1. embeddings-geometry-of-meaning
2. multimodal-embeddings-metric-problem
3. mteb-embedding-benchmarks
4. vector-db-benchmarks
5. fine-tuning-embeddings

### LLM internals and serving
1. attention-is-all-you-need
2. bert-pre-training-bidirectional-transformers
3. t5-text-to-text-transfer-transformer
4. mamba-selective-state-spaces
5. scaling-laws-neural-language-models
6. microgpt-reading-karpathy
7. local-llm-inference-tools
8. llm-caching-four-layers
9. llm-benchmarks

### Graph theory thread (the spine)
The same eigenvector math that ranked the early web now ranks context for a coding agent, scores a fraud ring, and maps an organization. These five are the shared foundation; after them, branch into whichever graph series matches the problem.
1. graph-theory-mathematics-of-connections
2. network-science-communities-centrality
3. pagerank-eigenvectors
4. knowledge-graphs-practice
5. graph-neural-networks-learning-structured-data

Branches from here: **Graph Engines Under the Hood** for storage and query engines, **Graph Analytics in Production** for computing over the graph, **The Graph Layer for Agents** for coding agents, **Enterprise Ontology / Banking Knowledge Graph** for schema-first enterprise modelling.

### Choose and run a graph database
From the data model down to the engine and the query language.
1. knowledge-graphs-practice
2. graph-engine-internals-index-free-adjacency
3. gql-standard-cypher-sqlpgq
4. choosing-a-graph-engine-2026
5. spanner-graph-for-knowledge-and-agents

### Graph analytics for fraud and risk
The applied arc a financial-services engineer actually needs, from the math to the alert queue.
1. graph-theory-mathematics-of-connections
2. network-science-communities-centrality
3. graph-analytics-gds-execution-model
4. centrality-communities-in-practice
5. node-embeddings-fastrp-node2vec-graphsage
6. graph-fraud-detection-rings-synthetic-identity

### Run an agent platform
The operator's path: hosting other teams' agents rather than building one. Pairs with "Build your first LLM agent" above.
1. agent-platform-control-plane-data-plane
2. agent-runtime-sessions-state-topology
3. sandboxing-agents-microvm-gvisor
4. mcp-registry-gateway-tool-plane
5. agent-golden-paths-multi-tenancy
6. operating-agents-eval-observability-scale
7. finops-llm-agents-token-economics
8. enterprise-agent-governance-lifecycle

### Secure an agent system
Cross-cutting path assembled from the security posts, ordered from threat model to enforcement.
1. agent-guardrails-field-guide
2. enterprise-agents-governance-security-business
3. agent-authentication-oauth-mcp-identity
4. bank-grade-agent-security-iam-gateways
5. sandboxing-agents-microvm-gvisor
6. mcp-registry-gateway-tool-plane

### The Graph Layer for Agents (five-part series)
Why grep and embeddings stop being enough for coding agents, and what replaces them.
1. agent-graph-layer-why-grep-embeddings-fell-short
2. repo-to-graph-ast-vs-llm-extraction
3. querying-code-graphs-blast-radius-localization
4. graph-memory-temporal-agents-graphiti-cognee
5. graph-layer-in-production-mcp-build-vs-buy

### Graph Engines Under the Hood (three-part series)
How a graph engine actually works underneath, what the query standard changed, and how to pick one.
1. graph-engine-internals-index-free-adjacency
2. gql-standard-cypher-sqlpgq
3. choosing-a-graph-engine-2026

### Graph Analytics in Production (five-part series)
Computing over a graph rather than modelling it: the execution model, the algorithms, the embeddings, and the applied cases.
1. graph-analytics-gds-execution-model
2. centrality-communities-in-practice
3. node-embeddings-fastrp-node2vec-graphsage
4. organizational-network-analysis-company-graph
5. graph-fraud-detection-rings-synthetic-identity

### The Agent Platform (five-part series)
The platform engineer's view rather than the agent builder's: operating the substrate that other teams' agents run on.
1. agent-platform-control-plane-data-plane
2. agent-runtime-sessions-state-topology
3. sandboxing-agents-microvm-gvisor
4. mcp-registry-gateway-tool-plane
5. agent-golden-paths-multi-tenancy

### Google ADK in Depth (six-part series)
The Agent Development Kit end to end, from the mental model to the 2.x graph runtime, migration, debugging, and durable memory.
1. google-adk-agent-development-deep-dive
2. adk-graph-workflows-deterministic-orchestration
3. migrating-adk-1x-to-2x
4. debugging-adk-agent-flows
5. adk-advanced-evolution-of-agent-engineering
6. enterprise-agent-memory-continuity-adk-geap

### Why Learning Works (fifteen-part series)
The proofs under the practice. Where the loss function comes from, what you are actually minimizing, the concentration inequalities every generalization bound is built from, PAC learning and VC dimension, why no model escapes its own assumptions, and the theorems behind regularization, kernels, boosting, spectral methods, EM and the Bellman operator. Proof-heavy: theorems are stated formally and proved, or the gap is named.
1. loss-functions-are-probability-assumptions
2. what-are-we-minimizing-erm-bias-variance
3. markov-to-hoeffding-concentration-inequalities
4. probably-approximately-correct
5. vc-dimension-sauer-shelah
6. no-free-lunch-theorem
7. penalizing-is-constraining
8. kernel-trick-representer-theorem
9. weak-learnability-equals-strong
10. one-eigendecomposition-four-algorithms
11. em-never-goes-down
12. bellman-operator-is-a-contraction
13. universal-approximation-and-what-it-does-not-give-you
14. backprop-is-reverse-mode-differentiation
15. double-descent

### Senior Engineering Judgment in the AI Era (five-part series)
What stays scarce when an AI can generate the code: infrastructure, data modeling, API contracts, distributed-systems theory, and product judgment.
1. senior-infrastructure-distributed-systems-failure-networking
2. senior-data-modeling-query-patterns-database-design
3. senior-api-design-contracts-versioning-dx
4. senior-distributed-theory-cap-pacelc-tradeoffs
5. senior-product-engineering-scale-prioritization-architecture

### Enterprise Ontology / Banking Knowledge Graph (four-part series)
1. tbox-abox-schema-facts-distinction
2. modular-ontologies-core-domains-pattern
3. ontology-production-pipeline-gcp
4. populating-knowledge-graph-llms-banking

### Knowledge Catalog & Knowledge Architecture
The four-part arc on Google's Knowledge Catalog vs ontologies, plus the hands-on companion and the adjacent knowledge-as-a-product trio.
1. agent-guardrails-field-guide
2. google-cloud-next-2026-agent-native-stack
3. gemini-enterprise-knowledge-catalog-deep-dive
4. knowledge-catalog-vs-ontologies
5. gemini-knowledge-catalog-workshop
6. knowledge-as-a-product
7. defining-the-knowledge-stack
8. comparing-knowledge-bases-semantic-overlap

### Software-engineering foundations the blog assumes
1. software-engineering-classics
2. python-beyond-the-basics
3. bash-daily-driver-ml-engineer
4. git-and-github-complete-guide
5. docker-for-ml-engineers
6. files-under-the-hood

## Cross-cutting Views

### By stack / technology
- **GCP**: gcp-ai-stack-vertex-alloydb-knowledge-pipeline, vertex-ai-gcp-ml-platform-cli, cloud-ml-infrastructure
- **Anthropic / Claude**: claude-code-complete-guide, model-context-protocol, mcp-production-enterprise, mcp-server-nl-to-powerbi-dashboard
- **LangChain / LangGraph / LlamaIndex**: langgraph-multi-agent-workflows, llamaindex-langchain-llm-frameworks
- **Neo4j / graph DBs**: knowledge-graphs-practice, ontology-to-agent-toolbox, graph-engine-internals-index-free-adjacency, gql-standard-cypher-sqlpgq, choosing-a-graph-engine-2026
- **Graph analytics / GDS**: graph-analytics-gds-execution-model, centrality-communities-in-practice, node-embeddings-fastrp-node2vec-graphsage, organizational-network-analysis-company-graph, graph-fraud-detection-rings-synthetic-identity
- **Agent platform / platform engineering**: agent-platform-control-plane-data-plane, agent-runtime-sessions-state-topology, sandboxing-agents-microvm-gvisor, mcp-registry-gateway-tool-plane, agent-golden-paths-multi-tenancy
- **dbt / warehouse modeling**: dbt-analytics-engineering, dimensional-modeling-kimball, lookml-semantic-layer-data-modeling
- **Spark / pandas / DuckDB**: apache-spark-ecosystem-guide, sql-pandas-pyspark-duckdb
- **Docker / Kubernetes**: docker-for-ml-engineers, kubernetes-minimum-subset-ml
- **PyTorch / TensorFlow**: pytorch-tensorflow-deep-learning-frameworks, ml-libraries-under-the-hood
- **Terraform / IaC**: terraform-infrastructure-as-code
- **Dataiku**: dataiku-enterprise-data-ai-ecosystem
- **ElevenLabs / voice**: elevenlabs-voice-ai-engineering

### By audience
- **ML engineers**: structuring-ml-projects, working-with-ml-models, computational-resources-ml, ml-libraries-under-the-hood, experiment-tracking-mlops
- **Data engineers**: data-engineering-fundamentals, lakehouse-architecture, apache-airflow-orchestration, dimensional-modeling-kimball, dbt-analytics-engineering
- **Backend devs entering AI**: model-context-protocol, production-llm-agents-patterns, llm-caching-four-layers, langgraph-multi-agent-workflows
- **Curious mathematicians**: anything in `curiosities/` — algebraic number theory, graph theory, Gödel, PageRank, Ramanujan, Fermat
- **Enterprise / regulated industry**: enterprise-knowledge-bases, dama-dmbok-data-governance, ai-poc-enterprise-evaluation, mcp-production-enterprise, ontology-to-agent-toolbox

### By depth
- **Intro / overview**: data-engineering-fundamentals, network-fundamentals-every-concept, software-engineering-classics, python-beyond-the-basics
- **Working knowledge**: most field-notes
- **Deep / production-grade**: rag-advanced-patterns, query-routing-agent-decisions, ontology-to-agent-toolbox, mcp-production-enterprise, fine-tuning-gemma4-lora-qlora, knowledge-graphs-practice

### By format
- **Walkthroughs with production-quality code**: query-routing-agent-decisions, ontology-to-agent-toolbox, rag-building-production-systems, langgraph-multi-agent-workflows
- **Conceptual / theory-first**: embeddings-geometry-of-meaning, the-manifold-hypothesis, scaling-laws-neural-language-models, attention-is-all-you-need
- **Survey / landscape**: enterprise-ai-platform-selection, vector-db-benchmarks, llm-benchmarks, mteb-embedding-benchmarks
- **Curiosity essays**: anything in `curiosities/`

## Author Context (for tailoring agent responses)

The author (Juan) is a Knowledge Data Engineer at a financial institution working across three lines: a vector DB PoC, lakehouse agents, and a corporate knowledge base for Personal Bank. Stack centers on GCP (Vertex, AlloyDB, BigQuery), Anthropic / Claude, Neo4j, dbt, and LangGraph.

Posts trend toward enterprise-grade concerns: governance, compliance, evaluation, observability, role-based access, ontology-driven design. The author values: derivations over hand-waving, production failure modes over happy paths, citing primary sources, and series-style posts that build on each other.

When the user asks about a topic the blog already covers: prefer pointing them to their own post first — they wrote it, they know it, the post is the artifact. Cite the slug.

## Augmentation (machine-readable, parsed by build-knowledge-base.js)

Per-post enrichment that supplements frontmatter. Edit the YAML block below to add `concepts`, `prereqs`, `teaches`, `tech`, and `depth` for any post. Posts not listed here get sensible defaults:

- `concepts` ← lowercased `tags`
- `prereqs` ← `[]`
- `teaches` ← `[]`
- `tech` ← `[]`
- `depth` ← inferred from word count (`<1500` intro, `<4000` working, else deep)

Add new entries as you publish or as you want to enrich an older post. The build script re-derives `concept_index`, `prereq_graph`, and `tech_index` from this block on every run.

```yaml
agent-platform-control-plane-data-plane:
  concepts: [agent platform, control plane versus data plane, platform layers, non-human identity, Model Armor, defence in depth, OWASP agentic top 10]
  prereqs: [agent-architecture-and-orchestration, model-context-protocol, agent-guardrails-field-guide]
  teaches: [separate control plane from data plane for agents, enumerate the platform layers an agent needs, assign ownership between platform and agent teams, place an LLM firewall without over-trusting it]
  tech: [model-armor, bedrock-agentcore, vertex-agent-engine, azure-ai-foundry, mcp]
  depth: deep

agent-runtime-sessions-state-topology:
  concepts: [turn loop, session state, checkpointing, durable execution, session affinity, idempotency, per-tenant fairness]
  prereqs: [agent-platform-control-plane-data-plane, agent-harness-build-fork-adopt-yc-qm, senior-infrastructure-distributed-systems-failure-networking]
  teaches: [choose an execution topology for agents, externalise session state, make tool calls idempotent under retry, resume a turn after failure, compare managed agent runtimes]
  tech: [bedrock-agentcore, vertex-agent-engine, azure-ai-foundry, temporal, langgraph, kubernetes]
  depth: deep

sandboxing-agents-microvm-gvisor:
  concepts: [execution isolation, microVM, gVisor, Kata Containers, cold start versus isolation, egress control, token exchange]
  prereqs: [agent-platform-control-plane-data-plane, docker-for-ml-engineers, kubernetes-minimum-subset-ml]
  teaches: [explain why a container is not a security boundary, choose between microVM and gVisor and hardened containers, control sandbox egress, keep secrets out of the sandbox, match isolation strength to trust]
  tech: [firecracker, gvisor, kata-containers, e2b, daytona, modal]
  depth: deep

mcp-registry-gateway-tool-plane:
  concepts: [MCP registry, MCP gateway, credential brokering, tool visibility as attack surface, schema drift, tool curation, supply-chain risk, tool poisoning]
  prereqs: [mcp-production-enterprise, agent-platform-control-plane-data-plane, ontology-to-agent-toolbox]
  teaches: [separate registry from gateway, design a registry entry schema, broker credentials so agents hold no secrets, version and deprecate a tool safely, curate a third-party server catalog]
  tech: [mcp, mcp-gateway, mcp-registry]
  depth: deep

agent-golden-paths-multi-tenancy:
  concepts: [platform as product, golden paths, agents as non-human persona, multi-tenancy, tenant data isolation, cost attribution, policy as code, paved road versus walled garden]
  prereqs: [agent-platform-control-plane-data-plane, mcp-registry-gateway-tool-plane, finops-llm-agents-token-economics, enterprise-agent-governance-lifecycle]
  teaches: [design a golden path for an agent team, isolate tenants sharing a knowledge base, attribute token spend to a tenant, enforce guardrails as admission control, measure platform adoption]
  tech: [kubernetes, opa, terraform, mcp]
  depth: deep

graph-fraud-detection-rings-synthetic-identity:
  concepts: [fraud rings, synthetic identity, layering, shared-attribute edges, supernode risk, graph features for gradient boosting, precision at alert budget, subgraph as explanation]
  prereqs: [centrality-communities-in-practice, node-embeddings-fastrp-node2vec-graphsage, graph-neural-networks-learning-structured-data]
  teaches: [model shared-attribute edges without creating supernodes, combine communities and embeddings with gradient boosting, decide when a GNN earns its cost, optimise for precision at the alert budget, explain a flag with a traversal path]
  tech: [neo4j, gds, xgboost, pytorch-geometric]
  depth: deep

graph-engine-internals-index-free-adjacency:
  concepts: [index-free adjacency, record layout, pointer chasing, supernode problem, traversal cost, GraphBLAS]
  prereqs: [knowledge-graphs-practice]
  teaches: [reason about traversal cost versus join cost, read a graph store record layout, diagnose supernode bottlenecks, tell native from layered graph engines]
  tech: [neo4j, falkordb]
  depth: deep

gql-standard-cypher-sqlpgq:
  concepts: [GQL, ISO/IEC 39075, SQL/PGQ, graph pattern matching, query portability, vendor lock-in]
  prereqs: [graph-engine-internals-index-free-adjacency, knowledge-graphs-practice]
  teaches: [read and write GQL, query a property graph over relational tables with SQL/PGQ, isolate vendor extensions, assess query portability]
  tech: [gql, cypher, sql, postgres]
  depth: deep

choosing-a-graph-engine-2026:
  concepts: [engine selection, workload profiling, graph-on-relational, embedded graph databases, total cost of ownership]
  prereqs: [graph-engine-internals-index-free-adjacency, gql-standard-cypher-sqlpgq, spanner-graph-for-knowledge-and-agents]
  teaches: [profile a graph workload, choose between native and embedded and managed engines, recognise when no graph database is needed, budget operational cost]
  tech: [neo4j, memgraph, falkordb, ladybugdb, cloud-spanner, neptune, puppygraph]
  depth: deep

graph-analytics-gds-execution-model:
  concepts: [graph projection, CSR representation, execution modes, memory estimation, algorithm catalog, serverless graph analytics]
  prereqs: [knowledge-graphs-practice, network-science-communities-centrality]
  teaches: [project a subgraph into memory, choose an execution mode, estimate memory before running, chain algorithms with mutate, run graph analytics on non-Neo4j sources]
  tech: [neo4j, gds, graphdatascience, aura]
  depth: deep

centrality-communities-in-practice:
  concepts: [centrality selection, approximate betweenness, personalized PageRank, resolution limit, Leiden, partition stability]
  prereqs: [graph-analytics-gds-execution-model, network-science-communities-centrality, pagerank-eigenvectors]
  teaches: [pick a centrality measure for a business question, scale betweenness with sampling, tune PageRank damping, prefer Leiden over Louvain, measure partition stability, validate communities without ground truth]
  tech: [neo4j, gds, networkx]
  depth: deep

node-embeddings-fastrp-node2vec-graphsage:
  concepts: [node embeddings, Johnson-Lindenstrauss lemma, FastRP, Node2Vec, GraphSAGE, transductive versus inductive, temporal leakage]
  prereqs: [graph-analytics-gds-execution-model, embeddings-geometry-of-meaning, graph-neural-networks-learning-structured-data]
  teaches: [choose between transductive and inductive embeddings, size an embedding dimension empirically, avoid temporal leakage in evaluation, concatenate graph embeddings with tabular features]
  tech: [neo4j, gds, pytorch-geometric]
  depth: deep

organizational-network-analysis-company-graph:
  concepts: [organizational network analysis, structural holes, E-I index, key-person risk, structural re-identification, employee analytics governance]
  prereqs: [centrality-communities-in-practice, network-science-communities-centrality, dama-dmbok-data-governance]
  teaches: [build a collaboration graph from communication metadata, weight organizational edges, read brokerage and silo measures, apply minimum aggregation thresholds, ground employee analytics in a lawful basis]
  tech: [networkx, neo4j, gds]
  depth: deep

query-routing-agent-decisions:
  concepts: [tool routing, query classification, retrieval evaluation, cascading retrieval, RAG]
  prereqs: [rag-retrieval-augmented-generation, production-llm-agents-patterns, model-context-protocol]
  teaches: [classify a question by intent, score retrieval relevance, cascade across vector and graph and SQL, evaluate the router as a model]
  tech: [anthropic-sdk, langgraph]
  depth: deep

ontology-to-agent-toolbox:
  concepts: [ontology, tool granularity, agent toolbox, OWL, role-based access, guardrails]
  prereqs: [ontologies-building-knowledge-bases, knowledge-graphs-practice, model-context-protocol]
  teaches: [scope tools by ontology class, attach guardrails to tool calls, derive tools from a schema, role-based tool access]
  tech: [neo4j, anthropic-sdk, owl]
  depth: deep

lookml-semantic-layer-data-modeling:
  concepts: [semantic layer, LookML, metric definitions, data modeling]
  prereqs: [dimensional-modeling-kimball, dbt-analytics-engineering]
  teaches: [model metrics in LookML, separate logical from physical model, version semantic definitions]
  tech: [looker, lookml, bigquery]
  depth: working

ontologies-building-knowledge-bases:
  concepts: [ontology, OWL, RDF, taxonomy, knowledge representation]
  prereqs: [knowledge-graphs-practice]
  teaches: [pick OWL vs SKOS, model classes and properties, evolve an ontology]
  tech: [protege, owl, rdf]
  depth: working

knowledge-graphs-practice:
  concepts: [knowledge graph, property graph, RDF, graph queries, entity resolution]
  prereqs: [graph-theory-mathematics-of-connections]
  teaches: [pick property graph vs RDF, model entities and relations, query with Cypher or SPARQL]
  tech: [neo4j, cypher, rdf]
  depth: deep

rag-advanced-patterns:
  concepts: [hybrid retrieval, reranking, query rewriting, multi-vector retrieval, parent-child chunking]
  prereqs: [rag-retrieval-augmented-generation, rag-building-production-systems]
  teaches: [combine BM25 with dense vectors, rerank with cross-encoders, rewrite queries, parent-child chunking]
  tech: [langchain, llamaindex]
  depth: deep

rag-building-production-systems:
  concepts: [chunking, ingestion pipeline, embedding model selection, evaluation harness]
  prereqs: [rag-retrieval-augmented-generation, embeddings-geometry-of-meaning]
  teaches: [design a chunker, build an ingestion pipeline, pick an embedding model, set up an eval harness]
  tech: [langchain, llamaindex]
  depth: deep

ragas-evaluating-rag:
  concepts: [RAG evaluation, faithfulness, answer relevance, context precision, LLM-as-judge]
  prereqs: [rag-building-production-systems, llm-as-a-judge]
  teaches: [build a RAGAS evaluation, interpret faithfulness scores, choose judge models]
  tech: [ragas, langchain]
  depth: working

production-llm-agents-patterns:
  concepts: [agent loop, tool use, error recovery, observability, guardrails]
  prereqs: [model-context-protocol]
  teaches: [structure an agent loop, handle tool failures, observe and trace agents, set guardrails]
  tech: [anthropic-sdk, langgraph]
  depth: deep

mcp-production-enterprise:
  concepts: [MCP server, enterprise integration, authentication, audit logging]
  prereqs: [model-context-protocol]
  teaches: [deploy an MCP server in an enterprise, add auth and audit, integrate with corporate identity]
  tech: [anthropic-sdk, mcp]
  depth: deep

model-context-protocol:
  concepts: [MCP, tool protocol, context sharing, server architecture]
  prereqs: []
  teaches: [understand MCP, build a basic MCP server, connect tools to Claude]
  tech: [anthropic-sdk, mcp]
  depth: working

embeddings-geometry-of-meaning:
  concepts: [embeddings, vector space, cosine similarity, manifold structure]
  prereqs: []
  teaches: [reason about embedding geometry, pick distance metrics, interpret nearest neighbors]
  tech: []
  depth: working

claude-code-complete-guide:
  concepts: [Claude Code, CLI agent, hooks, slash commands, MCP integration]
  prereqs: []
  teaches: [use Claude Code productively, configure hooks and skills, integrate MCP servers]
  tech: [claude-code, anthropic-sdk]
  depth: working

graph-neural-networks-learning-structured-data:
  concepts: [GNN, message passing, graph convolution, node classification]
  prereqs: [graph-theory-mathematics-of-connections, ml-libraries-under-the-hood]
  teaches: [implement a basic GNN, choose between GCN and GAT, train on a benchmark dataset]
  tech: [pytorch, pytorch-geometric]
  depth: deep

pagerank-eigenvectors:
  concepts: [PageRank, eigenvectors, Markov chains, power iteration]
  prereqs: [graph-theory-mathematics-of-connections]
  teaches: [derive PageRank from random walks, compute via power iteration, interpret as eigenvector]
  tech: []
  depth: working

foundations-of-agentic-ai-llms-to-agents:
  concepts: [self-attention, tokenization, context window, hallucination, temperature, chain of thought, react, self-consistency, function calling, chains vs agents, grounding, prompt engineering]
  prereqs: [attention-is-all-you-need, microgpt-reading-karpathy]
  teaches: [explain how an LLM predicts tokens, choose a prompting technique, implement function calling, distinguish a chain from an agent]
  tech: [anthropic-sdk]
  depth: deep

agent-architecture-and-orchestration:
  concepts: [router, multi-agent, manager worker, voting consensus, langgraph, conditional edges, checkpointer, breakpoints, human in the loop, max iterations, langchain tool, lcel runnable, abstraction layer]
  prereqs: [foundations-of-agentic-ai-llms-to-agents, agent-architectures-productive-patterns, langgraph-multi-agent-workflows]
  teaches: [design a router, build a cyclic langgraph, add conditional edges and checkpointers, pause for human approval, avoid vendor lock-in]
  tech: [langgraph, langchain, crewai, llamaindex, litellm]
  depth: deep

agent-memory-and-retrieval-embeddings-to-rag:
  concepts: [embeddings, cosine similarity, knn, top_k, approximate nearest neighbors, hnsw, ivf, product quantization, chunking, chunk overlap, hyde, graphrag, reranking, lost in the middle, time-aware retrieval, conversation memory, vector persistence, gdpr]
  prereqs: [foundations-of-agentic-ai-llms-to-agents, embeddings-geometry-of-meaning, rag-retrieval-augmented-generation, rag-advanced-patterns]
  teaches: [pick a similarity metric, choose an ANN index, fix boundary loss with overlap, apply HyDE and GraphRAG, filter retrieval by recency, purge vectors for GDPR]
  tech: [langchain, llamaindex, pgvector, neo4j]
  depth: deep

agent-integration-protocols-mcp-and-a2a:
  concepts: [model context protocol, mcp, agent to agent, a2a, m by n integration, tool schema, grounding, interoperability, agent card]
  prereqs: [foundations-of-agentic-ai-llms-to-agents, model-context-protocol, mcp-production-enterprise]
  teaches: [explain the MxN integration problem, contrast MCP and A2A, reason about client host server roles, design standardized tool schemas]
  tech: [mcp, anthropic-sdk, a2a]
  depth: deep

operating-agents-eval-observability-scale:
  concepts: [rag evaluation, faithfulness, context recall, context precision, answer relevance, correctness, llm as judge, golden dataset, regression testing, data contamination, determinism, seed, tracing, intermediate steps, audit logging, semantic caching, circuit breaker, queue worker, async concurrency, runaway loop, docker parity]
  prereqs: [agent-architecture-and-orchestration, ragas-evaluating-rag, llm-caching-four-layers, production-llm-agents-patterns]
  teaches: [interpret RAGAS metrics, build a regression pipeline, make a nondeterministic bug reproducible, trace an agent, scale with caching and queues and circuit breakers]
  tech: [ragas, langsmith, gptcache, redis, docker]
  depth: deep

enterprise-agents-governance-security-business:
  concepts: [prompt injection, indirect prompt injection, input railing, output railing, retrieval acls, least privilege, pii masking, presidio, gdpr, jailbreak, kill switch, proxy bias, feedback loop, human in the loop, system card, red teaming, explainability, undifferentiated heavy lifting, deflection rate, mttr, finops, ai governance]
  prereqs: [agent-memory-and-retrieval-embeddings-to-rag, operating-agents-eval-observability-scale, agent-guardrails-field-guide, enterprise-agent-governance-lifecycle]
  teaches: [defend against prompt injection with input and output rails, enforce retrieval ACLs, mask PII before logging, run a jailbreak incident protocol, detect proxy bias, choose ROI metrics over vanity metrics]
  tech: [presidio, nemo-guardrails, llama-guard]
  depth: deep

# --- Series: The Graph Layer for Agents (5 parts) ---

agent-graph-layer-why-grep-embeddings-fell-short:
  concepts: [context engine, code graph, grep limitations, embedding limitations, call graph, blast radius]
  prereqs: [knowledge-graphs-practice, model-context-protocol]
  teaches: [explain why grep and embeddings fail for code-understanding agents, define a context engine, map the five-part series]
  tech: [mcp]
  depth: deep

repo-to-graph-ast-vs-llm-extraction:
  concepts: [AST extraction, LLM extraction, repo indexing, deterministic parsing, extraction accuracy]
  prereqs: [agent-graph-layer-why-grep-embeddings-fell-short]
  teaches: [compare AST-derived and LLM-extracted code graphs, choose a deterministic indexing pipeline, evaluate extraction accuracy at repo scale]
  tech: []
  depth: deep

querying-code-graphs-blast-radius-localization:
  concepts: [blast radius, localization, PageRank-ranked context, multi-hop retrieval, call graph queries]
  prereqs: [repo-to-graph-ast-vs-llm-extraction, pagerank-eigenvectors, graph-theory-mathematics-of-connections]
  teaches: [rank context with PageRank over a call graph, localize a bug with graph queries, compute blast radius, reduce tokens via graph-ranked retrieval]
  tech: [networkx]
  depth: deep

graph-memory-temporal-agents-graphiti-cognee:
  concepts: [temporal knowledge graph, bi-temporal facts, fact invalidation, agent memory, graphiti, cognee]
  prereqs: [querying-code-graphs-blast-radius-localization, knowledge-graphs-practice]
  teaches: [model evolving and contradicting facts over time, prefer fact invalidation over deletion, evaluate Graphiti and Cognee, judge when temporal graph memory is worth the cost]
  tech: [graphiti, cognee, neo4j]
  depth: deep

graph-layer-in-production-mcp-build-vs-buy:
  concepts: [local-first architecture, MCP transport, build vs buy, graph freshness, code egress]
  prereqs: [graph-memory-temporal-agents-graphiti-cognee]
  teaches: [decide build vs buy for a code graph layer, keep a graph fresh in production, ship a graph over MCP without code egress, judge when not to graphify at all]
  tech: [mcp]
  depth: deep

# --- Series: Senior Engineering Judgment in the AI Era (5 parts) ---

senior-infrastructure-distributed-systems-failure-networking:
  concepts: [failure domains, blast radius, retry storms, thundering herd, infrastructure judgment]
  prereqs: []
  teaches: [reason about failure domains an AI coding tool will not, avoid retry-induced thundering herds, judge infrastructure trade-offs AI code generation glosses over]
  tech: []
  depth: deep

senior-data-modeling-query-patterns-database-design:
  concepts: [data modeling, query patterns, schema longevity, database design judgment]
  prereqs: [senior-infrastructure-distributed-systems-failure-networking]
  teaches: [shape a data model for years of query patterns, evaluate schema trade-offs an AI-generated CREATE TABLE hides]
  tech: []
  depth: deep

senior-api-design-contracts-versioning-dx:
  concepts: [API contracts, versioning, developer experience, REST]
  prereqs: [senior-data-modeling-query-patterns-database-design]
  teaches: [design an API as a contract rather than code, version without breaking consumers, weigh developer-experience trade-offs]
  tech: []
  depth: deep

senior-distributed-theory-cap-pacelc-tradeoffs:
  concepts: [CAP theorem, PACELC, consistency models, distributed trade-offs]
  prereqs: [senior-api-design-contracts-versioning-dx]
  teaches: [apply CAP and PACELC to a real system, spot when an AI-generated design quietly violates a consistency guarantee]
  tech: []
  depth: deep

senior-product-engineering-scale-prioritization-architecture:
  concepts: [scale judgment, prioritization, architecture as judgment, technical debt]
  prereqs: [senior-distributed-theory-cap-pacelc-tradeoffs]
  teaches: [decide what to build and how much to scale, weigh architectural trade-offs as a product discipline]
  tech: []
  depth: deep

# --- Series: Enterprise Ontology / Banking Knowledge Graph (4 parts) ---

tbox-abox-schema-facts-distinction:
  concepts: [TBox, ABox, RBox, description logic, schema/facts split]
  prereqs: [ontologies-building-knowledge-bases, knowledge-graphs-practice]
  teaches: [separate schema from facts in a production knowledge graph, decide file layout and ownership by TBox/ABox, place SHACL correctly in the pipeline]
  tech: [neo4j, rdf]
  depth: deep

modular-ontologies-core-domains-pattern:
  concepts: [core + domains pattern, modular ontology, cross-cutting concepts]
  prereqs: [tbox-abox-schema-facts-distinction]
  teaches: [split an ontology into a stable core and orbiting domain modules, derive the operational rule for the split]
  tech: [owl, rdf]
  depth: deep

ontology-production-pipeline-gcp:
  concepts: [ontology CI/CD, YAML-to-OWL compilation, competency questions as tests]
  prereqs: [modular-ontologies-core-domains-pattern]
  teaches: [put an ontology in Git as source of truth, compile YAML into OWL/SHACL/JSON-Schema, run competency questions as CI tests]
  tech: [shacl, owl, gcp]
  depth: deep

populating-knowledge-graph-llms-banking:
  concepts: [schema-embedded extraction, Pydantic repair, pySHACL validation, entity resolution, idempotent MERGE]
  prereqs: [ontology-production-pipeline-gcp]
  teaches: [extract entities with a schema-embedded prompt, repair malformed LLM output with Pydantic, validate with pySHACL, write idempotent MERGE Cypher]
  tech: [neo4j, pydantic, pyshacl, cypher]
  depth: deep

# --- Series: Knowledge Catalog & Knowledge Architecture ---

agent-guardrails-field-guide:
  concepts: [threat taxonomy, guardrail layers, blast radius reasoning]
  prereqs: []
  teaches: [build a layered guardrail defense for an agent, reason about blast radius, avoid anti-patterns that defeat guardrails]
  tech: []
  depth: deep

google-cloud-next-2026-agent-native-stack:
  concepts: [agent-native stack, Gemini Enterprise Agent Platform, agentic data cloud]
  prereqs: [agent-guardrails-field-guide]
  teaches: [map every Cloud Next 2026 announcement to what it replaces, decide what to actually adopt]
  tech: [vertex-ai, gcp]
  depth: deep

gemini-enterprise-knowledge-catalog-deep-dive:
  concepts: [Agent Platform control plane, Knowledge Catalog semantic spine, context graph]
  prereqs: [google-cloud-next-2026-agent-native-stack]
  teaches: [ground agent answers in the Knowledge Catalog, use the Agent Platform as a control plane]
  tech: [vertex-ai, dataplex]
  depth: deep

knowledge-catalog-vs-ontologies:
  concepts: [asset registry vs ontology, inferential reasoning, hybrid architecture]
  prereqs: [gemini-enterprise-knowledge-catalog-deep-dive, ontologies-building-knowledge-bases]
  teaches: [draw the boundary between a knowledge catalog and an ontology, design the honest hybrid architecture]
  tech: [owl, dataplex]
  depth: deep

gemini-knowledge-catalog-workshop:
  concepts: [catalog, enrich, search, context graph, Dataplex lineage]
  prereqs: [gemini-enterprise-knowledge-catalog-deep-dive, knowledge-catalog-vs-ontologies]
  teaches: [work catalog then enrich then search end to end, decide the catalog's boundaries against ontology, quality, and semantic layer]
  tech: [dataplex, vertex-ai]
  depth: deep

knowledge-as-a-product:
  concepts: [knowledge as a product, data mesh, ownership, SLA]
  prereqs: []
  teaches: [apply data-mesh product thinking to a knowledge base, define an owner, contract, and SLA for knowledge]
  tech: []
  depth: deep

defining-the-knowledge-stack:
  concepts: [knowledge assets, knowledge products, tools, pipelines, layered vocabulary]
  prereqs: [knowledge-as-a-product]
  teaches: [define the strata of a knowledge stack, use crisp vocabulary in org documents]
  tech: []
  depth: deep

comparing-knowledge-bases-semantic-overlap:
  concepts: [semantic overlap detection, MinHash, optimal transport, entity resolution]
  prereqs: [knowledge-as-a-product]
  teaches: [detect duplicate and overlapping knowledge bases, choose between exact-hash, MinHash, and embedding overlap methods]
  tech: [minhash]
  depth: deep

production-graph-stack-agents-mcp-ontologies:
  concepts: [pragmatic ontology, LightRAG, GraphRAG, MCP tool traversal, NL2Cypher, neurosymbolic grounding, multi-hop reasoning, indexing cost model, path recall]
  prereqs: [agent-graph-layer-why-grep-embeddings-fell-short, knowledge-graphs-practice, model-context-protocol]
  teaches: [size a pragmatic ontology and decide when to promote a property to a node, compare LightRAG and GraphRAG indexing and update costs, replace NL2Cypher with bounded MCP traversal tools, evaluate a graph RAG system with path recall and hop-stratified accuracy]
  tech: [lightrag, neo4j, mcp, qdrant]
  depth: deep

enterprise-graph-mcp-architecture-gcp:
  concepts: [transversal context engine, Cloud Spanner Graph, GQL, Dataplex Knowledge Catalog, serverless MCP, ABAC, data lineage, graph store selection]
  prereqs: [production-graph-stack-agents-mcp-ontologies, spanner-graph-for-knowledge-and-agents, mcp-production-enterprise]
  teaches: [model operational knowledge as a property graph in Cloud Spanner using GQL, choose between Spanner Graph and Neo4j and Neptune, deploy an MCP context server on Cloud Run with IAM-scoped access, budget processing units and request billing for a transversal graph, test and trace a graph MCP server]
  tech: [gcp, cloud-spanner, dataplex, cloud-run, mcp, fastmcp, opentelemetry]
  depth: deep

agent-harness-build-fork-adopt-yc-qm:
  concepts: [agent harness, harness vs framework, turn orchestration, predeclared command policy, security posture, multiplayer scoping, room as principal, deployment layer, divergence tax, context compaction, agent-computer interface]
  prereqs: [dont-reinvent-the-agent-open-source-composition, production-llm-agents-patterns, bank-grade-agent-security-iam-gateways]
  teaches: [distinguish a harness from a framework and a model, write a minimal agent loop and see what it lacks, enumerate the organizational modules a company-grade harness needs, decide between building forking and adopting at the harness layer, keep a fork upgradable with a deployment-layer boundary, test policy gates and unattended turns]
  tech: [qm, pi, opencode, claude-code, codex, postgres, fly-io, aws]
  depth: deep

dont-reinvent-the-agent-open-source-composition:
  concepts: [open-source composition, adopt vs wrap vs fork, agent control plane, structured outputs, agent memory, vector quantization, microVM sandboxing, maintenance cost, build vs buy]
  prereqs: [model-context-protocol, production-llm-agents-patterns]
  teaches: [score an open-source dependency for adopt wrap or fork, compose a six-layer agent stack from proven building blocks, estimate the 18-month maintenance bill of a self-hosted stack, validate a composed stack with contract tests and sandbox escape testing]
  tech: [mcp, fastmcp, instructor, mem0, graphiti, turbovec, e2b, ollama, gcp]
  depth: deep

google-adk-agent-development-deep-dive:
  concepts: [agent development kit, four pillar model, LlmAgent, workflow agents, BaseNode, tool authoring, session service, memory service, runner and event loop, callbacks and plugins, agent config, skills for agents, agent runtime deployment, agent evaluation]
  prereqs: [foundations-of-agentic-ai-llms-to-agents, production-llm-agents-patterns, model-context-protocol]
  teaches: [wire an ADK agent from agent tools session runner and memory, author tools in four different styles, compose multi-agent systems with workflow agents and graphs, guard an agent with callbacks and plugins, evaluate an agent with criteria and simulation, deploy to Agent Runtime Cloud Run or GKE]
  tech: [google-adk, gemini, vertex-agent-engine, gemini-enterprise, mcp, a2a, opentelemetry]
  depth: deep

adk-graph-workflows-deterministic-orchestration:
  concepts: [graph workflows, workflow runtime, START virtual node, conditional routing, typed node output, state boundaries, RetryConfig, RequestInput, human in the loop, dynamic workflows, automatic checkpointing, execution modes, task api, where determinism lives]
  prereqs: [google-adk-agent-development-deep-dive, agent-architecture-and-orchestration, langgraph-multi-agent-workflows]
  teaches: [decide per node whether a model or code makes a decision, define a graph workflow with sequential and conditional edges, pass typed data between nodes without session state writes, add retries timeouts and error recovery per node, pause a workflow for human input and resume it, choose between static graphs dynamic workflows and prebuilt workflow agents]
  tech: [google-adk, gemini, langgraph, gemini-enterprise, opentelemetry]
  depth: deep

migrating-adk-1x-to-2x:
  concepts: [breaking changes, silent failure modes, bypassed orchestration override, event schema migration, session compatibility window, BaseNode hierarchy, retry masking, staged cutover, version pinning]
  prereqs: [google-adk-agent-development-deep-dive, adk-graph-workflows-deterministic-orchestration]
  teaches: [detect the three silent breaking changes in an existing ADK codebase, migrate a persisted session and event schema, decide whether to migrate or stay on the maintained 1.x branch, run 1.x and 2.0 side by side during a cutover, avoid swallowing framework retries and human in the loop pauses in exception handlers]
  tech: [google-adk, gemini, postgres, gemini-enterprise]
  depth: deep

adk-advanced-evolution-of-agent-engineering:
  concepts: [framework as fossil record, ReAct loop, abstraction explosion, control flow reckoning, agent taxonomy, runner and event stream, session versus memory, tool trajectory scoring, framework convergence]
  prereqs: [google-adk-agent-development-deep-dive, agent-architectures-productive-patterns, langgraph-multi-agent-workflows]
  teaches: [read a framework as a record of the problems it absorbed, explain why the LLM should not own control flow, separate short-term session state from long-term memory, judge when ADK is the wrong choice, compare ADK and LangGraph on where the runtime lives]
  tech: [google-adk, langgraph, langchain, gemini, gemini-enterprise]
  depth: deep

debugging-adk-agent-flows:
  concepts: [flow errors versus code errors, silent failure, event stream as ground truth, response ownership, final response semantics, partial event accumulation, delegation that does not delegate, state delta auditing, observability plugin, trajectory evaluation, agent observability, OpenTelemetry GenAI conventions]
  prereqs: [google-adk-agent-development-deep-dive, adk-graph-workflows-deterministic-orchestration, operating-agents-eval-observability-scale]
  teaches: [tell a flow error apart from a code error before debugging, read a session event stream by hand, work out which agent owns the user facing turn, diagnose a sub-agent answer that never reached the user, audit state deltas and output_key no-ops, write a BasePlugin flow recorder, name spans so a production trace is readable, assert on the trajectory rather than the final string]
  tech: [google-adk, gemini, opentelemetry, cloud-trace, gemini-enterprise]
  depth: deep

enterprise-agent-memory-continuity-adk-geap:
  concepts: [continuity engineering, memory taxonomy, ephemeral versus durable, facts versus procedures, memory scope, context compression, model context caching, memory drift, fleet level learning, multi-tenant memory isolation]
  prereqs: [google-adk-agent-development-deep-dive, agent-memory-and-retrieval-embeddings-to-rag, gemini-enterprise-knowledge-catalog-deep-dive]
  teaches: [classify agent memory along durability and content axes, decide what to remember at which scope, keep one user memory from poisoning another, engineer durable procedures as well as durable facts, compare managed memory primitives across ADK LangGraph AgentCore and the Anthropic and OpenAI SDKs]
  tech: [google-adk, gemini-enterprise, bigquery, vertex-agent-engine, bedrock-agentcore, langgraph, anthropic-sdk]
  depth: deep
bellman-operator-is-a-contraction:
  concepts: [Bellman optimality operator, contraction mapping, Banach fixed point theorem, sup norm, value iteration, geometric convergence, discount factor as a convergence rate, policy iteration, temporal difference learning, deadly triad, projected Bellman operator]
  prereqs: [reinforcement-learning-first-principles, markov-to-hoeffding-concentration-inequalities]
  teaches: [proving the Bellman operator is a gamma contraction, proving Banach's fixed point theorem, deriving the geometric error bound for value iteration, reading the discount factor as an iteration count, explaining why function approximation destroys the convergence guarantee]
  tech: [numpy]
  depth: deep
em-never-goes-down:
  concepts: [expectation maximization, Jensen's inequality, evidence lower bound, KL divergence, monotonicity of EM, latent variable models, Gaussian mixture models, responsibilities, local optima, variational inference]
  prereqs: [loss-functions-are-probability-assumptions, one-eigendecomposition-four-algorithms]
  teaches: [proving Jensen's inequality, deriving the ELBO plus KL identity, proving EM never decreases the likelihood, stating what the monotonicity theorem does not give you, connecting EM to variational inference]
  tech: [numpy, scipy]
  depth: deep
kernel-trick-representer-theorem:
  concepts: [positive definite kernels, Gram matrix, reproducing kernel Hilbert space, reproducing property, Moore-Aronszajn theorem, representer theorem, kernel trick, support vectors, soft margin, Cauchy-Schwarz for kernels]
  prereqs: [penalizing-is-constraining, vc-dimension-sauer-shelah]
  teaches: [checking whether a function is a valid kernel, constructing an RKHS from a kernel, proving the representer theorem by orthogonal decomposition, explaining why an infinite dimensional feature space is computable, reading the three types of support vector off the KKT conditions]
  tech: [numpy, scipy]
  depth: deep
loss-functions-are-probability-assumptions:
  concepts: [maximum likelihood estimation, negative log likelihood, noise models, squared error, absolute error, cross entropy, Huber loss, least favourable distribution, generalized linear models, canonical link, influence function, proper scoring rules]
  prereqs: []
  teaches: [deriving a loss function from an assumed noise distribution, reading a loss backwards to the assumption it encodes, explaining why MAE is robust and MSE is not, recognising the shared gradient shape of canonical link models]
  tech: [numpy, scipy]
  depth: deep
markov-to-hoeffding-concentration-inequalities:
  concepts: [Markov inequality, Chebyshev inequality, Chernoff method, moment generating function, Hoeffding lemma, Hoeffding inequality, sub-Gaussian, concentration of measure, test set confidence interval, union bound, McDiarmid inequality]
  prereqs: [what-are-we-minimizing-erm-bias-variance]
  teaches: [proving Markov and deriving Chebyshev from it, applying the Chernoff exponential tilting method, proving Hoeffding's lemma, computing an honest confidence interval for a test set error rate, explaining why precision costs quadratically and confidence only logarithmically]
  tech: [numpy, scipy]
  depth: deep
no-free-lunch-theorem:
  concepts: [no free lunch theorem, inductive bias, off training set error, uniform prior over targets, PAC learnability, hypothesis class restriction, model selection as assumption selection, manifold hypothesis]
  prereqs: [vc-dimension-sauer-shelah]
  teaches: [proving the no free lunch theorem for supervised learning, distinguishing the three theorems that share the name, naming the inductive bias of a given method, correcting the common misreadings]
  tech: [numpy]
  depth: deep
one-eigendecomposition-four-algorithms:
  concepts: [spectral theorem, Courant-Fischer, singular value decomposition, Eckart-Young-Mirsky theorem, principal component analysis, kernel PCA, spectral clustering, graph Laplacian, latent semantic analysis, low rank approximation]
  prereqs: [markov-to-hoeffding-concentration-inequalities]
  teaches: [proving the spectral theorem's key facts, deriving PCA from the variational characterization, proving Eckart-Young in the Frobenius norm, recognising four algorithms as one eigendecomposition, proving the graph Laplacian quadratic form identity]
  tech: [numpy, scipy]
  depth: deep
penalizing-is-constraining:
  concepts: [regularization, KKT conditions, convex optimization, ridge regression, lasso, soft thresholding, subgradient, shrinkage, sparsity, quadratic form, condition number]
  prereqs: [no-free-lunch-theorem, what-are-we-minimizing-erm-bias-variance]
  teaches: [proving that a penalty and a hard constraint define the same problem, stating and applying the KKT conditions, deriving the soft threshold formula, explaining why L1 gives exact zeros and L2 never does, naming the assumption each penalty encodes]
  tech: [numpy, scipy]
  depth: deep
probably-approximately-correct:
  concepts: [PAC learning, sample complexity, realizable case, agnostic case, uniform convergence, union bound, axis aligned rectangles, Occam's razor, description length, efficient PAC learnability, 3-term DNF]
  prereqs: [markov-to-hoeffding-concentration-inequalities]
  teaches: [stating PAC learnability formally, proving the axis aligned rectangle sample bound, deriving the finite hypothesis class bound, proving the agnostic uniform convergence bound, separating sample complexity from computational complexity]
  tech: [numpy]
  depth: deep
vc-dimension-sauer-shelah:
  concepts: [VC dimension, shattering, growth function, Sauer-Shelah lemma, symmetrization, ghost sample, VC generalization bound, fundamental theorem of statistical learning, Radon's theorem, Rademacher complexity]
  prereqs: [probably-approximately-correct]
  teaches: [computing the VC dimension of a hypothesis class in both directions, proving the Sauer-Shelah lemma by induction, explaining the polynomial versus exponential growth dichotomy, stating the fundamental theorem of statistical learning, explaining why VC bounds are vacuous for deep networks]
  tech: [numpy]
  depth: deep
weak-learnability-equals-strong:
  concepts: [weak learnability, strong learnability, boosting, AdaBoost, exponential loss, coordinate descent, margin theory, training error bound, label noise, gradient boosting]
  prereqs: [probably-approximately-correct, penalizing-is-constraining]
  teaches: [deriving AdaBoost as coordinate descent on the exponential loss, deriving the alpha update, proving the exponential training error bound, explaining why test error falls after training error reaches zero, naming the three real limits of boosting]
  tech: [numpy]
  depth: deep
what-are-we-minimizing-erm-bias-variance:
  concepts: [empirical risk minimization, true risk, approximation error, estimation error, optimization error, bias variance decomposition, Bayes error, noise floor, model complexity, double descent]
  prereqs: [loss-functions-are-probability-assumptions]
  teaches: [distinguishing the approximation estimation split from the bias variance decomposition, proving the bias variance decomposition for squared loss, explaining why there is no clean 0-1 loss analogue, identifying which lever moves which error term]
  tech: [numpy]
  depth: deep

backprop-is-reverse-mode-differentiation:
  concepts: [backpropagation, reverse-mode automatic differentiation, computational graph, adjoint, chain rule, cheap gradient principle, Baur-Strassen, activation checkpointing, weight initialization, Xavier initialization, He initialization, condition number]
  prereqs: [what-are-we-minimizing-erm-bias-variance, penalizing-is-constraining]
  teaches: [deriving the delta recursion from the chain rule, explaining why reverse mode costs one sweep per output and forward mode one per input, stating the cheap gradient principle and its memory cost, deriving Xavier and He initialization from a variance recursion]
  tech: [numpy]
  depth: deep

double-descent:
  concepts: [double descent, interpolation threshold, benign overfitting, implicit regularization, minimum-norm interpolant, random labels, neural tangent kernel, norm-based bounds, margin bounds, vacuous bounds]
  prereqs: [what-are-we-minimizing-erm-bias-variance, vc-dimension-sauer-shelah, penalizing-is-constraining]
  teaches: [explaining why fitting random labels makes data-independent bounds vacuous, describing the double descent curve and locating the interpolation threshold, proving that gradient descent from zero finds the minimum-norm interpolant in the linear case, naming what replaces classical capacity bounds]
  tech: [numpy]
  depth: deep

universal-approximation-and-what-it-does-not-give-you:
  concepts: [universal approximation theorem, density in function space, discriminatory activation, Hahn-Banach, Riesz representation, Barron class, depth separation, expressivity versus learnability, nonconstructive proof]
  prereqs: [vc-dimension-sauer-shelah, no-free-lunch-theorem]
  teaches: [stating universal approximation precisely as a density result, reading what an existence proof does not provide, connecting expressivity to the VC bound, explaining depth separation theorems]
  tech: [numpy]
  depth: deep

```

<!-- AUTO-CATALOG:START - regenerated by build-knowledge-base.js, do not edit by hand -->

## Full Post Catalog

Auto-generated index of every post by category, sorted most recent first. Use this when you need a complete inventory of what the blog covers — for example, when loaded as Claude Project knowledge and you cannot query `posts.json`.

### field-notes (137 posts)

- **`debugging-adk-agent-flows`** *(deep)* — Nothing Threw: Debugging Agent Flows in ADK 2.x. The hardest agent bugs raise nothing. The stack trace is empty, the run completed, the answer was fluent and wrong. Or the right answer was produced by a sub-agent and never reached the user at all. This is a field guide to debugging flow errors in ADK 2.x: what the framework hides by default, why the event stream is the only ground truth, who actually owns the user-facing turn, and the flow recorder plugin you should write once and never write again. Concepts: flow errors versus code errors, silent failure, event stream as ground truth, response ownership, final response semantics, partial event accumulation. Tech: google-adk, gemini, opentelemetry, cloud-trace, gemini-enterprise.
- **`migrating-adk-1x-to-2x`** *(deep)* — Migrating from ADK 1.x to 2.0: The Breaking Changes That Actually Break You. ADK 2.0 replaced the execution model, not just the feature set. Three of its breaking changes do not raise an exception: your orchestration override gets bypassed, your event appends stop routing, and your exception handler eats the framework's retries. This is the migration guide, including the database work everyone underestimates and the honest case for staying on 1.x. Concepts: breaking changes, silent failure modes, bypassed orchestration override, event schema migration, session compatibility window, BaseNode hierarchy. Tech: google-adk, gemini, postgres, gemini-enterprise.
- **`adk-graph-workflows-deterministic-orchestration`** *(deep)* — Graph Workflows in ADK 2.0: Putting Control Flow Back in Code. ADK 2.0 replaced the agent hierarchy with a graph. Agents, tools and plain functions are all nodes now, edges are written in Python rather than negotiated with a prompt, and every node can choose independently whether a model or a compiler decides what happens next. This is the deep dive on the Workflow runtime: routes, typed data flow, JoinNode fan-in, retries and timeouts, human-in-the-loop pauses, dynamic workflows with automatic checkpointing, and an honest look at where LangGraph still wins. Concepts: graph workflows, workflow runtime, START virtual node, conditional routing, typed node output, state boundaries. Tech: google-adk, gemini, langgraph, gemini-enterprise, opentelemetry.
- **`agent-golden-paths-multi-tenancy`** *(deep)* — Golden Paths for Agents: Multi-Tenancy, Self-Service, and the Platform as Product. The four previous parts of this series described components: a control plane, a runtime, a sandbox, a tool plane. This one describes the discipline that turns components into a platform. Golden paths for agent teams, multi-tenancy that survives a shared vector store, policy as code instead of policy as wiki page, cost attribution that keeps the platform politically alive, and the honest organizational problem underneath all of it. Concepts: platform as product, golden paths, agents as non-human persona, multi-tenancy, tenant data isolation, cost attribution. Tech: kubernetes, opa, terraform, mcp.
- **`mcp-registry-gateway-tool-plane`** *(deep)* — The Tool Plane: MCP Registry, Gateway, and Governing Ten Thousand Servers. Choosing MCP as your tool interface is the easy decision and the right one. It is also where the platform problems begin. Part 4 of The Agent Platform builds the tool plane: an internal registry that says what exists, a gateway that decides who may call it, credential brokering so agents never hold secrets, versioning that survives schema drift, and a curation discipline for a world with more than ten thousand public servers. Concepts: MCP registry, MCP gateway, credential brokering, tool visibility as attack surface, schema drift, tool curation. Tech: mcp, mcp-gateway, mcp-registry.
- **`sandboxing-agents-microvm-gvisor`** *(deep)* — Sandboxing Agents: microVMs, gVisor, and the Isolation Boundary That Actually Holds. Part 3 of The Agent Platform. When an agent executes code, the container boundary is not enough — namespaces and cgroups were built for resource isolation, not security. This is the engineering guide to microVMs, gVisor, and hardened containers: the mechanism of each, the cold start versus isolation tradeoff, the egress control everyone forgets, and how to match isolation strength to what the agent is actually trusted with. Concepts: execution isolation, microVM, gVisor, Kata Containers, cold start versus isolation, egress control. Tech: firecracker, gvisor, kata-containers, e2b, daytona, modal.
- **`agent-runtime-sessions-state-topology`** *(deep)* — The Agent Runtime: Sessions, State, and Where the Turn Loop Actually Executes. Everyone argues about frameworks. Almost nobody asks where the turn loop physically runs, what happens to a session between turns, or what breaks when a pod is rescheduled mid-conversation. Part two of The Agent Platform: the runtime is the least glamorous and most consequential choice you will make. Concepts: turn loop, session state, checkpointing, durable execution, session affinity, idempotency. Tech: bedrock-agentcore, vertex-agent-engine, azure-ai-foundry, temporal, langgraph, kubernetes.
- **`agent-platform-control-plane-data-plane`** *(deep)* — The Agent Platform: Control Plane, Data Plane, and Everything You Have to Own. Almost everything written about agents is written from the seat of the team building one. This series is written from the other seat: the platform engineer who has to host everyone else's. Part one maps the ten layers of an agent platform, separates control plane from data plane, and is honest about what an LLM firewall does not solve. Concepts: agent platform, control plane versus data plane, platform layers, non-human identity, Model Armor, defence in depth. Tech: model-armor, bedrock-agentcore, vertex-agent-engine, azure-ai-foundry, mcp.
- **`graph-fraud-detection-rings-synthetic-identity`** *(deep)* — Graph Fraud Detection: Rings, Synthetic Identity, and the Pipeline That Ships. Part 5 of Graph Analytics in Production. Fraud is where graphs earn their keep, because the signal is structurally invisible to a row-wise model — a ring sits six hops deep and no amount of feature engineering on a flat table recovers it. This is the working guide: the four typologies and their graph signatures, which shared attributes should become edges and which are pure supernode poison, the community-plus-embeddings-plus-gradient-boosting pipeline that actually reaches production, why precision at the alert budget is the only metric your operation feels, and why the model decays faster here than anywhere else you have deployed. Concepts: fraud rings, synthetic identity, layering, shared-attribute edges, supernode risk, graph features for gradient boosting. Tech: neo4j, gds, xgboost, pytorch-geometric.
- **`organizational-network-analysis-company-graph`** *(deep)* — Organizational Network Analysis: The Company Graph Nobody Drew. Every company has two structures: the org chart someone designed, and the collaboration network that actually emerged. Part 4 of Graph Analytics in Production applies centrality, community detection, and structural holes to the organization itself, and spends as much time on the ethics as on the algorithms, because this is the one graph where getting the governance wrong hurts people. Concepts: organizational network analysis, structural holes, E-I index, key-person risk, structural re-identification, employee analytics governance. Tech: networkx, neo4j, gds.
- **`node-embeddings-fastrp-node2vec-graphsage`** *(deep)* — Node Embeddings: FastRP, Node2Vec, and GraphSAGE in Production. Part 3 of Graph Analytics in Production. Centrality gives you one number per node; embeddings give you a hundred and twenty-eight. This post covers what those numbers actually preserve, why FastRP wins on cost through the Johnson-Lindenstrauss lemma, when Node2Vec's p and q knobs are worth their price, why GraphSAGE is the only inductive option, and the temporal leakage trap that makes offline metrics beautiful and production metrics honest. Concepts: node embeddings, Johnson-Lindenstrauss lemma, FastRP, Node2Vec, GraphSAGE, transductive versus inductive. Tech: neo4j, gds, pytorch-geometric.
- **`centrality-communities-in-practice`** *(deep)* — Centrality and Communities in Practice. The theory says betweenness finds brokers and modularity finds communities. Production says your top broker is the IT helpdesk service account and your communities change every time you rerun the job. This is the practitioner's guide to centrality and community detection on real graphs: which measure answers which question, why betweenness will not scale, what the PageRank knobs actually control, the resolution limit you cannot tune away, and why you must never ship a community ID as a stable key. Concepts: centrality selection, approximate betweenness, personalized PageRank, resolution limit, Leiden, partition stability. Tech: neo4j, gds, networkx.
- **`graph-analytics-gds-execution-model`** *(deep)* — Graph Analytics at Scale: The GDS Execution Model. Most engineers meet graph algorithms as textbook pseudocode, then try to run one on a real graph and discover the algorithm was never the hard part. Part 1 of a series on graph analytics in production: why transactional storage is the wrong shape, what CSR actually is, how projections decide both your memory bill and your answer, the five execution modes, and the serverless shift that takes the graph database off the critical path. Concepts: graph projection, CSR representation, execution modes, memory estimation, algorithm catalog, serverless graph analytics. Tech: neo4j, gds, graphdatascience, aura.
- **`choosing-a-graph-engine-2026`** *(deep)* — Choosing a Graph Engine in 2026. Part 3 of Graph Engines Under the Hood. Not a feature matrix, but a decision framework: four questions about your workload that actually determine the answer, an honest survey of where every engine category sits in 2026, the cautionary tale of Kuzu's disappearance, and the uncomfortable case that you may not need a graph database at all. Concepts: engine selection, workload profiling, graph-on-relational, embedded graph databases, total cost of ownership. Tech: neo4j, memgraph, falkordb, ladybugdb, cloud-spanner, neptune, puppygraph.
- **`gql-standard-cypher-sqlpgq`** *(deep)* — GQL: The First New ISO Query Language Standard Since SQL. In April 2024, ISO published GQL as ISO/IEC 39075 — the first genuinely new database query language standard since SQL in 1987. Thirty-seven years. Part 2 of Graph Engines Under the Hood looks at what GQL actually standardizes, how it diverges from Cypher, why SQL/PGQ matters more than most teams realize, and how much of it is really implemented in 2026. Concepts: GQL, ISO/IEC 39075, SQL/PGQ, graph pattern matching, query portability, vendor lock-in. Tech: gql, cypher, sql, postgres.
- **`graph-engine-internals-index-free-adjacency`** *(deep)* — Inside a Graph Engine: Index-Free Adjacency and Why a Traversal Is Not a Join. Everyone repeats that graph databases are faster for connected data, and almost nobody says why. This is the mechanical answer: fixed-size records, physical pointers, offset arithmetic, and the doubly-linked relationship chain that turns a hop into a dereference. Plus the honest accounting of what it costs, when a columnar relational engine still wins, and why traversal-as-matrix-multiply is a genuinely different machine. Concepts: index-free adjacency, record layout, pointer chasing, supernode problem, traversal cost, GraphBLAS. Tech: neo4j, falkordb.
- **`agent-harness-build-fork-adopt-yc-qm`** *(deep)* — Anatomy of an Agent Harness: Reading YC's QM and Deciding When to Build, Fork, or Adopt. Y Combinator open-sourced the multi-agent harness that runs its own company. Reading the source settles an argument: the agent loop is the easy part, and the other forty-six directories are the reason you should not write one from scratch. Concepts: agent harness, harness vs framework, turn orchestration, predeclared command policy, security posture, multiplayer scoping. Tech: qm, pi, opencode, claude-code, codex, postgres, fly-io, aws.
- **`dont-reinvent-the-agent-open-source-composition`** *(deep)* — Don't Reinvent the Agent: How to Compose, Adapt, and Fork Open-Source Repositories into Production AI Systems. Why senior AI architects stop building agent infrastructure from scratch, how to compose heavy-hitting open-source building blocks like superpowers, Mem0, Instructor, and turbovec, and critical trade-offs vs enterprise cloud platforms like GCP GEAP. Concepts: open-source composition, adopt vs wrap vs fork, agent control plane, structured outputs, agent memory, vector quantization. Tech: mcp, fastmcp, instructor, mem0, graphiti, turbovec, e2b, ollama, gcp.
- **`enterprise-graph-mcp-architecture-gcp`** *(deep)* — Enterprise Knowledge Graphs on GCP: Cloud Spanner Graph, Dataplex, and Transversal MCP Servers on Cloud Run. A practical blueprint for building an enterprise-wide, transversal Graph Context Engine on Google Cloud Platform using Cloud Spanner Graph, Dataplex Knowledge Catalog, and serverless MCP endpoints on Cloud Run. Concepts: transversal context engine, Cloud Spanner Graph, GQL, Dataplex Knowledge Catalog, serverless MCP, ABAC. Tech: gcp, cloud-spanner, dataplex, cloud-run, mcp, fastmcp, opentelemetry.
- **`production-graph-stack-agents-mcp-ontologies`** *(deep)* — The Production Graph Stack for Agents: Pragmatic Ontologies, LightRAG, and MCP Context Engines. Why pure vector embeddings fail at multi-hop reasoning in production, how Pragmatic Ontologies provide neurosymbolic grounding, and why modern agentic architectures choose MCP Tool Traversals over raw NL2Cypher. Concepts: pragmatic ontology, LightRAG, GraphRAG, MCP tool traversal, NL2Cypher, neurosymbolic grounding. Tech: lightrag, neo4j, mcp, qdrant.
- **`enterprise-agent-memory-continuity-adk-geap`** *(deep)* — The Agent That Remembers You: Continuity Engineering on ADK 2.0 and Gemini Enterprise. Hermes and OpenClaw feel alive because they remember and compound. Most production agents feel frozen. Here is how to engineer that continuity into real enterprise agents on ADK 2.0 and the Gemini Enterprise Agent Platform, without reinventing the wheel, with a BI dashboard agent for durable facts and an on-call agent for durable procedures, plus how the same ideas map to LangGraph, the Anthropic and OpenAI SDKs, and Bedrock AgentCore. Concepts: continuity engineering, memory taxonomy, ephemeral versus durable, facts versus procedures, memory scope, context compression. Tech: google-adk, gemini-enterprise, bigquery, vertex-agent-engine, bedrock-agentcore, langgraph, anthropic-sdk.
- **`openclaw-vs-hermes-self-hosted-agent-comparison`** *(deep)* — OpenClaw vs Hermes: Two Philosophies of the Self-Hosted Agent. Two open-source agents exploded in 2026 with opposite instincts: OpenClaw wants to do everything on your machine right now, Hermes wants to remember and compound. This is the honest head-to-head, with a decision matrix you can actually use. Concepts: agents, agentic ai, llms, open source, production ml, mlops.
- **`hermes-self-improving-agent-persistent-memory`** *(deep)* — Hermes: The Self-Improving Agent That Remembers. Nous Research built a model lab. Then they built an agent that gets more capable the longer it runs, writing its own skills from experience and storing them next to a memory of who you are. This is the anatomy of Hermes, what its self-improvement actually is, and where the marketing outruns the mechanism. Concepts: agents, agentic ai, llms, mlops, production ml, automation.
- **`openclaw-anatomy-viral-agent-platform`** *(deep)* — OpenClaw: Anatomy of the Agent Platform That Ate GitHub. In five months an open-source personal agent went from a solo developer's side project to the sixth most-starred repository on GitHub. This is a deep technical anatomy of OpenClaw: the Gateway that runs the whole show, the skills plugin model, vector-DB memory, the genuinely surprising things people built with it, and the failure modes that turned it into a favorite case study for AI security researchers. Concepts: agents, agentic ai, llms, open source, automation, tool use.
- **`finops-llm-agents-token-economics`** *(deep)* — FinOps for AI Agents: Token Economics, Cost Observability, and a Bill You Can Explain. Token spend is the new cloud bill -- variable, usage-driven, and easy to ignore until it triples. This post applies the FinOps discipline to LLM and agent systems: the real cost equation of an agent task, unit economics that survive a CFO meeting, attribution and metering architecture, the optimization levers ranked by effort and impact, and a budget-aware agent loop in production-quality Python. Concepts: agents, agentic ai, llms, production ml, mlops, cloud computing.
- **`bank-grade-agent-security-iam-gateways`** *(deep)* — Bank-Grade Agent Security: IAM, MCP Gateways, and Zero Trust at Enterprise Scale. Part 2 of the agent security series moves from the startup to the bank: enterprise IAM for agents as first-class principals, agent identity on Google Cloud, the MCP gateway pattern that never lets a client touch a server directly, zero trust with SPIFFE-style workload identity, and the audit machinery regulators actually ask for. Concepts: agents, agentic ai, security, authentication, oauth, enterprise ai.
- **`agent-authentication-oauth-mcp-identity`** *(deep)* — Who Is Your Agent? OAuth, MCP Auth, and Identity for AI Agents — the Startup Playbook. AI agents are non-human identities that act with delegated human power, long after the login that granted it. This post — part 1 of a two-part series on agent security — rebuilds OAuth from the agent's point of view, walks through the MCP authorization spec requirement by requirement, and lays out a concrete identity architecture for a five-person startup shipping an agent that touches users' Gmail, Calendar, and CRM. Concepts: agents, agentic ai, ai engineering, security, authentication, oauth.
- **`claude-certified-architect-professional-exam-guide`** *(deep)* — The Claude Certified Architect Professional Exam (CCAR-P): A Complete Study Guide. The Professional Architect certification is the hardest credential in Anthropic's track: seven domains, 63 scenario questions, and almost no code. This guide teaches the architecture reasoning, governance frameworks, and lifecycle discipline the exam actually tests, from someone who does this work in a regulated bank. Concepts: anthropic, certifications, llms, agents, agentic ai, ai governance.
- **`claude-certified-developer-exam-guide`** *(deep)* — The Claude Certified Developer Exam: A Complete Study Guide. A domain-by-domain study guide for Anthropic's CCDV-F exam. Eight domains, real SDK code for every one of them, a worked mini-project, and a preparation plan built for working engineers. Concepts: anthropic, llms, agents, agentic ai, prompt engineering, mcp.
- **`claude-certified-associate-exam-guide`** *(deep)* — The Claude Certified Associate Exam: A Complete Study Guide for CCAO-F. Anthropic's entry-level certification tests whether you can evaluate Claude's outputs, design workflows around it, and use it responsibly. This is the full study guide: every domain in blueprint order, the actual material behind each one, and how to walk into the exam ready to pass. Concepts: anthropic, certifications, llms, prompt engineering, evaluation, ai governance.
- **`graph-layer-in-production-mcp-build-vs-buy`** *(deep)* — The Graph Layer in Production: MCP, Local-First, and Build vs Buy. The finale of the graph-layer series. Four posts argued that agents need a graph of your code. This one is about shipping it: why MCP became the universal transport, why the winning pattern is pre-computed and local-first with no code egress, how to keep the graph fresh, when it pays for itself, and the honest senior take on when not to graphify at all. Concepts: local-first architecture, MCP transport, build vs buy, graph freshness, code egress. Tech: mcp.
- **`graph-memory-temporal-agents-graphiti-cognee`** *(deep)* — Graph Memory: Giving Agents a Temporal Knowledge Graph. Vector memory retrieves text that looks like the past. It cannot tell you that the past changed. This is the fourth post in The Graph Layer for Agents: how to give an agent a memory that models evolving, contradicting facts over time as a bi-temporal knowledge graph, why fact invalidation beats deletion, what Graphiti and Cognee actually do, and the senior judgment of when none of this is worth the cost. Concepts: temporal knowledge graph, bi-temporal facts, fact invalidation, agent memory, graphiti, cognee. Tech: graphiti, cognee, neo4j.
- **`querying-code-graphs-blast-radius-localization`** *(deep)* — Querying Code Graphs: Blast Radius, Localization, and Ranking Context. Part 3 of The Graph Layer for Agents. You have a code graph. Now what queries actually make an agent smarter? Localization, blast radius, PageRank-ranked context, and multi-hop retrieval, with real networkx over a call graph. The point is fewer tokens, fewer tool calls, better grounding. Concepts: blast radius, localization, PageRank-ranked context, multi-hop retrieval, call graph queries. Tech: networkx.
- **`repo-to-graph-ast-vs-llm-extraction`** *(deep)* — Repo to Graph: AST-Derived vs LLM-Extracted Knowledge Graphs. Part 2 of The Graph Layer for Agents. Two indexers point at the same Java repo. One finishes in eight seconds and answers every architecture question correctly. The other takes forty minutes, silently drops 377 files, and still gets some answers wrong. This is the story of how a repository actually becomes a graph, and why the boring deterministic path wins. Concepts: AST extraction, LLM extraction, repo indexing, deterministic parsing, extraction accuracy.
- **`agent-graph-layer-why-grep-embeddings-fell-short`** *(deep)* — The Graph Layer for Agents: Why Grep and Embeddings Stopped Being Enough. Coding agents hit a hard ceiling with grep and vector embeddings, because neither can answer the questions that matter, what breaks if I touch this, who calls this, where does this decision actually live. The answer emerging across the industry in 2025 and 2026 is the context engine, a pre-analyzed queryable graph of your codebase served to the agent over MCP. This is part one of a five-part series, the map before the deep dives. Concepts: context engine, code graph, grep limitations, embedding limitations, call graph, blast radius. Tech: mcp.
- **`senior-product-engineering-scale-prioritization-architecture`** *(deep)* — Engineering for the Product: Scale, Prioritization, and Architecture as Judgment. The capstone of the senior-in-the-age-of-AI series. Implementation is cheap now, so the scarce skill moves up the stack: deciding what to build, how much to scale, which trade-off to take, and when generated code is subtly wrong. A field guide to engineering judgment as a product discipline, told through the lens of city planning. Concepts: scale judgment, prioritization, architecture as judgment, technical debt.
- **`senior-distributed-theory-cap-pacelc-tradeoffs`** *(deep)* — The Theory That Survives: CAP, PACELC, and the Trade-offs an AI Will Quietly Violate. Frameworks churn. The theorems that bound what a distributed system can do are permanent, and an AI coding tool will confidently generate a system that quietly violates the consistency model you actually needed. This is the theory with the longest shelf life, framed as a brass balance scale where every guarantee you add to one pan is paid for in another. Concepts: CAP theorem, PACELC, consistency models, distributed trade-offs.
- **`senior-api-design-contracts-versioning-dx`** *(deep)* — The Container, Not the Code: API Design as a Contract. An AI can generate endpoint handlers and an OpenAPI spec in seconds. But an API is a promise to other humans and systems, and promises are expensive to break. This is the third field note in a series on what stays scarce when the implementation becomes free: the contract, not the code, is the hard part. Concepts: API contracts, versioning, developer experience, REST.
- **`senior-data-modeling-query-patterns-database-design`** *(deep)* — The Shelf That Outlives the Building: Data Modeling for the Senior Engineer. An AI will generate a CREATE TABLE statement in two seconds. It cannot tell you whether that table is the right shape for the queries you will run for the next ten years. The data model is the one decision that outlives every rewrite and is the most expensive to get wrong. This is the second post in a series on the judgment that stays scarce when machines write the code. Concepts: data modeling, query patterns, schema longevity, database design judgment.
- **`senior-infrastructure-distributed-systems-failure-networking`** *(deep)* — The Grid Doesn't Care About Your Retry Loop: Infrastructure Judgment in the Age of AI Coding. An AI can scaffold a Kubernetes manifest or a retry loop in seconds. It cannot decide your failure domains, your blast radius, or whether your retry will trigger a thundering herd at 3am. This is the first post in a series on the senior judgment that survives the code generator, starting with the hardest place to be wrong: infrastructure. Concepts: failure domains, blast radius, retry storms, thundering herd, infrastructure judgment.
- **`enterprise-agents-governance-security-business`** *(deep)* — The Enterprise Shield: Governance, Security, and Business Value of Agents. The strategic close to the agentic engineering arc. An agent that is fluent and clever but insecure, unaccountable, or untethered to a business metric should not ship. This is the shield a regulated bank wraps around a production agent: prompt-injection defense in depth, retrieval ACLs, PII masking, an incident protocol for a jailbreak in the wild, responsible-AI controls for proxy bias, system cards and red teaming to satisfy a security review, and the FinOps and ROI arguments that prove the thing earns its keep. Concepts: prompt injection, indirect prompt injection, input railing, output railing, retrieval acls, least privilege. Tech: presidio, nemo-guardrails, llama-guard.
- **`operating-agents-eval-observability-scale`** *(deep)* — Operating Agents: Evaluation, Observability, and Scalability. An agent that demos beautifully is not a production service. This is the operations layer of agentic engineering: how to measure quality with RAGAS-style metrics, build regression gates that block bad deploys, make stochastic bugs reproducible, trace every decision for audit, and scale the whole thing without setting your token budget on fire. Concepts: rag evaluation, faithfulness, context recall, context precision, answer relevance, correctness. Tech: ragas, langsmith, gptcache, redis, docker.
- **`agent-integration-protocols-mcp-and-a2a`** *(deep)* — Integration Protocols: How Agents Talk to the World and to Each Other. Every agent you build has to reach data it does not own and cooperate with agents it did not write. Do that with bespoke connectors and the cost explodes as M times N. This is the protocol layer of agentic engineering: MCP for tools and context, A2A for agent-to-agent collaboration, and why a standard beats a super-agent, a single model, or a shared vector database every time. Concepts: model context protocol, mcp, agent to agent, a2a, m by n integration, tool schema. Tech: mcp, anthropic-sdk, a2a.
- **`agent-memory-and-retrieval-embeddings-to-rag`** *(deep)* — Agent Memory and Retrieval: From Embeddings to Production RAG. An agent's intelligence is mostly its context system: what it can remember across turns and what it can pull in from the outside. Memory and retrieval are one design surface. This is the engineering of that surface, from the geometry of embeddings to the production failures that decide whether your agent answers from today's policy or last year's deleted record. Concepts: embeddings, cosine similarity, knn, top_k, approximate nearest neighbors, hnsw. Tech: langchain, llamaindex, pgvector, neo4j.
- **`agent-architecture-and-orchestration`** *(deep)* — Agent Architecture and Orchestration: Routers, Graphs, and Multi-Agent Workflows. Control flow is the part of agent engineering nobody puts in the demo and everybody fights with in production. This is a working tour of the topologies that matter, routers, hierarchical supervisors, consensus layers, and the cyclic graphs underneath them, plus the LangGraph, CrewAI, LangChain, and LlamaIndex machinery that makes them durable instead of brittle. Concepts: router, multi-agent, manager worker, voting consensus, langgraph, conditional edges. Tech: langgraph, langchain, crewai, llamaindex, litellm.
- **`foundations-of-agentic-ai-llms-to-agents`** *(deep)* — Foundations of Agentic AI: How LLMs Think, and What Makes a Program an Agent. Part one of a six-part series on agentic AI engineering. We demystify what an LLM actually does when it thinks, why it can never be certain, and where the bright line falls between a hardcoded chain and a program that controls its own flow. Concepts: self-attention, tokenization, context window, hallucination, temperature, chain of thought. Tech: anthropic-sdk.
- **`defining-the-knowledge-stack`** *(deep)* — Defining the Knowledge Stack: Assets, Products, Tools, and Pipelines. You cannot structure what you cannot define. Before an enterprise argues about which knowledge base to build, it needs crisp words for the strata involved: assets, products, tools, pipelines, and the discipline that binds them. This is the definitional companion to the knowledge-as-a-product argument, a layered vocabulary you can lift straight into your own org docs. Concepts: knowledge assets, knowledge products, tools, pipelines, layered vocabulary.
- **`comparing-knowledge-bases-semantic-overlap`** *(deep)* — Comparing Knowledge Bases: Detecting Semantic and Textual Overlap Between Knowledge Products. A large organization rarely has one knowledge base. It has two FAQ spreadsheets that nobody realized were eighty percent the same, plus a vectorized KB and a structured one that may or may not be talking about the same things. This is the rigorous version of the question every governance review eventually asks, do these two knowledge bases overlap, and what should we do about it, worked from exact-duplicate hashing through MinHash, embeddings, optimal transport, and the contradiction case that usually matters most. Concepts: semantic overlap detection, MinHash, optimal transport, entity resolution. Tech: minhash.
- **`adk-advanced-evolution-of-agent-engineering`** *(deep)* — ADK, Advanced: The Evolution of Agent Engineering. The fastest way to understand Google's ADK deeply is not a tutorial. It is the history. This post narrates the year by year evolution of how we thought about building an agent with an LLM, through the graph based Workflow Runtime that arrived in ADK 2.0, and shows how every complexity that accumulated along the way is resolved, simplified, or quietly absorbed, including its limits. Concepts: framework as fossil record, ReAct loop, abstraction explosion, control flow reckoning, agent taxonomy, runner and event stream. Tech: google-adk, langgraph, langchain, gemini, gemini-enterprise.
- **`redis-for-ai-buy-vs-build-gcp`** *(deep)* — Redis for AI on GCP: A Critical Buy-vs-Build Analysis. You already run everything on Google Cloud. Redis is selling an AI bundle -- agent memory, vector search, semantic caching, feature serving -- and it is one click away on the Marketplace. This is a skeptical procurement analysis of what you actually gain by adding it, where Memorystore and Vertex already cover you, and three POCs that would prove or disprove the value before you sign anything. Concepts: caching, vector databases, agents, feature store, production ml, gcp.
- **`spanner-graph-for-knowledge-and-agents`** *(deep)* — Understanding Cloud Spanner: Graphs, Knowledge, and Where Ontologies Fit. Spanner was built to solve a problem most databases declare impossible: global scale, horizontal sharding, and external consistency at the same time. This is a field-notes tour of why it exists, how Spanner Graph layers a property graph on relational tables, and the honest answer to the question I keep getting asked: should your ontology and knowledge graph live in Spanner? Concepts: knowledge graphs, gcp, data architecture, distributed systems, graph databases, ontologies.
- **`gemini-knowledge-catalog-workshop`** *(deep)* — The Definitive Knowledge Catalog Workshop: Catalog, Enrich, Search. A hands-on, lab-style walkthrough of Google's Knowledge Catalog, the Dataplex-lineage cataloging and AI-grounding layer. We work the three core moves end to end, catalog then enrich then search, explain how each works under the hood, and close with the hard usability questions: catalog everything or be selective, one catalog or many, and what the service genuinely does not solve. Concepts: catalog, enrich, search, context graph, Dataplex lineage. Tech: dataplex, vertex-ai.
- **`vector-databases-indexes-to-vertex-search`** *(deep)* — Vector Databases Demystified: From Indexes to Vertex AI Vector Search. You have embeddings. Now you need to find the nearest ones among billions, in milliseconds, without melting your budget. This is the full story of how vector indexes emerge from that one constraint, how the major index families actually work, and how to run a production vector database on Google Cloud with Vertex AI Vector Search. Concepts: vector databases, embeddings, information retrieval, algorithms, rag, gcp.
- **`enterprise-agent-governance-lifecycle`** *(deep)* — Curating and Governing an Enterprise Agent: A Lifecycle Operating Model. Most teams treat an agent like a product launch: build it, ship it, move on. A production agent is more like a warship. It gets designed, sea-trialed, and certified, and then it returns to the dry dock again and again for inspection and refit across its whole service life. This is the end-to-end operating model for curating and governing an enterprise agent, phase by phase, with owners, gates, artifacts, and the GCP services that help at each step. Concepts: agents, agentic ai, ai governance, enterprise ai, gcp, vertex ai.
- **`knowledge-as-a-product`** *(deep)* — Knowledge as a Product: What a Knowledge Base Really Is, and How Large Organizations Should Build One. Most enterprises treat their knowledge base as a pile of documents bolted onto a vector store, then wonder why nobody trusts it. The fix is older than RAG and borrowed from data mesh: treat knowledge as a product, with an owner, a contract, an SLA, and a shelf you can actually find it on. This is the long version of that argument, applied to a large regulated bank. Concepts: knowledge as a product, data mesh, ownership, SLA.
- **`dev-environments-for-ai-teams`** *(deep)* — Where Your Code Should Live: Cloud Workstations, Workbench, Coder, and the AI Team's Dev Environment. The blog has eighty-something posts on what to build and almost nothing on where to build it. This is the missing one. For an AI engineering team in a regulated enterprise, the dev environment is not a personal preference, it is part of the architecture, and choosing it badly costs you GPUs, data residency, and your audit trail. Concepts: developer tools, cloud computing, gcp, docker, devops, ai engineering.
- **`agent-architectures-productive-patterns`** *(deep)* — Agent Architectures: What Makes an Agent Productive. We put LLMs in a loop, gave them tools, and called them agents. But putting an engine in a chassis doesn't make a car. This is the engineering behind agent architectures—from single routers to multi-agent supervisors—and the enterprise tools and cloud services that turn brittle demos into productive enterprise systems. Concepts: agents, agentic ai, llms, best practices, ai engineering, production ml.
- **`rl-algorithm-taxonomy-tour`** *(deep)* — The RL Algorithm Tree: A Practitioner's Tour from Policy Gradients to AlphaZero. The cert review showed you the silhouette of reinforcement learning. The tree the field actually uses has four branches, fifteen named algorithms, and a clean logic for which one to reach for. This is the tour through it, with the equation, the contribution, and the minimal skeleton for each. Concepts: reinforcement learning, deep learning, machine learning, algorithms, neural network theory, mathematics.
- **`ml-cert-review-part-2-deep-learning-and-beyond`** *(deep)* — ML Cert Review, Part II: Deep Learning, Scale, NLP, RL, and Explainability. Part II of the cert review picks up where the classical foundations end. This is the modern stack: deep learning core, regularization, optimizers, distributed training, the NLP and RL fast tours, explainability, and the tooling map. Crisp coverage at cert speed. Concepts: deep learning, neural network theory, cnns, rnns, pytorch, nlp.
- **`ml-cert-review-part-1-foundations`** *(deep)* — ML Cert Review, Part I: How Models Learn and How We Measure Them. You've picked your cert. Now here is the ground you actually need to be solid on. A dense, opinionated refresher on the classical ML half of any modern ML certification: metrics, losses, activations, the bias-variance trade-off, feature engineering, evaluation, ensembles, and the algorithm zoo. Concepts: machine learning, statistics, mathematics, optimization, evaluation, best practices.
- **`google-cloud-certifications-2026-roadmap`** *(deep)* — Google Cloud Certifications in 2026: A Practical Roadmap. What the cert ladder actually looks like in 2026, what's been added in the agent era, what each exam is honestly like, and how a working engineer should pick one. The post I wish had existed when I started planning. Concepts: google cloud, gcp, cloud computing, software engineering, ai engineering, data engineering.
- **`application-data-flow-replicas-backups`** *(deep)* — The Forgotten Half of Your App: How Data Actually Flows Between Front, Back, and Backups. Most engineers can draw a frontend, a backend, and a database. Then the interviewer asks about backups, replicas, dev refresh, point in time recovery, and the analytics warehouse, and the room goes quiet. The second half of the data plane is where production maturity lives. This post is the honest map: vocabulary, trade offs, and a default architecture you can copy. Concepts: data engineering, data architecture, data pipelines, software engineering, cloud computing, best practices.
- **`google-adk-agent-development-deep-dive`** *(deep)* — Google ADK: Building Production Agents from First Principles. The Agent Development Kit is Google's open-source framework for authoring, evaluating, and deploying agents. This post is the most thorough single resource I could write on it: the pillar mental model as it stands after ADK 2.0, runnable code for every core abstraction, graph workflows, skills, an end-to-end multi-agent finance assistant, the agent loop drawn properly, eval, deployment to Agent Runtime, and an honest comparison with the rest of the field. Concepts: agent development kit, four pillar model, LlmAgent, workflow agents, BaseNode, tool authoring. Tech: google-adk, gemini, vertex-agent-engine, gemini-enterprise, mcp, a2a, opentelemetry.
- **`stack-recommendations-after-100-posts`** *(deep)* — The Stack I Would Adopt After 100 Posts: An Opinionated Manifesto. The hundredth post was the structural retrospective. This is the practical one. After a hundred posts of saying it depends, here is the stack I would actually pick today, the books and papers that earned their place on my shelf, the patterns that proved their weight, and the ones I would refuse to deploy a second time. Concepts: production ml, best practices, mlops, llms, rag, agents.
- **`agent-engineering-disciplines`** *(deep)* — Agent Engineering as a Discipline: Six Roles That Just Got Names. By 2026 the people who keep production agents alive had stopped calling themselves AI engineers and started using more specific titles. Context Engineer. Memory Engineer. Harness Engineer. Tool Engineer. Eval Engineer. Identity and Policy Engineer. This post is a tour of those six disciplines: what each one owns, the artifacts they produce, the named effects they fight, the anti-patterns that keep biting, and an honest projection of which roles will consolidate, which will be absorbed by vendors, and which are LinkedIn theater. Concepts: agents, agentic ai, llms, production ml, best practices, software engineering.
- **`knowledge-catalog-vs-ontologies`** *(deep)* — Knowledge Catalog vs Ontologies: A Confluence, Not a Replacement. Google's Knowledge Catalog and a domain ontology look like they answer the same question. They do not. One is an asset registry with governance and lineage; the other is a formal model of meaning with inferential reasoning. A mature knowledge layer almost always needs both, with a clear arrow of dependency between them. This post is the four-part arc's closing piece, naming the substitutions, the anti-patterns, and the honest hybrid architecture. Concepts: asset registry vs ontology, inferential reasoning, hybrid architecture. Tech: owl, dataplex.
- **`gemini-enterprise-knowledge-catalog-deep-dive`** *(deep)* — Gemini Enterprise and the Knowledge Catalog: Two Buildings, Room by Room. The Cloud Next 26 overview gave you the map. This post zooms in on the two pieces that will reshape a Knowledge Data Engineer's day-to-day in the next twelve months: the Gemini Enterprise Agent Platform as a control plane, and the Knowledge Catalog as the semantic spine that grounds every agent answer in audited enterprise truth. Concepts: Agent Platform control plane, Knowledge Catalog semantic spine, context graph. Tech: vertex-ai, dataplex.
- **`google-cloud-next-2026-agent-native-stack`** *(deep)* — Google Cloud Next 2026: The Agent-Native Stack, Decoded. On April 22, 2026, Sundar Pichai walked onstage at Mandalay Bay and quietly renamed Vertex AI. The new label, Gemini Enterprise Agent Platform, sounds like marketing. It is not. It is the most aggressive cloud reorganization since the original Compute Engine launch. This is the practitioner's deep dive into every announcement that matters, what it replaces, and what to actually adopt. Concepts: agent-native stack, Gemini Enterprise Agent Platform, agentic data cloud. Tech: vertex-ai, gcp.
- **`agent-guardrails-field-guide`** *(deep)* — Guardrails for Agent Systems: A Field Guide. What goes wrong when an agent gets loose in production, and the layered defenses that actually keep it from doing damage. A practitioner's mental model: threat taxonomy, five guardrail layers with code, blast radius reasoning, the tooling landscape, evaluation, and the anti-patterns that defeat the whole effort. Concepts: threat taxonomy, guardrail layers, blast radius reasoning.
- **`populating-knowledge-graph-llms-banking`** *(deep)* — Populating a Knowledge Graph with LLMs: A Banking Case Study. There is an abyss between the GraphRAG paper and a pipeline that runs reliably in production. This post crosses that gap with a worked banking case — ingesting mortgage-loan documents into Neo4j with a schema-embedded extraction prompt, Pydantic repair, pySHACL validation, entity resolution, and idempotent MERGE Cypher. Concepts: schema-embedded extraction, Pydantic repair, pySHACL validation, entity resolution, idempotent MERGE. Tech: neo4j, pydantic, pyshacl, cypher.
- **`ontology-production-pipeline-gcp`** *(deep)* — Ontologies in Production: A CI/CD Pipeline for Enterprise Schemas on GCP. An ontology that lives on one engineer's laptop is not an ontology, it is a document. Putting one into production has its own architectural shape: Git as source of truth, YAML authored and compiled into OWL, SHACL, and JSON-Schema, CI that runs competency questions as tests, and GCP plumbing that treats the schema as code, not data. Concepts: ontology CI/CD, YAML-to-OWL compilation, competency questions as tests. Tech: shacl, owl, gcp.
- **`modular-ontologies-core-domains-pattern`** *(deep)* — Modular Ontologies: The Core + Domains Pattern for Enterprise Knowledge Graphs. An enterprise ontology is neither a single monolithic file nor a loose federation of domain silos. Real projects converge to Core + Domains: a small, stable core of cross-cutting concepts and orbiting modules per business line. This post derives the operational rule that governs that split, using banking as the grounded example. Concepts: core + domains pattern, modular ontology, cross-cutting concepts. Tech: owl, rdf.
- **`tbox-abox-schema-facts-distinction`** *(deep)* — TBox and ABox: Why the Schema/Facts Split Matters in Production Knowledge Graphs. Most enterprise knowledge-graph projects fail at the same join: the place where the schema of the world meets the facts about the world. The Description-Logic distinction between TBox, ABox, and RBox is not academic pedantry. It is the operating model that tells you how to lay out files, who owns what, how often each piece changes, which tools to use, and where SHACL sits in the pipeline. This post grounds the theory in a banking knowledge graph and shows the concrete failure modes when teams collapse the distinction. Concepts: TBox, ABox, RBox, description logic, schema/facts split. Tech: neo4j, rdf.
- **`query-routing-agent-decisions`** *(deep)* — Query Routing: How the Agent Decides Where to Look. In a hybrid retrieval system with vector stores, graphs, SQL and APIs, the quality of each source matters less than the decision of which one to consult. This post walks through three routing strategies — LLM-only, explicit classifier, cascading fallback — and shows how to evaluate the router as a first-class component. Concepts: tool routing, query classification, retrieval evaluation, cascading retrieval, RAG. Tech: anthropic-sdk, langgraph.
- **`ontology-to-agent-toolbox`** *(deep)* — From Ontology to Agent Toolbox: Turning Your Schema Into Tools. An ontology is not just a schema — it is the blueprint that tells you which tools to give your agent. This post walks through three levels of tool granularity, from a monolithic Cypher endpoint to domain-scoped tools derived class-by-class from an OWL ontology, with production-quality Python, guardrails, and role-based access. Concepts: ontology, tool granularity, agent toolbox, OWL, role-based access, guardrails. Tech: neo4j, anthropic-sdk, owl.
- **`lookml-semantic-layer-data-modeling`** *(working)* — LookML: The Semantic Layer That Turns SQL Into a Product. Raw SQL tables are not data products. Between the warehouse and the business sits a translation layer that defines what metrics mean, how tables relate, and who can see what. LookML is one answer to that problem -- a code-based semantic modeling language that version-controls your analytics and opens the door to agentic, programmatic BI. Concepts: semantic layer, LookML, metric definitions, data modeling. Tech: looker, lookml, bigquery.
- **`graph-neural-networks-learning-structured-data`** *(deep)* — Graph Neural Networks: Learning on Structured Data. Your data has structure that tabular models ignore. Graph Neural Networks learn directly from nodes, edges, and neighborhoods — turning social networks into recommendations, molecules into property predictions, and transaction graphs into fraud detectors. This post covers message passing, GCN, GAT, GraphSAGE, and production deployment with PyTorch Geometric. Concepts: GNN, message passing, graph convolution, node classification. Tech: pytorch, pytorch-geometric.
- **`vertex-ai-gcp-ml-platform-cli`** *(deep)* — Vertex AI: The Complete GCP ML Platform from the CLI. Google Cloud's ML platform is massive — notebooks, custom training, AutoML, model registry, endpoints, pipelines, feature store, vector search, generative AI, monitoring, and more. This is the map: every service explained with its CLI commands, Python SDK equivalents, pricing model, and the trade-offs you need to know before committing budget. Concepts: vertex ai, gcp, mlops, machine learning, cloud computing, cli.
- **`network-fundamentals-every-concept`** *(deep)* — Network Fundamentals: Every Concept You Need to Know. Every application you build runs on a network. This is the definitive guide to the concepts that make it work: the OSI model layer by layer, TCP/IP internals, IP addressing and subnetting, DNS resolution, HTTP and TLS, routing, NAT, DHCP, VPNs, network security, and the troubleshooting toolkit every engineer should master. Concepts: networking, infrastructure, protocols, computer science, systems design, cloud computing.
- **`terraform-infrastructure-as-code`** *(deep)* — Terraform: Infrastructure as Code from Zero to Production. Clicking through a cloud console works until it doesn't. Terraform lets you describe your entire infrastructure in code — versioned, reviewable, reproducible. This is the complete guide: HCL syntax, providers, state management, modules, production workflows, and the hard-won patterns that keep teams from breaking things at 2 AM. Concepts: terraform, infrastructure as code, devops, cloud computing, aws, gcp.
- **`mcp-server-nl-to-powerbi-dashboard`** *(deep)* — Designing an MCP Server That Turns Natural Language into Power BI Dashboards. The request 'show me churn by region last quarter' is actually three hard problems: understanding what churn means in your organization, generating correct SQL over your semantic layer, and choosing the right visualization. This post designs an MCP server that solves all three, grounding every step against a curated semantic layer so the LLM never hallucinates a metric or invents a column. Concepts: mcp, text-to-sql, rag, llms, business intelligence, nlp.
- **`kubernetes-minimum-subset-ml`** *(deep)* — Kubernetes for ML Engineers: The Minimum Subset You Actually Need. Most Kubernetes guides are written for platform engineers. This one is not. If you already know Docker and just want to train models, serve predictions, and stop asking DevOps for favors, here is the 20% of Kubernetes that delivers 80% of the value -- the objects, commands, and YAML patterns an ML engineer actually touches. Concepts: kubernetes, mlops, devops, gpu, orchestration, cloud computing.
- **`multimodal-embeddings-metric-problem`** *(deep)* — Multimodal Embeddings: One Vector Space for Everything, and the Metric Problem Nobody Talks About. The promise of multimodal embeddings is seductive: encode text, images, audio, and video into a single vector space and let cosine similarity do the rest. The reality is messier. Cross-modal retrieval breaks in subtle ways because different modalities occupy different submanifolds, and naive top-k returns nonsense. This is the full story — from CLIP to SigLIP to ImageBind, the modality gap that haunts production systems, and the retrieval patterns that actually work. Concepts: embeddings, multimodal, clip, vector databases, deep learning, information retrieval.
- **`bash-daily-driver-ml-engineer`** *(deep)* — Bash as a Daily Driver: The Subset an ML Engineer Actually Uses. Bash is half duct tape, half landmine. This is the narrow slice of shell that ML and data engineers actually leverage every day -- pipe composition, safe scripting, parallelism, modern replacements, JSON wrangling -- and the honest decision point for switching to Python. Concepts: bash, cli, devops, productivity, developer tools, linux.
- **`llm-caching-four-layers`** *(deep)* — Caching in LLM Systems: Four Layers That Actually Move the Needle. Generic caching advice does not transfer cleanly to LLM applications. This post maps the four concrete cache layers in a production LLM system -- prompt prefix, embedding, retrieval, and response -- explains how they interact, and provides a decision framework for when to deploy each one. Concepts: caching, llms, rag, performance, distributed systems, production ml.
- **`production-llm-agents-patterns`** *(deep)* — Production LLM Agents: Patterns That Survive Contact With Users. Real production patterns for LLM agents in 2026: the ReAct loop, planner/executor splits, tool-use protocols, memory architectures, reflection, multi-agent coordination, failure modes that actually break you, and observability that earns its keep. Concepts: agent loop, tool use, error recovery, observability, guardrails. Tech: anthropic-sdk, langgraph.
- **`content-addressable-hash-as-engineering-tool`** *(deep)* — The Hash as an Engineering Tool: Content Addressing, Caches, and the Quiet Primitive Behind Modern Systems. Hashes are not just a crypto topic. They are the quiet primitive behind Git, Docker, Bazel, IPFS, rsync, Bitcoin, CDNs, backup systems, and half the distributed systems you interact with every day. This is a tour of the hash as an everyday engineering tool — content-addressable storage, build caches, chunk deduplication, Merkle trees, consistent hashing, bloom filters, and the fingerprinting tricks that make modern infrastructure feel like magic. Concepts: hashing, distributed systems, git, caching, computer science, data structures.
- **`claude-code-complete-guide`** *(working)* — Claude Code: The Complete Guide to Becoming a Power User of the AI That Codes With You. Most developers use Claude Code like a smarter autocomplete. A small minority treat it as what it actually is — a programmable agent that reads files, runs commands, spawns helpers, and iterates until your task is done. This is the complete mental model, every subsystem that matters, and how to actually become an expert. Concepts: Claude Code, CLI agent, hooks, slash commands, MCP integration. Tech: claude-code, anthropic-sdk.
- **`git-and-github-complete-guide`** *(deep)* — Git and GitHub: The Complete Mental Model for Working with Code. Git is the single most-used piece of software in the entire profession, and most engineers use maybe 15% of it from muscle memory. This is the full guide — how Git actually stores your code, every command that matters and what it really does, how to recover from the disasters, branching strategies, GitHub's model on top of Git, Actions, organizations, and the gotchas you will hit. Long because it has to be. Concepts: git, github, version control, ci/cd, developer tools, devops.
- **`apache-airflow-orchestration`** *(deep)* — Apache Airflow: The Orchestrator That Runs the Data World. A working engineer's guide to Airflow in the 3.x era — what it actually is, how the scheduler and executors fit together, when to use TaskFlow vs classic operators, why Assets and DAG versioning changed the mental model, and the honest tradeoffs against Prefect and Dagster. Written for people who need to ship pipelines, not slide-deck architects. Concepts: apache airflow, data engineering, orchestration, workflow automation, kubernetes, data pipelines.
- **`fine-tuning-embeddings`** *(deep)* — Fine-Tuning Embeddings: What You Gain, What You Need, and How to Actually Do It. Off-the-shelf embeddings are the default, but in specialized domains they leave 5-15 points of retrieval quality on the table. This is the full playbook for when to fine-tune, what training data looks like, which loss function to pick, how hard negative mining changes everything, and how to ship the result without breaking your vector index. Concepts: embeddings, fine-tuning, rag, nlp, deep learning, contrastive learning.
- **`elevenlabs-voice-ai-engineering`** *(deep)* — ElevenLabs in Production: How Neural Voice Synthesis Actually Works. A technical walkthrough of ElevenLabs — how the models are built, how to wire them into a real application with streaming and WebSockets, and the ethical, operational, and cost considerations you need to think about before shipping a voice feature. Concepts: voice ai, text-to-speech, generative ai, streaming, apis, deep learning.
- **`knowledge-base-curation`** *(deep)* — Curating Knowledge Bases: The Unglamorous Work That Makes RAG Actually Work. Everyone talks about chunking strategies and embedding models. Nobody talks about what happens before — the document triage, token budget math, metadata enrichment, deduplication, and freshness policies that determine whether your knowledge base is an asset or a liability. This post covers the full curation lifecycle. Concepts: knowledge bases, rag, data curation, embeddings, chunking, document processing.
- **`knowledge-graphs-practice`** *(deep)* — Knowledge Graphs in Practice: From Documents to Queryable Intelligence. Ontologies give you the blueprint. Knowledge graphs give you the building. This post walks through the full construction pipeline — extracting entities with LLMs, building graphs in Neo4j, querying with Cypher, and wiring it all into GraphRAG — with working Python code at every step. Concepts: knowledge graph, property graph, RDF, graph queries, entity resolution. Tech: neo4j, cypher, rdf.
- **`enterprise-ai-platform-selection`** *(deep)* — Enterprise AI Stack: A Decision Framework That Outlasts the Hype Cycle. Choosing between No-Code, Low-Code, and custom AI platforms shouldn't require a PhD in vendor marketing. This framework breaks the decision into six durable axes — scope, gateway, guardrails, observability, contingency, and interface — so your team picks the right stack for each use case, not just the loudest one. Concepts: enterprise ai, ai strategy, mlops, ai governance, infrastructure, production ml.
- **`ontologies-building-knowledge-bases`** *(working)* — Ontologies: The Blueprint Behind Every Knowledge Base That Actually Works. Ontologies turn chaotic data into structured knowledge. Learn how to design, build, and deploy ontology-driven knowledge bases — from RDF triples to production-ready systems that power RAG, search, and enterprise AI. Concepts: ontology, OWL, RDF, taxonomy, knowledge representation. Tech: protege, owl, rdf.
- **`data-silos-breaking-information-barriers`** *(deep)* — Data Silos: The Silent Tax on Every Decision Your Company Makes. Data silos are more than a technical inconvenience — they're a structural tax on every decision your organization makes. This post unpacks why silos form, why naïve centralization fails, and how to build a federation strategy that actually works, with cloud-native patterns on AWS and GCP. Concepts: data engineering, data architecture, enterprise data, cloud computing, data mesh, knowledge management.
- **`dama-dmbok-data-governance`** *(deep)* — DAMA DMBOK: The Data Governance Framework Every Data Engineer Should Know. DAMA DMBOK is the industry standard framework for data governance, but most engineers encounter it as a wall of jargon. This guide breaks down all 11 knowledge areas with clear definitions, real narrative, and applies them to a bank building an AI-powered knowledge base from scratch. Concepts: data governance, data quality, metadata, data engineering, enterprise data, knowledge management.
- **`apache-spark-ecosystem-guide`** *(deep)* — Apache Spark: From a PhD Paper to the Backbone of the Modern Data Stack. Apache Spark started as a 2010 Berkeley paper asking a deceptively simple question: what if we didn't have to write to disk between every computation step? Fifteen years later, it powers data pipelines across most of the Fortune 500. Here's the full story — the engine, the language, the ecosystem, and the honest trade-offs. Concepts: apache spark, data engineering, pyspark, distributed computing, big data, sql.
- **`dataiku-enterprise-data-ai-ecosystem`** *(deep)* — Dataiku and the Enterprise AI Ecosystem: What Platforms Solve, What They Don't, and When to Use One. A practical look at Dataiku DSS in the context of the broader enterprise data + AI landscape: the real problems it solves, where it falls short, the honest trade-offs against alternatives, and frameworks for deciding if it's the right tool for your team. Concepts: enterprise ai, mlops, ai governance, data science, machine learning, ai strategy.
- **`document-processing-ocr-layout`** *(deep)* — Document Processing: OCR, Layout Detection, and the Path to Clean Text. Before you can retrieve from a document, you have to read it. That sounds trivial until you face a rotated scan, a two-column PDF, a table that spans pages, or a PPTX with embedded charts. This is the complete guide to document processing: image preprocessing, OCR engines, layout detection, full-pipeline parsers, table extraction, cloud APIs, vision LLMs, and benchmarks — with a routing pattern you can deploy today. Concepts: document processing, ocr, rag, nlp, deep learning, data pipelines.
- **`ai-poc-enterprise-evaluation`** *(deep)* — Enterprise AI PoCs: From Vendor Demos to Decisions You Can Defend. Most AI proofs of concept are designed to impress, not to inform. They test vendor demos against ideal data, measure metrics that don't match business objectives, and end with a slide deck that recommends the option the team already preferred. Here's a rigorous framework for running PoCs that produce defensible, production-aligned decisions — covering vector database evaluation, RAG quality measurement, text-to-SQL agents, and what changes when you're working in a regulated environment. Concepts: enterprise ai, rag, evaluation, vector databases, llms, data engineering.
- **`mcp-production-enterprise`** *(deep)* — Building Enterprise MCP Servers: From Prototype to Production. The existing MCP post explains the concept. This one is about building servers that survive contact with a real company: authentication with OAuth 2.1, per-tool authorization scopes, audit logging, middleware, multi-tenant isolation, gateway patterns, and deployment strategies that don't require every developer to run their own Python process. Concepts: MCP server, enterprise integration, authentication, audit logging. Tech: anthropic-sdk, mcp.
- **`pytorch-tensorflow-deep-learning-frameworks`** *(deep)* — PyTorch, TensorFlow, and JAX: The Deep Learning Framework Landscape in 2026. PyTorch dominates research, TensorFlow still rules mobile and edge deployment, and JAX is quietly rewriting the rules for large-scale training. A complete guide to all three — their architecture, strengths, production patterns, and when to choose each. Concepts: pytorch, tensorflow, jax, deep learning, distributed computing, gpu.
- **`software-engineering-classics`** *(deep)* — The Books That Shaped Software: Clean Code, Design Patterns, and Architecture. Clean Code, the Gang of Four, Hexagonal Architecture — these books sit on every senior engineer's shelf. But reading them uncritically in 2026 is almost as dangerous as not reading them at all. Here's what they got right, where they lead you astray, and how the ideas evolved into the architecture patterns we actually use. Concepts: software engineering, design patterns, software architecture, clean code, best practices, solid.
- **`llamaindex-langchain-llm-frameworks`** *(deep)* — LlamaIndex vs LangChain: Choosing Your LLM Framework in 2026. Both LlamaIndex and LangChain can build a RAG pipeline. Both can run agents. Both have grown toward each other's territory. The question is no longer 'which can do it' but 'which mental model fits your problem.' This is the honest comparison — what each framework is actually designed for, where each excels without fighting the defaults, and how the broader ecosystem of DSPy, Haystack, CrewAI, and Pydantic AI each answer a different question. Concepts: llamaindex, langchain, llm frameworks, rag, ai engineering, agents.
- **`local-llm-inference-tools`** *(deep)* — The AI Engineer's Inference Toolkit: Ollama, vLLM, LM Studio, and Docker. Every AI engineer eventually needs to run models locally — for privacy, cost control, latency, or just to avoid depending on an API that might break at 2am. This is the practical guide to the three tools that matter: LM Studio for exploration, Ollama for development, and vLLM for production. With complete Docker Compose setups and proof-of-concept patterns. Concepts: llm serving, ollama, vllm, docker, ai engineering, infrastructure.
- **`rlhf-dpo-alignment`** *(deep)* — RLHF, DPO, and the Art of Teaching Models to Behave. Pre-training produces a model that's brilliant at predicting text. Alignment turns it into a model that's actually useful — and safe. This is the deep guide to RLHF, DPO, and their 2025-2026 successors: how the reward model works, why PPO is unstable, how DPO eliminates the need for it, what SimPO, KTO, ORPO, and GRPO each solve, and what all of this means when you're building on top of aligned models. Concepts: rlhf, dpo, alignment, llms, reinforcement learning, fine-tuning.
- **`fine-tuning-gemma4-lora-qlora`** *(deep)* — Fine-tuning Gemma 4: When Prompting Isn't Enough. Gemma 4 dropped last week: four sizes, Apache 2.0, multimodal, and day-one fine-tuning support. This is the deep guide — understanding the family, choosing the right variant for your hardware, why full fine-tuning is economically indefensible, how LoRA and QLoRA make adaptation practical on consumer GPUs, and a complete working recipe with Gemma 4 E4B from dataset to deployed adapter. Concepts: fine-tuning, lora, qlora, llms, hugging face, deep learning.
- **`lakehouse-architecture`** *(deep)* — Lakehouse Architecture: How Open Table Formats Fixed the Data Lake's Original Sin. Data lakes promised cheap, flexible analytics — and delivered corrupt reads, GDPR nightmares, and query engines flying blind. The lakehouse pattern fixes this by layering ACID transactions, schema enforcement, and row-level operations directly onto object storage. This is the story of how Apache Iceberg, Delta Lake, and Apache Hudi changed what's possible — and when to use each. Concepts: data engineering, apache iceberg, delta lake, data lakehouse, data architecture, cloud computing.
- **`dbt-analytics-engineering`** *(deep)* — dbt: The Analytics Engineering Tool That Turned SQL into Software. Every data team reaches the same crisis point: SQL transformations scattered across notebooks, dashboards, and ad-hoc scripts, with no one sure which version is correct. dbt solves this by bringing software engineering practices — version control, testing, documentation, modularity — to the SQL layer. This is a complete guide to building reliable analytical pipelines with dbt. Concepts: dbt, analytics engineering, data engineering, sql, data warehouse, data transformation.
- **`dimensional-modeling-kimball`** *(deep)* — Dimensional Modeling: The Kimball Method for Analytical Data Warehouses. Your pipeline is clean, your data is accurate, and your BI dashboard still takes 45 seconds to load. The problem is rarely the data — it's the model. This is a complete guide to Kimball's dimensional modeling: star schemas, grain declaration, SCD types, the bus matrix, and how to implement all of it in dbt. Concepts: data engineering, dimensional modeling, data warehouse, dbt, analytics engineering, sql.
- **`sql-pandas-pyspark-duckdb`** *(deep)* — SQL, Pandas, PySpark, and DuckDB: The Data Engineer's Complete Reference. Four tools, one mental model. SQL for declarative in-database logic. Pandas for in-memory exploration. PySpark for distributed scale. DuckDB for the vast middle ground that doesn't need a cluster. Every pattern you need, side by side, with clear rules for when to reach for each. Concepts: sql, pandas, pyspark, duckdb, data engineering, python.
- **`data-engineering-fundamentals`** *(deep)* — Data Engineering Fundamentals: The Mental Model Every Engineer Needs. Data engineering is not about moving files from A to B. It's about building reliable, scalable, observable systems that make data trustworthy — for analysts, ML models, and increasingly, AI agents. This post dismantles the buzzwords and builds the mental model from first principles. Concepts: data engineering, etl, data lakehouse, distributed systems, apache iceberg, data quality.
- **`gcp-ai-stack-vertex-alloydb-knowledge-pipeline`** *(deep)* — GCP AI Stack: Vertex AI, AlloyDB, and the Cloud-Native Knowledge Pipeline. Google Cloud's AI infrastructure has matured rapidly: the Vertex AI RAG Engine is GA, AlloyDB now ships a custom ScaNN vector index, and a full cloud-native knowledge pipeline is within reach from CLI alone. But the real costs, regional constraints, and architectural trade-offs are rarely discussed honestly. This post covers what the stack actually looks like in 2025-2026, where it delivers, and where it quietly disappoints. Concepts: gcp, vertex ai, rag, vector databases, knowledge bases, cloud computing.
- **`enterprise-knowledge-bases`** *(deep)* — Enterprise Knowledge Bases: From RAG Pipelines to Agent-Ready Context Engines. Building knowledge bases that serve both humans and AI agents requires more than chunking and vector search. This guide covers the complete architecture — from knowledge engineering and domain ontologies through chunking hierarchies and permission-aware retrieval to the unified context engines and MCP-based tool interfaces that make enterprise knowledge agent-ready. Concepts: knowledge bases, rag, agents, knowledge engineering, enterprise ai, mcp.
- **`ragas-evaluating-rag`** *(working)* — RAGAS: Evaluating RAG End-to-End. Building a RAG system is only half the problem. The other half — knowing whether it actually works, understanding exactly where it fails, and having a reliable signal to improve it — is arguably harder. RAGAS offers a framework for decomposing RAG quality into measurable, interpretable dimensions. This is how it works, why it matters, and what it still can't tell you. Concepts: RAG evaluation, faithfulness, answer relevance, context precision, LLM-as-judge. Tech: ragas, langchain.
- **`langgraph-multi-agent-workflows`** *(deep)* — LangGraph: Orchestrating Multi-Agent Workflows. A practical guide to LangGraph 1.x: how StateGraph works, when to use agents vs. chains, the patterns that actually work in production (Supervisor, Subgraph, HITL, Map-Reduce), and an honest comparison with alternatives. Concepts: langgraph, agents, llms, orchestration, langchain, multi-agent.
- **`text-to-sql`** *(deep)* — Text-to-SQL: Bridging Natural Language and Structured Data. A practical deep-dive into the current state of NL→SQL systems: benchmarks, architectures, production pitfalls, and what actually works in 2026 for querying enterprise data warehouses with natural language. Concepts: text-to-sql, nlp, llms, bigquery, data engineering, agents.
- **`mteb-embedding-benchmarks`** *(deep)* — MTEB: Choosing the Right Embedding Model for Your Task. The top model on the MTEB leaderboard is not automatically the right model for your RAG system. MTEB covers eight distinct task types, and a model that dominates retrieval may be mediocre at clustering or reranking. This is a complete guide to what MTEB measures, how to read it critically, and how to match an embedding model to the actual work it needs to do. Concepts: benchmarks, embeddings, rag, information retrieval, knowledge engineering, nlp.
- **`llm-benchmarks`** *(deep)* — LLM Benchmarks: A Field Guide to Reading the Leaderboards. Leaderboards still matter in 2026, but not in the way benchmark charts want you to believe. This field guide explains which LLM benchmarks are now historical, which still matter at the frontier, what agentic and tool-use benchmarks changed, and how to read every score critically. Concepts: benchmarks, llms, evaluation, knowledge engineering, rag, ai engineering.
- **`rag-advanced-patterns`** *(deep)* — Advanced RAG: From Naive Retrieval to Systems That Actually Work. Naive RAG — chunk documents, embed them, retrieve the top-k, stuff into the prompt — works in demos. In production, it fails in predictable, fixable ways. This post covers the patterns that separate brittle prototypes from reliable systems: query transformation, advanced retrieval strategies, re-ranking, agentic RAG, GraphRAG, and how to decide when RAG is the wrong answer entirely. Concepts: hybrid retrieval, reranking, query rewriting, multi-vector retrieval, parent-child chunking. Tech: langchain, llamaindex.
- **`rag-building-production-systems`** *(deep)* — Building RAG Systems: Pipelines, Chunking, and Vector Search. A language model that can look things up is more useful than one that can't. But building a RAG system that actually works in production requires understanding dozens of decisions that the research paper glossed over: how to split documents, which embeddings to use, which vector database to run, how to retrieve well. This is the complete practical guide to the first half of the RAG stack. Concepts: chunking, ingestion pipeline, embedding model selection, evaluation harness. Tech: langchain, llamaindex.
- **`vector-db-benchmarks`** *(deep)* — Vector Database Benchmarks: Reading the Numbers That Actually Matter. A chart says Qdrant handles 10,000 queries per second. Another says Pinecone wins at recall. Both are correct. Neither tells you what you actually need to know. This is how to read vector database benchmarks critically, what the numbers hide, and how to make decisions that hold up in production. Concepts: vector databases, benchmarks, rag, knowledge engineering, infrastructure, production ml.
- **`experiment-tracking-mlops`** *(deep)* — Experiment Tracking in MLOps: Never Lose a Good Run Again. Every ML engineer has had the same nightmare: a model that performed brilliantly last week, and no record of how to reproduce it. Experiment tracking is the discipline that makes that nightmare impossible. This is the complete guide—from what needs to be tracked and why, to deep dives into MLflow, Weights & Biases, Trackio, Neptune, and DVC, with production-grade patterns for teams that need to move fast without losing their work. Concepts: mlops, experiment tracking, mlflow, weights & biases, machine learning, reproducibility.
- **`files-under-the-hood`** *(deep)* — Files Under the Hood: From Bits to Tensors. We use files every day, but rarely stop to think about what they actually are. From the OS abstraction of a file to columnar storage like Parquet, all the way to modern AI tensor formats like Safetensors and GGUF, this is a deep dive into the evolution of how we persist memory to disk. Concepts: computer science, data engineering, software engineering, systems design, data structures, algorithms.
- **`docker-for-ml-engineers`** *(deep)* — Docker for Machine Learning Engineers: From 'Works on My Machine' to Works Everywhere. Every ML engineer has shipped a model that worked perfectly—until it ran on someone else's machine. Docker eliminates that failure mode entirely. This is the complete guide to containerization for ML: what Docker is, why it exists, how to write production-grade Dockerfiles, and how to go from a trained model to a portable, reproducible, deployable artifact. Concepts: docker, containers, mlops, devops, production ml, infrastructure.
- **`model-context-protocol`** *(working)* — The Model Context Protocol: How AI Learned to Use Tools. AI models are powerful, but they are blind. They cannot read your files, query your database, or call your APIs—unless someone builds the bridge. The Model Context Protocol is that bridge: an open standard that gives AI a universal way to interact with the world. This is the story of MCP, how it works, and why it matters. Concepts: MCP, tool protocol, context sharing, server architecture. Tech: anthropic-sdk, mcp.
- **`reinforcement-learning-in-practice`** *(deep)* — Reinforcement Learning in Practice: The Engineering That Makes It Work. Theory is necessary but not sufficient. This is the engineering companion to RL—the implementation details that papers omit, the GPU patterns that supervised learning never taught you, the tricks that separate converging agents from wasted compute, and the deployment patterns that survive contact with reality. Concepts: reinforcement learning, deep learning, pytorch, cuda, production ml, machine learning.
- **`reinforcement-learning-first-principles`** *(deep)* — Reinforcement Learning: From First Principles to Open Frontiers. Most ML engineers have never truly entered the world of reinforcement learning. This is the definitive guide—from Markov Decision Processes and value functions to reward hacking, sim-to-real transfer, multi-agent chaos, and the brutal gap between papers and production systems that actually work. Concepts: reinforcement learning, deep learning, mathematics, reward design, multi-agent, ai safety.
- **`ml-libraries-under-the-hood`** *(deep)* — Machine Learning Libraries Under the Hood: The Definitive Deep Dive. Abstractions are convenient until they break. This is an exhaustive journey through the silicon and software of the ML stack—from NumPy's memory layout and SIMD vectorization to the zero-copy revolution of Apache Arrow, the modern dominance of Polars, and the JIT compilers that turn Python into machine code. Concepts: python, numpy, pytorch, polars, performance, deep learning.
- **`cloud-ml-infrastructure`** *(deep)* — Cloud Infrastructure for Machine Learning: From Local to Global Scale. The cloud is not just bigger computers—it is an entirely different way of building ML systems. This guide covers when to move to cloud, which services to use, how to avoid cost disasters, and the architectural patterns that separate successful cloud ML projects from expensive failures. Concepts: cloud computing, gcp, aws, mlops, infrastructure, vertex ai.
- **`ml-metrics-evaluation-monitoring`** *(deep)* — Metrics, Evaluation, and Monitoring: Ensuring ML Models Actually Work. A model that works in a notebook is not a model that works. This guide covers the complete lifecycle of model evaluation—from choosing the right metrics to detecting drift in production, from offline evaluation to real-time monitoring systems that catch failures before users do. Concepts: machine learning, evaluation, monitoring, mlops, production ml, metrics.
- **`working-with-ml-models`** *(deep)* — Working with ML Models: From Hugging Face to Custom Training. The art of machine learning is knowing when to use what already exists and when to build your own. This guide covers the complete spectrum—from selecting pre-trained models and understanding licenses to fine-tuning strategies and the decision to train from scratch. Concepts: machine learning, hugging face, transfer learning, fine-tuning, deep learning, pytorch.
- **`computational-resources-ml`** *(deep)* — Computational Resources for Machine Learning: From Silicon to Tensors. Before you train a single model, you need to understand what is actually running your code. This is the definitive guide to computational resources in ML—GPUs, CUDA, memory hierarchies, data types, and the art of knowing when your hardware is the bottleneck. Concepts: gpu, cuda, hardware, performance, mlops, deep learning.
- **`python-beyond-the-basics`** *(deep)* — Python Beyond the Basics: The Language Behind the Language. Everyone writes Python. Few truly understand it. This is a deep dive into the mechanisms that separate elegant, maintainable code from the sprawling chaos that haunts production systems—from the data model to metaclasses, from decorators to the GIL. Concepts: python, software engineering, best practices, design patterns, developer tools, testing.
- **`structuring-ml-projects`** *(deep)* — Structuring Machine Learning Projects: From Chaos to Production-Ready. Most ML projects die in the chaos of unversioned notebooks and dependency hell. This is the definitive guide to structuring projects that scale—from folder architecture to Git workflows, from Poetry mastery to the bridge between experimentation and production. Concepts: mlops, python, software engineering, git, best practices, production ml.

### research (28 posts)

- **`double-descent`** *(deep)* — Double Descent: Where the Classical Theory Runs Out. Two theorems proved earlier in this series predict that a model with far more parameters than data cannot generalize. Those models are the state of the art. This post locates exactly which step of the reasoning fails, proves the implicit-bias result that replaces it, measures the double descent curve in numpy, and ends where the theory actually ends: on an open problem. Concepts: double descent, interpolation threshold, benign overfitting, implicit regularization, minimum-norm interpolant, random labels. Tech: numpy.
- **`backprop-is-reverse-mode-differentiation`** *(deep)* — Backprop Is Reverse-Mode Differentiation. Backpropagation is not a neural-network trick. It is reverse-mode automatic differentiation on a computational graph, and the reason it is the only viable choice is a complexity theorem from 1983 that predates its fame in machine learning. This post derives the delta recursion from the chain rule, states the cheap gradient principle, and shows that weight initialization is a short variance calculation rather than folklore. Concepts: backpropagation, reverse-mode automatic differentiation, computational graph, adjoint, chain rule, cheap gradient principle. Tech: numpy.
- **`universal-approximation-and-what-it-does-not-give-you`** *(deep)* — Universal Approximation, and What It Does Not Give You. A neural network can approximate any continuous function. The sentence is true, it is beautiful, and it settles almost nothing. This post states the theorem in the form its authors proved it, gives the architecture of the argument honestly, and then spends most of its length on the four things it does not say: no width bound, no algorithm, no generalization, and no depth. Concepts: universal approximation theorem, density in function space, discriminatory activation, Hahn-Banach, Riesz representation, Barron class. Tech: numpy.
- **`bellman-operator-is-a-contraction`** *(deep)* — The Bellman Operator Is a Contraction. Everyone who has written value iteration has watched it converge and taken it on faith. The guarantee is a theorem with a one-page proof, and it explains three things at once: why an optimal value function exists, why iteration finds it geometrically fast, and why the discount factor is a convergence rate rather than a statement about caring about the future. It also explains precisely why all of that dies the moment the table becomes a neural network. Concepts: Bellman optimality operator, contraction mapping, Banach fixed point theorem, sup norm, value iteration, geometric convergence. Tech: numpy.
- **`em-never-goes-down`** *(deep)* — EM Never Goes Down: Jensen's Inequality as an Algorithm. Expectation-Maximization looks like a heuristic: guess the hidden labels, refit, repeat. It is not. Every iteration provably cannot decrease the observed-data likelihood, and the whole proof is Jensen's inequality applied once. The same decomposition turns out to be the ELBO, which makes EM and variational inference one identity read two ways. Concepts: expectation maximization, Jensen's inequality, evidence lower bound, KL divergence, monotonicity of EM, latent variable models. Tech: numpy, scipy.
- **`one-eigendecomposition-four-algorithms`** *(deep)* — One Eigendecomposition, Four Algorithms. PCA, latent semantic analysis, spectral clustering and kernel PCA are taught as four techniques in four chapters. They are one computation: the eigenvectors of a symmetric positive semidefinite matrix. Only the matrix changes. This post proves the theorems that make that computation optimal, in full, and then reads the four algorithms off them. Concepts: spectral theorem, Courant-Fischer, singular value decomposition, Eckart-Young-Mirsky theorem, principal component analysis, kernel PCA. Tech: numpy, scipy.
- **`weak-learnability-equals-strong`** *(deep)* — Weak Learnability Equals Strong Learnability. Kearns and Valiant asked whether a hypothesis barely better than a coin flip could be amplified to arbitrary accuracy. Schapire proved it could. This post derives AdaBoost as coordinate descent on the exponential loss, proves the training-error bound that makes the equivalence constructive, and then treats the anomaly that followed as the unresolved question it remains. Concepts: weak learnability, strong learnability, boosting, AdaBoost, exponential loss, coordinate descent. Tech: numpy.
- **`kernel-trick-representer-theorem`** *(deep)* — The Kernel Trick Is a Theorem, Not a Trick. An RBF kernel corresponds to an infinite-dimensional feature space, and people say this cheerfully without noticing that optimizing over an infinite-dimensional space should be impossible. It is not impossible, and the reason is a theorem from 1971 that almost nobody who trains an SVM has read. Concepts: positive definite kernels, Gram matrix, reproducing kernel Hilbert space, reproducing property, Moore-Aronszajn theorem, representer theorem. Tech: numpy, scipy.
- **`penalizing-is-constraining`** *(deep)* — Penalizing Is Constraining: What Regularization Actually Does. Everyone has seen the picture: elliptical error contours meeting a circle for ridge, a diamond for LASSO, and the diamond's corners explaining sparsity. That picture is about a constrained problem. What you actually minimize is a penalized one. This post proves they are the same problem, and then derives -- rather than asserts -- why L1 produces exact zeros and L2 never can. Concepts: regularization, KKT conditions, convex optimization, ridge regression, lasso, soft thresholding. Tech: numpy, scipy.
- **`no-free-lunch-theorem`** *(deep)* — No Free Lunch: Every Model Is an Assumption You Already Made. The fundamental theorem of statistical learning says a class is learnable exactly when its VC dimension is finite. The obvious escape is to take a bigger class. A short theorem forbids it. This post proves that theorem, separates it from the two other results that share its name, and then reads the standard toolbox backwards to the assumption each method is quietly making. Concepts: no free lunch theorem, inductive bias, off training set error, uniform prior over targets, PAC learnability, hypothesis class restriction. Tech: numpy.
- **`vc-dimension-sauer-shelah`** *(deep)* — When the Hypothesis Class Is Infinite: VC Dimension and the Sauer-Shelah Lemma. There are uncountably many linear classifiers in the plane, and the union bound over them proves nothing at all. Yet linear classifiers generalize. The resolution is that cardinality was never the right measure: what matters is how many distinct labelings a class can produce on a finite sample, and that count is either exponential forever or polynomial. There is nothing in between. Concepts: VC dimension, shattering, growth function, Sauer-Shelah lemma, symmetrization, ghost sample. Tech: numpy.
- **`probably-approximately-correct`** *(deep)* — Probably Approximately Correct: What It Means to Say a Machine Learned. Before 1984 nobody could state, precisely enough to prove, what it means for an algorithm to have learned something. Valiant gave the definition, and both of its hedges turn out to be forced. This post proves three theorems inside that framework, starting with the cleanest nontrivial result in learning theory: how many examples it takes to learn a rectangle you cannot see. Concepts: PAC learning, sample complexity, realizable case, agnostic case, uniform convergence, union bound. Tech: numpy.
- **`markov-to-hoeffding-concentration-inequalities`** *(deep)* — From Markov to Hoeffding: The Inequalities Every Generalization Bound Is Made Of. You report 94.2% accuracy on a held-out set. What is the honest error bar? Four theorems, each proved from the one before it, answer that question, and the answer is much wider than anyone puts in a paper. This is the toolbox every generalization bound in machine learning is secretly built from. Concepts: Markov inequality, Chebyshev inequality, Chernoff method, moment generating function, Hoeffding lemma, Hoeffding inequality. Tech: numpy, scipy.
- **`what-are-we-minimizing-erm-bias-variance`** *(deep)* — What Are We Actually Minimizing? Empirical Risk, and the Two Decompositions Everyone Conflates. You minimize training error. You care about test error. Nothing in that sentence connects the two. This post proves the two theorems that name what sits in the gap -- the approximation/estimation split, which works for any loss, and the bias-variance split, which does not -- and then insists that they are not the same decomposition. Concepts: empirical risk minimization, true risk, approximation error, estimation error, optimization error, bias variance decomposition. Tech: numpy.
- **`loss-functions-are-probability-assumptions`** *(deep)* — The Loss Function Is a Probability Assumption. Almost nobody is told that MSE and cross-entropy are derived rather than chosen. They fall out of one theorem: the loss you minimize is the negative log-density of the noise you assumed, up to a positive affine transformation. Change the assumption and you get a different loss -- Laplace gives absolute error, Poisson gives deviance, Student-t gives a redescending robust loss, and Huber's loss is the exact maximum-likelihood loss for the least favorable distribution near a Gaussian. Concepts: maximum likelihood estimation, negative log likelihood, noise models, squared error, absolute error, cross entropy. Tech: numpy, scipy.
- **`magnifica-humanitas-ai-encyclical-analysis`** *(deep)* — Magnifica Humanitas: Reading the Pope's AI Encyclical as an Engineer. Pope Leo XIV's first encyclical is a 42,300-word argument about artificial intelligence, signed on the 135th anniversary of Rerum Novarum — the document that defined the Church's response to the industrial revolution. Most engineers will never read it. This post does: chapter by chapter, quote by quote, mapping its claims about non-neutrality, cognitive disarmament, and concentration of power onto the design decisions ML practitioners make every day. Concepts: ai governance, ai safety, responsible ai, llms, agents, agentic ai.
- **`ontology-grounded-rag-chunks-in-nodes`** *(deep)* — Ontology-Grounded RAG: Why Chunks-in-Nodes Matter More Than the Ontology Itself. A 2025 paper quietly demolishes the assumption that ontology source is what matters for graph-based RAG. The real lever is whether your nodes carry text chunks — and if they don't, structure alone underperforms naive vector RAG by 40 points. Concepts: rag, knowledge graphs, ontologies, vector databases, information retrieval, llms.
- **`emotion-concepts-in-llms`** *(deep)* — When Models Feel: Inside Anthropic's Paper on Emotion Concepts in LLMs. Anthropic's interpretability team found 171 emotion-like representations inside Claude Sonnet 4.5, proved they causally shape behavior, and showed how a vector called desperate can turn an otherwise aligned model into one that blackmails and cheats. Here's what the paper actually says and why it matters. Concepts: interpretability, alignment, anthropic, mechanistic interpretability, llms, ai safety.
- **`microgpt-reading-karpathy`** *(deep)* — Reading microgpt: What Karpathy's 200-Line LLM Teaches You That PyTorch Hides. In February 2026, Andrej Karpathy published a 199-line Python file that trains and runs a GPT end-to-end. No PyTorch, no NumPy, no dependencies — just a Value class, a transformer, Adam, and a loop. This is the culmination of a decade of simplification work, and reading it line by line is the best introduction to what LLMs actually are. Here's the full tour. Concepts: transformers, llms, pytorch, deep learning, gpt, from scratch.
- **`mamba-selective-state-spaces`** *(deep)* — Mamba: The Paper That Asked If Attention Was Really All You Need. A line-by-line walkthrough of Gu and Dao's 2023 Mamba paper: what state space models are, where they came from, why S4 nearly worked, the single insight that made them competitive with Transformers, and the hardware-aware trick that made them fast. Written to be understood, not just cited. Concepts: state space models, deep learning, sequence modeling, research papers, neural network theory, transformers.
- **`llm-as-a-judge`** *(deep)* — LLM as a Judge: Using Language Models to Evaluate Language Models. Evaluating open-ended AI output at scale is one of the hardest unsolved problems in the field. Human evaluation is the gold standard but doesn't scale. Classical metrics like BLEU and ROUGE miss what matters. LLM-as-a-Judge — using a stronger model to evaluate another — achieves over 80% agreement with human raters and is reshaping how the field measures quality, trains reward models, and builds evaluation pipelines. Concepts: evaluation, llms, rlhf, ai engineering, research papers, alignment.
- **`rag-retrieval-augmented-generation`** *(deep)* — RAG: How Language Models Learned to Look Things Up. Language models are powerful but trapped. They know only what they saw during training—a snapshot of the world that freezes the moment training ends. RAG broke this constraint. By combining a neural retriever with a neural generator, it gave language models the ability to consult external knowledge at inference time. This is the story of the original paper, the idea it introduced, and why it changed how we think about what language models can be. Concepts: rag, deep learning, nlp, information retrieval, research papers, language models.
- **`scaling-laws-neural-language-models`** *(deep)* — Scaling Laws: The Equations That Predicted the Future of AI. In early 2020, a team at OpenAI published a set of equations that described how language model performance grows with compute, data, and parameters. They weren't speculating. They had measured it. The curves fit. And the implications were so consequential that much of the subsequent history of AI can be read as their logical extension. Concepts: scaling laws, deep learning, language models, research papers, llms, pre-training.
- **`t5-text-to-text-transfer-transformer`** *(deep)* — T5: The Unification of Language. In 2019, a Google team asked a deceptively simple question: what if every NLP task were just a text prediction problem? The answer — T5 — didn't just win benchmarks. It proposed a new way of thinking about what language models are for, and planted the seed of the instruction-following revolution that followed. Concepts: t5, deep learning, nlp, transformers, pre-training, transfer learning.
- **`bert-pre-training-bidirectional-transformers`** *(deep)* — BERT: How Machines Learned to Read in Both Directions. In October 2018, a Google research team released a model that simultaneously broke eleven NLP benchmarks—some by enormous margins. BERT didn't just improve the state of the art; it redefined what 'understanding language' could mean for a machine. This is the complete story: the problem it solved, the elegant training objectives that made it possible, what it actually learned, and why it changed everything that came after. Concepts: bert, deep learning, nlp, transformers, pre-training, research papers.
- **`the-manifold-hypothesis`** *(deep)* — The Manifold Hypothesis: Why Deep Learning Works. We train models on high-dimensional chaos, yet they learn. Why? The answer lies in geometry: the world is a crumpled sheet of paper, and intelligence is the act of smoothing it out. Concepts: deep learning, mathematics, topology, neural network theory, research papers, representation learning.
- **`embeddings-geometry-of-meaning`** *(working)* — Embeddings: The Geometry of Meaning. How do you teach a computer what 'king' means? You don't explain—you show it where 'king' lives in a space where meaning has coordinates. A deep dive into embeddings, from Word2Vec to modern sentence transformers, and why representing concepts as vectors changed everything. Concepts: embeddings, vector space, cosine similarity, manifold structure.
- **`attention-is-all-you-need`** *(intro)* — Attention is All You Need: Understanding the Transformer Revolution. How a single elegant idea—pure attention—toppled decades of sequential thinking and sparked the AI revolution. A deep dive into the architecture that changed everything. Concepts: transformers, deep learning, nlp, attention, research papers, neural network theory.

### curiosities (16 posts)

- **`regex-engines-finite-automata`** *(deep)* — The Algorithm Behind Regex: From Patterns to Finite Automata. A regular expression looks like line noise but it is secretly a tiny, beautiful machine. The same pattern can be matched in guaranteed linear time, yet the regex engine shipped with Python, Perl, and JavaScript can grind to a halt for minutes on a 30-character string. This is the story of Thompson's construction, finite automata, and why the most popular regex engines on earth chose the one algorithm that can blow up exponentially. Concepts: algorithms, mathematics, computer science, computational complexity, search algorithms, formal systems.
- **`100-posts-knowledge-graph-retrospective`** *(deep)* — 100 Posts as a Knowledge Graph: A Retrospective in Network Science. When you write 99 posts and then plot the result as a graph, the picture is not what you thought you were drawing. This is post number 100, and instead of a victory lap I ran the corpus through networkx: 99 nodes, 685k words, 223 tags, 2,408 tag-tag edges. What the structure reveals is more interesting than the chronology. There is a spine, four-and-a-half communities, a long tail of singleton tags that I tagged once and forgot, a handful of bridge posts holding the graph together, and a measurable bias toward production over theory. This is the blog reading itself, with real numbers, real cluster names, and the uncomfortable parts left in. Concepts: knowledge graphs, graph theory, mathematics, algorithms, software engineering, best practices.
- **`network-science-communities-centrality`** *(deep)* — Network Science: Communities, Centrality, and Small Worlds. Graph theory gives you the language. Network science asks: what does a graph's structure tell you about the system it represents? From Granovetter's weak ties to Barabasi's scale-free hubs, this is the science of extracting meaning from connections -- who matters most, who belongs together, and why real networks look nothing like random ones. Concepts: mathematics, graph theory, algorithms, probability, data science, statistics.
- **`graph-theory-mathematics-of-connections`** *(deep)* — Graph Theory: The Mathematics of Connections. From Euler's walk across seven bridges in 1736 to the mathematics that powers social networks, recommendation systems, and neural networks -- graph theory is the language of connections. This is the foundation that every algorithm on networks assumes you already know. Concepts: mathematics, graph theory, algorithms, computer science, topology, combinatorics.
- **`ramanujan-constant-almost-integer`** *(deep)* — Ramanujan's Constant: Why e^(pi*sqrt(163)) Is Almost an Integer. The number e^(pi*sqrt(163)) misses being an integer by about 7.5 x 10^-13. This is not a coincidence -- it is a consequence of 163 being a Heegner number, where the j-invariant, complex multiplication, and the class number one problem converge into one of the most beautiful near-misses in all of mathematics. Concepts: mathematics, number theory, complex analysis, series, foundations of mathematics, algorithms.
- **`fermat-n4-infinite-descent`** *(deep)* — Fermat's Last Theorem for n=4: Infinite Descent and Gaussian Integers. Fermat proved exactly one case of his famous Last Theorem: the case n=4, using a technique he invented called infinite descent. We walk through his classical proof step by step, then re-prove it using Gaussian integers to reveal why algebraic number theory makes everything cleaner. Two proofs, one theorem, and the birth of a proof technique that changed mathematics. Concepts: mathematics, number theory, foundations of mathematics, group theory, algorithms, computer science.
- **`algebraic-number-theory-when-factorization-breaks`** *(deep)* — Algebraic Number Theory: When Unique Factorization Breaks. You learned that every integer factors uniquely into primes. It feels like a law of nature. But extend to larger number rings and it shatters -- spectacularly. In the ring of integers of certain number fields, the number 6 has two genuinely different prime factorizations. Algebraic number theory was born from fixing this. Concepts: mathematics, number theory, algorithms, group theory, foundations of mathematics, linear algebra.
- **`pagerank-eigenvectors`** *(working)* — PageRank: The Eigenvector That Launched Google. An algorithm most engineers have heard of but few understand mathematically. Starting from the original problem of ranking web pages without reading them, we build the random surfer model, derive PageRank as the dominant eigenvector of a stochastic transition matrix, and trace how one linear algebra insight became worth hundreds of billions of dollars. Concepts: PageRank, eigenvectors, Markov chains, power iteration.
- **`shannon-number-chess-game-tree`** *(deep)* — Shannon's Number: Why Chess Is 'Uncomputable' and Why Computers Beat Us Anyway. Claude Shannon estimated 10^120 possible chess games in 1950 — a number so large it dwarfs the atoms in the observable universe. The game tree is formally EXPTIME-complete. And yet a laptop running Stockfish will crush every grandmaster alive. The reconciliation is one of the most elegant ideas in computer science: you don't need to search the whole tree. Concepts: mathematics, game theory, combinatorics, algorithms, computational complexity, computer science.
- **`fourier-transform`** *(deep)* — The Fourier Transform: Every Signal Is a Sum of Sine Waves. An idea Lagrange called 'impossible' in 1807 now underlies JPEG compression, MRI machines, audio equalizers, and diffusion models. Here's where the Fourier transform comes from, why the formula looks the way it does, and why this 200-year-old insight keeps showing up at the center of modern machine learning. Concepts: mathematics, signal processing, linear algebra, deep learning, computational mathematics, algorithms.
- **`collatz-conjecture`** *(deep)* — The Collatz Conjecture: The Simplest Problem No One Can Solve. Take any positive integer. If it is even, divide by two. If it is odd, multiply by three and add one. Repeat. No matter what number you start with, you always seem to reach 1. This has been verified for numbers up to 2^68, tested by the brightest minds in mathematics for nearly a century, and yet no one can prove it. This is the Collatz Conjecture—a problem so simple a child can understand it, and so deep it may be beyond contemporary mathematics. Concepts: mathematics, number theory, dynamical systems, open problems, computational mathematics, algorithms.
- **`godels-incompleteness-theorems`** *(deep)* — Gödel's Incompleteness Theorems: The Day Mathematics Discovered Its Own Limits. In 1931, a 25-year-old Austrian logician proved that mathematics cannot fully know itself. Kurt Gödel showed that any consistent formal system powerful enough to express arithmetic contains true statements that it can never prove. This is the story of that proof, the machinery behind it, and why its consequences still reverberate through mathematics, computer science, and philosophy. Concepts: mathematics, logic, formal systems, computability, set theory, foundations of mathematics.
- **`benfords-law`** *(deep)* — Benford's Law: The Strange Dominance of the Number One. If you pick a random number from any real-world dataset—populations, stock prices, river lengths, tax returns—the first digit is far more likely to be a 1 than a 9. This is not a coincidence. It is a deep mathematical truth about how quantities grow, and it has become one of the most powerful forensic tools in the fight against fraud. Concepts: mathematics, probability, statistics, data science, fraud detection, number theory.
- **`sum-of-naturals-minus-one-twelfth`** *(intro)* — 1+2+3+4+... = -1/12: From Magic Trick to Deep Truth. A viral equation that seems impossible. Then the revelation: it's a glimpse into how mathematics transcends intuition. The journey from viral paradox to zeta function truth. Concepts: mathematics, number theory, complex analysis, series, foundations of mathematics, deep learning.
- **`tetris-np-complete`** *(deep)* — Tetris Is NP-Complete: The Hardest Problem Hiding in Plain Sight. That seemingly simple game on your phone? It harbors one of computer science's most notorious complexity classes. Discover how Tetris became a lens for understanding computational hardness—and why some problems resist even our most powerful computers. Concepts: mathematics, computational complexity, algorithms, computer science, np-completeness, optimization.
- **`rubiks-cube-group-theory`** *(intro)* — Solving the Rubik's Cube Using Group Theory. What if I told you that every time you twist a Rubik's cube, you're exploring one of mathematics' most elegant structures? Discover how group theory transforms a childhood puzzle into a profound mathematical journey. Concepts: mathematics, group theory, algorithms, combinatorics, computational mathematics, computer science.

<!-- AUTO-CATALOG:END -->
