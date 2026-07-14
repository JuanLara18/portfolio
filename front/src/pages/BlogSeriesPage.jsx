import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Play, Pause, Download, Gauge } from 'lucide-react';
import { getSeriesWithPosts, BLOG_CONFIG, getWebPPath } from '../utils/blogUtils';
import { buildZip } from '../utils/zip';
import { variants as motionVariants } from '../utils';

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

// Resolve a header image path against PUBLIC_URL (mirrors PostCard).
const getImageUrl = (path) => {
  if (!path) return '';
  const base = process.env.PUBLIC_URL || '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
};

// Absolute (R2) audio URLs pass through; relative paths resolve against PUBLIC_URL.
const publicUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.PUBLIC_URL || ''}${path}`;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

// Reconstruct a portable, self-describing markdown file for the download bundle.
const postToMarkdown = (post) => {
  const front = [
    '---',
    `title: ${JSON.stringify(post.title || '')}`,
    `date: ${JSON.stringify(post.date || '')}`,
    `category: ${post.category || ''}`,
    `slug: ${post.slug || ''}`,
    `url: https://juanlara18.github.io/portfolio/#/blog/${post.slug || ''}`,
    '---',
    '',
    '',
  ].join('\n');
  return front + (post.content || '').trim() + '\n';
};

// Compact, podcast-style inline player for a single series step. Sits above the
// card's full-bleed link overlay (relative z-10) and stops click propagation so
// interacting with the player never navigates to the post.
function SeriesAudioBar({ post, playingSlug, setPlayingSlug }) {
  const langs = ['en', 'es'].filter((l) => post.audio?.[l]?.url);
  const [lang, setLang] = useState(langs[0] || null);
  const track = lang ? post.audio[lang] : null;
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(track?.durationSec || 0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [barVisible, setBarVisible] = useState(true);

  const isActive = playingSlug === post.slug;

  // Pause this player whenever another step's player takes over.
  useEffect(() => {
    if (!isActive && audioRef.current) audioRef.current.pause();
  }, [isActive]);

  // Track whether this player's inline bar is on screen (drives the floating control).
  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => setBarVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Reset transport when the language (and thus the source) changes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setIsPlaying(false);
    setCurrent(0);
    setDuration(track?.durationSec || 0);
    el.load();
    el.playbackRate = SPEEDS[speedIndex];
  }, [track]);

  if (!track) return null;

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const play = () => {
    const el = audioRef.current;
    if (!el) return;
    setPlayingSlug(post.slug);
    el.playbackRate = SPEEDS[speedIndex];
    el.play().catch(() => setIsPlaying(false));
  };

  const toggle = (e) => {
    stop(e);
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) play();
    else el.pause();
  };

  const cycleSpeed = (e) => {
    stop(e);
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const onSeek = (e) => {
    stop(e);
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const speed = SPEEDS[speedIndex];
  const showFloating = hasStarted && isActive && !barVisible;
  const floatingLabel = isPlaying
    ? (lang === 'es' ? 'Pausar narración' : 'Pause narration')
    : (lang === 'es' ? 'Reanudar narración' : 'Resume narration');

  return (
    <>
      <div
        ref={barRef}
        onClick={stop}
        className="relative z-10 mt-4 flex items-center gap-2 sm:gap-2.5 max-w-md"
      >
        <audio
          ref={audioRef}
          src={publicUrl(track.url)}
          preload="none"
          onPlay={() => {
            setIsPlaying(true);
            setHasStarted(true);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration || track.durationSec || 0);
            e.target.playbackRate = SPEEDS[speedIndex];
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrent(0);
          }}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-bg"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={onSeek}
          aria-label="Seek"
          className="flex-1 h-1 bg-gray-200 dark:bg-cyan-400/15 cursor-pointer relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:focus:ring-brand-accent"
        >
          <div
            className="h-full bg-cyan-700 dark:bg-brand-accent transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </button>
        <span className="font-mono text-[10px] text-gray-500 dark:text-brand-fg-muted tabular-nums flex-shrink-0">
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${speed}x`}
          title="Change playback speed"
          className="inline-flex items-center gap-0.5 font-mono text-[10px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors focus:outline-none flex-shrink-0"
        >
          <Gauge size={12} />
          <span className="tabular-nums">{speed}x</span>
        </button>
        {langs.length > 1 && (
          <div className="flex items-center flex-shrink-0" aria-label="Audio language">
            {langs.map((l, i) => (
              <span key={l} className="inline-flex items-center">
                {i > 0 && <span className="mx-0.5 text-gray-400 dark:text-brand-fg-muted opacity-50">·</span>}
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    setLang(l);
                  }}
                  aria-pressed={l === lang}
                  className={`font-mono text-[10px] tracking-[0.1em] uppercase transition-colors focus:outline-none ${
                    l === lang
                      ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-2'
                      : 'text-gray-400 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Floating play/pause for the active track once its inline bar scrolls away. */}
      <button
        type="button"
        onClick={toggle}
        aria-hidden={!showFloating}
        tabIndex={showFloating ? 0 : -1}
        aria-label={floatingLabel}
        title={floatingLabel}
        className={`fixed bottom-24 right-8 z-[199] w-12 h-12 bg-cyan-700 hover:bg-cyan-800 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg rounded-full flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-bg ${
          showFloating ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>
    </>
  );
}

function SeriesStep({ post, isLast, playingSlug, setPlayingSlug }) {
  const categoryConfig = BLOG_CONFIG.categories[post.category];
  const headerImagePath = post.headerImage || `/blog/headers/default-${post.category}.jpg`;
  const fallbackPath = '/blog/headers/default.jpg';
  const postUrl = `/blog/${post.category}/${post.slug}`;
  const hasAudio = Boolean(post.audio?.en?.url || post.audio?.es?.url);

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

      <article className="group relative pb-8">
        <div className="flex gap-4">
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
        </div>

        {hasAudio && (
          <SeriesAudioBar
            post={post}
            playingSlug={playingSlug}
            setPlayingSlug={setPlayingSlug}
          />
        )}
      </article>
    </motion.li>
  );
}

export default function BlogSeriesPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  // Only one step's audio plays at a time across the whole page.
  const [playingSlug, setPlayingSlug] = useState(null);

  const downloadSeries = (s) => {
    const files = s.posts.map((p) => ({
      name: `${String(p.part).padStart(2, '0')}-${p.slug}.md`,
      text: postToMarkdown(p),
    }));
    const blob = buildZip(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.id}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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
                  <div className="mt-4 flex items-center gap-5 flex-wrap">
                    <Link
                      to={`/blog/${s.posts[0].category}/${s.posts[0].slug}`}
                      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
                    >
                      <span>Start from part 1</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => downloadSeries(s)}
                      title="Download all posts in this series as markdown (.zip)"
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-400 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
                    >
                      <Download size={13} />
                      <span>Download .md</span>
                    </button>
                  </div>
                </motion.div>

                <ol className="list-none m-0 p-0">
                  {s.posts.map((post, index) => (
                    <SeriesStep
                      key={post.slug}
                      post={post}
                      isLast={index === s.posts.length - 1}
                      playingSlug={playingSlug}
                      setPlayingSlug={setPlayingSlug}
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
