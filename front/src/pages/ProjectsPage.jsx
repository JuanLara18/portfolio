import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { variants as motionVariants, defaultViewportSettings, earlyViewportSettings } from '../utils';
import { MotionCard } from '../components/common';
import { 
  ExternalLink, 
  Github, 
  Code, 
  Database, 
  BarChart, 
  Layers, 
  Box, 
  Cpu, 
  Gamepad, 
  Server, 
  Globe, 
  FileText, 
  Music, 
  Search, 
  Filter,
  Terminal,
  Mail
} from 'lucide-react';
import { ScrollIndicator, OptimizedImage } from '../components/ui';

// Animation variants (centralized)
const fadeInUp = motionVariants.fadeInUp();
const fadeInRight = motionVariants.fadeInRight();
const staggerContainer = motionVariants.stagger();

// Card hover behavior is centralized via MotionCard

// Constantes de configuración de grid
const GRID_CONFIG = {
  DESKTOP_COLUMNS: 4,
  MOBILE_COLUMNS: 2,
  FEATURED_WIDTH: 2,
  FEATURED_PLACEMENT_INTERVAL: 6
};

// Project categories with their icons and colors
const categories = [
  { id: 'all', name: 'All Projects', icon: Layers, color: 'blue' },
  { id: 'ml', name: 'Machine Learning & AI', icon: Brain, color: 'purple' },
  { id: 'web', name: 'Web Development', icon: Globe, color: 'indigo' },
  { id: 'data', name: 'Data Science', icon: BarChart, color: 'green' },
  { id: 'tools', name: 'Tools & Utilities', icon: Terminal, color: 'yellow' },
  { id: 'games', name: 'Games & Interactive', icon: Gamepad, color: 'red' },
  { id: 'upcoming', name: 'Upcoming Projects', icon: FileText, color: 'teal' }
];

// Color map for badges (light bg, dark opaque bg, and text colors)
const COLOR_MAP = {
  blue: { lightBg: '#DBEAFE', darkBg: 'rgba(37,99,235,0.22)', lightText: '#1e3a8a', darkText: '#FFFFFF' },
  indigo: { lightBg: '#EEF2FF', darkBg: 'rgba(99,102,241,0.22)', lightText: '#3730a3', darkText: '#FFFFFF' },
  purple: { lightBg: '#F3E8FF', darkBg: 'rgba(124,58,237,0.22)', lightText: '#6b21a8', darkText: '#FFFFFF' },
  green: { lightBg: '#ECFCCB', darkBg: 'rgba(34,197,94,0.22)', lightText: '#166534', darkText: '#FFFFFF' },
  yellow: { lightBg: '#FEF3C7', darkBg: 'rgba(245,158,11,0.22)', lightText: '#92400e', darkText: '#111827' },
  teal: { lightBg: '#CCFBF1', darkBg: 'rgba(20,184,166,0.22)', lightText: '#0f766e', darkText: '#FFFFFF' },
  orange: { lightBg: '#FFF7ED', darkBg: 'rgba(249,115,22,0.22)', lightText: '#7c2d12', darkText: '#111827' },
  red: { lightBg: '#FEE2E2', darkBg: 'rgba(239,68,68,0.22)', lightText: '#7f1d1d', darkText: '#FFFFFF' },
  gray: { lightBg: '#F1F5F9', darkBg: 'rgba(148,163,184,0.22)', lightText: '#334155', darkText: '#FFFFFF' }
};

