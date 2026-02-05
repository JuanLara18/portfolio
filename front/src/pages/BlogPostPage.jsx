import { useState, useEffect, useRef } from 'react';
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
  Check
} from 'lucide-react';
import { getPostBySlug, BLOG_CONFIG, formatDate, scrollToElementCentered, getWebPPath } from '../utils/blogUtils';
import { MarkdownRenderer } from '../components/features/blog';
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

// Table of Contents component
const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  
  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
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
    <nav className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
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
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
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

export default function BlogPostPage() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  
  // Transform values for smoother header parallax
  const headerY = useTransform(scrollY, [0, 400], [0, -60]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
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
        canonical={`https://juanlara18.github.io/Portfolio/#/blog/${post.slug}`}
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
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Post Content */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-0 sm:p-6 md:p-8 lg:p-12 border border-gray-100 dark:border-gray-700">
                  {post.excerpt && (
                    <div className="mb-6 sm:mb-8 mx-2 sm:mx-0 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  )}
                  
                  <div className="px-2 sm:px-0">
                    <MarkdownRenderer 
                      content={post.content} 
                      baseImagePath={baseImagePath}
                      className=""
                    />
                  </div>
                </div>
              </motion.article>
              
              {/* Sidebar — hidden on mobile, visible on desktop */}
              <motion.aside 
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="hidden lg:block lg:w-1/4"
              >
                <div className="space-y-6">
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
                </div>
              </motion.aside>
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
    </>
  );
}