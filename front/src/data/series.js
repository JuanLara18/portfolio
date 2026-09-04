// Curated narrative reading series for the blog.
//
// Each entry is an ordered arc of posts that build on one another.
// This is the single source of truth for the /blog/series page. Membership and
// order are curated here (rather than per-post frontmatter) so the reading order
// is explicit and easy to fix when an arc's prose numbering is inconsistent.
//
// `posts` are post slugs. The category is resolved at render time by joining
// against blogData.json, so only the slug is needed here. Slugs that no longer
// exist are dropped defensively by getSeriesWithPosts() in blogUtils.js.
//
// Posts may appear in more than one series — series are reading *paths*, not
// partitions.

export const SERIES = [
  // ── ML & Deep Learning ────────────────────────────────────────────────
  {
    id: 'foundations-of-ml',
    title: 'Machine Learning from First Principles',
    description:
      'Everything you need before touching an LLM: the full ML stack from Python and ' +
      'libraries to hardware, models, evaluation, experiment tracking, and a certification ' +
      'review as capstone.',
    posts: [
      'python-beyond-the-basics',
      'structuring-ml-projects',
      'ml-libraries-under-the-hood',
      'computational-resources-ml',
      'working-with-ml-models',
      'ml-metrics-evaluation-monitoring',
      'experiment-tracking-mlops',
      'ml-cert-review-part-1-foundations',
      'ml-cert-review-part-2-deep-learning-and-beyond',
    ],
  },
  {
    id: 'deep-learning-architectures',
    title: 'Deep Learning Architectures: The Papers That Shaped the Field',
    description:
      'The papers and architectures that changed everything, read closely: from the ' +
      'manifold hypothesis and embeddings through scaling laws, Transformers, BERT, T5, ' +
      'building GPT from scratch with Karpathy, to the Mamba alternative.',
    posts: [
      'the-manifold-hypothesis',
      'embeddings-geometry-of-meaning',
      'scaling-laws-neural-language-models',
      'attention-is-all-you-need',
      'bert-pre-training-bidirectional-transformers',
      't5-text-to-text-transfer-transformer',
      'microgpt-reading-karpathy',
      'mamba-selective-state-spaces',
    ],
  },
  {
    id: 'reinforcement-learning',
    title: 'Reinforcement Learning: Theory to Implementation',
    description:
      'RL from first principles to running code on GPUs: theory, algorithm taxonomy, ' +
      'PyTorch implementation, and the bridge to LLM alignment via RLHF and DPO.',
    posts: [
      'reinforcement-learning-first-principles',
      'rl-algorithm-taxonomy-tour',
      'reinforcement-learning-in-practice',
      'rlhf-dpo-alignment',
    ],
  },

  // ── RAG & Retrieval ───────────────────────────────────────────────────
  {
    id: 'production-rag',
    title: 'RAG: From Paper to Production',
    description:
      'The full arc of retrieval-augmented generation: the core idea, building a real ' +
      'pipeline, the advanced patterns that survive production, grounding retrieval in ' +
      'ontologies, intelligent query routing, LLM caching, and evaluating the whole thing.',
    posts: [
      'rag-retrieval-augmented-generation',
      'rag-building-production-systems',
      'rag-advanced-patterns',
      'ontology-grounded-rag-chunks-in-nodes',
      'query-routing-agent-decisions',
      'llm-caching-four-layers',
      'ragas-evaluating-rag',
    ],
  },
  {
    id: 'embeddings-and-retrieval',
    title: 'Embeddings & Vector Search: The Retrieval Stack',
    description:
      'Everything between the text and the vector that reaches the model: what embeddings ' +
      'are, how to fine-tune them, the multimodal frontier, benchmarks, where to store them, ' +
      'and how documents enter the pipeline.',
    posts: [
      'embeddings-geometry-of-meaning',
      'fine-tuning-embeddings',
      'multimodal-embeddings-metric-problem',
      'mteb-embedding-benchmarks',
      'vector-databases-indexes-to-vertex-search',
      'vector-db-benchmarks',
      'document-processing-ocr-layout',
    ],
  },

  // ── Knowledge Engineering ─────────────────────────────────────────────
  {
    id: 'ontology-engineering',
    title: 'Ontology Engineering, End to End',
    description:
      'Building knowledge graphs the disciplined way: foundations, separating schema from ' +
      'facts, keeping the model modular, shipping it on GCP, grounding RAG in it, populating ' +
      'it from real documents with LLMs, and turning the ontology into an agent toolbox.',
    posts: [
      'ontologies-building-knowledge-bases',
      'tbox-abox-schema-facts-distinction',
      'modular-ontologies-core-domains-pattern',
      'ontology-production-pipeline-gcp',
      'ontology-grounded-rag-chunks-in-nodes',
      'populating-knowledge-graph-llms-banking',
      'ontology-to-agent-toolbox',
    ],
  },
  {
    id: 'knowledge-systems',
    title: 'The Knowledge Stack: From Data Governance to Agent-Ready Knowledge',
    description:
      'The complete path from raw data to knowledge an agent can use: breaking silos, ' +
      'data governance, knowledge graphs in practice, enterprise knowledge bases, curation, ' +
      'defining the stack, knowledge as a product, and measuring semantic overlap.',
    posts: [
      'data-silos-breaking-information-barriers',
      'dama-dmbok-data-governance',
      'knowledge-graphs-practice',
      'enterprise-knowledge-bases',
      'knowledge-base-curation',
      'defining-the-knowledge-stack',
      'knowledge-as-a-product',
      'comparing-knowledge-bases-semantic-overlap',
    ],
  },

  // ── Graph Engineering ─────────────────────────────────────────────────
  {
    id: 'graph-engineering',
    title: 'Graph Engineering: From Engine Internals to Analytics at Scale',
    description:
      'Graphs as infrastructure: how a graph engine stores and traverses data, the new ' +
      'GQL query standard, choosing an engine in 2026, the GDS execution model, centrality ' +
      'and community detection, node embeddings, graph neural networks, and a full fraud ' +
      'detection pipeline.',
    posts: [
      'graph-engine-internals-index-free-adjacency',
      'gql-standard-cypher-sqlpgq',
      'choosing-a-graph-engine-2026',
      'graph-analytics-gds-execution-model',
      'centrality-communities-in-practice',
      'node-embeddings-fastrp-node2vec-graphsage',
      'graph-neural-networks-learning-structured-data',
      'graph-fraud-detection-rings-synthetic-identity',
    ],
  },
  {
    id: 'graph-layer-for-agents',
    title: 'The Graph Layer for Agents',
    description:
      'A five-part series on why grep and embeddings stop being enough for coding agents: ' +
      'building a repo into a code graph, querying it for blast radius and localization, ' +
      'giving agents a temporal graph memory, and shipping the whole layer in production.',
    posts: [
      'agent-graph-layer-why-grep-embeddings-fell-short',
      'repo-to-graph-ast-vs-llm-extraction',
      'querying-code-graphs-blast-radius-localization',
      'graph-memory-temporal-agents-graphiti-cognee',
      'graph-layer-in-production-mcp-build-vs-buy',
    ],
  },

  // ── Agentic AI ────────────────────────────────────────────────────────
  {
    id: 'agentic-ai-foundations',
    title: 'Agentic AI Engineering, End to End',
    description:
      'Building, operating, and governing production agents: how LLMs become agents, ' +
      'architecture and orchestration, productive patterns, memory and retrieval, the ' +
      'integration protocols that connect them, the engineering disciplines underneath, ' +
      'operating them at scale, and the enterprise shield of governance and business value.',
    posts: [
      'foundations-of-agentic-ai-llms-to-agents',
      'agent-architecture-and-orchestration',
      'agent-architectures-productive-patterns',
      'agent-memory-and-retrieval-embeddings-to-rag',
      'agent-integration-protocols-mcp-and-a2a',
      'agent-engineering-disciplines',
      'operating-agents-eval-observability-scale',
      'enterprise-agents-governance-security-business',
    ],
  },
  {
    id: 'agent-platform',
    title: 'The Agent Platform: Building the Runtime Layer',
    description:
      'Control plane, runtime, sandbox, tool plane, golden paths. The five layers of ' +
      'infrastructure that production agents need, from resource provisioning to multi-tenancy.',
    posts: [
      'agent-platform-control-plane-data-plane',
      'agent-runtime-sessions-state-topology',
      'sandboxing-agents-microvm-gvisor',
      'mcp-registry-gateway-tool-plane',
      'agent-golden-paths-multi-tenancy',
    ],
  },
  {
    id: 'agent-security-finops',
    title: 'Securing and Financing AI Agents',
    description:
      'Identity, security, guardrails, governance, and the real economics of operating ' +
      'agents: from field-guide guardrails and OAuth/MCP identity to bank-grade IAM, ' +
      'enterprise lifecycle governance, and FinOps token economics.',
    posts: [
      'agent-guardrails-field-guide',
      'agent-authentication-oauth-mcp-identity',
      'bank-grade-agent-security-iam-gateways',
      'enterprise-agent-governance-lifecycle',
      'finops-llm-agents-token-economics',
    ],
  },
  {
    id: 'adk-in-depth',
    title: 'Google ADK in Depth',
    description:
      'The Agent Development Kit end to end, from the four-pillar mental model to the ' +
      'graph-based Workflow Runtime that landed in ADK 2.0: deterministic orchestration, ' +
      'the breaking changes worth planning for, debugging the flow errors that never raise, ' +
      'why the framework is shaped the way it is, ' +
      'and engineering durable memory on top of the Gemini Enterprise Agent Platform.',
    posts: [
      'google-adk-agent-development-deep-dive',
      'adk-graph-workflows-deterministic-orchestration',
      'migrating-adk-1x-to-2x',
      'debugging-adk-agent-flows',
      'adk-advanced-evolution-of-agent-engineering',
      'enterprise-agent-memory-continuity-adk-geap',
    ],
  },
  {
    id: 'agent-tooling-ecosystem',
    title: 'The Agent Tooling Landscape: Frameworks, Platforms, and Build-vs-Buy',
    description:
      'The real ecosystem: LangGraph workflows, open-source agent composition, the ' +
      'build-vs-fork-vs-adopt decision, and a head-to-head comparison of self-hosted agent ' +
      'platforms. Google ADK gets its own arc in Google ADK in Depth.',
    posts: [
      'google-adk-agent-development-deep-dive',
      'langgraph-multi-agent-workflows',
      'dont-reinvent-the-agent-open-source-composition',
      'agent-harness-build-fork-adopt-yc-qm',
      'openclaw-anatomy-viral-agent-platform',
      'hermes-self-improving-agent-persistent-memory',
      'openclaw-vs-hermes-self-hosted-agent-comparison',
    ],
  },
  {
    id: 'mcp-in-depth',
    title: 'Model Context Protocol: From Concept to Enterprise',
    description:
      'MCP end to end: the protocol itself, running it in production, building a real ' +
      'MCP server (NL-to-PowerBI), and the registry and gateway that scale it.',
    posts: [
      'model-context-protocol',
      'mcp-production-enterprise',
      'mcp-server-nl-to-powerbi-dashboard',
      'mcp-registry-gateway-tool-plane',
    ],
  },

  // ── Data Engineering ──────────────────────────────────────────────────
  {
    id: 'data-engineering-stack',
    title: 'The Modern Data Engineering Stack',
    description:
      'From fundamentals to the full modern stack: query tools, dimensional modeling, ' +
      'lakehouse architecture, Spark, Airflow orchestration, dbt transformations, and ' +
      'the LookML semantic layer.',
    posts: [
      'data-engineering-fundamentals',
      'sql-pandas-pyspark-duckdb',
      'dimensional-modeling-kimball',
      'lakehouse-architecture',
      'apache-spark-ecosystem-guide',
      'apache-airflow-orchestration',
      'dbt-analytics-engineering',
      'lookml-semantic-layer-data-modeling',
    ],
  },

  // ── Google Cloud for AI ───────────────────────────────────────────────
  {
    id: 'google-cloud-for-ai',
    title: 'Google Cloud for AI: Vertex, Knowledge Catalog, and the Agent Stack',
    description:
      'The GCP AI platform from infrastructure to agent-native services: Vertex AI, the ' +
      'GCP AI stack with AlloyDB, what Google launched at Cloud Next 2026, the Gemini ' +
      'Enterprise and Knowledge Catalog primitives, the hands-on workshop, and how the ' +
      'Catalog and ontologies fit together.',
    posts: [
      'vertex-ai-gcp-ml-platform-cli',
      'gcp-ai-stack-vertex-alloydb-knowledge-pipeline',
      'google-cloud-next-2026-agent-native-stack',
      'gemini-enterprise-knowledge-catalog-deep-dive',
      'gemini-knowledge-catalog-workshop',
      'knowledge-catalog-vs-ontologies',
    ],
  },

  // ── DevOps & Infrastructure ───────────────────────────────────────────
  {
    id: 'devops-infra-for-ml',
    title: 'DevOps & Infrastructure for ML Engineers',
    description:
      'The infrastructure toolkit every ML engineer needs: shell, version control, ' +
      'containers, orchestration, infrastructure as code, networking, and dev environments.',
    posts: [
      'bash-daily-driver-ml-engineer',
      'git-and-github-complete-guide',
      'docker-for-ml-engineers',
      'kubernetes-minimum-subset-ml',
      'terraform-infrastructure-as-code',
      'network-fundamentals-every-concept',
      'dev-environments-for-ai-teams',
    ],
  },

  // ── Software Engineering Judgment ─────────────────────────────────────
  {
    id: 'senior-judgment-ai-era',
    title: 'Senior Engineering Judgment in the AI Era',
    description:
      'What stays scarce when an AI can generate the code in seconds: infrastructure and ' +
      'failure domains, data modeling that outlives the app, API contracts, the distributed-' +
      'systems theory an AI will quietly violate, and architecture as a product discipline.',
    posts: [
      'senior-infrastructure-distributed-systems-failure-networking',
      'senior-data-modeling-query-patterns-database-design',
      'senior-api-design-contracts-versioning-dx',
      'senior-distributed-theory-cap-pacelc-tradeoffs',
      'senior-product-engineering-scale-prioritization-architecture',
    ],
  },

  // ── Mathematical Curiosities ──────────────────────────────────────────
  {
    id: 'why-learning-works',
    title: 'Why Learning Works: The Theorems Behind Machine Learning',
    description:
      'The proofs under the practice, in order: where the loss function comes from, what ' +
      'you are actually minimizing, the concentration inequalities every generalization ' +
      'bound is built from, PAC learning and VC dimension, why no model escapes its own ' +
      'assumptions, and the theorems behind regularization, kernels, boosting, spectral ' +
      'methods, EM and the Bellman operator.',
    posts: [
      'loss-functions-are-probability-assumptions',
      'what-are-we-minimizing-erm-bias-variance',
      'markov-to-hoeffding-concentration-inequalities',
      'probably-approximately-correct',
      'vc-dimension-sauer-shelah',
      'no-free-lunch-theorem',
      'penalizing-is-constraining',
      'kernel-trick-representer-theorem',
      'weak-learnability-equals-strong',
      'one-eigendecomposition-four-algorithms',
      'em-never-goes-down',
      'bellman-operator-is-a-contraction',
      'universal-approximation-and-what-it-does-not-give-you',
      'backprop-is-reverse-mode-differentiation',
      'double-descent',
    ],
  },

  {
    id: 'algebraic-number-theory',
    title: 'When Factorization Breaks: An Algebraic Number Theory Thread',
    description:
      'A three-part mathematical journey: how unique factorization fails, Fermat for ' +
      'n=4 by infinite descent, and the almost-integer mystery of the Ramanujan constant.',
    posts: [
      'algebraic-number-theory-when-factorization-breaks',
      'fermat-n4-infinite-descent',
      'ramanujan-constant-almost-integer',
    ],
  },
  {
    id: 'mathematical-curiosities',
    title: 'Mathematics & Computer Science Curiosities',
    description:
      'Where math meets computation: graph theory and network science, PageRank and ' +
      'eigenvectors, the Fourier transform, regex engines as finite automata, why Tetris ' +
      'is NP-complete, and the game tree behind chess.',
    posts: [
      'graph-theory-mathematics-of-connections',
      'network-science-communities-centrality',
      'pagerank-eigenvectors',
      'fourier-transform',
      'regex-engines-finite-automata',
      'tetris-np-complete',
      'shannon-number-chess-game-tree',
    ],
  },
];

export default SERIES;
