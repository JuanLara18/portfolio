import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { variants as motionVariants, defaultViewportSettings, earlyViewportSettings } from '../utils';
import { Github, Linkedin, Mail, ExternalLink, Code, Terminal, Database, Server, Cpu, TerminalSquare, FileCode, FileText, Braces, Layers, User, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import components from new structure
import { TypingTerminal, TechIcon, ParticleBackground, ScrollIndicator } from '../components/ui';
import { HoverMotion } from '../components/layout';

// Constantes de configuración de scroll
const SCROLL_CONFIG = {
  HERO_START: 150,
  HERO_END: 500,
  HEADING_END: 300,
  PARALLAX_RANGE: 300,
  SCROLL_THRESHOLD: 50,
  SECTION_THRESHOLDS: {
    HERO: 600,
    ABOUT: 1200,
    EXPERIENCE: 1800
  }
};

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();
const slideInRight = motionVariants.fadeInRight();
const slideInLeft = motionVariants.fadeInLeft();

// Custom smooth card animations for landing previews
const smoothCardLeft = {
  hidden: { 
    opacity: 0, 
    x: -30, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  }
};

const smoothCardRight = {
  hidden: { 
    opacity: 0, 
    x: 30, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.1
    } 
  }
};

// Custom stagger for preview cards
const previewStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
const scaleUp = motionVariants.scaleUp();

