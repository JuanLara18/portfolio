// Canonical brand constants for the verbal layer of the personal brand.
// Mirror of BRAND.md (repo root). Update both in the same commit.
//
// Locked: 2026-05-01. Hierarchy: Engineering 70% / Applied Research 25% / Foundations 5%.
// Voice: formal B2B, deeply technical, Apple-style cadence — sentences as headlines,
// periods as rhythm, every word earns its place.

// Two sentences, one per line in hero rendering. Period cadence,
// no hyphens. Apple-style ("Pro. Beyond." / "Think different.").
// In prose contexts (bios), use the comma form: "Frontier AI, engineered for production."
export const TAGLINE = "Frontier AI. Engineered for production.";

// Sub-tagline. Different vocabulary so it adds claim instead of repeating.
export const SUB_TAGLINE = "From research to enterprise scale.";

export const ROLE = "Senior AI Engineer";

export const STRAP_LINE = "Senior AI Engineer · Production AI · Knowledge Systems";

// Short bio. For Twitter/X, GitHub header, talk speaker tagline. ~30 words.
export const BIO_50 =
  "Senior AI Engineer. Frontier AI, engineered for production. " +
  "Five years across banking, retail logistics, healthcare AI, and academic research. " +
  "Currently at Davivienda. Previously: Falabella, GenomAI, Harvard.";

// Medium bio. For LinkedIn short form, conference speaker bio.
export const BIO_100 =
  "Senior AI Engineer. Frontier AI, engineered for production at enterprise scale.\n\n" +
  "Five years across regulated industries: banking, retail logistics, healthcare AI, " +
  "academic research at Harvard. Currently Knowledge Data Engineer for the AI-First " +
  "initiative at Davivienda, building the data and knowledge platforms behind " +
  "production AI inside a financial institution.\n\n" +
  "My focus is what production demands that papers omit. Scale. Governance. " +
  "Evaluation. The engineering decisions between a working prototype and a system " +
  "you can run.";

// Long bio. For /about, full LinkedIn About, full conference bio.
export const BIO_200 =
  "Senior AI Engineer. Frontier AI, engineered for production at enterprise scale.\n\n" +
  "Five years building production AI across banking, retail logistics, healthcare AI, " +
  "and academic research. Currently Knowledge Data Engineer for the AI-First " +
  "initiative at Davivienda. Previously at Falabella, GenomAI, and Harvard University.\n\n" +
  "My focus is the engineering layer between frontier ML research and enterprise " +
  "systems. RAG and retrieval platforms. Agentic architectures. Knowledge-grounded " +
  "LLM applications. The data foundations that make them reliable.\n\n" +
  "Three things meet in my work. Deep familiarity with the latest research. The " +
  "engineering rigor required to ship under regulated and high-scale constraints. " +
  "The architectural taste to know which abstractions survive contact with production. " +
  "I write about all of it on my blog.\n\n" +
  "Computer Science + Mathematics dual degree, 4.7/5.0. M.Sc. in Artificial " +
  "Intelligence in progress at Universidad de los Andes. Open to talks, technical " +
  "engagements, and collaborations at the production-AI frontier.";

// Hero body. List-of-three then context. Apple period cadence, no em-dashes.
export const HERO_BODY =
  "Production RAG. Agentic architectures. Knowledge systems. " +
  "Built for regulated industries. Currently inside a major bank.";

// Three content pillars. Order enforces the 70/25/5 hierarchy.
// `color` is a Tailwind palette key consumed by existing components.
// `icon` is the Lucide icon component name (consumer imports it from lucide-react).
export const PILLARS = [
  {
    id: "production-ai-systems",
    name: "Production AI Systems",
    oneLiner:
      "The systems themselves — RAG platforms, agentic architectures, knowledge applications, LLM ops at scale.",
    homeCopy: "Production AI, shipped. RAG, agents, and knowledge applications in users' hands.",
    color: "blue",
    icon: "Server",
  },
  {
    id: "engineering-practice",
    name: "Engineering Practice",
    oneLiner:
      "How they ship — architecture decisions, MLOps, evaluation, governance, the engineering moves between prototype and production.",
    homeCopy: "From notebook to running system. Architecture, evaluation, and ops at scale.",
    color: "indigo",
    icon: "Cpu",
  },
  {
    id: "applied-research",
    name: "Applied Research",
    oneLiner:
      "Reading the frontier — paper-to-product translation, what survives contact with production.",
    homeCopy: "The frontier, translated. What survives contact with production.",
    color: "emerald",
    icon: "BrainCircuit",
  },
];

