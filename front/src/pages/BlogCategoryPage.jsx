import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import {
  getPostsByCategory,
  getPostsByTag,
  BLOG_CONFIG
} from '../utils/blogUtils';
import { variants as motionVariants } from '../utils';
import { PostCard } from '../components/features/blog';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

export default function BlogCategoryPage() {
  const { category, tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { scrollY } = useScroll();
  const heroRef = useRef(null);

  // Subtle hero opacity dampening on scroll.
  const heroOpacity = useTransform(scrollY, [100, 600], [1, 0.97]);

  // Determine if we're showing category or tag
  const isCategory = Boolean(category);
  const isTag = Boolean(tag);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        let postsData;

        if (isCategory) {
          postsData = await getPostsByCategory(category);
        } else if (isTag) {
          postsData = await getPostsByTag(tag);
        }

        setPosts(postsData || []);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [category, tag, isCategory, isTag]);

  const getDisplayInfo = () => {
    if (isCategory) {
      const categoryConfig = BLOG_CONFIG.categories[category];
      return {
        title: categoryConfig?.name || category,
        description: categoryConfig?.description || `Posts in ${category}`,
        kicker: 'Category',
      };
    } else if (isTag) {
      return {
        title: `#${tag}`,
        description: `Posts tagged with "${tag}"`,
        kicker: 'Tag',
      };
    }
    return { title: 'Posts', description: '', kicker: '' };
  };

  const displayInfo = getDisplayInfo();

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
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${displayInfo.title} · Juan Lara`}
        description={`Browse ${displayInfo.title} posts by Juan Lara. Engineering notes on production AI, RAG systems, agentic architectures, and LLM ops.`}
      />
      <div className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg min-h-screen">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative pt-28 pb-16 md:pt-36 md:pb-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <motion.div variants={fadeInUp} className="mb-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-600 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
              >
                <ArrowLeft size={14} />
                Back to blog
              </Link>
            </motion.div>

            <div className="text-center">
              {/* Kicker */}
              <motion.div variants={fadeInUp} className="mb-4">
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted">
                  {displayInfo.kicker}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-gray-900 dark:text-brand-fg mb-6"
              >
                {displayInfo.title}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base md:text-lg text-gray-600 dark:text-brand-fg-muted mb-6 max-w-2xl mx-auto leading-relaxed"
              >
                {displayInfo.description}
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted"
              >
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Posts Grid */}
      <section className="py-8 md:py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
          <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            {posts.length === 0 ? (
              <motion.div
                variants={fadeInUp}
                className="text-center py-24"
              >
                <BookOpen size={32} className="mx-auto text-gray-400 dark:text-brand-fg-muted mb-4" />
                <h3 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-brand-fg mb-2">No posts found.</h3>
                <p className="text-gray-600 dark:text-brand-fg-muted mb-6 max-w-md mx-auto">
                  {isCategory
                    ? `No posts have been published in the "${displayInfo.title}" category.`
                    : `No posts have been tagged with "${tag}".`
                  }
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                >
                  Browse all posts
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={false}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 mobile-grid-single"
              >
                {posts.map(post => (
                  <PostCard key={`${post.category}-${post.slug}`} post={post} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}
