import { useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SEO } from '../components/common/SEO';
import { variants as motionVariants, defaultViewportSettings } from '../utils';
import { MotionCard } from '../components/common';
import {
  ExternalLink,
  Github,
  Layers,
  Globe,
  Wrench,
  Gamepad2,
  BookOpen,
  Brain,
} from 'lucide-react';

// PUBLIC_URL helper (same pattern as PostCard)
const withBase = (path) => {
  if (!path) return '';
  const base = process.env.PUBLIC_URL || '';
  return path.startsWith('http') ? path : `${base}${path}`;
};

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       name: 'All',        icon: Layers   },
  { id: 'ml',        name: 'AI & ML',    icon: Brain,   color: 'purple'  },
  { id: 'tools',     name: 'Tools',      icon: Wrench,  color: 'blue'    },
  { id: 'web',       name: 'Web & Apps', icon: Globe,   color: 'indigo'  },
  { id: 'games',     name: 'Games',      icon: Gamepad2, color: 'rose'   },
  { id: 'resources', name: 'Resources',  icon: BookOpen, color: 'emerald'},
];

// Category badge classes (no MutationObserver — pure Tailwind dark:)
const BADGE = {
  ml:        'bg-purple-100  dark:bg-purple-900/40  text-purple-800  dark:text-purple-300',
  tools:     'bg-blue-100    dark:bg-blue-900/40    text-blue-800    dark:text-blue-300',
  web:       'bg-indigo-100  dark:bg-indigo-900/40  text-indigo-800  dark:text-indigo-300',
  games:     'bg-rose-100    dark:bg-rose-900/40    text-rose-800    dark:text-rose-300',
  resources: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
};

// Active pill (when selected)
const PILL_ACTIVE = {
  ml:        'bg-purple-600  text-white',
  tools:     'bg-blue-600    text-white',
  web:       'bg-indigo-600  text-white',
  games:     'bg-rose-600    text-white',
  resources: 'bg-emerald-600 text-white',
};

// ─── Projects data ────────────────────────────────────────────────────────────

