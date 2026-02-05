import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowRight, Brain, FileText, Code2 } from 'lucide-react';
import { BLOG_CONFIG, formatDate, getWebPPath } from '../../../utils/blogUtils';
import { variants as motionVariants } from '../../../utils';
import { MotionCard } from '../../common';

const fadeInUp = motionVariants.fadeInUp();

/**
 * Reusable Post Card Component
 * Used across BlogHomePage, BlogCategoryPage, and potentially other blog views
 */
export const PostCard = ({ post }) => {
  const categoryConfig = BLOG_CONFIG.categories[post.category];
  
  // Get the header image path with PUBLIC_URL
  const getImageUrl = (path) => {
    if (!path) return '';
    const base = process.env.PUBLIC_URL || '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${base}${path}`;
    return `${base}/${path}`;
  };
  
  const headerImagePath = post.headerImage || `/blog/headers/default-${post.category}.jpg`;
  const fallbackPath = `/blog/headers/default.jpg`;
  
  return (
    <MotionCard 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col group hover:shadow-xl transition-all duration-200 mobile-card"
      hover="lift"
      variants={fadeInUp}
    >
      {/* Header Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <picture>
          <source 
            srcSet={getImageUrl(getWebPPath(headerImagePath))} 
            type="image/webp" 
          />
          <img 
            src={getImageUrl(headerImagePath)}
            alt={post.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = getImageUrl(fallbackPath);
            }}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${categoryConfig?.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
              ${categoryConfig?.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : ''}
              ${categoryConfig?.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}
            `}
          >
            {categoryConfig?.icon === 'Brain' && <Brain size={12} className="mr-1" />}
            {categoryConfig?.icon === 'FileText' && <FileText size={12} className="mr-1" />}
            {categoryConfig?.icon === 'Code2' && <Code2 size={12} className="mr-1" />}
            {categoryConfig?.name || post.category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            <Link to={`/blog/${post.category}/${post.slug}`}>
              {post.title}
            </Link>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed card-description text-sm">
            {post.excerpt}
          </p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 2).map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="card-tag inline-flex items-center text-xs"
                >
                  <Tag size={9} className="mr-1" />
                  {tag}
                </Link>
              ))}
              {post.tags.length > 2 && (
                <span className="card-tag inline-flex items-center text-xs opacity-70">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Meta info */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(post.date, 'MMM d')}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{post.readingTime}m</span>
            </div>
          </div>
          
          <Link 
            to={`/blog/${post.category}/${post.slug}`}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
          >
            <span className="mr-1">Read</span>
            <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </MotionCard>
  );
};

export default PostCard;
