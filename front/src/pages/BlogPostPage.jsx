import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import {
  Clock,
  ArrowLeft,
  Share2,
  BookOpen,
  ChevronUp,
  List,
  X,
  Check,
  Maximize2
} from 'lucide-react';
import { getPostBySlug, BLOG_CONFIG, scrollToElementCentered, getWebPPath, categoryToneClass } from '../utils/blogUtils';
import { postPath } from '../utils/postLinks';
import { MarkdownRenderer, AudioPlayer } from '../components/features/blog';
import ReadingMode from '../components/features/blog/ReadingMode';
import { ScrollFade } from '../components/features/blog/MarkdownRenderer/ReadingSurfaces';
import { HoverMotion } from '../components/layout';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

// Strip fenced code blocks from markdown so that comments inside code
// (e.g. Dockerfile `# ...`, bash `# ...`) are not mistaken for headings.
function stripCodeBlocks(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

// Strip the leading '# Title' line from markdown so it doesn't render as a
// duplicate H1 — the post hero already shows the title prominently.
function stripLeadingH1(markdown) {
  if (!markdown) return markdown;
  return markdown.replace(/^\s*#\s+[^\n]+\n+/, '');
}

// Table of Contents component
const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  
  useEffect(() => {
    // Extract headings from markdown content (excluding code blocks)
    const cleanContent = stripCodeBlocks(content);
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [];
    let match;
    
    while ((match = headingRegex.exec(cleanContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      matches.push({ level, text, id });
    }
    
    setHeadings(matches);
  }, [content]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );
    
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, [headings]);
  
  if (headings.length === 0) return null;

  // Function to smoothly scroll to element and center it
  const scrollToElement = (e, id) => {
    e.preventDefault();
    
    // Adjust navbar height based on screen size
    const navbarHeight = window.innerWidth < 768 ? 70 : 80;
    
    scrollToElementCentered(id, {
      navbarHeight,
      updateURL: true,
      highlightElement: true
    });
  };
  
  return (
    <nav>
      <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-4">
        Contents
      </h3>
      <ul className="space-y-1 border-l border-gray-200/60 dark:border-white/[0.08]">
        {headings.map(({ level, text, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => scrollToElement(e, id)}
              className={`block py-1 text-sm transition-colors duration-200 cursor-pointer leading-snug -ml-px border-l ${
                activeId === id
                  ? 'text-cyan-700 dark:text-brand-accent font-medium border-cyan-700 dark:border-brand-accent'
                  : 'text-gray-600 dark:text-brand-fg-muted hover:text-gray-900 dark:hover:text-brand-fg border-transparent'
              }`}
              style={{ paddingLeft: `${(level - 1) * 12 + 12}px` }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Helper function for creating URL-friendly slugs
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Mobile Table of Contents — floating button + bottom sheet drawer (visible below lg)
const MobileTableOfContents = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const cleanContent = stripCodeBlocks(content);
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(cleanContent)) !== null) {
      matches.push({ level: match[1].length, text: match[2].trim(), id: slugify(match[2].trim()) });
    }
    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [headings]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavigation = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    setTimeout(() => {
      const navbarHeight = window.innerWidth < 768 ? 70 : 80;
      scrollToElementCentered(id, { navbarHeight, updateURL: true, highlightElement: true });
    }, 200);
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Floating TOC button — circular accent (allowed: rounded-full on a circle) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-8 left-8 z-50 w-12 h-12 bg-cyan-700 hover:bg-cyan-800 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg rounded-full flex items-center justify-center transition-colors"
        aria-label="Table of Contents"
      >
        <List size={22} />
      </button>

      {/* Bottom sheet drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[200]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-brand-bg overflow-hidden border-t border-gray-200/60 dark:border-white/[0.08]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 dark:bg-cyan-400/30 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-gray-200/60 dark:border-white/[0.08]">
                <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                  Contents
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-cyan-400/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} className="text-gray-500 dark:text-brand-fg-muted" />
                </button>
              </div>
              {/* Headings list */}
              <div className="overflow-y-auto max-h-[calc(70vh-80px)] px-6 py-4">
                <ul className="space-y-0.5">
                  {headings.map(({ level, text, id }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(e) => handleNavigation(e, id)}
                        className={`block py-2 text-sm transition-colors duration-200 ${
                          activeId === id
                            ? 'text-cyan-700 dark:text-brand-accent font-medium'
                            : 'text-gray-600 dark:text-brand-fg-muted hover:text-gray-900 dark:hover:text-brand-fg'
                        }`}
                        style={{ paddingLeft: `${(level - 1) * 12 + 12}px`, paddingRight: '12px' }}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Toast notification for copy-to-clipboard feedback
const CopyToast = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-gray-900 dark:bg-brand-fg text-white dark:text-brand-bg text-sm font-medium flex items-center gap-2"
      >
        <Check size={16} />
        Link copied to clipboard
      </motion.div>
    )}
  </AnimatePresence>
);

// Scroll to top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsVisible(latest > 300);
    });
  }, [scrollY]);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (!isVisible) return null;
  
  return (
    <HoverMotion as={motion.button}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-cyan-700 hover:bg-cyan-800 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg rounded-full flex items-center justify-center transition-colors"
      scale={1.1}
      whileTap={{ scale: 0.9 }}
    >
      <ChevronUp size={24} />
    </HoverMotion>
  );
};

