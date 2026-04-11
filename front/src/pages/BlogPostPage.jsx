import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  BookOpen,
  ChevronUp,
  List,
  X,
  Check,
  Maximize2,
  ArrowDownUp
} from 'lucide-react';
import { getPostBySlug, BLOG_CONFIG, formatDate, scrollToElementCentered, getWebPPath } from '../utils/blogUtils';
import { MarkdownRenderer, AudioPlayer } from '../components/features/blog';
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
    <nav className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        <BookOpen size={16} className="mr-2" />
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {headings.map(({ level, text, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => scrollToElement(e, id)}
              className={`block py-1 text-sm transition-colors duration-200 cursor-pointer ${
                activeId === id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              style={{ paddingLeft: `${(level - 1) * 12}px` }}
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
      {/* Floating TOC button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-8 left-8 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <BookOpen size={18} className="mr-2" />
                  Table of Contents
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
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
                        className={`block py-2 text-sm rounded-lg transition-colors duration-200 ${
                          activeId === id
                            ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
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
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
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
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

// Reading mode theme presets
const RM_THEMES = {
  light: { bg: '#ffffff', text: '#111827', subtleBg: '#f9fafb', border: '#e5e7eb', dark: false },
  sepia: { bg: '#f4ecd8', text: '#3b2c1a', subtleBg: '#ede3c8', border: '#d4b896', dark: false },
  dark:  { bg: '#111827', text: '#f3f4f6', subtleBg: '#1f2937', border: '#374151', dark: true  },
};
const RM_WIDTHS = { narrow: '58ch', normal: '70ch', wide: '90ch' };

// Reading mode overlay component
const ReadingMode = ({ post, onClose, baseImagePath }) => {
  const [fontSize, setFontSize] = useState(
    () => parseInt(localStorage.getItem('rm.fontSize') || '18')
  );
  const [lineHeight, setLineHeight] = useState(
    () => parseFloat(localStorage.getItem('rm.lineHeight') || '1.8')
  );
  const [fontFamily, setFontFamily] = useState(
    () => localStorage.getItem('rm.fontFamily') || 'sans'
  );
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('rm.theme');
    if (saved && RM_THEMES[saved]) return saved;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [width, setWidth] = useState(
    () => localStorage.getItem('rm.width') || 'normal'
  );
  const [readProgress, setReadProgress] = useState(0);
  const [isDiagramFullscreen, setIsDiagramFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const contentRef = useRef(null);
  const lastScrollY = useRef(0);
  // Snapshot the site's dark-mode state at the moment reading mode opens.
  // We restore this on exit so the main page is never affected.
  const originalDark = useRef(document.documentElement.classList.contains('dark'));

  // Persist reading-mode-only settings (rm.* keys, never touches 'theme')
  useEffect(() => { localStorage.setItem('rm.fontSize', String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('rm.lineHeight', String(lineHeight)); }, [lineHeight]);
  useEffect(() => { localStorage.setItem('rm.fontFamily', fontFamily); }, [fontFamily]);
  useEffect(() => { localStorage.setItem('rm.theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('rm.width', width); }, [width]);

  // While reading mode is open, nudge the dark-mode class so code blocks
  // and Mermaid diagrams render in the right palette. On unmount, always
  // restore the original state so the main page is unaffected.
  useEffect(() => {
    const isDark = RM_THEMES[theme]?.dark ?? false;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      // Restore original site dark mode — never leave the main page out of sync
      if (originalDark.current) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  // Listen for diagram fullscreen toggle to hide reading mode chrome
  useEffect(() => {
    const handleToggle = (e) => setIsDiagramFullscreen(e.detail);
    window.addEventListener('mermaid-fullscreen-toggle', handleToggle);
    return () => window.removeEventListener('mermaid-fullscreen-toggle', handleToggle);
  }, []);

  // Lock body scroll; ESC only fires when no higher-z dialog is open (e.g. diagram viewer)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setReadProgress(max > 0 ? el.scrollTop / max : 0);

    const currentScrollY = el.scrollTop;
    if (currentScrollY > lastScrollY.current + 20 && currentScrollY > 50) {
      setIsControlsVisible(false);
      lastScrollY.current = currentScrollY;
    } else if (currentScrollY < lastScrollY.current - 20 || currentScrollY < 50) {
      setIsControlsVisible(true);
      lastScrollY.current = currentScrollY;
    }
  };

  const fontSizeMin = 14, fontSizeMax = 26;
  const lineHeightMin = 1.4, lineHeightMax = 2.4;
  const tc = RM_THEMES[theme] || RM_THEMES.light;

  const sep = (
    <div className="w-px h-5 flex-shrink-0 mx-0.5" style={{ backgroundColor: tc.border }} />
  );

  const mkBtn = (onClick, disabled, title, children) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ color: tc.text }}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-25 text-xs font-medium select-none hover:bg-black/[0.06]"
    >
      {children}
    </button>
  );

  const excerptBg = theme === 'dark'
    ? 'rgba(59,130,246,0.12)'
    : theme === 'sepia'
    ? 'rgba(139,90,43,0.10)'
    : 'rgba(239,246,255,1)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        backgroundColor: tc.bg,
        color: tc.text,
        '--rm-font-size': `${fontSize}px`,
        '--rm-line-height': String(lineHeight),
      }}
      className="fixed inset-0 z-[400] flex flex-col reading-mode-active"
    >
      {/* ── Controls bar ── */}
      {!isDiagramFullscreen && (
        <div
          className="flex-shrink-0 flex items-center gap-0.5 px-3 sm:px-4 py-2 border-b"
          style={{ backgroundColor: tc.subtleBg, borderColor: tc.border }}
        >
          {/* Close */}
        <button
          onClick={onClose}
          title="Exit (Esc)"
          aria-label="Exit reading mode"
          style={{ color: tc.text }}
          className="p-1.5 rounded-lg transition-colors hover:bg-black/[0.06] flex-shrink-0"
        >
          <X size={18} />
        </button>

        {/* Title — desktop only */}
        <span className="flex-1 text-sm truncate px-2 min-w-0 hidden md:block" style={{ color: tc.text, opacity: 0.5 }}>
          {post.title}
        </span>
        <span className="flex-1 md:hidden" />

        {/* Font size */}
        <div className="flex items-center flex-shrink-0">
          {mkBtn(() => setFontSize(s => Math.max(fontSizeMin, s - 1)), fontSize <= fontSizeMin, 'Smaller text', 'A−')}
          <span className="text-xs w-9 text-center tabular-nums hidden sm:block" style={{ color: tc.text, opacity: 0.45 }}>{fontSize}px</span>
          {mkBtn(() => setFontSize(s => Math.min(fontSizeMax, s + 1)), fontSize >= fontSizeMax, 'Larger text', 'A+')}
        </div>

        {sep}

        {/* Line height */}
        <div className="flex items-center flex-shrink-0">
          {mkBtn(
            () => setLineHeight(h => Math.max(lineHeightMin, parseFloat((h - 0.1).toFixed(1)))), 
            lineHeight <= lineHeightMin, 
            'Tighter spacing', 
            <div className="flex items-center"><ArrowDownUp size={12} className="mr-0.5" />−</div>
          )}
          <span className="text-xs w-9 text-center tabular-nums hidden sm:block" style={{ color: tc.text, opacity: 0.45 }}>{lineHeight}</span>
          {mkBtn(
            () => setLineHeight(h => Math.min(lineHeightMax, parseFloat((h + 0.1).toFixed(1)))), 
            lineHeight >= lineHeightMax, 
            'Looser spacing', 
            <div className="flex items-center"><ArrowDownUp size={12} className="mr-0.5" />+</div>
          )}
        </div>

        {sep}

        {/* Font family */}
        <button
          onClick={() => setFontFamily(f => f === 'sans' ? 'serif' : 'sans')}
          title="Toggle font family"
          style={{ color: tc.text }}
          className="px-2 h-8 rounded-lg hover:bg-black/[0.06] text-xs transition-colors flex-shrink-0 select-none"
        >
          {fontFamily === 'sans'
            ? <span style={{ fontFamily: 'Georgia, serif' }}>Serif</span>
            : <span>Sans</span>
          }
        </button>

        {sep}

        {/* Column width — desktop only */}
        <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
          {['narrow', 'normal', 'wide'].map(w => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              title={`${w.charAt(0).toUpperCase() + w.slice(1)} column`}
              style={{ color: tc.text }}
              className={`h-7 px-1.5 rounded-md text-xs transition-colors select-none ${
                width === w ? 'font-semibold bg-black/10' : 'hover:bg-black/[0.06]'
              }`}
            >
              {w === 'narrow' ? 'Nar' : w === 'normal' ? 'Std' : 'Wide'}
            </button>
          ))}
        </div>

        {sep}

        {/* Theme: Light / Sepia / Dark */}
        <div className="flex items-center gap-1 flex-shrink-0 px-1">
          {[
            { key: 'light', bg: '#ffffff', border: '#d1d5db', label: 'Light' },
            { key: 'sepia', bg: '#f4ecd8', border: '#c4a87a', label: 'Sepia' },
            { key: 'dark',  bg: '#111827', border: '#6b7280', label: 'Dark'  },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              title={t.label}
              aria-label={`${t.label} theme`}
              className="w-5 h-5 rounded-full transition-all flex-shrink-0"
              style={{
                backgroundColor: t.bg,
                border: theme === t.key ? '2px solid #2563eb' : `1.5px solid ${t.border}`,
                transform: theme === t.key ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      )}

      {/* Progress bar */}
      {!isDiagramFullscreen && (
      <div className="h-0.5 flex-shrink-0" style={{ backgroundColor: tc.border }}>
        <div
          className="h-full bg-blue-600 transition-[width] duration-75"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>
      )}

      {/* ── Scrollable content ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div
          className="mx-auto px-5 sm:px-8 py-10 sm:py-14"
          style={{
            maxWidth: RM_WIDTHS[width] || RM_WIDTHS.normal,
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: fontFamily === 'serif'
              ? '"Georgia", "Palatino Linotype", Palatino, serif'
              : 'inherit',
          }}
        >
          <h1
            className="font-bold mb-6"
            style={{ fontSize: `${Math.round(fontSize * 1.6)}px`, lineHeight: 1.2, color: tc.text }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <div className="mb-8 p-4 rounded-lg border-l-4 border-blue-500" style={{ backgroundColor: excerptBg }}>
              <p className="italic leading-relaxed" style={{ color: tc.text, opacity: 0.85 }}>
                {post.excerpt}
              </p>
            </div>
          )}

          <MarkdownRenderer content={post.content} baseImagePath={baseImagePath} />
          <div className="h-16" />
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      {!isDiagramFullscreen && (
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-1.5 text-xs select-none gap-2"
        style={{ borderTop: `1px solid ${tc.border}`, color: tc.text, opacity: 0.4, backgroundColor: tc.subtleBg }}
      >
        <span className="truncate min-w-0 flex-1 pr-2" title={post.title}>{post.title}</span>
        <span className="flex-shrink-0 whitespace-nowrap">{Math.round(readProgress * 100)}% · {post.readingTime} min read</span>
      </div>
      )}
    </motion.div>
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
        const postData = await getPostBySlug(category, slug);

        if (!postData) {
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
  }, [category, slug]);
  
  // Share functionality
  const sharePost = async () => {
    const url = window.location.href;
    const title = post.title;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log('Error sharing:', err);
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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Post Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The post you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/blog')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </button>
            <Link 
              to="/blog"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Posts
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
        title={`${post.title} | Juan Lara`}
        description={post.description || post.summary || `Read about ${post.title} - a deep dive into ${post.category}`}
        canonical={`https://juanlara18.github.io/portfolio/#/blog/${post.slug}`}
        image={headerImage}
        type="article"
        keywords={post.tags || [post.category, 'machine learning', 'AI', 'computer science']}
        article={{
          publishedDate: post.date,
          modifiedDate: post.modifiedDate || post.date,
          tags: post.tags,
          category: post.category,
          wordCount: post.content?.split(' ').length
        }}
      />
      
      {/* Reading Progress Bar */}
      <ScrollProgress />

      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
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
              className="w-full h-full object-cover"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
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
              {/* Back Button */}
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors border border-white/20 text-sm sm:text-base"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  <span className="hidden xs:inline">Back to Blog</span>
                  <span className="xs:hidden">Back</span>
                </button>
              </div>
              
              {/* Category Badge */}
              <div className="mb-3 sm:mb-4">
                <Link 
                  to={`/blog/category/${post.category}`}
                  className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-medium border border-white/20 hover:bg-white/30 transition-colors"
                >
                  {categoryConfig?.name || post.category}
                </Link>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/90 text-sm sm:text-base">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">{formatDate(post.date, 'MMMM d, yyyy')}</span>
                  <span className="sm:hidden">{formatDate(post.date, 'MMM d')}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1.5 sm:mr-2" />
                  <span>{post.readingTime} min read</span>
                </div>
                {post.readingTime >= 15 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-white rounded-full text-xs font-medium border border-white/20">
                    Long read
                  </span>
                )}
                <button
                  onClick={sharePost}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <Share2 size={14} className="mr-1.5 sm:mr-2" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setIsReadingMode(true)}
                  className="flex items-center hover:text-white transition-colors"
                  title="Modo lectura"
                >
                  <Maximize2 size={14} className="mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Read</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Post Content */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8 mobile-card-container">
          <div className="max-w-6xl mx-auto">
            
            {/* Mobile post meta — category & tags shown before the article on small screens */}
            <div className="lg:hidden mb-6 px-2 sm:px-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link 
                  to={`/blog/category/${post.category}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${categoryConfig?.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
                    ${categoryConfig?.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : ''}
                    ${categoryConfig?.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}
                    ${!categoryConfig?.color ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                  `}
                >
                  {categoryConfig?.name || post.category}
                </Link>
                {post.tags && post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="card-tag inline-flex items-center text-xs"
                  >
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <motion.article
                initial="hidden"
                animate="visible"
                variants={slideInLeft}
                className="lg:w-3/4"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm sm:shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-100 dark:border-gray-700">
                  {post.audio && <AudioPlayer audio={post.audio} />}

                  {post.excerpt && (
                    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  )}
                  
                  <div className="px-1 sm:px-0">
                    <MarkdownRenderer 
                      content={post.content} 
                      baseImagePath={baseImagePath}
                      className=""
                    />
                  </div>
                </div>
              </motion.article>
              
              {/* Sidebar — hidden on mobile, visible on desktop */}
              <aside 
                ref={sidebarRef}
                className="hidden lg:flex lg:flex-col lg:w-1/4 lg:gap-6 sticky self-start"
              >
                {/* Table of Contents */}
                <TableOfContents content={post.content} />
                  
                  {/* Post Stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Post Information
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          Reading Time
                        </span>
                        <span>{post.readingTime} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          Published
                        </span>
                        <span>{formatDate(post.date, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Category
                    </h3>
                    <Link 
                      to={`/blog/category/${post.category}`}
                      className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                        {categoryConfig?.name || post.category}
                      </div>
                      {categoryConfig?.description && (
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {categoryConfig?.description}
                        </div>
                      )}
                    </Link>
                  </div>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag, index) => (
                          <Link
                            key={index}
                            to={`/blog/tag/${encodeURIComponent(tag)}`}
                            className="card-tag inline-flex items-center text-xs"
                          >
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </Link>
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
          onClose={() => setIsReadingMode(false)}
          baseImagePath={baseImagePath}
        />
      )}
    </AnimatePresence>
    </>
  );
}