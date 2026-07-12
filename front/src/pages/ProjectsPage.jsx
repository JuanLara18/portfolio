import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import { variants as motionVariants, defaultViewportSettings } from '../utils';
import {
  ExternalLink,
  Github,
  BarChart,
  Layers,
  Gamepad,
  Globe,
  FileText,
  Search,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { OptimizedImage, ViewToggle } from '../components/ui';

// Animation variants (centralized)
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

// Grid configuration constants
const GRID_CONFIG = {
  DESKTOP_COLUMNS: 4,
  MOBILE_COLUMNS: 2,
  FEATURED_WIDTH: 2,
  FEATURED_PLACEMENT_INTERVAL: 6
};

// Project categories (icons preserved for filter UI; color metadata dropped — single cyan accent only)
const categories = [
  { id: 'all', name: 'All', icon: Layers },
  { id: 'ml', name: 'AI & ML', icon: Brain },
  { id: 'web', name: 'Web Dev', icon: Globe },
  { id: 'data', name: 'Data', icon: BarChart },
  { id: 'tools', name: 'Tools', icon: Terminal },
  { id: 'games', name: 'Games', icon: Gamepad },
  { id: 'upcoming', name: 'Upcoming', icon: FileText }
];

// Brain icon (kept inline since lucide doesn't export Brain in this version)
function Brain(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  );
}

