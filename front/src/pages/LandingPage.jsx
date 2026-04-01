import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SEO, defaultSEO } from '../components/common/SEO';
import { variants as motionVariants, defaultViewportSettings, earlyViewportSettings } from '../utils';
import { Github, Linkedin, Mail, ExternalLink, Code, Terminal, Database, Server, Cpu, TerminalSquare, FileCode, FileText, Braces, Layers, User, BrainCircuit, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import components from new structure
import { TechIcon, ScrollIndicator } from '../components/ui';
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
      <SEO
        title="Juan Lara | AI Engineer — Research to Production"
        description="Research-minded AI Engineer specializing in LLM systems, NLP, and taking ML from concept to production. CS + Mathematics foundation, experience spanning Harvard research to enterprise-scale AI."
        keywords={[
          'Juan Lara',
          'AI Engineer',
          'LLM Systems',
          'NLP',
          'RAG',
          'Production ML',
          'Applied Research',
          'Python',
          'Machine Learning',
          'GenAI',
          'LangChain',
          'PyTorch'
        ]}
      />
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
        {/* Clean Background */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900 -z-20"></div>
        
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
                  <Code size={12} className="mr-1.5 sm:mr-1.5" /> AI Engineer
                </div>
              </motion.div>
              
              {/* Enhanced text reveal animation with mobile optimization */}
              <motion.h1 
                ref={titleRef}
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 inline-block pb-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Bridging the gap
                </motion.span>
                <motion.span 
                  className="block mt-1 lg:mt-2 text-gray-800 dark:text-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  from research to scalable production
                </motion.span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-5 lg:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0"
              >
                I transform complex mathematical models and AI research into robust, enterprise-grade applications. Specializing in autonomous agents, distributed systems, and driving measurable business impact through scalable ML engineering.
              </motion.p>
              
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-8 lg:mb-10 px-2 sm:px-0"
              >
                {[
                  'Autonomous Agents', 
                  'Distributed Systems', 
                  'Enterprise MLOps', 
                  'Scalable Architecture'
                ].map((tag, i) => (
                  <HoverMotion as={motion.span}
                    key={i}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 cursor-default"
                    y={-2}
                  >
                    {tag}
                  </HoverMotion>
                ))}
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
                <a 
                  href={`${process.env.PUBLIC_URL}/documents/CV___EN.pdf`}
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
                </a>
              </motion.div>
            </motion.div>
            
            {/* Interactive Value Delivered Card */}
            <HoverMotion as={motion.div}
              variants={scaleUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 mt-8 lg:mt-0 px-2 sm:px-0 relative"
              y={-5}
              duration={0.3}
            >
              {/* Decorative backgrounds */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-10 blur-2xl rounded-[3rem] z-0"></div>
              
              <div className="relative z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] sm:rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50">
                <h3 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4 sm:mb-6 tracking-tight px-1 sm:px-2">
                  Value Delivered
                </h3>
                
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Item 1 */}
                  <div className="group relative p-3.5 sm:p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50 shadow-none hover:shadow-sm transition-all duration-300 cursor-default overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <BrainCircuit size={20} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-base leading-tight">Intelligent Systems</p>
                        <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">Automating complex enterprise workflows.</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="group relative p-3.5 sm:p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-purple-100 dark:hover:border-purple-900/50 shadow-none hover:shadow-sm transition-all duration-300 cursor-default overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100/50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Server size={20} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-base leading-tight">Scalable Architecture</p>
                        <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">Low-latency models deployed at scale.</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="group relative p-3.5 sm:p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 shadow-none hover:shadow-sm transition-all duration-300 cursor-default overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Cpu size={20} strokeWidth={2} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-base leading-tight">Applied Research</p>
                        <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">Bridging theory and business solutions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </HoverMotion>
          </div>
        </div>
      </motion.section>
      
      {/* Scroll indicator */}
      <div className="bg-white dark:bg-gray-900">
        <ScrollIndicator 
          fadeOutStart={0} 
          fadeOutEnd={100}
        />
      </div>
      
      {/* Value Pillars Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle background gradient to avoid flat colors or hard lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10 pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewportSettings} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">Why Work With Me</motion.h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewportSettings}
            variants={previewStagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Pillar 1: Research */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-gray-600 transition-all duration-500 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 dark:from-transparent dark:to-transparent dark:group-hover:from-blue-900/12 dark:group-hover:to-transparent transition-opacity duration-500 pointer-events-none"></div>
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 dark:from-blue-950/80 dark:to-blue-950/40 dark:text-blue-400 mb-6 shadow-sm dark:shadow-none transform group-hover:scale-110 transition-transform duration-500 relative z-10">
                <BrainCircuit size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 relative z-10">Applied Research</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm relative z-10">
                Translating SOTA mathematical models and papers into practical algorithms that solve complex problems.
              </p>
            </motion.div>
            
            {/* Pillar 2: Engineering */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-gray-600 transition-all duration-500 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 dark:from-transparent dark:to-transparent dark:group-hover:from-indigo-900/12 dark:group-hover:to-transparent transition-opacity duration-500 pointer-events-none"></div>
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 dark:from-indigo-950/80 dark:to-indigo-950/40 dark:text-indigo-400 mb-6 shadow-sm dark:shadow-none transform group-hover:scale-110 transition-transform duration-500 relative z-10">
                <Server size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 relative z-10">Scalable Engineering</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm relative z-10">
                Building robust data pipelines, optimizing inference latency, and deploying ML systems on the cloud.
              </p>
            </motion.div>

            {/* Pillar 3: ROI */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-gray-600 transition-all duration-500 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 dark:from-transparent dark:to-transparent dark:group-hover:from-green-900/12 dark:group-hover:to-transparent transition-opacity duration-500 pointer-events-none"></div>
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 dark:from-green-950/80 dark:to-green-950/40 dark:text-green-400 mb-6 shadow-sm dark:shadow-none transform group-hover:scale-110 transition-transform duration-500 relative z-10">
                <TrendingUp size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 relative z-10">Business Impact</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm relative z-10">
                Creating AI solutions that automate workflows, reduce operational costs, and deliver measurable ROI.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Blog and Contact Preview */}
      <section className="py-16 sm:py-24 bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewportSettings} className="text-center">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2 sm:mb-4">Recent Updates</motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 text-center"
            >
              Latest insights and featured projects in AI and machine learning.
            </motion.p>
          </motion.div>
          
          {/* Blog Previews */}
          <div className="max-w-4xl mx-auto flex flex-col gap-5">
            {/* Latest Blog Post */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden relative cursor-pointer"
            >
              <Link to="/blog/field-notes/reinforcement-learning-in-practice" className="block p-5 sm:p-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 flex-1 min-w-0 pr-5 md:pr-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 dark:from-indigo-900/60 dark:to-indigo-800/20 dark:text-indigo-400 flex-shrink-0 transform group-hover:scale-105 transition-transform duration-500 shadow-sm mt-0.5 sm:mt-0">
                      <FileText size={22} strokeWidth={1.5} className="sm:w-[28px] sm:h-[28px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-1.5 sm:mb-1">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap">
                          Latest Post
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                          Feb 5, 2026 <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span> 65 min read
                        </span>
                      </div>
                      <h4 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white leading-snug sm:leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        Reinforcement Learning in Practice
                      </h4>
                    </div>
                  </div>
                  
                  {/* Right Side: Expanding text + Arrow on Desktop */}
                  <div className="hidden md:flex items-center justify-end pl-4 w-1/3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 border-l border-gray-100 dark:border-gray-700/50">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed text-right mr-4">
                      Implementation details that papers omit — deployment patterns, optimization tricks, and engineering decisions.
                    </p>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </div>
                  </div>
                  
                  {/* Mobile Arrow */}
                  <div className="md:hidden absolute top-1/2 -translate-y-1/2 right-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                     <span className="transform group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  </div>
                </div>
                {/* Background hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent dark:via-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out"></div>
              </Link>
            </motion.div>
            
            {/* Featured Article */}
            <motion.div 
              variants={motionVariants.scrollReveal.up()}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden relative cursor-pointer"
            >
              <Link to="/blog/deep-dives/reinforcement-learning-first-principles" className="block p-5 sm:p-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 flex-1 min-w-0 pr-5 md:pr-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 dark:from-green-900/60 dark:to-green-800/20 dark:text-green-400 flex-shrink-0 transform group-hover:scale-105 transition-transform duration-500 shadow-sm mt-0.5 sm:mt-0">
                      <BrainCircuit size={22} strokeWidth={1.5} className="sm:w-[28px] sm:h-[28px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-1.5 sm:mb-1">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-[9px] sm:text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap">
                          Featured Article
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                          Jan 20, 2026 <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span> 90 min read
                        </span>
                      </div>
                      <h4 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white leading-snug sm:leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                        Reinforcement Learning
                      </h4>
                    </div>
                  </div>
                  
                  {/* Right Side: Expanding text + Arrow on Desktop */}
                  <div className="hidden md:flex items-center justify-end pl-4 w-1/3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 border-l border-gray-100 dark:border-gray-700/50">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed text-right mr-4">
                      Bridging the gap between mathematical foundations of MDPs, Bellman equations, and practical implementation.
                    </p>
                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </div>
                  </div>
                  
                  {/* Mobile Arrow */}
                  <div className="md:hidden absolute top-1/2 -translate-y-1/2 right-4 text-gray-300 dark:text-gray-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                     <span className="transform group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  </div>
                </div>
                {/* Background hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/30 to-transparent dark:via-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out"></div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      </div>
    </>
  );
}