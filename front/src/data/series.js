// Curated narrative reading series for the blog.
//
// Each entry is an ordered arc of posts that build on one another ("Part 1/2/3").
// This is the single source of truth for the /blog/series page. Membership and
// order are curated here (rather than per-post frontmatter) so the reading order
// is explicit and easy to fix when an arc's prose numbering is inconsistent.
//
// `posts` are post slugs. The category is resolved at render time by joining
// against blogData.json, so only the slug is needed here. Slugs that no longer
// exist are dropped defensively by getSeriesWithPosts() in blogUtils.js.

export const SERIES = [
  {
    id: 'agentic-ai-engineering',
    title: 'Agentic AI Engineering, end to end',
    description:
      'A six-part path through building production agents: how LLMs actually think, ' +
      'architecture and orchestration, memory and retrieval, the integration protocols ' +
      'that connect them, operating them at scale, and the enterprise shield of ' +
      'governance, security, and business value.',
    posts: [
      'foundations-of-agentic-ai-llms-to-agents',
      'agent-architecture-and-orchestration',
      'agent-memory-and-retrieval-embeddings-to-rag',
      'agent-integration-protocols-mcp-and-a2a',
      'operating-agents-eval-observability-scale',
      'enterprise-agents-governance-security-business',
    ],
  },
  {
    id: 'production-rag',
    title: 'RAG, from foundations to production',
    description:
      'The full arc of retrieval-augmented generation: the core idea, building a real pipeline, the advanced patterns that survive production, and how to evaluate the whole thing.',
    posts: [
      'rag-retrieval-augmented-generation',
      'rag-building-production-systems',
      'rag-advanced-patterns',
      'ragas-evaluating-rag',
    ],
  },
  {
    id: 'ontology-engineering',
    title: 'Ontology engineering, end to end',
    description:
      'Building knowledge graphs the disciplined way: separating schema from facts, keeping the model modular, shipping it on GCP, grounding RAG in it, and populating it from real documents with LLMs.',
    posts: [
      'tbox-abox-schema-facts-distinction',
      'modular-ontologies-core-domains-pattern',
      'ontology-production-pipeline-gcp',
      'ontology-grounded-rag-chunks-in-nodes',
      'populating-knowledge-graph-llms-banking',
    ],
  },
  {
    id: 'knowledge-catalog-arc',
    title: 'The agent-native knowledge stack',
    description:
      'A four-part arc on the modern agentic data layer: the guardrails every production agent needs, what Google launched at Cloud Next 2026, the Gemini Enterprise and Knowledge Catalog primitives, and how the Catalog and ontologies fit together.',
    posts: [
      'agent-guardrails-field-guide',
      'google-cloud-next-2026-agent-native-stack',
      'gemini-enterprise-knowledge-catalog-deep-dive',
      'knowledge-catalog-vs-ontologies',
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
  {
    id: 'senior-judgment-ai-era',
    title: 'Senior engineering judgment in the AI era',
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
  {
    id: 'ml-cert-review',
    title: 'ML certification review',
    description:
      'A two-part tour through the machine learning foundations and the deep learning material worth knowing, framed as a focused certification review.',
    posts: [
      'ml-cert-review-part-1-foundations',
      'ml-cert-review-part-2-deep-learning-and-beyond',
    ],
  },
  {
    id: 'algebraic-number-theory',
    title: 'When factorization breaks: an algebraic number theory thread',
    description:
      'A three-part mathematical journey: how unique factorization fails, Fermat for n=4 by infinite descent, and the almost-integer mystery of the Ramanujan constant.',
    posts: [
      'algebraic-number-theory-when-factorization-breaks',
      'fermat-n4-infinite-descent',
      'ramanujan-constant-almost-integer',
    ],
  },
];

export default SERIES;