// Project data based on the GitHub repositories
const projects = [
  // ── AI & ML ──────────────────────────────────────────────
  {
    id: 1,
    name: "classifai",
    description: "Classify any text dataset from a single config file. Supports OpenAI, Anthropic, and local Ollama models with guaranteed structured outputs, unsupervised clustering (UMAP + HDBSCAN), and rich HTML reports.",
    image: "classification.png",
    tags: ["nlp", "llm", "text-classification", "clustering", "openai", "ollama"],
    github: "https://github.com/JuanLara18/classifai",
    category: "ml",
    featured: true
  },
  {
    id: 2,
    name: "voxscribe",
    description: "Local-first transcription and speaker diarization for any audio or video. Wraps faster-whisper, pyannote, WhisperX, and Ollama into a single CLI and Python library. No cloud, no data leaving your machine.",
    image: "meeting-scribe.png",
    tags: ["whisper", "speaker-diarization", "faster-whisper", "pyannote", "speech-to-text"],
    github: "https://github.com/JuanLara18/voxscribe",
    category: "ml",
    featured: true
  },
  {
    id: 3,
    name: "TextInsight",
    description: "Advanced text analysis library combining BERT for sentiment analysis, GPT-3.5 for text correction and topic generation, and embeddings for graph visualization. Deployed at Ipsos to analyze survey data, reducing analysis time by 60% while delivering deeper insights.",
    image: "textinsight.png",
    tags: ["NLP", "Transformers", "OpenAI", "NetworkX", "PyVis"],
    github: "https://github.com/JuanLara18/TextInsight",
    demo: "https://textinsight-ipsos.streamlit.app/",
    category: "ml",
  },
  {
    id: 4,
    name: "bank-agent-llm",
    description: "Privacy-first local pipeline that imports and parses bank statements (PDF), categorizes transactions, and surfaces dashboards in the terminal and Streamlit. Runs fully offline with Ollama and SQLite.",
    image: "bank-agent-llm.png",
    tags: ["personal-finance", "ollama", "pdf", "streamlit", "local-first", "python"],
    github: "https://github.com/JuanLara18/bank-agent-llm",
    category: "ml"
  },
  {
    id: 5,
    name: "Translation",
    description: "High-performance distributed translation system for large multilingual datasets using PySpark and OpenAI. Features caching, checkpointing, and metadata-preserving Stata translation.",
    image: "translation.png",
    tags: ["nlp", "distributed-computing", "stata", "pyspark", "openai"],
    github: "https://github.com/JuanLara18/Distributed-Translation-System",
    category: "ml",
    featured: true
  },
  {
    id: 6,
    name: "AgentFlow",
    description: "Simulation framework for visualizing multi-agent organizational dynamics using a modular Streamlit-based interface. Models organizational behavior and hierarchies.",
    image: "agentflow.png",
    tags: ["simulation", "multi-agent-systems", "organizational-model"],
    github: "https://github.com/JuanLara18/AgentFlow",
    demo: "https://agentflow.streamlit.app/",
    category: "ml"
  },
  {
    id: 7,
    name: "ai-video-gen",
    description: "Batch AI video generation from JSON prompts. A multi-provider pipeline (including Veo on Vertex AI) with style packs, variants, and automatic logo overlay.",
    image: "ai-video-gen.png",
    tags: ["generative-ai", "video-generation", "vertex-ai", "veo", "ffmpeg", "python"],
    github: "https://github.com/JuanLara18/ai-video-gen",
    category: "ml"
  },
  {
    id: 8,
    name: "awesome-ai-roadmap",
    description: "The open-source roadmap to mastering AI and ML, from foundations to LLMs, agents, and production systems. Curated resources, project ideas, and visual learning paths.",
    image: "ai-roadmap.png",
    tags: ["roadmap", "machine-learning", "llm", "ai-agents", "learning-path"],
    github: "https://github.com/JuanLara18/awesome-ai-roadmap",
    category: "ml",
    featured: true
  },
  {
    id: 9,
    name: "minigrid-qlearning",
    description: "Tabular Q-learning with subtask reward shaping for MiniGrid BlockedUnlockPickup, built as a reinforcement-learning course project. Includes a walled-maze environment as supplementary work.",
    image: "minigrid-qlearning.png",
    tags: ["reinforcement-learning", "q-learning", "gymnasium", "minigrid", "python"],
    github: "https://github.com/JuanLara18/minigrid-qlearning",
    category: "ml"
  },
  // ── Web ──────────────────────────────────────────────────
  {
    id: 10,
    name: "Cunservicios Platform",
    description: "Smart platform for managing public utility services, including bill consultation, claims processing (PQR), and payment tracking. Built with React and Python.",
    image: "cunservicios.png",
    tags: ["react", "python", "sql", "pqr"],
    github: "https://github.com/JuanLara18/Cunservicios",
    category: "web",
    featured: true
  },
  {
    id: 11,
    name: "QuizApp",
    description: "Full-stack learning platform where educators create and manage quizzes and learners get instant feedback. React frontend, Flask backend, SQLite storage.",
    image: "quizapp.png",
    tags: ["react", "flask", "quiz", "sqlite", "full-stack"],
    github: "https://github.com/JuanLara18/QuizApp",
    demo: "https://quizapp213.netlify.app",
    category: "web"
  },
  // ── Tools ────────────────────────────────────────────────
  {
    id: 12,
    name: "pdf-optimizer",
    description: "Smart PDF compression that combines structural and raster optimization, exposed through both a CLI and a Streamlit UI. Built on PyMuPDF.",
    image: "pdf-optimizer.png",
    tags: ["pdf", "compression", "pymupdf", "streamlit", "python"],
    github: "https://github.com/JuanLara18/pdf-optimizer",
    demo: "https://pdf-optimizer.streamlit.app/",
    category: "tools"
  },
  {
    id: 13,
    name: "notebook-converter",
    description: "Convert Jupyter notebooks into clean, organized Python packages, preserving code, outputs, and markdown as documentation.",
    image: "notebook-converter.png",
    tags: ["jupyter", "converter", "markdown", "data-science", "streamlit"],
    github: "https://github.com/JuanLara18/notebook-converter",
    demo: "https://notebook-converter.streamlit.app/",
    category: "tools"
  },
  {
    id: 14,
    name: "whiteboard",
    description: "Lightweight local-first whiteboard in the browser: freehand drawing, sticky notes, image paste, templates, and zoom/pan, with PNG and JSON export. Saves to localStorage, no backend.",
    image: "whiteboard.png",
    tags: ["canvas", "konva", "typescript", "vite", "local-first"],
    github: "https://github.com/JuanLara18/whiteboard",
    category: "tools"
  },
  {
    id: 15,
    name: "MadameX",
    description: "Interactive cryptography toolkit for encrypting and decrypting messages across classic algorithms, plus cryptanalysis tools to break ciphers without the original key.",
    image: "madamex.png",
    tags: ["cryptography", "encryption", "cryptanalysis", "javascript"],
    github: "https://github.com/JuanLara18/MadameX",
    demo: "https://juanlara18.github.io/MadameX/",
    category: "tools"
  },
  // ── Games ────────────────────────────────────────────────
  {
    id: 16,
    name: "pixel-valentine",
    description: "A retro pixel-art platformer that ends with your own love letter. Fork it, edit one file, and send it to your crush. Built with Phaser 3 and TypeScript.",
    image: "pixel-valentine.png",
    tags: ["game", "phaser3", "pixel-art", "typescript", "platformer"],
    github: "https://github.com/JuanLara18/pixel-valentine",
    demo: "https://juanlara18.github.io/San-Valentine/",
    category: "games"
  },
  {
    id: 17,
    name: "Tetris",
    description: "A clean Tetris implementation built with JavaScript and the p5.js library, originally written for an object-oriented programming course.",
    image: "tetris.png",
    tags: ["game", "javascript", "p5js", "object-oriented"],
    github: "https://github.com/JuanLara18/Tetris",
    category: "games"
  },
  {
    id: 18,
    name: "BrickBreaker",
    description: "A classic brick-breaker arcade game built in JavaScript, originally an object-oriented programming course project.",
    image: "brickbreaker.png",
    tags: ["game", "javascript", "object-oriented", "arcade"],
    github: "https://github.com/JuanLara18/BrickBreaker",
    category: "games"
  },
  // ── Upcoming / In-progress ───────────────────────────────
  {
    id: 19,
    name: "BalanceAI",
    description: "Reinforcement learning project to teach an AI agent to balance itself. Visual interface enables real-time observation of the agent learning and improving through training iterations.",
    image: "balance-ai.png",
    tags: ["reinforcement-learning", "machine-learning", "python", "gymnasium"],
    category: "upcoming"
  },
  {
    id: 20,
    name: "DJ-Mix Generator",
    description: "AI-powered DJ that creates seamless transitions between songs based on your preferences. Analyzes BPM, key, and energy levels to create professional-sounding mixes with a techno focus.",
    image: "dj-mix.png",
    tags: ["audio-processing", "machine-learning", "music-generation", "python"],
    category: "upcoming"
  },
  {
    id: 21,
    name: "FoodEconomy",
    description: "Web app that tracks historical prices of essential household products, analyzes their evolution over time, and recommends optimized shopping lists based on price trends and preferences.",
    image: "food-economy.png",
    tags: ["web-scraping", "data-analysis", "price-prediction", "react", "python"],
    category: "upcoming",
  }
];