// Brain icon is not imported, so let's define it
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
  {
    id: 1,
    name: "TextInsight",
    description: "Advanced text analysis library combining BERT for sentiment analysis, GPT-3.5 for text correction and topic generation, and embeddings for graph visualization. Deployed at Ipsos to analyze survey data, reducing analysis time by 60% while delivering deeper insights.",
    image: "textinsight.png",
    tags: ["NLP", "Transformers", "OpenAI", "NetworkX", "PyVis"],
    github: "https://github.com/JuanLara18/TextInsight",
    demo: "https://textinsight-ipsos.streamlit.app/",
    category: "ml",
  },
  {
    id: 2,
    name: "Meeting-Scribe",
    description: "AI-powered meeting transcription tool with speaker diarization using Whisper and pyannote-audio. Automatically transcribes meetings, identifies speakers, and generates summaries.",
    image: "meeting-scribe.png",
    tags: ["ffmpeg", "transcription", "whisper", "pyannote-audio", "diarization"],
    github: "https://github.com/JuanLara18/Meeting-Scribe",
    category: "ml",
    featured: true
  },
  {
    id: 3,
    name: "Translation",
    description: "High-performance distributed translation system for large multilingual datasets using PySpark and OpenAI. Features caching, checkpointing, and metadata-preserving Stata translation.",
    image: "translation.png",
    tags: ["nlp", "distributed-computing", "stata", "pyspark", "openai"],
    github: "https://github.com/JuanLara18/Translation",
    category: "ml",
    featured: true
  },
  {
    id: 4,
    name: "AgentFlow",
    description: "Simulation framework for visualizing multi-agent organizational dynamics using a modular Streamlit-based interface. Models organizational behavior and hierarchies.",
    image: "agentflow.png",
    tags: ["simulation", "multi-agent-systems", "organizational-model"],
    github: "https://github.com/JuanLara18/AgentFlow",
    category: "ml"
  },
  {
    id: 5,
    name: "Classification",
    description: "Modular pipeline for text clustering, classification, and evaluation using TF-IDF and unsupervised ML techniques. Optimized for large-scale document processing.",
    image: "classification.png",
    tags: ["nlp", "unsupervised-learning", "tfidf", "text-clustering"],
    github: "https://github.com/JuanLara18/Classification",
    category: "ml",
    featured: true
  },
  // {
  //   id: 6,
  //   name: "Pharmacy Segmentation Application",
  //   description: "Responsive mobile field application for pharmacy segmentation using R Shiny with Google Cloud Storage integration. Features geolocation mapping with Leaflet, route management, and real-time ML classification, reducing manual segmentation effort by 85%.",
  //   image: "pharmacy-app.png",
  //   tags: ["R Shiny", "Google Cloud", "Random Forest", "Leaflet"],
  //   category: "data",
  //   featured: true
  // },
  {
    id: 7,
    name: "QuizApp",
    description: "A modern full-stack learning platform that enables educators to create and manage quizzes, delivering instant feedback to learners via a React frontend and Flask backend.",
    image: "quizapp.png",
    tags: ["flask", "reactjs", "sqlite", "quiz"],
    github: "https://github.com/JuanLara18/QuizApp",
    category: "web"
  },
  {
    id: 8,
    name: "Whiteboard-app",
    description: "Collaborative whiteboard built with React, TypeScript, and WebSockets. Draw, share, and brainstorm ideas in real-time with your team.",
    image: "whiteboard.png",
    tags: ["react", "real-time", "typescript", "whiteboard"],
    github: "https://github.com/JuanLara18/whiteboard-app",
    category: "web"
  },
  {
    id: 9,
    name: "Cunservicios Platform",
    description: "Smart platform for managing public utility services, including bill consultation, claims processing (PQR), and payment tracking. Built with React and Python.",
    image: "cunservicios.png",
    tags: ["react", "python", "sql", "pqr"],
    github: "https://github.com/JuanLara18/Cunservicios",
    category: "web",
    featured: true
  },
  {
    id: 10,
    name: "Notebook-Converter",
    description: "Convert Jupyter Notebooks to different formats (PDF, HTML, Markdown) using a customizable and efficient command-line tool. Optimized for data scientists and researchers.",
    image: "notebook-converter.png",
    tags: ["automation", "jupyter-notebook"],
    github: "https://github.com/JuanLara18/Notebook-Converter",
    category: "tools"
  },
  {
    id: 11,
    name: "AI-Roadmap",
    description: "A structured, project-based roadmap for learning Machine Learning & AI through hands-on projects. Each project builds on the previous, helping you progress from beginner to advanced AI concepts.",
    image: "ai-roadmap.png",
    tags: ["ai", "ml", "education"],
    github: "https://github.com/JuanLara18/AI-Roadmap",
    category: "ml"
  },
  {
    id: 12,
    name: "MadameX",
    description: "Interactive cryptography toolkit that enables users to encrypt and decrypt messages using various algorithms, and perform cryptanalysis to break encrypted messages without the original key.",
    image: "madamex.png",
    tags: ["cryptography", "cryptoanalysis", "encryption-decryption"],
    github: "https://github.com/JuanLara18/MadameX",
    demo: "https://juanlara18.github.io/MadameX/",
    category: "web"
  },
  {
    id: 13,
    name: "BrickBreaker",
    description: "Classic brick breaker game built with JavaScript and p5.js. Features multiple levels, power-ups, and progressive difficulty.",
    image: "brickbreaker.png",
    tags: ["object-oriented-programming", "retrogames", "JavaScript"],
    github: "https://github.com/JuanLara18/BrickBreaker",
    category: "games"
  },
  {
    id: 14,
    name: "Tetris",
    description: "Implementation of the classic Tetris game using JavaScript and p5 library, developed for an Object-oriented Programming course.",
    image: "tetris.png", 
    tags: ["object-oriented-programming", "retrogames", "JavaScript"],
    github: "https://github.com/JuanLara18/Tetris",
    category: "games"
  },
  // Upcoming/In-progress projects
  {
    id: 15,
    name: "BalanceAI",
    description: "Reinforcement learning project to teach an AI agent to balance itself. Visual interface enables real-time observation of the agent learning and improving through training iterations.",
    image: "balance-ai.png",
    tags: ["reinforcement-learning", "machine-learning", "python", "gymnasium"],
    category: "upcoming"
  },
  {
    id: 16,
    name: "DJ-Mix Generator",
    description: "AI-powered DJ that creates seamless transitions between songs based on your preferences. Analyzes BPM, key, and energy levels to create professional-sounding mixes with a techno focus.",
    image: "dj-mix.png",
    tags: ["audio-processing", "machine-learning", "music-generation", "python"],
    category: "upcoming"
  },
  {
    id: 17,
    name: "FoodEconomy",
    description: "Web app that tracks historical prices of essential household products, analyzes their evolution over time, and recommends optimized shopping lists based on price trends and preferences.",
    image: "food-economy.png",
    tags: ["web-scraping", "data-analysis", "price-prediction", "react", "python"],
    category: "upcoming",
  }
];