// Main landing page component
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Enhanced transform values based on scroll position for parallax effects
  const heroOpacity = useTransform(scrollY, [SCROLL_CONFIG.HERO_START, SCROLL_CONFIG.HERO_END], [1, 0.9]);
  const heroScale = useTransform(scrollY, [SCROLL_CONFIG.HERO_START, SCROLL_CONFIG.HERO_END], [1, 0.98]);
  const heroY = useTransform(scrollY, [SCROLL_CONFIG.HERO_START, SCROLL_CONFIG.HERO_END], [0, 10]);
  const headingY = useTransform(scrollY, [0, SCROLL_CONFIG.HEADING_END], [0, -15]);
  
  // Parallax for decorative elements
  const bgElement1Y = useTransform(scrollY, [0, SCROLL_CONFIG.PARALLAX_RANGE], [0, 30]);
  const bgElement2Y = useTransform(scrollY, [0, SCROLL_CONFIG.PARALLAX_RANGE], [0, -20]);
  
  // Handle scroll events
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_CONFIG.SCROLL_THRESHOLD);
    
    // Determine active section
    if (latest < SCROLL_CONFIG.SECTION_THRESHOLDS.HERO) {
      setActiveSection('hero');
    } else if (latest < SCROLL_CONFIG.SECTION_THRESHOLDS.ABOUT) {
      setActiveSection('about');
    } else if (latest < SCROLL_CONFIG.SECTION_THRESHOLDS.EXPERIENCE) {
      setActiveSection('experience');
    } else {
      setActiveSection('projects');
    }
  });
  
  // Handle mouse movement with debounce for better performance
  useEffect(() => {
    let timeoutId;
    
    const handleMouseMove = (e) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 10); // Slight debounce for smoother experience
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Enhanced scroll to content function with smooth acceleration
  const scrollToContent = () => {
    const targetPosition = window.innerHeight - 80;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;
    
    // Easing function for smooth acceleration/deceleration
    const easeInOutCubic = (t) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * eased);
      
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };
    
    window.requestAnimationFrame(animate);
  };

  // Determine active nav link class
  const getNavClass = (section) => {
    return activeSection === section
      ? "relative py-1 font-medium text-blue-600 dark:text-blue-400 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-blue-600 dark:before:bg-blue-400 before:transform before:origin-left transform transition duration-300"
      : "relative py-1 hover:text-blue-600 dark:hover:text-blue-400 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-blue-600 dark:before:bg-blue-400 before:transform before:scale-x-0 before:origin-left hover:before:scale-x-100 transform transition duration-300";
  };
  
  return (
    <>
      <Helmet>
        <title>Juan Lara</title>
        <meta name="description" content="LLM/ML Specialist with 3+ years developing production-ready generative AI solutions. Specializing in RAG systems, LLM fine-tuning, and cloud deployment." />
        <meta property="og:title" content="Juan Lara - LLM/ML Specialist" />
        <meta property="og:description" content="Computer Scientist & Mathematician building AI-powered solutions" />
        <meta name="keywords" content="LLM, RAG, MLOps, AWS, GCP, Python, AI Engineer, Machine Learning" />
      </Helmet>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 relative overflow-x-hidden">
      
      {/* Hero Section with Enhanced Technical Grid */}
      <motion.section 
        ref={heroRef}
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY // Apply parallax effect on scroll
        }}
        className="hero-section relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12"
      >
        {/* Enhanced Particle Grid Background */}
  <ParticleBackground mousePosition={mousePosition} />
        
        {/* Floating decorative elements with parallax effect */}
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-3xl -z-10"
          style={{ y: bgElement1Y }}
        />
        <motion.div 
          className="absolute bottom-40 left-10 w-64 h-64 rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-3xl -z-10"
          style={{ y: bgElement2Y }}
        />
        
        {/* Gradient overlays for smooth fading */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-0"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-0"></div>
        
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10 -mt-8 sm:-mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-3 text-center lg:text-left px-2 sm:px-0"
              style={{ y: headingY }} // Counter-parallax for content
            >
              <motion.div variants={fadeInUp} className="mb-3 lg:mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm font-medium mb-3 lg:mb-4 backdrop-blur-sm">
                  <Code size={12} className="mr-1.5 sm:mr-1.5" /> LLM/ML Specialist at GenomAI
                </div>
              </motion.div>
              
              {/* Enhanced text reveal animation with mobile optimization */}
              <motion.h1 
                ref={titleRef}
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 inline-block  pb-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Shaping the future
                </motion.span>
                <motion.span 
                  className="block mt-1 lg:mt-2 text-gray-800 dark:text-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  with Generative AI
                </motion.span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 lg:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0"
              >
                Building production-ready AI systems with LLM fine-tuning, RAG architectures, and scalable cloud deployment.
              </motion.p>
              
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6 lg:mb-8 px-2 sm:px-0"
              >
                <HoverMotion as={motion.span}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 backdrop-blur-sm transition-all duration-300 touch-target"
                >
                  LLM
                </HoverMotion>
                <HoverMotion as={motion.span}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 backdrop-blur-sm transition-all duration-300 touch-target"
                >
                  RAG
                </HoverMotion>
                <HoverMotion as={motion.span}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 backdrop-blur-sm transition-all duration-300 touch-target"
                >
                  MLOps
                </HoverMotion>
                <HoverMotion as={motion.span}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800 backdrop-blur-sm transition-all duration-300 touch-target"
                >
                  AWS
                </HoverMotion>
                <HoverMotion as={motion.span}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 backdrop-blur-sm transition-all duration-300 touch-target"
                >
                  GCP
                </HoverMotion>
              </motion.div>
              
              {/* Enhanced CTA buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 mb-6 lg:mb-8 px-2 sm:px-0"
              >
                <Link 
                  to="/projects" 
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg touch-target"
                >
                  <span className="z-10 relative">View Projects</span>
                  <ExternalLink size={16} className="z-10 relative transition-transform duration-150 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-blue-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                </Link>
                <Link 
                  to="/documents/CV___EN.pdf" 
                  className="w-full sm:w-auto px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg group hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden touch-target"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="relative z-10">Download CV</span>
                  <svg 
                    className="w-4 h-4 transform transition-transform duration-150 group-hover:translate-x-1 group-hover:translate-y-1 relative z-10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                  </svg>
                  {/* Add subtle glow on hover */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-blue-300 dark:bg-blue-700 rounded-lg transition-opacity duration-300"
                  />
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Enhanced Terminal Card */}
            <HoverMotion as={motion.div}
              variants={scaleUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 mt-8 lg:mt-0 px-2 sm:px-0"
              y={-5}
              duration={0.3}
            >
              <div className="relative">
                {/* Simplified decorative shapes for mobile */}
                <motion.div 
                  className="absolute -top-6 -left-6 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-blue-200/20 dark:bg-blue-900/10 rounded-lg z-0 hidden sm:block"
                  initial={{ rotate: 12, scale: 0.9 }}
                  animate={{ 
                    rotate: [12, 15, 12, 9, 12],
                    scale: [0.9, 1, 0.95, 1, 0.9],
                    transition: { 
                      duration: 10, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
                <motion.div 
                  className="absolute -bottom-14 -right-14 w-60 h-60 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-lg z-0"
                  initial={{ rotate: -12, scale: 0.95 }}
                  animate={{ 
                    rotate: [-12, -9, -12, -15, -12],
                    scale: [0.95, 1.05, 1, 0.98, 0.95],
                    transition: { 
                      duration: 12, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
                
                {/* Enhanced terminal card with mobile optimization */}
                <div className="relative z-10 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500">
                  <TypingTerminal text="const profile = {\n  name: 'Juan Lara',\n  role: 'LLM/ML Specialist @ GenomAI',\n  expertise: ['LLM', 'RAG', 'MLOps'],\n  stack: ['Python', 'PyTorch', 'AWS', 'GCP'],\n  education: [\n    'B.S. Computer Science',\n    'B.S. Mathematics'\n  ],\n  mission: 'Building next-gen AI systems'\n};" />

                  <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                    <TechIcon icon={BrainCircuit} label="GenAI" delay={0.2} />
                    <TechIcon icon={Database} label="Vector DB" delay={0.4} />
                    <TechIcon icon={Server} label="DevOps" delay={0.6} />
                  </div>
                </div>
              </div>
            </HoverMotion>
          </div>
          
        {/* Subtle cursor effect for desktop only */}
        <motion.div 
          className="fixed w-6 h-6 rounded-full border-2 border-blue-400/30 dark:border-blue-500/30 pointer-events-none z-50 hidden md:block"
          style={{ 
            left: mousePosition.x - 12, 
            top: mousePosition.y - 12,
            opacity: scrolled ? 0 : 0.6
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            transition: { duration: 1, repeat: Infinity }
          }}
        />
        </div>
      </motion.section>
      
      {/* Scroll indicator */}
      <div className="bg-white dark:bg-gray-900">
        <ScrollIndicator 
          fadeOutStart={0} 
          fadeOutEnd={100}
        />
      </div>
      
      {/* Section Previews */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mobile-card-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewportSettings}
            variants={previewStagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
          >
            {/* About Preview */}
            <motion.div 
              variants={motionVariants.scrollReveal.left()}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 mobile-smooth-transition mobile-card-large mobile-card-optimized"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 mr-3">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Background</h3>
                  <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400"></div>
                </div>
              </div>
              <div className="max-w-3xl text-left">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Computer Scientist & Mathematician with 3+ years developing generative AI solutions. Currently building clinical decision support systems at GenomAI and contributing to research at Harvard University.
                </p>
                <HoverMotion>
                  <Link to="/about" className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 group">
                    Learn more
                    <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </HoverMotion>
              </div>
            </motion.div>
            
            
            {/* Projects Preview */}
            <motion.div 
              variants={smoothCardRight}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 mobile-smooth-transition mobile-card-large mobile-card-optimized"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 mr-3">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Featured Work</h3>
                  <div className="w-20 h-1 bg-blue-600 dark:bg-blue-400"></div>
                </div>
              </div>
              <div className="max-w-3xl text-left">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  End-to-end AI solutions from multilingual NLP libraries to scalable RAG systems. Each project emphasizes production deployment and measurable business impact.
                </p>
                <HoverMotion>
                  <Link to="/projects" className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 group">
                    View projects
                    <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </HoverMotion>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Blog and Contact Preview */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewportSettings} className="text-center">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4">Recent Updates</motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 text-center"
            >
              Latest insights and professional certifications in AI and machine learning.
            </motion.p>
          </motion.div>
          
          {/* Blog Previews */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Latest Blog Post */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-xl group flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] font-semibold rounded uppercase tracking-wide mb-2">
                    Latest Post
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    <Link to="/blog/research/embeddings-geometry-of-meaning" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Embeddings: The Geometry of Meaning
                    </Link>
                  </h4>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3 ml-[52px]">
                October 22, 2025 • 18 min read
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-grow ml-[52px]">
                How do you teach a computer what 'king' means? A deep dive into embeddings, from Word2Vec to modern transformers.
              </p>
              <div className="ml-[52px]">
                <Link 
                  to="/blog/research/embeddings-geometry-of-meaning" 
                  className="inline-flex items-center font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-300 group text-sm"
                >
                  Read post
                  <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </motion.div>
            
            {/* Latest Certification */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-xl group flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 text-[10px] font-semibold rounded uppercase tracking-wide mb-2">
                    New Certification
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    <a href="https://www.datacamp.com/certificate/AIEDA0019827293059" target="_blank" rel="noreferrer" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      AI Engineer for Developers Associate
                    </a>
                  </h4>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3 ml-[52px]">
                DataCamp • July 2025
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-grow ml-[52px]">
                Advanced certification covering LLM engineering, RAG systems, and production-ready AI development practices.
              </p>
              <div className="ml-[52px]">
                <a 
                  href="https://www.datacamp.com/certificate/AIEDA0019827293059"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center font-semibold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-300 group text-sm"
                >
                  View certificate
                  <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer/Contact */}
      <footer className="py-8 sm:py-12 bg-gray-900 text-white" id="contact">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 
              variants={fadeInUp} 
              className="text-2xl font-bold mb-8 text-center"
            >
              Let's Connect
            </motion.h2>
            
            <HoverMotion as={motion.div}
              className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl border border-gray-700 mb-6 sm:mb-8 mobile-smooth-transition mobile-card-large"
              y={-5}
              duration={0.3}
              variants={scaleUp}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                  <p className="text-gray-400 mb-6">
                    Always interested in new projects, research collaborations, and discussing innovative challenges in AI and computational mathematics.
                  </p>
                  <div className="flex items-center mb-4">
                    <Mail className="text-blue-400 mr-3" size={18} />
                    <span className="text-gray-300">larajuand@outlook.com</span>
                  </div>
                  <div className="flex items-center">
                    <Terminal className="text-blue-400 mr-3" size={18} />
                    <span className="text-gray-300">Bogotá, Colombia</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex flex-col space-y-3 sm:space-y-4">
                    <HoverMotion as={motion.a}
                      href="https://github.com/JuanLara18" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition"
                      y={-2}
                      duration={0.2}
                    >
                      <Github className="mr-3 text-white" size={20} />
                      <span>GitHub</span>
                      <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white dark:via-gray-200 to-transparent skew-x-20"
                        animate={{ 
                          x: ["200%", "-200%"],
                          transition: { 
                            repeat: Infinity, 
                            repeatType: "loop", 
                            duration: 2,
                            ease: "easeInOut",
                            repeatDelay: 0.2
                          } 
                        }}
                      />
                    </HoverMotion>
                    <HoverMotion as={motion.a}
                      href="https://www.linkedin.com/in/julara/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition"
                      y={-2}
                      duration={0.2}
                    >
                      <Linkedin className="mr-3 text-white" size={20} />
                      <span>LinkedIn</span>
                      <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white dark:via-gray-200 to-transparent skew-x-20"
                        animate={{ 
                          x: ["200%", "-200%"],
                          transition: { 
                            repeat: Infinity, 
                            repeatType: "loop", 
                            duration: 2,
                            ease: "easeInOut",
                            repeatDelay: 0.2
                          } 
                        }}
                      />
                    </HoverMotion>
                    <HoverMotion as={motion.a}
                      href="mailto:larajuand@outlook.com" 
                      className="flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition"
                      y={-2}
                      duration={0.2}
                    >
                      <Mail className="mr-3 text-white" size={20} />
                      <span>Email</span>
                      <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white dark:via-gray-200 to-transparent skew-x-20"
                        animate={{ 
                          x: ["200%", "-200%"],
                          transition: { 
                            repeat: Infinity, 
                            repeatType: "loop", 
                            duration: 2,
                            ease: "easeInOut",
                            repeatDelay: 0.2
                          } 
                        }}
                      />
                    </HoverMotion>
                  </div>
                </div>
              </div>
            </HoverMotion>
            
            <motion.p 
              variants={fadeInUp}
              className="text-center text-gray-400 text-sm"
            >
              © {new Date().getFullYear()} Juan Lara. All rights reserved.
            </motion.p>
          </motion.div>
        </div>
      </footer>
      </div>
    </>
  );
}