const PROJECTS = [
  // ── AI & ML ──────────────────────────────────────────────────────────────
  {
    id: 'voxscribe',
    name: 'VoxScribe',
    description: 'Local transcription & speaker diarization for any audio/video. Wraps faster-whisper, pyannote, WhisperX and Ollama into one CLI + Python library. No cloud. No data leaving your machine.',
    image: 'voxscribe.png',
    tags: ['Python', 'Whisper', 'PyAnnote', 'NLP'],
    github: 'https://github.com/JuanLara18/voxscribe',
    category: 'ml',
  },
  {
    id: 'classifai',
    name: 'ClassifAI',
    description: 'Classify any text dataset with one config file. OpenAI, Anthropic, or Ollama — guaranteed structured outputs, unsupervised clustering, and HTML reports.',
    image: 'classifai.png',
    tags: ['Python', 'NLP', 'OpenAI', 'UMAP'],
    github: 'https://github.com/JuanLara18/classifai',
    category: 'ml',
  },
  {
    id: 'ai-video-gen',
    name: 'AI Video Gen',
    description: 'Batch AI video generation from JSON prompts. Multi-provider pipeline with style packs, variants, and logo overlay. Production-ready CLI.',
    image: 'ai-video-gen.png',
    tags: ['Python', 'FFmpeg', 'AI', 'CLI'],
    github: 'https://github.com/JuanLara18/ai-video-gen',
    category: 'ml',
  },
  {
    id: 'textinsight',
    name: 'TextInsight',
    description: 'NLP library combining BERT for sentiment analysis, embeddings for graph visualization, and GPT for text generation. Being rebuilt as a clean, published Python package.',
    image: 'textinsight.png',
    tags: ['Python', 'BERT', 'NLP', 'NetworkX'],
    github: 'https://github.com/JuanLara18/TextInsight',
    demo: 'https://textinsight-ipsos.streamlit.app/',
    category: 'ml',
  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  {
    id: 'pdf-optimizer',
    name: 'PDF Optimizer',
    description: 'Smart PDF compression via CLI and Streamlit web UI. Structural optimization or aggressive raster compression powered by PyMuPDF — significant size reduction without quality loss.',
    image: 'pdf-optimizer.png',
    tags: ['Python', 'PyMuPDF', 'Streamlit', 'CLI'],
    github: 'https://github.com/JuanLara18/pdf-optimizer',
    demo: 'https://pdf-optimizer.streamlit.app/',
    category: 'tools',
  },
  {
    id: 'notebook-converter',
    name: 'Notebook Converter',
    description: 'Convert Jupyter Notebooks into organized Python packages with code, outputs, and markdown documentation — all bundled in a single ZIP ready to share.',
    image: 'notebook-converter.png',
    tags: ['Python', 'Jupyter', 'Streamlit', 'Markdown'],
    github: 'https://github.com/JuanLara18/notebook-converter',
    demo: 'https://notebook-converter.streamlit.app/',
    category: 'tools',
  },

  // ── Web & Apps ────────────────────────────────────────────────────────────
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Lightweight local-first whiteboard in the browser: freehand drawing, sticky notes, image paste, templates, zoom/pan, PNG & JSON export. Everything saves to localStorage.',
    image: 'whiteboard.png',
    tags: ['TypeScript', 'React', 'Konva', 'Canvas'],
    github: 'https://github.com/JuanLara18/whiteboard',
    category: 'web',
  },
  {
    id: 'quizapp',
    name: 'QuizApp',
    description: 'Full-stack learning platform that lets educators create and manage quizzes. React frontend with instant feedback, Flask backend, and SQLite persistence.',
    image: 'quizapp.png',
    tags: ['React', 'Flask', 'SQLite', 'Full-Stack'],
    github: 'https://github.com/JuanLara18/QuizApp',
    category: 'web',
  },

  // ── Games ─────────────────────────────────────────────────────────────────
  {
    id: 'pixel-valentine',
    name: 'Pixel Valentine',
    description: 'A retro pixel-art platformer that ends with your love letter. Fork → edit one file → send to your crush. Built with Phaser 3 and TypeScript.',
    image: 'pixel-valentine.png',
    tags: ['TypeScript', 'Phaser 3', 'Pixel Art'],
    github: 'https://github.com/JuanLara18/pixel-valentine',
    demo: 'https://juanlara18.github.io/San-Valentine/',
    category: 'games',
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Classic Tetris implemented in JavaScript with p5.js. Full piece rotation, line clearing, score tracking, and progressive difficulty. Clean game loop with OOP structure.',
    image: 'tetris.png',
    tags: ['JavaScript', 'p5.js', 'OOP'],
    github: 'https://github.com/JuanLara18/Tetris',
    category: 'games',
  },
  {
    id: 'brickbreaker',
    name: 'BrickBreaker',
    description: 'Browser-based brick breaker arcade game. Smooth physics, power-ups, and progressive difficulty. Built with JavaScript and object-oriented design principles.',
    image: 'brickbreaker.png',
    tags: ['JavaScript', 'Canvas', 'OOP'],
    github: 'https://github.com/JuanLara18/BrickBreaker',
    category: 'games',
  },

  // ── Resources ─────────────────────────────────────────────────────────────
  {
    id: 'awesome-ai-roadmap',
    name: 'Awesome AI Roadmap',
    description: 'The open-source roadmap to mastering AI & ML — from foundations to AI agents, LLMs, and production systems. Curated resources, project ideas, and visual learning paths.',
    image: 'awesome-ai-roadmap.png',
    tags: ['Machine Learning', 'LLMs', 'AI Agents'],
    github: 'https://github.com/JuanLara18/awesome-ai-roadmap',
    category: 'resources',
  },
];

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project }) {
  const category = CATEGORIES.find(c => c.id === project.category);
  const badgeCls = BADGE[project.category] ?? BADGE.tools;
  const IconCmp  = category?.icon ?? Layers;

  const pngSrc  = project.image
    ? withBase(`/images/project-previews/${project.image}`)
    : null;
  const webpSrc = pngSrc
    ? pngSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    : null;

  return (
    <MotionCard
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col group hover:shadow-xl transition-shadow duration-200 mobile-card"
      hover="lift"
      variants={fadeInUp}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[16/9] flex-shrink-0">
        {pngSrc ? (
          <>
            <picture>
              {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
              <img
                src={pngSrc}
                alt={project.name}
                loading="lazy"
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <IconCmp size={52} className="opacity-15 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeCls}`}>
            <IconCmp size={11} />
            {category?.name}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.name}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="card-tag text-xs inline-flex items-center">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="card-tag text-xs opacity-60">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={`GitHub: ${project.name}`}
              >
                <Github size={17} />
              </a>
            ) : (
              <span className="text-gray-300 dark:text-gray-600 cursor-not-allowed">
                <Github size={17} />
              </span>
            )}

            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label={`Demo: ${project.name}`}
              >
                <ExternalLink size={17} />
              </a>
            )}
          </div>

          {project.demo && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              Live demo
              <ExternalLink size={11} />
            </span>
          )}
        </div>
      </div>
    </MotionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [selected, setSelected] = useState('all');
  const heroRef = useRef(null);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [260, 800], [1, 0.98]);
  const heroScale   = useTransform(scrollY, [260, 800], [1, 0.995]);

  const filtered = useMemo(
    () => selected === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === selected),
    [selected]
  );

  return (
    <>
      <SEO
        title="Projects | Juan Lara"
        description="Portfolio of AI, ML and software projects — from local transcription tools to open-source learning resources and browser games."
        canonical="https://juanlara18.github.io/portfolio/#/projects"
        keywords={['AI Projects', 'Machine Learning Portfolio', 'Python Tools', 'NLP', 'Open Source', 'TypeScript']}
      />

      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">

        {/* ── Header ── */}
        <div className="pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 -z-10" />
          <div className="absolute top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 sm:-left-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl -z-10" />

          <motion.section
            ref={heroRef}
            style={{ opacity: heroOpacity, scale: heroScale }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-3xl mx-auto text-center"
              >
                <motion.div variants={fadeInUp}>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium mb-4">
                    <Layers size={14} className="mr-1.5" />
                    Project Portfolio
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Built, Shipped,
                  </span>{' '}
                  <span className="text-gray-800 dark:text-gray-100">Learned</span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2 sm:px-0"
                >
                  Production tools, research experiments, and open-source projects — continuously evolving.
                </motion.p>
              </motion.div>
            </div>
          </motion.section>
        </div>

        {/* ── Grid section ── */}
        <section className="pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
            <div className="max-w-6xl mx-auto">

              {/* Category pills */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewportSettings}
                variants={fadeInUp}
                className="flex flex-wrap gap-2 mb-8"
              >
                {CATEGORIES.map(cat => {
                  const isActive = selected === cat.id;
                  const CatIcon = cat.icon;
                  const activeCls = cat.color ? PILL_ACTIVE[cat.id] : 'bg-blue-600 text-white';
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelected(cat.id)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150
                        ${isActive
                          ? activeCls
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                      <CatIcon size={14} />
                      {cat.name}
                      {isActive && filtered.length > 0 && cat.id !== 'all' && (
                        <span className="bg-white/25 text-xs px-1.5 py-0.5 rounded-full leading-none">
                          {filtered.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>

              {/* Grid */}
              {filtered.length > 0 ? (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={defaultViewportSettings}
                  variants={staggerContainer}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mobile-grid-single"
                >
                  {filtered.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-center py-20 text-gray-500 dark:text-gray-400"
                >
                  <p className="text-lg">No projects in this category yet.</p>
                  <button
                    onClick={() => setSelected('all')}
                    className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all projects
                  </button>
                </motion.div>
              )}

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
