import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  BookOpen,
  Network,
  ArrowRight
} from 'lucide-react';
import { loadAllPosts, getAllTags, BLOG_CONFIG, getWebPPath } from '../utils/blogUtils';
import { variants as motionVariants } from '../utils';
import { PostCard } from '../components/features/blog';
import { ViewToggle } from '../components/ui';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

export default function BlogHomePage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 1024px)').matches
      ? BLOG_CONFIG.postsPerPageDesktop
      : BLOG_CONFIG.postsPerPageMobile
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View mode: 'grid' (default) or 'list'. Persisted in localStorage.
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === 'undefined') return 'grid';
    try {
      return window.localStorage.getItem('blog-view-mode') === 'list' ? 'list' : 'grid';
    } catch (_) { return 'grid'; }
  });
  useEffect(() => {
    try { window.localStorage.setItem('blog-view-mode', viewMode); } catch (_) {}
  }, [viewMode]);

  const { scrollY } = useScroll();
  const heroRef = useRef(null);

  // Subtle hero opacity dampening on scroll — keep, no scaling lift.
  const heroOpacity = useTransform(scrollY, [260, 800], [1, 0.98]);

  // Load posts and tags on component mount
  useEffect(() => {
    async function loadBlogData() {
      try {
        setLoading(true);
        const [postsData, tagsData] = await Promise.all([
          loadAllPosts(),
          getAllTags()
        ]);

        setPosts(postsData);
        setFilteredPosts(postsData);
        setTags(tagsData);
      } catch (err) {
        setError('Failed to load blog posts. Please try again later.');
        console.error('Error loading blog data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBlogData();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () =>
      setPostsPerPage(
        mq.matches ? BLOG_CONFIG.postsPerPageDesktop : BLOG_CONFIG.postsPerPageMobile
      );
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = [...posts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.some(tag =>
          tag.toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    setFilteredPosts(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [posts, searchTerm, selectedCategory, selectedTag]);

  useEffect(() => {
    const pages = Math.ceil(filteredPosts.length / postsPerPage);
    if (pages === 0) return;
    setCurrentPage((p) => Math.min(p, pages));
  }, [postsPerPage, filteredPosts.length]);

  // Pagination calculations
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-700 dark:border-brand-accent mx-auto mb-4"></div>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">Loading posts</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-bg flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-brand-fg-muted mb-4" />
          <h1 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-brand-fg mb-2">
            Unable to load posts.
          </h1>
          <p className="text-gray-600 dark:text-brand-fg-muted mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Blog | Juan Lara"
        description="Technical articles about AI, machine learning, NLP, and computer science. Deep dives into research papers, curiosities, and practical ML engineering."
        canonical="https://juanlara18.github.io/portfolio/#/blog"
        keywords={[
          'AI blog',
          'machine learning',
          'deep learning',
          'NLP',
          'transformers',
          'research papers',
          'ML engineering',
          'computer science',
          'technical blog'
        ]}
      />
      <div className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg min-h-screen">

      {/* Header Section */}
      <div className="pt-12 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 flex flex-col relative">
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative flex-1"
        >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Kicker */}
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                Writing
              </span>
            </motion.div>

            {/* Editorial display headline */}
            <motion.h1
              variants={fadeInUp}
              className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-gray-900 dark:text-brand-fg mb-6"
            >
              Notes from production<span className="text-cyan-700 dark:text-brand-accent">.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-600 dark:text-brand-fg-muted mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Engineering notes on RAG, agents, and knowledge systems. Research deep-dives. Mathematical curiosities.
            </motion.p>

            {/* Subtle knowledge graph link — inline mono text with hover underline */}
            <motion.div variants={fadeInUp} className="mb-10">
              <Link
                to="/blog/graph"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
              >
                <Network size={14} />
                <span>Explore knowledge graph</span>
                <span className="opacity-50">·</span>
                <span>{posts.length} posts</span>
              </Link>
            </motion.div>

            {/* Search + filter row — bottom hairline only */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto"
            >
              {/* Search — bottom hairline only */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400 dark:text-brand-fg-muted" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-7 pr-3 py-2.5 bg-transparent border-0 border-b border-gray-200/60 dark:border-white/[0.08] text-gray-900 dark:text-brand-fg placeholder-gray-400 dark:placeholder-brand-fg-muted focus:outline-none focus:border-cyan-700 dark:focus:border-brand-accent transition-colors text-sm"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tag Filter — native select with hairline */}
              {tags.length > 0 && (
                <div className="relative">
                  <select
                    className="block w-full md:w-56 pl-1 pr-8 py-2.5 bg-transparent border-0 border-b border-gray-200/60 dark:border-white/[0.08] text-gray-700 dark:text-brand-fg/80 font-mono text-[11px] tracking-[0.08em] uppercase focus:outline-none focus:border-cyan-700 dark:focus:border-brand-accent transition-colors appearance-none cursor-pointer"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                    <option value="">All tags</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        </motion.section>
      </div>

      {/* Posts Grid */}
      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container">
          <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
          >
            {/* Category filter row — inline mono uppercase, underline-active */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
            >
              <button
                key="all"
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
                aria-label="Show all posts"
                className={`font-mono text-[11px] tracking-[0.12em] uppercase py-1 transition-colors ${
                  selectedCategory === 'all'
                    ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-[6px] decoration-1'
                    : 'text-gray-500 dark:text-brand-fg-muted hover:text-gray-900 dark:hover:text-brand-fg'
                }`}
              >
                All
              </button>
              {Object.entries(BLOG_CONFIG.categories).map(([key, config]) => {
                const isActive = selectedCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    aria-pressed={isActive}
                    aria-label={`Filter posts by ${config.name}`}
                    className={`font-mono text-[11px] tracking-[0.12em] uppercase py-1 transition-colors ${
                      isActive
                        ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-[6px] decoration-1'
                        : 'text-gray-500 dark:text-brand-fg-muted hover:text-gray-900 dark:hover:text-brand-fg'
                    }`}
                  >
                    {config.name}
                  </button>
                );
              })}
            </motion.div>

            {/* Section header — kicker + view toggle + post count */}
            <motion.div
              variants={fadeInUp}
              className="flex items-end justify-between mb-12 gap-3 pb-5 border-b border-gray-200/60 dark:border-white/[0.08]"
            >
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                {selectedCategory !== 'all' ? BLOG_CONFIG.categories[selectedCategory]?.name : 'All posts'}
              </div>

              <div className="flex items-center gap-3">
                <ViewToggle value={viewMode} onChange={setViewMode} />
                <span className="w-px h-4 bg-gray-300/70 dark:bg-white/[0.12]" />
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg-muted whitespace-nowrap">
                  {totalPosts > 0 && (
                    <>
                      {Math.min((currentPage - 1) * postsPerPage + 1, totalPosts)}
                      {'–'}
                      {Math.min(currentPage * postsPerPage, totalPosts)}
                      {' / '}
                      {totalPosts}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {totalPosts === 0 ? (
              <motion.div
                variants={fadeInUp}
                className="text-center py-24"
              >
                <Search size={32} className="mx-auto text-gray-400 dark:text-brand-fg-muted mb-4" />
                <h3 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-brand-fg mb-2">No posts found.</h3>
                <p className="text-gray-600 dark:text-brand-fg-muted mb-6 max-w-md mx-auto">
                  No matches. Try different terms or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTag('');
                    setSearchTerm('');
                  }}
                  className="font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                >
                  View all posts
                </button>
              </motion.div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <motion.div
                    initial={false}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 mobile-grid-single"
                  >
                    {paginatedPosts.map(post => (
                      <PostCard key={`${post.category}-${post.slug}`} post={post} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={false}
                    variants={staggerContainer}
                    className="divide-y divide-gray-200/60 dark:divide-white/[0.08]"
                  >
                    {paginatedPosts.map(post => {
                      // Build image URL with PUBLIC_URL prefix (matches PostCard's approach)
                      const buildUrl = (path) => {
                        if (!path) return '';
                        const base = process.env.PUBLIC_URL || '';
                        if (path.startsWith('http')) return path;
                        if (path.startsWith('/')) return `${base}${path}`;
                        return `${base}/${path}`;
                      };
                      const headerImagePath = post.headerImage || `/blog/headers/default-${post.category}.jpg`;
                      const fallbackPath = `/blog/headers/default.jpg`;
                      const categoryName = BLOG_CONFIG.categories?.[post.category]?.name || post.category;
                      return (
                        <motion.article
                          key={`${post.category}-${post.slug}`}
                          variants={fadeInUp}
                          className="group"
                        >
                          <Link
                            to={`/blog/${post.category}/${post.slug}`}
                            className="flex gap-5 sm:gap-8 py-6 sm:py-8"
                          >
                            {/* Thumbnail */}
                            <div className="hidden sm:block flex-shrink-0 w-32 md:w-44 aspect-[4/3] bg-gray-100 dark:bg-brand-bg-soft overflow-hidden">
                              <picture>
                                <source srcSet={buildUrl(getWebPPath(headerImagePath))} type="image/webp" />
                                <img
                                  src={buildUrl(headerImagePath)}
                                  alt={post.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                  onError={(e) => { e.target.src = buildUrl(fallbackPath); }}
                                />
                              </picture>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-2">
                                {categoryName}
                                {post.readingTime && (
                                  <>
                                    <span className="opacity-50 mx-1.5">·</span>
                                    {post.readingTime} min
                                  </>
                                )}
                              </p>
                              <h3 className="font-bold text-xl sm:text-2xl tracking-tight leading-snug text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors mb-2">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed line-clamp-2 mb-3">
                                  {post.excerpt}
                                </p>
                              )}
                              {post.tags && post.tags.length > 0 && (
                                <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg-muted hidden sm:block">
                                  {post.tags.slice(0, 5).join(' · ')}
                                </p>
                              )}
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center text-cyan-700 dark:text-brand-accent flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                              <ArrowRight size={16} />
                            </div>
                          </Link>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                )}

                {/* Pagination controls — text-based */}
                {totalPages > 1 && (
                  <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-10 pt-6 border-t border-gray-200/60 dark:border-white/[0.08]"
                  >
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted">
                      {Math.min((currentPage - 1) * postsPerPage + 1, totalPosts)}
                      {'–'}
                      {Math.min(currentPage * postsPerPage, totalPosts)}
                      {' / '}
                      {totalPosts}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.12em] uppercase">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="text-gray-700 dark:text-brand-fg/80 disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
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
                        className="text-gray-700 dark:text-brand-fg/80 disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
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
