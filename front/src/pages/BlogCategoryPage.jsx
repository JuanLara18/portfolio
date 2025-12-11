import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Layers,
  Tag,
  Brain,
  FileText,
  Code2
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
const staggerContainer = motionVariants.stagger();export default function BlogCategoryPage() {
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
  
  const getDisplayInfo = () => {
    if (isCategory) {
      const categoryConfig = BLOG_CONFIG.categories[category];
      const iconMap = {
        'Brain': Brain,
        'FileText': FileText,
        'Code2': Code2
      };
      const icon = categoryConfig?.icon ? iconMap[categoryConfig.icon] : BookOpen;
      
      return {
        title: categoryConfig?.name || category,
        description: categoryConfig?.description || `Posts in ${category}`,
        icon: icon,
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
        
        <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
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
                  ${displayInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}
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
        <div className="container mx-auto px-0 sm:px-6 lg:px-8 mobile-card-container">
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