import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { getSeriesWithPosts, BLOG_CONFIG, getWebPPath } from '../utils/blogUtils';
import { variants as motionVariants } from '../utils';

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

// Resolve a header image path against PUBLIC_URL (mirrors PostCard).
const getImageUrl = (path) => {
  if (!path) return '';
  const base = process.env.PUBLIC_URL || '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
};

function SeriesStep({ post, isLast }) {
  const categoryConfig = BLOG_CONFIG.categories[post.category];
  const headerImagePath = post.headerImage || `/blog/headers/default-${post.category}.jpg`;
  const fallbackPath = '/blog/headers/default.jpg';
  const postUrl = `/blog/${post.category}/${post.slug}`;

  return (
    <motion.li variants={fadeInUp} className="relative pl-14 sm:pl-16">
      {/* Vertical connector line down to the next step */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[18px] sm:left-[22px] top-10 bottom-[-1.75rem] w-px bg-gray-200 dark:bg-white/[0.12]"
        />
      )}

      {/* Part number badge */}
      <span className="absolute left-0 top-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 dark:border-white/[0.12] bg-white dark:bg-brand-bg font-mono text-xs sm:text-sm text-cyan-700 dark:text-brand-accent">
        {post.part}
      </span>

      <article className="group relative flex gap-4 pb-8">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-2">
            Part {post.part} of {post.partsTotal}
            <span className="mx-1.5 opacity-50">·</span>
            {categoryConfig?.name || post.category}
          </div>

          <h3 className="font-bold text-xl md:text-2xl tracking-tight leading-tight text-gray-900 dark:text-brand-fg mb-2 group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">
            <Link to={postUrl} className="after:absolute after:inset-0 after:content-['']">
              {post.title.split(':')[0]}
            </Link>
          </h3>

          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
            <span>{post.readingTime} min read</span>
          </div>

          <p
            className="text-gray-600 dark:text-brand-fg-muted leading-relaxed text-sm overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Thumbnail — hidden on the smallest screens to keep rows compact */}
        <div className="hidden sm:block shrink-0 w-28 md:w-36 aspect-[16/9] overflow-hidden self-start">
          <picture>
            <source srcSet={getImageUrl(getWebPPath(headerImagePath))} type="image/webp" />
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
      </article>
    </motion.li>
  );
}

export default function BlogSeriesPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getSeriesWithPosts();
        if (active) setSeries(data);
      } catch (err) {
        console.error('Error loading reading series:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Reading Series · Juan Lara"
        description="Curated, multi-part reading series from the blog — ordered arcs on RAG, ontology engineering, the agent-native knowledge stack, ML fundamentals, and number theory."
        canonical="https://juanlara18.github.io/portfolio/#/blog/series"
        breadcrumbs={[
          { name: 'Blog', url: 'https://juanlara18.github.io/portfolio/#/blog' },
          { name: 'Reading Series', url: 'https://juanlara18.github.io/portfolio/#/blog/series' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>All posts</span>
        </Link>

        {/* Header */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-12 sm:mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-4"
          >
            <BookOpen size={14} />
            <span>Reading series</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05] text-gray-900 dark:text-brand-fg mb-5"
          >
            Posts that build on each other<span className="text-cyan-700 dark:text-brand-accent">.</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-gray-600 dark:text-brand-fg-muted max-w-2xl leading-relaxed"
          >
            Some posts are continuations of others. These are the curated arcs — read
            them in order to follow the full thread, or jump straight to the part you need.
          </motion.p>
        </motion.header>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700 dark:border-brand-accent mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-brand-fg-muted">Loading series...</p>
          </div>
        ) : series.length === 0 ? (
          <p className="text-gray-600 dark:text-brand-fg-muted">No reading series available yet.</p>
        ) : (
          <div className="space-y-16 sm:space-y-20">
            {series.map((s) => (
              <motion.section
                key={s.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="mb-8 pb-6 border-b border-gray-200/60 dark:border-white/[0.08]">
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-3">
                    {s.partsTotal} parts
                  </div>
                  <h2 className="font-bold text-2xl md:text-3xl tracking-tight leading-tight text-gray-900 dark:text-brand-fg mb-3">
                    {s.title}
                  </h2>
                  <p className="text-gray-600 dark:text-brand-fg-muted leading-relaxed max-w-2xl">
                    {s.description}
                  </p>
                  <Link
                    to={`/blog/${s.posts[0].category}/${s.posts[0].slug}`}
                    className="inline-flex items-center gap-2 mt-4 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                  >
                    <span>Start from part 1</span>
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>

                <ol className="list-none m-0 p-0">
                  {s.posts.map((post, index) => (
                    <SeriesStep
                      key={post.slug}
                      post={post}
                      isLast={index === s.posts.length - 1}
                    />
                  ))}
                </ol>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