// Project card component
const ProjectCard = ({ project, inView }) => {
  const getIcon = (tag) => {
    switch (tag.toLowerCase()) {
      case 'ml': case 'ai': case 'machine-learning':
        return <Brain size={14} />;
      case 'python': case 'flask': case 'javascript': case 'typescript': case 'react':
        return <Code size={14} />;
      case 'data': case 'data-analysis': case 'price-prediction':
        return <BarChart size={14} />;
      case 'nlp': case 'transformers': case 'openai':
        return <Terminal size={14} />;
      default:
        return <Box size={14} />;
    }
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
  };

  
  // detect dark mode class on <html> and respond to changes
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <MotionCard
      as={motion.div}
      hover="liftScale"
  className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col mobile-card
  ${project.featured ? 'ring-1 ring-yellow-200 dark:ring-yellow-900/30' : ''}`}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 z-10"></div>
        {project.image ? (
          <OptimizedImage 
            src={`/images/project-previews/${project.image}`} 
            alt={project.name}
            className="transform transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-${getCategoryColor(project.category)}-100 dark:bg-${getCategoryColor(project.category)}-900/30`}>
            {(() => {
              const category = categories.find(c => c.id === project.category);
              if (category && typeof category.icon === 'function') {
                const IconComponent = category.icon;
                return <IconComponent size={48} className={`text-${getCategoryColor(project.category)}-600 dark:text-${getCategoryColor(project.category)}-400 opacity-40`} />;
              }
              return <Box size={48} className={`text-${getCategoryColor(project.category)}-600 dark:text-${getCategoryColor(project.category)}-400 opacity-40`} />;
            })()}
          </div>
        )}
        
        {/* Category badge (improved contrast in dark mode) */}
        {(() => {
          const catKey = getCategoryColor(project.category);
          const categoryObj = categories.find(c => c.id === project.category);
          const colorInfo = COLOR_MAP[catKey] || COLOR_MAP.gray;
          const badgeStyle = {
            backgroundColor: isDark ? colorInfo.darkBg : colorInfo.lightBg,
            color: isDark ? (colorInfo.darkText || '#fff') : (colorInfo.lightText || '#111'),
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            boxShadow: isDark ? 'inset 0 -1px 0 rgba(0,0,0,0.2)' : 'none'
          };
          const IconComponent = categoryObj && typeof categoryObj.icon === 'function' ? categoryObj.icon : Box;
          return (
            <div style={badgeStyle} className="absolute top-4 left-4 z-20 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <IconComponent size={12} />
              <span>{categoryObj?.name}</span>
            </div>
          );
        })()}
        
        {project.featured && (
          <div className="absolute top-4 right-4 z-20 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 card-description">{project.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
          {project.tags && project.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index} 
              className="card-tag inline-flex items-center gap-1 text-xs sm:text-sm"
            >
              {getIcon(tag)}
              {tag}
            </span>
          ))}
          {project.tags && project.tags.length > 4 && (
            <span className="card-tag inline-flex items-center text-xs sm:text-sm">
              +{project.tags.length - 4} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          {/* left area intentionally left blank — action icons are fixed to bottom-left */}
          <div />

          {project.category === 'upcoming' ? (
            <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 sm:px-2.5 py-1 rounded-full">
              Coming Soon
            </span>
          ) : null}
        </div>

        {/* Fixed icons: GitHub always bottom-left; demo link next to it if present. */}
        <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 z-30 flex items-center gap-2 sm:gap-3">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label={`GitHub repository for ${project.name}`}
            >
              <Github size={18} />
            </a>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 opacity-50" aria-hidden="true">
              <Github size={18} />
            </span>
          )}

          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label={`Live demo for ${project.name}`}
            >
              <ExternalLink size={18} />
            </a>
          ) : null}
        </div>
      </div>
  </MotionCard>
  );
};

