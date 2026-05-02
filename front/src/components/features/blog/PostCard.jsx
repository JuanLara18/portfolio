import { Link } from 'react-router-dom';
import { BLOG_CONFIG, getWebPPath } from '../../../utils/blogUtils';
import { variants as motionVariants } from '../../../utils';
import { motion } from 'framer-motion';

const fadeInUp = motionVariants.fadeInUp();

/**
 * Editorial Post Card (Brand v3)
 * Magazine-style entry: no card chrome, hairline only at the bottom.
 * Typography and whitespace structure the listing.
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

  const postUrl = `/blog/${post.category}/${post.slug}`;

  return (
    <motion.article
      variants={fadeInUp}
      className="relative group flex flex-col h-full pb-8 border-b border-gray-200/60 dark:border-white/[0.08]"
    >
      {/* Header Image — flush, no rounding, no overlay */}
      <div className="relative overflow-hidden aspect-[16/9] mb-5">
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
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Kicker — category */}
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-3">
        {categoryConfig?.name || post.category}
      </div>

      {/* Title — Newsreader italic; stretched link covers the whole card */}
      <h2 className="font-bold text-2xl md:text-[1.7rem] tracking-tight leading-tight text-gray-900 dark:text-brand-fg mb-3 line-clamp-2 group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">
        <Link to={postUrl} className="after:absolute after:inset-0 after:content-['']">
          {post.title.split(':')[0]}
        </Link>
      </h2>

      {/* Meta — mono uppercase, dot-separated */}
      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted mb-4">
        <span>{post.readingTime} min read</span>
      </div>

      {/* Excerpt */}
      <p className="text-gray-600 dark:text-brand-fg-muted mb-4 line-clamp-3 leading-relaxed text-sm flex-1">
        {post.excerpt}
      </p>

      {/* Tags — inline mono uppercase, middle-dot separated, no boxes */}
      {post.tags && post.tags.length > 0 && (
        <div className="relative z-10 font-mono text-[10px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted mt-auto">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={tag}>
              {index > 0 && <span className="mx-1.5 opacity-50">·</span>}
              <Link
                to={`/blog/tag/${encodeURIComponent(tag)}`}
                className="hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
              >
                {tag}
              </Link>
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
};

export default PostCard;
