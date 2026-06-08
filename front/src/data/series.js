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