// Main Projects Page Component
export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const isFeaturedInView = useInView(featuredRef, { once: true, margin: "0px" });
  
  // Transform values based on scroll position
  const heroOpacity = useTransform(scrollY, [260, 800], [1, 0.98]);
  const heroScale = useTransform(scrollY, [260, 800], [1, 0.995]);
  
  // Filter projects based on category and search term with optimized visual layout
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];
    
    // Apply category filter first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) || 
        project.description.toLowerCase().includes(term) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Only reorganize if showing all projects without search
    if (selectedCategory === 'all' && !searchTerm) {
      const featuredProjects = filtered.filter(p => p.featured);
      const regularProjects = filtered.filter(p => !p.featured);
      
      // Create grid-aware layout that fills space efficiently
      const createOptimalLayout = () => {
        // Use configuration constants
        const { DESKTOP_COLUMNS, MOBILE_COLUMNS, FEATURED_WIDTH, FEATURED_PLACEMENT_INTERVAL } = GRID_CONFIG;
        
        // Calculate how many slots we have to fill
        const totalRegularSlots = regularProjects.length;
        const totalFeaturedSlots = featuredProjects.length * FEATURED_WIDTH;
        const totalSlots = totalRegularSlots + totalFeaturedSlots;
        
        // Initialize arrays to track our grid
        const result = [];
        let currentGridState = []; // Represents the state of the current row being built
        let regularIndex = 0;
        let featuredIndex = 0;
        
        // Function to add a project to the result and update grid state
        const addToGrid = (project, width) => {
          result.push(project);
          
          // Update grid state (desktop layout)
          for (let i = 0; i < width; i++) {
            currentGridState.push(true);
          }
          
          // If we've filled a row or more, reset the grid state
          while (currentGridState.length >= DESKTOP_COLUMNS) {
            currentGridState = currentGridState.slice(DESKTOP_COLUMNS);
          }
        };
        
        // Distribute projects optimally across the grid
        while (regularIndex < regularProjects.length || featuredIndex < featuredProjects.length) {
          // Check if we can place a featured project in the current row
          const canPlaceFeatured = 
            featuredIndex < featuredProjects.length && 
            (currentGridState.length + FEATURED_WIDTH <= DESKTOP_COLUMNS);
          
          // Check if placing a featured project would minimize gaps
          const shouldPlaceFeatured = 
            canPlaceFeatured && 
            (
              // Place featured at start of row
              currentGridState.length === 0 ||
              // Place featured at end of row if it fits perfectly
              currentGridState.length === DESKTOP_COLUMNS - FEATURED_WIDTH ||
              // Place featured at strategic positions or if we're running out of regular projects
              regularIndex === regularProjects.length ||
              // Place featured after every ~6 regular projects for visual rhythm
              (featuredIndex < featuredProjects.length - 1 && 
              regularIndex > 0 && 
              regularIndex % FEATURED_PLACEMENT_INTERVAL === 0)
            );
            
          if (shouldPlaceFeatured) {
            // Place a featured project
            addToGrid(featuredProjects[featuredIndex], FEATURED_WIDTH);
            featuredIndex++;
          } else if (regularIndex < regularProjects.length) {
            // Place a regular project
            addToGrid(regularProjects[regularIndex], 1);
            regularIndex++;
          } else if (featuredIndex < featuredProjects.length) {
            // Force place remaining featured projects at the beginning of the next row
            if (currentGridState.length !== 0) {
              // Fill the current row with regular projects if available
              while (currentGridState.length < DESKTOP_COLUMNS && regularIndex < regularProjects.length) {
                addToGrid(regularProjects[regularIndex], 1);
                regularIndex++;
              }
              // Reset to start a new row
              currentGridState = [];
            }
            
            // Now place the featured project at the start of a row
            addToGrid(featuredProjects[featuredIndex], FEATURED_WIDTH);
            featuredIndex++;
          }
        }
        
        // If we still have incomplete row, fill it with any remaining projects
        // This should rarely happen with the logic above, but just in case
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
  }, [selectedCategory, searchTerm, projects]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Pagination calculations
  const totalProjects = filteredProjects.length;
  const effectivePerPage = perPage === -1 ? totalProjects || 1 : perPage;
  const totalPages = Math.max(1, Math.ceil(totalProjects / effectivePerPage));
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * effectivePerPage, currentPage * effectivePerPage);

  // Get featured projects
  const featuredProjects = projects.filter(project => project.featured);
  
  return (
    <>
      <Helmet>
        <title>Projects | Juan Lara</title>
        <meta name="description" content="Explore my portfolio of AI and machine learning projects, including TextInsight, RAG systems, and production-ready generative AI solutions." />
        <meta property="og:title" content="Projects | Juan Lara" />
        <meta property="og:description" content="AI & Machine Learning projects portfolio" />
        <meta name="keywords" content="AI Projects, Machine Learning Portfolio, TextInsight, RAG Systems, Python Projects" />
      </Helmet>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      {/* Hero Section + Scroll Indicator Container */}
      <div className="h-[calc(100dvh-5.5rem)] flex flex-col">
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative flex-1 flex items-center justify-center overflow-hidden"
        >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 -z-10"></div>
        
        {/* Decorative elements - adjusted for mobile */}
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 sm:-bottom-20 -left-10 sm:-left-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl -z-10"></div>
        
  <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center mb-0"
          >
            <motion.div variants={fadeInUp} className="mb-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium mb-2">
                <Layers size={14} className="mr-1.5" /> Project Portfolio
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Engineering Intelligent
              </span>
              <span className="block mt-1 text-gray-800 dark:text-gray-100">
                Solutions
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 sm:px-0"
            >
              A portfolio of AI, Machine Learning, and software engineering projects. Each represents a specific technical challenge solved through rigorous computational thinking.
            </motion.p>
            
            {/* Search and filter */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col gap-3 sm:gap-4 max-w-xl mx-auto px-2 sm:px-0"
            >
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none text-sm sm:text-base"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        </motion.section>
        
        {/* Scroll indicator */}
        <ScrollIndicator 
          fadeOutStart={0} 
          fadeOutEnd={300}
          className="flex-shrink-0"
        />
      </div>
      
      {/* All Projects Grid */}
      <section className="py-0 pb-16">
        <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewportSettings}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div 
              variants={motionVariants.scrollReveal.right()}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
            >
              <div className="flex items-center">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 sm:mr-4">
                  <Layers className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedCategory !== 'all' 
                    ? categories.find(c => c.id === selectedCategory)?.name 
                    : 'All Projects'}
                </h2>
              </div>
              
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </div>
            </motion.div>
            
            {/* Category pills for easier filtering on desktop - hide on mobile for cleaner look */}
            <motion.div 
              variants={fadeInUp}
              className="hidden md:flex flex-wrap gap-3 mb-6"
            >
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  aria-label={`Filter projects by ${category.name}`}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedCategory === category.id 
                      ? `bg-${category.color}-100 dark:bg-${category.color}-900/50 text-${category.color}-800 dark:text-${category.color}-200 border border-${category.color}-200 dark:border-${category.color}-800` 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'}`}
                >
                  {(() => {
                    if (typeof category.icon === 'function') {
                      const IconComponent = category.icon;
                      return <IconComponent size={16} className="mr-2" />;
                    }
                    return <Box size={16} className="mr-2" />;
                  })()}
                  {category.name}
                </button>
              ))}
            </motion.div>
            
            {filteredProjects.length === 0 ? (
              <motion.div 
                variants={fadeInUp}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No projects found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18"></path>
                  </svg>
                  Show all projects
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  variants={fadeInUp}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 auto-rows-auto mobile-grid-single"
                >
                  {paginatedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} inView={true} />
                  ))}
                </motion.div>

                {/* Pagination controls (clean, subtle) */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-700 dark:text-gray-100">{Math.min((currentPage - 1) * effectivePerPage + 1, totalProjects || 0)}</span>
                    &nbsp;–&nbsp;
                    <span className="font-medium text-gray-700 dark:text-gray-100">{Math.min(currentPage * effectivePerPage, totalProjects)}</span>
                    &nbsp;of&nbsp;<span className="font-medium">{totalProjects}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="sr-only">Items per page</label>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setPerPage(v);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-gray-700 dark:text-gray-100 bg-white/5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md focus:outline-none"
                      aria-label="Items per page"
                    >
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                      <option value={-1}>All</option>
                    </select>

                    <div className="inline-flex items-center rounded-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-800 shadow-sm">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <div className="px-3 text-sm text-gray-700 dark:text-gray-300">{currentPage} / {totalPages}</div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Collaboration CTA */}
    <section className="py-16 sm:py-24 bg-gray-900 dark:bg-gray-950 text-white">
      <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
          >
            Let's Build Something Amazing Together
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto px-2 sm:px-0"
          >
            Have a project idea or collaboration opportunity? I'm always interested in discussing new challenges and building innovative solutions.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="mailto:larajuand@outlook.com"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base"
            >
              <Mail size={18} />
              <span>Get in Touch</span>
            </Link>

            <Link
              to="https://github.com/JuanLara18"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base"
            >
              <Github size={18} />
              <span>View GitHub</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
    </div>
    </>
  );
}