// Hero chips replace the previous Autonomous Agents / Distributed Systems / Enterprise
// MLOps / Scalable Architecture set. These are short noun phrases for the four cards
// directly under the hero tagline.
export const HERO_CHIPS = [
  "Production RAG",
  "Agentic Architectures",
  "Knowledge Systems",
  "LLM Ops",
];

// Anchor topics — six things the brand is being built around.
// Each maps to a potential talk topic and a potential blog series.
// Cap is six. To add a 7th, retire one.
export const ANCHOR_TOPICS = [
  {
    id: "production-rag-at-scale",
    label: "Production RAG at scale",
    claim:
      "Chunking, retrieval evaluation, hybrid search, latency under regulated constraints.",
    talkTitle: "Production RAG: what the papers leave out",
    seriesTitle: "Production RAG Field Manual",
  },
  {
    id: "agentic-architectures-in-prod",
    label: "Agentic architectures in production",
    claim: "Agent patterns that ship vs. demos, tool design, failure modes, evaluation.",
    talkTitle: "Agents that survive production: patterns and anti-patterns",
    seriesTitle: "Agent Architectures in Practice",
  },
  {
    id: "knowledge-systems-for-llms",
    label: "Knowledge systems for LLM applications",
    claim:
      "Knowledge graphs, ontologies, retrieval-grounded knowledge platforms.",
    talkTitle: "From documents to knowledge: building the substrate for LLM agents",
    seriesTitle: "Knowledge Systems for LLMs",
  },
  {
    id: "llm-ops-regulated-industries",
    label: "LLM ops in regulated industries",
    claim:
      "Compliance, governance, audit trails, evaluation under banking / healthcare constraints.",
    talkTitle: "Shipping LLM features in a regulated bank",
    seriesTitle: "LLM Ops in Regulated Industries",
  },
  {
    id: "evaluation-in-production",
    label: "Evaluation in production",
    claim:
      "Beyond static benchmarks; live evaluation harnesses, drift detection for LLM systems.",
    talkTitle: "Evaluation that survives production",
    seriesTitle: "Evals in the Wild",
  },
  {
    id: "data-foundations-for-ai",
    label: "Data foundations for AI",
    claim: "Lakehouse-to-agent pipelines; the data layer agents actually need.",
    talkTitle: "The data layer your agents actually need",
    seriesTitle: "Data Foundations for AI",
  },
];

// Hard blocklist — none of these strings should appear on any brand-facing surface.
// Includes hype words, corporate filler, intensifier filler, and the retired
// three-identity strap-line. Use as the source for a CI-style copy check (future).
export const FORBIDDEN_PHRASES = [
  // Hype words
  "cutting-edge",
  "cutting edge",
  "revolutionary",
  "game-changing",
  "leverage",
  "paradigm shift",
  "unleash",
  "supercharge",
  "holistic",
  "synergy",
  // Corporate filler
  "end-to-end solutions",
  "robust enterprise-grade",
  "driving measurable business impact",
  "scalable ML engineering",
  // Intensifier filler (Apple-style strict)
  "really",
  "super",
  "truly",
  "innovative",
  "powerful",
  // Retired strap-line
  "Computer Scientist · Mathematician · AI Researcher",
];

// Footer / contact blurb.
export const FOOTER_CONNECT_BLURB =
  "Open to talks, technical engagements, and collaborations on production AI at the research frontier.";

// Default SEO description. No em-dashes; periods for cadence.
export const SEO_DEFAULT_DESCRIPTION =
  "Senior AI Engineer building production AI systems at enterprise scale. RAG platforms, " +
  "agentic architectures, knowledge-grounded LLM applications. Engineering experience " +
  "across regulated banking, retail logistics, healthcare AI, and Harvard research.";

// Default SEO title. Single separator (middle dot). Tab-truncation safe.
// Stays readable when truncated to "Juan Lara · Senior AI Engineer".
export const SEO_DEFAULT_TITLE = "Juan Lara · Senior AI Engineer";