// Editorial project entry — magazine flow, no card chrome, hairline divider only.
const ProjectCard = ({ project }) => {
  const categoryObj = categories.find(c => c.id === project.category);
  const CategoryIcon = categoryObj && typeof categoryObj.icon === 'function' ? categoryObj.icon : Layers;

  return (
    <motion.div
      variants={fadeInUp}
      className="group flex flex-col pb-10 border-b border-gray-200/60 dark:border-white/[0.08]"
    >
      {/* Image — flush, no rounding, no overlay */}
      <div className="relative overflow-hidden aspect-[4/3] mb-6">
        {project.image ? (
          <OptimizedImage
            src={`/images/project-previews/${project.image}`}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon size={48} className="text-gray-400 dark:text-brand-fg-muted opacity-50" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-grow">
        {/* Category kicker */}
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3 flex items-center gap-2">
          <CategoryIcon size={12} />
          <span>{categoryObj?.name}</span>
          {project.featured && (
            <span className="text-cyan-700 dark:text-brand-accent">· Featured</span>
          )}
          {project.category === 'upcoming' && (
            <span className="text-cyan-700 dark:text-brand-accent">· Coming soon</span>
          )}
        </p>

        <h3 className="font-bold text-2xl md:text-[1.7rem] tracking-tight leading-tight mb-3 text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">
          {project.name.split(':')[0]}
        </h3>

        <p className="font-sans text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Tech stack — inline mono uppercase, dot-separated, no boxes */}
        {project.tags && project.tags.length > 0 && (
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted mb-5 leading-[1.9]">
            {project.tags.slice(0, 5).map((tag, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-1.5 opacity-60">·</span>}
                <span>{tag}</span>
              </span>
            ))}
            {project.tags.length > 5 && (
              <span>
                <span className="mx-1.5 opacity-60">·</span>
                <span>+{project.tags.length - 5}</span>
              </span>
            )}
          </div>
        )}

        {/* Actions — inline cyan text links */}
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.12em] uppercase">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
              aria-label={`GitHub repository for ${project.name}`}
            >
              <Github size={13} />
              <span>Code →</span>
            </a>
          ) : null}

          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
              aria-label={`Live demo for ${project.name}`}
            >
              <ExternalLink size={13} />
              <span>Demo →</span>
            </a>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

// Main Projects Page Component
export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);

  // View mode: 'grid' (default) or 'list'. Persisted in localStorage.
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === 'undefined') return 'grid';
    try {
      return window.localStorage.getItem('projects-view-mode') === 'list' ? 'list' : 'grid';
    } catch (_) { return 'grid'; }
  });
  useEffect(() => {
    try { window.localStorage.setItem('projects-view-mode', viewMode); } catch (_) {}
  }, [viewMode]);

  // Pagination configuration
  const PROJECTS_PER_PAGE = 9;

  // Subtle scroll-driven hero fade (no scale-y/skew shenanigans)
  const heroOpacity = useTransform(scrollY, [260, 800], [1, 0.98]);

  // Filter projects based on category and search term with optimized visual layout
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (selectedCategory === 'all' && !searchTerm) {
      const featuredProjects = filtered.filter(p => p.featured);
      const regularProjects = filtered.filter(p => !p.featured);

      const createOptimalLayout = () => {
        const { DESKTOP_COLUMNS, FEATURED_WIDTH, FEATURED_PLACEMENT_INTERVAL } = GRID_CONFIG;

        const result = [];
        let currentGridState = [];
        let regularIndex = 0;
        let featuredIndex = 0;

        const addToGrid = (project, width) => {
          result.push(project);
          for (let i = 0; i < width; i++) {
            currentGridState.push(true);
          }
          while (currentGridState.length >= DESKTOP_COLUMNS) {
            currentGridState = currentGridState.slice(DESKTOP_COLUMNS);
          }
        };

        while (regularIndex < regularProjects.length || featuredIndex < featuredProjects.length) {
          const canPlaceFeatured =
            featuredIndex < featuredProjects.length &&
            (currentGridState.length + FEATURED_WIDTH <= DESKTOP_COLUMNS);

          const shouldPlaceFeatured =
            canPlaceFeatured &&
            (
              currentGridState.length === 0 ||
              currentGridState.length === DESKTOP_COLUMNS - FEATURED_WIDTH ||
              regularIndex === regularProjects.length ||
              (featuredIndex < featuredProjects.length - 1 &&
                regularIndex > 0 &&
                regularIndex % FEATURED_PLACEMENT_INTERVAL === 0)
            );

          if (shouldPlaceFeatured) {
            addToGrid(featuredProjects[featuredIndex], FEATURED_WIDTH);
            featuredIndex++;
          } else if (regularIndex < regularProjects.length) {
            addToGrid(regularProjects[regularIndex], 1);
            regularIndex++;
          } else if (featuredIndex < featuredProjects.length) {
            if (currentGridState.length !== 0) {
              while (currentGridState.length < DESKTOP_COLUMNS && regularIndex < regularProjects.length) {
                addToGrid(regularProjects[regularIndex], 1);
                regularIndex++;
              }
              currentGridState = [];
            }
            addToGrid(featuredProjects[featuredIndex], FEATURED_WIDTH);
            featuredIndex++;
          }
        }

        if (regularIndex < regularProjects.length && currentGridState.length > 0) {
          while (currentGridState.length < DESKTOP_COLUMNS && regularIndex < regularProjects.length) {
            addToGrid(regularProjects[regularIndex], 1);
            regularIndex++;
          }
        }

        return result;
      };

      filtered = createOptimalLayout();
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Pagination calculations
  const totalProjects = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / PROJECTS_PER_PAGE));
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);

  return (
    <>
      <SEO
        title="Projects · Juan Lara"
        description="Portfolio of AI and machine learning projects including TextInsight, RAG systems, and production-ready generative AI solutions. Explore ML engineering work and research implementations."
        canonical="https://juanlara18.github.io/portfolio/#/projects"
        keywords={[
          'AI Projects',
          'Machine Learning Portfolio',
          'TextInsight',
          'RAG Systems',
          'Python Projects',
          'ML Engineering',
          'NLP Projects',
          'Deep Learning'
        ]}
      />
      <div className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg min-h-screen">

        {/* Hero — editorial, centered (matches Blog structure) */}
        <div className="pt-12 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16">
          <motion.section
            ref={heroRef}
            style={{ opacity: heroOpacity }}
            className="relative"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl mx-auto text-center"
              >
                <motion.div variants={fadeInUp} className="mb-4">
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                    Projects
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-gray-900 dark:text-brand-fg mb-6"
                >
                  Built<span className="text-cyan-700 dark:text-brand-accent">.</span> Shipped<span className="text-cyan-700 dark:text-brand-accent">.</span> Learned<span className="text-cyan-700 dark:text-brand-accent">.</span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-base md:text-lg text-gray-600 dark:text-brand-fg-muted mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                  Production systems, research tools, and open-source contributions.
                </motion.p>

                {/* GitHub count link — mirrors the Knowledge Graph link in Blog */}
                <motion.div variants={fadeInUp} className="mb-10">
                  <a
                    href="https://github.com/JuanLara18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                  >
                    <Github size={14} />
                    <span>View on GitHub</span>
                    <span className="opacity-50">·</span>
                    <span>{projects.length} projects</span>
                  </a>
                </motion.div>

                {/* Search — centered, bottom hairline only (matches Blog) */}
                <motion.div
                  variants={fadeInUp}
                  className="max-w-3xl mx-auto"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400 dark:text-brand-fg-muted" />
                    </div>
                    <input
                      type="text"
                      aria-label="Search projects"
                      className="block w-full pl-7 pr-3 py-2.5 bg-transparent border-0 border-b border-gray-200/60 dark:border-white/[0.08] text-gray-900 dark:text-brand-fg placeholder-gray-400 dark:placeholder-brand-fg-muted focus:outline-none focus:border-cyan-700 dark:focus:border-brand-accent transition-colors text-sm"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        </div>

        {/* Projects grid */}
        <section className="pb-10 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container">
            <motion.div
              initial={false}
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={staggerContainer}
            >
              {/* Category filter row — inline mono uppercase, underline-active (matches Blog) */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
                role="group"
                aria-label="Filter projects by category"
              >
                {categories.map(category => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      aria-pressed={isActive}
                      aria-label={`Filter projects by ${category.name}`}
                      className={`font-mono text-[11px] tracking-[0.12em] uppercase py-1 transition-colors ${
                        isActive
                          ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-[6px] decoration-1'
                          : 'text-gray-500 dark:text-brand-fg-muted hover:text-gray-900 dark:hover:text-brand-fg'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </motion.div>

              {/* Section header — kicker + view toggle + count (matches Blog) */}
              <motion.div
                variants={fadeInUp}
                className="flex items-end justify-between mb-12 gap-3 pb-5 border-b border-gray-200/60 dark:border-white/[0.08]"
              >
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                  {selectedCategory !== 'all'
                    ? categories.find(c => c.id === selectedCategory)?.name
                    : 'All projects'}
                </div>

                <div className="flex items-center gap-3">
                  <ViewToggle value={viewMode} onChange={setViewMode} />
                  <span className="w-px h-4 bg-gray-300/70 dark:bg-white/[0.12]" />
                  <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg-muted whitespace-nowrap">
                    {filteredProjects.length > 0 && (
                      <>
                        {Math.min((currentPage - 1) * PROJECTS_PER_PAGE + 1, filteredProjects.length)}
                        {'–'}
                        {Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length)}
                        {' / '}
                        {filteredProjects.length}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {filteredProjects.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  className="text-center py-24"
                >
                  <Search size={28} className="mx-auto mb-4 text-gray-400 dark:text-brand-fg-muted" />
                  <h3 className="font-bold text-xl tracking-tight mb-2 text-gray-900 dark:text-brand-fg">
                    No projects found
                  </h3>
                  <p className="font-sans text-sm text-gray-600 dark:text-brand-fg-muted mb-6 max-w-md mx-auto">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                    }}
                    className="font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                  >
                    Show all projects
                  </button>
                </motion.div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <motion.div
                      variants={fadeInUp}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                    >
                      {paginatedProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={fadeInUp}
                      className="divide-y divide-gray-200/60 dark:divide-white/[0.08]"
                    >
                      {paginatedProjects.map(project => {
                        const categoryName = categories.find(c => c.id === project.category)?.name || project.category;
                        return (
                          <article key={project.id} className="group flex gap-5 sm:gap-8 py-6 sm:py-8">
                            {/* Thumbnail */}
                            {project.image && (
                              <div className="hidden sm:block flex-shrink-0 w-32 md:w-44 aspect-[4/3] bg-gray-100 dark:bg-brand-bg-soft overflow-hidden">
                                <OptimizedImage
                                  src={`/images/project-previews/${project.image}`}
                                  alt={project.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-2">
                                {categoryName}
                                {project.featured && (
                                  <>
                                    <span className="opacity-50 mx-1.5">·</span>
                                    Featured
                                  </>
                                )}
                              </p>
                              <h3 className="font-bold text-xl sm:text-2xl tracking-tight leading-snug text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors mb-2">
                                {project.name}
                              </h3>
                              {project.description && (
                                <p className="text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed line-clamp-2 mb-3">
                                  {project.description}
                                </p>
                              )}
                              {project.tags && project.tags.length > 0 && (
                                <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg-muted hidden sm:block mb-3">
                                  {project.tags.slice(0, 5).join(' · ')}
                                </p>
                              )}
                              {(project.github || project.demo) && (
                                <div className="flex gap-5 mt-2">
                                  {project.github && (
                                    <a
                                      href={project.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                                    >
                                      <Github size={12} />
                                      <span>Code</span>
                                    </a>
                                  )}
                                  {project.demo && (
                                    <a
                                      href={project.demo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                                    >
                                      <ExternalLink size={12} />
                                      <span>Demo</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Arrow on the right */}
                            <div className="hidden md:flex items-center text-cyan-700/40 dark:text-brand-accent/40 group-hover:text-cyan-700 dark:group-hover:text-brand-accent flex-shrink-0 transition-colors">
                              <ArrowRight size={16} />
                            </div>
                          </article>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Pagination — text-based */}
                  {totalPages > 1 && (
                    <motion.div
                      variants={fadeInUp}
                      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-10 pt-6 border-t border-gray-200/60 dark:border-white/[0.08]"
                    >
                      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted">
                        <span className="text-gray-700 dark:text-brand-fg">
                          {Math.min((currentPage - 1) * PROJECTS_PER_PAGE + 1, totalProjects)}
                        </span>
                        {' – '}
                        <span className="text-gray-700 dark:text-brand-fg">
                          {Math.min(currentPage * PROJECTS_PER_PAGE, totalProjects)}
                        </span>
                        {' of '}
                        <span className="text-gray-700 dark:text-brand-fg">{totalProjects}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.12em] uppercase">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ← Prev
                        </button>

                        <span className="opacity-50">·</span>

                        <div className="text-gray-500 dark:text-brand-fg-muted whitespace-nowrap tabular-nums">
                          {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                        </div>

                        <span className="opacity-50">·</span>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