// Scroll progress bar component
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-cyan-700 dark:bg-brand-accent origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

export default function BlogPostPage() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const sidebarRef = useRef(null);

  // Bidirectional sticky sidebar: adjusts `top` based on scroll direction so the
  // whole sidebar travels with the page without needing its own scrollbar.
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const TOP_OFFSET = 96;   // 6rem – gap below navbar
    const BOTTOM_GAP = 24;   // breathing room at the bottom
    let lastY = window.scrollY;
    let curTop = TOP_OFFSET;
    el.style.top = `${curTop}px`;

    const recalc = () => {
      const sidebarH = el.offsetHeight;
      const vpH = window.innerHeight;
      const sy = window.scrollY;
      const delta = sy - lastY;

      if (sidebarH <= vpH - TOP_OFFSET - BOTTOM_GAP) {
        curTop = TOP_OFFSET;
      } else {
        const minTop = vpH - sidebarH - BOTTOM_GAP;
        curTop = Math.min(TOP_OFFSET, Math.max(minTop, curTop - delta));
      }

      el.style.top = `${curTop}px`;
      lastY = sy;
    };

    window.addEventListener('scroll', recalc, { passive: true });
    window.addEventListener('resize', recalc, { passive: true });
    return () => {
      window.removeEventListener('scroll', recalc);
      window.removeEventListener('resize', recalc);
    };
  }, [post]);

  // Transform values for smoother header parallax
  const headerY = useTransform(scrollY, [0, 400], [0, -60]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Safety net: force instant scroll-to-top synchronously whenever the post identity
  // changes. The global ScrollToTop in App.js already handles route changes, but the
  // lazy-loaded BlogPostPage bundle plus the async post fetch can cause a layout shift
  // after the initial scroll reset, leaving users a few hundred pixels down on mobile.
  // `behavior: 'instant'` bypasses the global `scroll-behavior: smooth` rule.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [category, slug]);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError(null);
        const postData = await getPostBySlug(category, slug);

        if (!postData) {
          // The slug exists under another category (the post was moved):
          // send the reader to its current address instead of a dead end.
          const moved = postPath(slug);
          if (moved) {
            navigate(moved + window.location.hash, { replace: true });
            return;
          }
          setError('Post not found');
          return;
        }

        setPost(postData);
        // Once the content has actually rendered, ensure the viewport is at the top.
        // The async fetch resolves after paint, so a second reset catches any shift
        // caused by markdown/hero image rendering.
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        });
      } catch (err) {
        setError('Failed to load post. Please try again later.');
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [category, slug, navigate]);
  
  // Share functionality
  const sharePost = async () => {
    const url = window.location.href;
    const title = post.title;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2500);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-700 dark:border-brand-accent mx-auto mb-4"></div>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">Loading post</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-bg flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-brand-fg-muted mb-4" />
          <h1 className="type-section text-2xl text-gray-900 dark:text-brand-fg mb-2">
            {error || 'Post not found.'}
          </h1>
          <p className="text-gray-600 dark:text-brand-fg-muted mb-6">
            The post you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <button
              onClick={() => navigate('/blog')}
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <Link
              to="/blog"
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
            >
              View all posts
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const categoryConfig = BLOG_CONFIG.categories[post.category];
  const withPublicUrl = (p) => {
    if (!p) return '';
    const base = process.env.PUBLIC_URL || '';
    if (p.startsWith('http')) return p;
    if (p.startsWith('/')) return `${base}${p}`;
    return `${base}/${p}`;
  };
  const headerImage = withPublicUrl(post.headerImage || `/blog/headers/default-${post.category}.jpg`);
  const baseImagePath = withPublicUrl(`/blog/figures/${post.category}`);
  
  return (
    <>
      <SEO
        title={`${post.title} · Juan Lara`}
        description={post.excerpt || post.description || `Read about ${post.title}. A deep dive into ${post.category}.`}
        canonical={`https://juanlara18.github.io/portfolio/blog/${post.category}/${post.slug}/`}
        image={headerImage.startsWith('http') ? headerImage : `https://juanlara18.github.io${headerImage}`}
        type="article"
        keywords={post.tags || [post.category, 'machine learning', 'AI', 'computer science']}
        article={{
          publishedDate: post.date,
          modifiedDate: post.modifiedDate || post.date,
          tags: post.tags,
          category: categoryConfig?.name || post.category,
          wordCount: post.estimatedWordCount || post.content?.split(/\s+/).length,
          readingTimeSec: post.readingTime ? post.readingTime * 60 : undefined,
          audioUrl: post.audio?.en?.url,
          audioDurationSec: post.audio?.en?.durationSec,
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://juanlara18.github.io/portfolio/' },
          { name: 'Blog', url: 'https://juanlara18.github.io/portfolio/blog/' },
          { name: categoryConfig?.name || post.category, url: `https://juanlara18.github.io/portfolio/blog/category/${post.category}/` },
          { name: post.title, url: `https://juanlara18.github.io/portfolio/blog/${post.category}/${post.slug}/` },
        ]}
      />
      
      {/* Reading Progress Bar */}
      <ScrollProgress />

      <div className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg min-h-screen">
      {/* Header with Hero Image */}
  <motion.section 
        ref={heroRef}
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative min-h-[450px] sm:min-h-[500px] md:min-h-[550px] overflow-hidden parallax-smooth"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <picture>
            <source 
              srcSet={getWebPPath(headerImage)} 
              type="image/webp" 
            />
            <img 
              src={headerImage}
              alt={post.title}
              className="w-full h-full object-cover brand-duotone"
              onError={(e) => {
                const fallbackByCat = withPublicUrl(`/blog/headers/default-${post.category}.jpg`);
                const fallback = withPublicUrl('/blog/headers/default.jpg');
                if (e.target.src !== fallbackByCat) {
                  e.target.src = fallbackByCat;
                } else if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
            />
          </picture>
          {/* Theme-aware overlay. Light mode = black gradient (max text contrast).
              Dark mode = night gradient that blends seamlessly into the page bg below. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/45 dark:from-brand-bg dark:via-brand-bg/85 dark:to-brand-bg/55"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full min-h-[450px] sm:min-h-[500px] md:min-h-[550px] flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="max-w-4xl"
            >
              {/* Back Button — inline mono link */}
              <div className="mb-5 sm:mb-7">
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-white hover:text-brand-accent transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden xs:inline">Back to blog</span>
                  <span className="xs:hidden">Back</span>
                </button>
              </div>

              {/* Category kicker — inline mono uppercase */}
              <div className="mb-4 sm:mb-5">
                <Link
                  to={`/blog/category/${post.category}`}
                  className="inline-flex items-center font-mono text-[10px] tracking-[0.18em] uppercase text-brand-accent hover:underline underline-offset-4 transition-colors"
                >
                  {categoryConfig?.name || post.category}
                </Link>
              </div>

              {/* Title — serif italic, closed by the amber period (night value: the hero is always dark) */}
              <h1 className="type-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 sm:mb-5 leading-[1.08]">
                {post.title}
                {!/[.!?]$/.test(post.title) && <span className="text-brand-contrast-night">.</span>}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.08em] uppercase text-white/95">
                <div className="flex items-center whitespace-nowrap">
                  <Clock size={12} className="mr-1.5" />
                  <span>{post.readingTime} min read</span>
                </div>
                <button
                  onClick={sharePost}
                  className="flex items-center hover:text-brand-accent transition-colors"
                >
                  <Share2 size={12} className="mr-1.5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setIsReadingMode(true)}
                  className="flex items-center hover:text-brand-accent transition-colors"
                  title="Reading mode"
                >
                  <Maximize2 size={12} className="mr-1.5" />
                  <span className="whitespace-nowrap">Reader</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Post Content */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container">
          <div>
            
            {/* Mobile post meta: category and tags in two rows that scroll
                sideways, so a long tag list does not fill the screen. */}
            {(() => {
              const items = [
                { key: 'category', to: `/blog/category/${post.category}`, label: categoryConfig?.name || post.category, cls: categoryToneClass(post.category) },
                ...(post.tags || []).map((tag) => ({ key: tag, to: `/blog/tag/${encodeURIComponent(tag)}`, label: tag, cls: 'text-gray-600 dark:text-brand-fg-muted' })),
              ];
              const total = items.reduce((n, i) => n + i.label.length, 0);
              let acc = 0;
              const rows = [[], []];
              items.forEach((i) => { rows[acc < total / 2 || rows[0].length === 0 ? 0 : 1].push(i); acc += i.label.length; });
              return (
                <ScrollFade className="lg:hidden mb-6 -mx-4 post-meta-scroll" label="Category and tags">
                  <div className="post-meta-rows font-mono text-[10px] tracking-[0.12em] uppercase">
                    {rows.filter((r) => r.length).map((row, r) => (
                      <div key={r} className="post-meta-row">
                        {row.map((i) => (
                          <Link key={i.key} to={i.to} className={`${i.cls} hover:text-cyan-700 dark:hover:text-brand-accent transition-colors`}>
                            {i.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollFade>
              );
            })()}

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <motion.article
                initial="hidden"
                animate="visible"
                variants={slideInLeft}
                className="lg:flex-1 lg:min-w-0"
              >
                <div>
                  {post.audio && <AudioPlayer audio={post.audio} />}

                  {post.excerpt && (
                    <div className="mb-6 sm:mb-8 pl-4 border-l border-cyan-700/40 dark:border-brand-accent/40">
                      <p className="font-display italic text-base sm:text-lg text-gray-700 dark:text-brand-fg/90 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  )}

                  <div className="post-body">
                    <MarkdownRenderer
                      content={stripLeadingH1(post.content)}
                      baseImagePath={baseImagePath}
                      className=""
                    />
                  </div>
                </div>
              </motion.article>
              
              {/* Sidebar — hidden on mobile, visible on desktop */}
              <aside
                ref={sidebarRef}
                className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 lg:flex-shrink-0 lg:gap-10 sticky self-start"
              >
                {/* Table of Contents */}
                <TableOfContents content={post.content} />

                {/* Post Stats */}
                <div>
                  <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
                    Post info
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-brand-fg/80 divide-y divide-gray-200/60 dark:divide-white/[0.08]">
                    <div className="flex items-center justify-between py-2">
                      <span className="flex items-center text-gray-500 dark:text-brand-fg-muted">
                        <Clock size={14} className="mr-2" />
                        Reading time
                      </span>
                      <span className="font-mono text-xs tabular-nums">{post.readingTime} min</span>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
                    Category
                  </h3>
                  <Link
                    to={`/blog/category/${post.category}`}
                    className="block group"
                  >
                    <div className="font-bold text-base text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">
                      {categoryConfig?.name || post.category}
                    </div>
                    {categoryConfig?.description && (
                      <div className="text-xs text-gray-600 dark:text-brand-fg-muted mt-2 leading-relaxed">
                        {categoryConfig?.description}
                      </div>
                    )}
                  </Link>
                </div>

                {/* Tags — inline mono uppercase, dot-separated */}
                {post.tags && post.tags.length > 0 && (
                  <div>
                    <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
                      Tags
                    </h3>
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase leading-[1.9]">
                      {post.tags.map((tag, index) => (
                        <span key={index}>
                          {index > 0 && <span className="mx-1.5 text-gray-400 dark:text-brand-fg-muted opacity-60">·</span>}
                          <Link
                            to={`/blog/tag/${encodeURIComponent(tag)}`}
                            className="text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
                          >
                            {tag}
                          </Link>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile Table of Contents */}
      <MobileTableOfContents content={post.content} />
      
      {/* Copy Toast */}
      <CopyToast show={showCopyToast} />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>

    {/* Reading Mode overlay */}
    <AnimatePresence>
      {isReadingMode && (
        <ReadingMode
          post={post}
          content={stripLeadingH1(post.content)}
          onClose={() => setIsReadingMode(false)}
          baseImagePath={baseImagePath}
        />
      )}
    </AnimatePresence>
    </>
  );
}