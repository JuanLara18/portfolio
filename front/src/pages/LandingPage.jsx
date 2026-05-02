import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import { variants as motionVariants, defaultViewportSettings } from '../utils';
import { ArrowUpRight, Server, Cpu, BrainCircuit, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollIndicator, HeroVisual } from '../components/ui';
import { HERO_BODY, HERO_CHIPS, PILLARS, ROLE } from '../data/brand';
import { loadAllPosts, BLOG_CONFIG } from '../utils/blogUtils';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

// Hero scroll thresholds. Subtle parallax/dampen, nothing showy.
const HERO_START = 150;
const HERO_END = 500;
const HEADING_END = 300;

export default function LandingPage() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [HERO_START, HERO_END], [1, 0.92]);
  const heroScale = useTransform(scrollY, [HERO_START, HERO_END], [1, 0.99]);
  const heroY = useTransform(scrollY, [HERO_START, HERO_END], [0, 10]);
  const headingY = useTransform(scrollY, [0, HEADING_END], [0, -15]);

  // Recent posts — pulled live from blog data, sorted by date desc, top 2.
  const [recentPosts, setRecentPosts] = useState([]);
  useEffect(() => {
    loadAllPosts().then((posts) => {
      const sorted = [...posts]
        .filter((p) => p && p.title && p.slug && p.category)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentPosts(sorted.slice(0, 2));
    });
  }, []);

  return (
    <>
      <SEO
        title="Juan Lara · Senior AI Engineer"
        description="Senior AI Engineer building production AI systems at enterprise scale. RAG platforms, agentic architectures, knowledge-grounded LLM applications. Engineering experience across regulated banking, retail logistics, healthcare AI, and Harvard research."
        keywords={[
          'Juan Lara',
          'Senior AI Engineer',
          'Production AI',
          'RAG',
          'Agentic Architectures',
          'Knowledge Systems',
          'LLM Ops',
          'Knowledge Data Engineer',
          'LangChain',
          'PyTorch'
        ]}
      />
      <div className="min-h-screen bg-white text-gray-900 dark:bg-brand-bg dark:text-brand-fg relative overflow-x-hidden">

      {/* Hero Section. Editorial. No floating blobs. No glassmorphism. */}
      <motion.section
        ref={heroRef}
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY
        }}
        className="hero-section relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12"
      >
        <div className="absolute inset-0 bg-white dark:bg-brand-bg -z-20"></div>
        
        {/* Single-column editorial hero. The type IS the hero. */}
        {/* Right-side animated constellation (lg+ only) breathes life into the canvas without competing with the type. */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <HeroVisual />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left relative"
            style={{ y: headingY }}
          >
            <motion.div variants={fadeInUp} className="mb-6 lg:mb-8">
              <p className="font-mono text-[11px] sm:text-xs tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                <span className="text-cyan-700 dark:text-brand-accent">{ROLE}</span> · Production AI
              </p>
            </motion.div>

            {/* Hero tagline. Newsreader italic ONLY here — short text, brand moment. */}
            <motion.h1
              ref={titleRef}
              variants={fadeInUp}
              className="font-display italic font-semibold text-[2.6rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 leading-[0.98] tracking-[-0.025em] max-w-5xl mx-auto lg:mx-0"
            >
              <motion.span
                className="text-cyan-700 dark:text-brand-accent inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Frontier AI.
              </motion.span>
              <motion.span
                className="block text-gray-900 dark:text-brand-fg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Engineered for production.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-sans text-base sm:text-lg text-gray-600 dark:text-gray-300/85 mb-6 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {HERO_BODY}
            </motion.p>

            {/* Hero chips — hidden on mobile for a cleaner above-the-fold; visible on md+ */}
            <motion.div
              variants={fadeInUp}
              className="hidden md:flex flex-wrap justify-center lg:justify-start gap-2.5 mb-8 lg:mb-12"
            >
              {HERO_CHIPS.map((tag, i) => (
                <span
                  key={i}
                  className="font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-2 border border-gray-300 dark:border-cyan-400/25 text-gray-700 dark:text-brand-fg/80 hover:border-cyan-700 dark:hover:border-brand-accent hover:text-cyan-700 dark:hover:text-brand-accent transition-colors duration-200 cursor-default"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTAs — uniform editorial pattern: label + icon, hover cyan. No filled primary, all ghost. */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 sm:gap-x-8 mb-4 sm:mb-6 lg:mb-8"
            >
              <Link
                to="/projects"
                className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-medium text-gray-900 dark:text-brand-fg hover:text-cyan-700 dark:hover:text-brand-accent transition-colors touch-target"
              >
                <span>Projects</span>
                <ArrowUpRight size={16} className="text-cyan-700 dark:text-brand-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                to="/blog"
                className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-medium text-gray-900 dark:text-brand-fg hover:text-cyan-700 dark:hover:text-brand-accent transition-colors touch-target"
              >
                <span>Blog</span>
                <ArrowRight size={16} className="text-cyan-700 dark:text-brand-accent transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <a
                href={`${process.env.PUBLIC_URL}/documents/CV___EN.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-medium text-gray-900 dark:text-brand-fg hover:text-cyan-700 dark:hover:text-brand-accent transition-colors touch-target"
              >
                <span>Curriculum</span>
                <Download size={15} className="text-cyan-700 dark:text-brand-accent transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Scroll indicator */}
      <div className="bg-white dark:bg-brand-bg">
        <ScrollIndicator 
          fadeOutStart={0} 
          fadeOutEnd={100}
        />
      </div>
      
      {/* Value Pillars Section. Editorial. No background gradients. */}
      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewportSettings} className="text-center mb-12 sm:mb-16">
            <motion.p variants={fadeInUp} className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
              Why Work With Me
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 dark:text-brand-fg tracking-tight leading-tight">
              Three pillars. <span className="text-cyan-700 dark:text-brand-accent">One discipline.</span>
            </motion.h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewportSettings}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Pillar 1 — Production AI Systems */}
            <motion.div variants={motionVariants.scrollReveal.up()} className="group">
              <div className="flex items-start gap-5 sm:gap-6">
                <Server strokeWidth={1.3} className="w-7 h-7 sm:w-11 sm:h-11 text-cyan-700 dark:text-brand-accent flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-105" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-900 dark:text-brand-fg tracking-tight leading-[1.15] mb-2 sm:mb-3">
                    {PILLARS[0].name}.
                  </h3>
                  <p className="text-gray-600 dark:text-brand-fg-muted leading-relaxed text-sm sm:text-[15px]">
                    {PILLARS[0].homeCopy}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pillar 2 — Engineering Practice */}
            <motion.div variants={motionVariants.scrollReveal.up()} className="group">
              <div className="flex items-start gap-5 sm:gap-6">
                <Cpu strokeWidth={1.3} className="w-7 h-7 sm:w-11 sm:h-11 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-105" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-900 dark:text-brand-fg tracking-tight leading-[1.15] mb-2 sm:mb-3">
                    {PILLARS[1].name}.
                  </h3>
                  <p className="text-gray-600 dark:text-brand-fg-muted leading-relaxed text-sm sm:text-[15px]">
                    {PILLARS[1].homeCopy}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pillar 3 — Applied Research */}
            <motion.div variants={motionVariants.scrollReveal.up()} className="group">
              <div className="flex items-start gap-5 sm:gap-6">
                <BrainCircuit strokeWidth={1.3} className="w-7 h-7 sm:w-11 sm:h-11 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-105" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-900 dark:text-brand-fg tracking-tight leading-[1.15] mb-2 sm:mb-3">
                    {PILLARS[2].name}.
                  </h3>
                  <p className="text-gray-600 dark:text-brand-fg-muted leading-relaxed text-sm sm:text-[15px]">
                    {PILLARS[2].homeCopy}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Recent Updates / Blog preview — same container width as Pillars for visual coherence */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-brand-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewportSettings} className="flex items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-cyan-400/15">
            <motion.div variants={fadeInUp}>
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-1">
                From the blog
              </p>
              <h2 className="font-bold text-2xl sm:text-3xl text-gray-900 dark:text-brand-fg tracking-tight leading-tight">
                Latest writing<span className="text-cyan-700 dark:text-brand-accent">.</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link
                to="/blog"
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft transition-colors"
              >
                <span>Browse all</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Blog Previews — pulled live from blog data, sorted by date desc. Editorial divided list. */}
          {recentPosts.length > 0 && (
            <div>
              {recentPosts.map((post, i) => {
                const categoryLabel = BLOG_CONFIG.categories?.[post.category]?.name || post.category;
                const kicker = i === 0 ? 'Latest post' : categoryLabel;
                return (
                  <motion.div
                    key={`${post.category}/${post.slug}`}
                    variants={motionVariants.scrollReveal.up()}
                    className="group border-b border-gray-200 dark:border-cyan-400/15 hover:border-cyan-700/40 dark:hover:border-brand-accent/40 transition-colors last:border-b-0"
                  >
                    <Link to={`/blog/${post.category}/${post.slug}`} className="block py-5 sm:py-6">
                      <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
                        <div className="md:w-36 flex-shrink-0">
                          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent">
                            {kicker}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg sm:text-2xl tracking-tight leading-snug text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors mb-1">
                            {post.title}
                            {!/[.!?]$/.test(post.title) && '.'}
                          </h4>
                          {post.excerpt && (
                            <p className="text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="hidden md:flex items-center text-cyan-700 dark:text-brand-accent flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      </div>
    </>
  );
}