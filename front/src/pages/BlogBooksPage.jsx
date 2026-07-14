import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { motion } from 'framer-motion';
import { ArrowLeft, Library, BookOpen, FileText, ExternalLink } from 'lucide-react';
import { getBooksData } from '../utils/blogUtils';
import { variants as motionVariants } from '../utils';

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

const POSTS_PREVIEW = 5;

// Progressive reveal of the ranked list: show the top few, unveil in small
// batches, then offer the full list once the reader has clearly kept scrolling.
const INITIAL_VISIBLE = 5;
const REVEAL_STEP = 5;
const STEPS_BEFORE_SHOW_ALL = 3;

function CitingPosts({ posts }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? posts : posts.slice(0, POSTS_PREVIEW);
  const hidden = posts.length - shown.length;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-gray-400 dark:text-brand-fg-muted mr-1">
        cited in
      </span>
      {shown.map((p) => (
        <Link
          key={p.slug}
          to={`/blog/${p.category}/${p.slug}`}
          className="text-[12px] text-gray-600 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent underline decoration-gray-300 dark:decoration-white/20 underline-offset-2 hover:decoration-cyan-700 dark:hover:decoration-brand-accent transition-colors"
        >
          {p.title.split(':')[0]}
        </Link>
      ))}
      {hidden > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="font-mono text-[10px] tracking-[0.08em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-2"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}

function WorkRow({ work, rank, kind }) {
  const titleLink = kind === 'papers'
    ? (work.arxivId ? `https://arxiv.org/abs/${work.arxivId}` : work.url)
    : null;

  const meta = [work.authors, work.year].filter(Boolean).join(' · ');

  return (
    <motion.li variants={fadeInUp} className="flex gap-4 py-4 border-b border-gray-200/60 dark:border-white/[0.08]">
      {/* Mention count badge */}
      <div className="flex-shrink-0 flex flex-col items-center w-12">
        <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-cyan-700 dark:text-brand-accent leading-none">
          {work.count}
        </span>
        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-gray-400 dark:text-brand-fg-muted mt-1">
          {work.count === 1 ? 'post' : 'posts'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-base sm:text-lg leading-snug text-gray-900 dark:text-brand-fg">
          {titleLink ? (
            <a
              href={titleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-700 dark:hover:text-brand-accent transition-colors inline-flex items-start gap-1"
            >
              <span>{work.title}</span>
              <ExternalLink size={12} className="flex-shrink-0 mt-1.5 opacity-60" />
            </a>
          ) : (
            work.title
          )}
        </h3>
        {meta && (
          <div className="mt-0.5 text-sm text-gray-500 dark:text-brand-fg-muted">
            {meta}
          </div>
        )}
        <CitingPosts posts={work.posts} />
      </div>

      <span className="hidden sm:block flex-shrink-0 font-mono text-xs text-gray-300 dark:text-white/15 tabular-nums self-start pt-1">
        {String(rank).padStart(2, '0')}
      </span>
    </motion.li>
  );
}

function Section({ id, icon: Icon, label, works }) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  if (!works.length) return null;

  const shown = works.slice(0, visible);
  const remaining = works.length - shown.length;
  const showAllThreshold = INITIAL_VISIBLE + REVEAL_STEP * STEPS_BEFORE_SHOW_ALL;
  const btn =
    'font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors';

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainer}
      className="mb-16"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
        <Icon size={18} className="text-cyan-700 dark:text-brand-accent" />
        <h2 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">
          {label}
        </h2>
        <span className="font-mono text-xs text-gray-400 dark:text-brand-fg-muted ml-1">
          {works.length}
        </span>
      </motion.div>
      <ol className="list-none m-0 p-0">
        {shown.map((w, i) => (
          <WorkRow key={w.key} work={w} rank={i + 1} kind={id} />
        ))}
      </ol>

      {(remaining > 0 || visible > INITIAL_VISIBLE) && (
        <div className="mt-6 flex items-center gap-5">
          {remaining > 0 && (
            visible < showAllThreshold ? (
              <button type="button" onClick={() => setVisible((v) => Math.min(v + REVEAL_STEP, works.length))} className={btn}>
                Show more <span className="opacity-50">· {remaining} left</span>
              </button>
            ) : (
              <button type="button" onClick={() => setVisible(works.length)} className={btn}>
                Show all {works.length}
              </button>
            )
          )}
          {visible > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setVisible(INITIAL_VISIBLE)}
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-400 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </motion.section>
  );
}

export default function BlogBooksPage() {
  const [data, setData] = useState({ books: [], papers: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('mentions'); // 'mentions' | 'title'

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const d = await getBooksData();
        if (active) setData(d);
      } catch (err) {
        console.error('Error loading books:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(() => {
    const year = (w) => parseInt(w.year, 10) || 0;
    const order = (list) => {
      if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
      if (sort === 'year') {
        // Newest first; ties broken by citation count, then title. Undated last.
        return [...list].sort(
          (a, b) => year(b) - year(a) || b.count - a.count || a.title.localeCompare(b.title)
        );
      }
      return list; // 'mentions' — already sorted by count desc
    };
    return { books: order(data.books), papers: order(data.papers) };
  }, [data, sort]);

  return (
    <>
      <SEO
        title="Books & Papers · Juan Lara"
        description="Every book and academic paper cited across the blog, ranked by how many posts reference it — the recurring canonical sources behind the writing."
        canonical="https://juanlara18.github.io/portfolio/#/blog/books"
        breadcrumbs={[
          { name: 'Blog', url: 'https://juanlara18.github.io/portfolio/#/blog' },
          { name: 'Books & Papers', url: 'https://juanlara18.github.io/portfolio/#/blog/books' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-500 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>All posts</span>
        </Link>

        <motion.header
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-12 sm:mb-14"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-cyan-700 dark:text-brand-accent mb-4"
          >
            <Library size={14} />
            <span>Bibliography</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05] text-gray-900 dark:text-brand-fg mb-5"
          >
            The books and papers behind the blog<span className="text-cyan-700 dark:text-brand-accent">.</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-gray-600 dark:text-brand-fg-muted max-w-2xl leading-relaxed"
          >
            Every book and academic paper cited in the posts' <em>Going Deeper</em> sections,
            aggregated automatically and ranked by how many posts reference it. The works that
            recur are the load-bearing sources — a map of what this blog is actually built on.
          </motion.p>

          {data.stats && (
            <motion.div
              variants={fadeInUp}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.1em] uppercase text-gray-500 dark:text-brand-fg-muted"
            >
              <span>{data.stats.books} books</span>
              <span>{data.stats.papers} papers</span>
              <span className="text-gray-300 dark:text-white/20">·</span>
              <div className="inline-flex items-center gap-2">
                <span>Sort</span>
                {[
                  ['mentions', 'most cited'],
                  ['year', 'newest'],
                  ['title', 'A–Z'],
                ].map(([s, labelText]) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    aria-pressed={sort === s}
                    className={`transition-colors ${
                      sort === s
                        ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-4'
                        : 'hover:text-cyan-700 dark:hover:text-brand-accent'
                    }`}
                  >
                    {labelText}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.header>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700 dark:border-brand-accent mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-brand-fg-muted">Loading bibliography...</p>
          </div>
        ) : (
          <>
            <Section id="books" icon={BookOpen} label="Books" works={sorted.books} />
            <Section id="papers" icon={FileText} label="Papers" works={sorted.papers} />
          </>
        )}
      </div>
    </>
  );
}
