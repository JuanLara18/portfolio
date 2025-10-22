import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Tag, 
  ArrowLeft, 
  BookOpen, 
  ArrowRight,
  Layers,
  Brain,
  FileText
} from 'lucide-react';
import { 
  getPostsByCategory, 
  getPostsByTag, 
  BLOG_CONFIG, 
  formatDate 
} from '../utils/blogUtils';
import { variants as motionVariants } from '../utils';
import { MotionCard } from '../components/common';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

// Post card component (reused from BlogHomePage but simplified)
const PostCard = ({ post }) => {
  const categoryConfig = BLOG_CONFIG.categories[post.category];
  const withPublicUrl = (p) => {
    if (!p) return '';
    const base = process.env.PUBLIC_URL || '';
    if (p.startsWith('http')) return p;
    if (p.startsWith('/')) return `${base}${p}`;
    return `${base}/${p}`;
  };
  const headerImage = withPublicUrl(post.headerImage || `/blog/headers/default-${post.category}.jpg`);
  
  return (
    <MotionCard 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col group hover:shadow-xl transition-all duration-200"
      hover="lift"
      variants={fadeInUp}
    >
      {/* Header Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img 
          src={headerImage}
          alt={post.title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${categoryConfig?.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
              ${categoryConfig?.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : ''}
            `}
          >
            {categoryConfig?.color === 'blue' ? <Brain size={12} className="mr-1" /> : <FileText size={12} className="mr-1" />}
            {categoryConfig?.name || post.category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link to={`/blog/${post.category}/${post.slug}`}>
              {post.title}
            </Link>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed card-description">
            {post.excerpt}
          </p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="card-tag inline-flex items-center"
                >
                  <Tag size={10} className="mr-1" />
                  {tag}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="card-tag inline-flex items-center">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(post.date, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          
          <Link 
            to={`/blog/${post.category}/${post.slug}`}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
          >
            <span className="mr-1">Read more</span>
            <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
  </MotionCard>
  );
};

export default function BlogCategoryPage() {
  const { category, tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  
  // Transform values for parallax effects
  const heroOpacity = useTransform(scrollY, [100, 600], [1, 0.97]);
  const heroScale = useTransform(scrollY, [100, 600], [1, 0.995]);
  
  // Determine if we're showing category or tag
  const isCategory = Boolean(category);
  const isTag = Boolean(tag);
  const filterValue = category || tag;
  
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
  
  // Get display information
  const getDisplayInfo = () => {
    if (isCategory) {
      const categoryConfig = BLOG_CONFIG.categories[category];
      return {
        title: categoryConfig?.name || category,
        description: categoryConfig?.description || `Posts in ${category}`,
        icon: categoryConfig?.color === 'blue' ? Brain : FileText,
        color: categoryConfig?.color || 'blue'
      };
    } else if (isTag) {
      return {
        title: `#${tag}`,
        description: `Posts tagged with "${tag}"`,
        icon: Tag,
        color: 'indigo'
      };
    }
    return { title: 'Posts', description: '', icon: BookOpen, color: 'blue' };
  };
  
  const displayInfo = getDisplayInfo();
  const IconComponent = displayInfo.icon;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Unable to Load Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link 
            to="/blog"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{displayInfo.title} | Juan Lara</title>
        <meta name="description" content={`Browse ${displayInfo.title} posts by Juan Lara`} />
        <meta property="og:title" content={`${displayInfo.title} | Juan Lara`} />
        <meta property="og:description" content={`${displayInfo.title} blog posts`} />
      </Helmet>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 -z-10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-3 md:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <motion.div variants={fadeInUp} className="mb-8">
              <Link 
                to="/blog"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Blog
              </Link>
            </motion.div>
            
            <div className="text-center">
              <motion.div variants={fadeInUp} className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4
                  ${displayInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
                  ${displayInfo.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : ''}
                `}>
                  <IconComponent size={14} className="mr-1.5" />
                  {isCategory ? 'Category' : 'Tag'}
                </div>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {displayInfo.title}
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              >
                {displayInfo.description}
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="text-gray-500 dark:text-gray-400"
              >
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Posts Grid */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-3 md:px-6">
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
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <IconComponent size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isCategory 
                    ? `No posts have been published in the "${displayInfo.title}" category.`
                    : `No posts have been tagged with "${tag}".`
                  }
                </p>
                <Link 
                  to="/blog"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Layers size={16} />
                  Browse All Posts
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={false}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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