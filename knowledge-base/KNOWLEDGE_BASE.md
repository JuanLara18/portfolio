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
5. ontology-to-agent-toolbox

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

### Graph theory thread (curiosity → applied)
1. graph-theory-mathematics-of-connections
2. network-science-communities-centrality
3. pagerank-eigenvectors
4. graph-neural-networks-learning-structured-data

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
- **Neo4j / graph DBs**: knowledge-graphs-practice, ontology-to-agent-toolbox
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
```

<!-- AUTO-CATALOG:START - regenerated by build-knowledge-base.js, do not edit by hand -->

## Full Post Catalog

Auto-generated index of every post by category, sorted most recent first. Use this when you need a complete inventory of what the blog covers — for example, when loaded as Claude Project knowledge and you cannot query `posts.json`.

### field-notes (64 posts)

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

### research (12 posts)

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

### curiosities (14 posts)

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
