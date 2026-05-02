import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Headphones, Gauge, Languages } from 'lucide-react';

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const LANG_PREF_KEY = 'blog-audio-lang';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function publicUrl(path) {
  const base = process.env.PUBLIC_URL || '';
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path}`;
}

function normalizeAudio(audio) {
  if (!audio) return {};
  // Back-compat: old shape had {url, durationSec, ...}; new shape has {en, es}.
  if (audio.url && !audio.en && !audio.es) {
    return { en: audio };
  }
  return audio;
}

export default function AudioPlayer({ audio }) {
  const tracks = useMemo(() => normalizeAudio(audio), [audio]);
  const available = useMemo(
    () => ['en', 'es'].filter((l) => tracks[l]?.url),
    [tracks]
  );

  const initialLang = useMemo(() => {
    if (available.length === 0) return null;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(LANG_PREF_KEY);
        if (saved && available.includes(saved)) return saved;
      } catch (_) { /* ignore */ }
    }
    return available[0];
  }, [available]);

  const [lang, setLang] = useState(initialLang);
  const current = lang ? tracks[lang] : null;

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(current?.durationSec || 0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    const onToggle = (e) => setIsReadingMode(Boolean(e.detail));
    window.addEventListener('reading-mode-toggle', onToggle);
    return () => window.removeEventListener('reading-mode-toggle', onToggle);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPlayerVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;

    const onTime = () => setCurrentTime(el.currentTime);
    const onLoaded = () => {
      setDuration(el.duration || current?.durationSec || 0);
      setIsReady(true);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHasStarted(false);
    };

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [current]);

  // When language changes, reset transport state and reload src.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    setDuration(current?.durationSec || 0);
    setIsReady(false);
    el.load();
  }, [current]);

  if (!current?.url) return null;

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  };

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[next];
    }
  };

  const switchLang = (target) => {
    if (target === lang || !tracks[target]?.url) return;
    setLang(target);
    try {
      window.localStorage.setItem(LANG_PREF_KEY, target);
    } catch (_) { /* ignore */ }
  };

  const onSeek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    el.currentTime = ratio * duration;
    setCurrentTime(el.currentTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentSpeed = SPEEDS[speedIndex];
  const showLangToggle = available.length > 1;

  const showFloating = hasStarted && (isReadingMode || !isPlayerVisible);
  const floatingLabel = isPlaying
    ? (lang === 'es' ? 'Pausar narración' : 'Pause narration')
    : (lang === 'es' ? 'Reanudar narración' : 'Resume narration');

  return (
    <>
    <div ref={containerRef} className="mb-8 sm:mb-10 pb-6 border-b border-gray-200/60 dark:border-white/[0.08]">
      <audio ref={audioRef} src={publicUrl(current.url)} preload="none" />

      {/* Desktop: single row. Mobile: stacked rows. */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-bg"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-gray-700 dark:text-brand-fg/80 min-w-0">
              <Headphones size={12} className="flex-shrink-0" />
              <span className="truncate">
                {lang === 'es' ? 'Escucha este post' : 'Listen to this post'}
              </span>
            </div>
            <div className="font-mono text-[11px] text-gray-500 dark:text-brand-fg-muted tabular-nums flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <button
            type="button"
            onClick={onSeek}
            aria-label="Seek"
            className="w-full h-1.5 bg-gray-200 dark:bg-cyan-400/15 cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:focus:ring-brand-accent"
          >
            <div
              className="h-full bg-cyan-700 dark:bg-brand-accent transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </button>
        </div>

        {/* Secondary controls — hidden on mobile, shown inline on sm+ */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          {showLangToggle && (
            <div
              role="group"
              aria-label="Audio language"
              className="inline-flex items-center gap-1.5"
              title="Switch audio language"
            >
              <Languages size={12} className="text-cyan-700 dark:text-brand-accent" />
              {available.map((l, idx) => (
                <span key={l} className="inline-flex items-center">
                  {idx > 0 && <span className="mx-1 text-gray-400 dark:text-brand-fg-muted opacity-60">·</span>}
                  <button
                    type="button"
                    onClick={() => switchLang(l)}
                    aria-pressed={l === lang}
                    className={`font-mono text-[10px] tracking-[0.12em] uppercase transition-colors focus:outline-none ${
                      l === lang
                        ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-4 decoration-1'
                        : 'text-gray-500 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Playback speed: ${currentSpeed}x`}
            className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors focus:outline-none"
            title="Change playback speed"
          >
            <Gauge size={12} />
            <span className="tabular-nums">{currentSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Mobile-only secondary controls row */}
      <div className="mt-3 flex items-center justify-end gap-3 sm:hidden">
        {showLangToggle && (
          <div
            role="group"
            aria-label="Audio language"
            className="inline-flex items-center gap-1.5"
          >
            <Languages size={12} className="text-cyan-700 dark:text-brand-accent" />
            {available.map((l, idx) => (
              <span key={l} className="inline-flex items-center">
                {idx > 0 && <span className="mx-1 text-gray-400 dark:text-brand-fg-muted opacity-60">·</span>}
                <button
                  type="button"
                  onClick={() => switchLang(l)}
                  aria-pressed={l === lang}
                  className={`font-mono text-[10px] tracking-[0.12em] uppercase transition-colors focus:outline-none ${
                    l === lang
                      ? 'text-cyan-700 dark:text-brand-accent underline underline-offset-4 decoration-1'
                      : 'text-gray-500 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${currentSpeed}x`}
          className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.12em] uppercase text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors focus:outline-none"
        >
          <Gauge size={12} />
          <span className="tabular-nums">{currentSpeed}x</span>
        </button>
      </div>

      {!isReady && (
        <p className="mt-3 font-mono text-[10px] tracking-[0.08em] uppercase text-gray-500 dark:text-brand-fg-muted">
          {lang === 'es'
            ? 'Narrado con Microsoft Neural TTS · código, diagramas y ecuaciones se omiten'
            : 'Narrated by Microsoft Neural TTS · code, diagrams, and equations are skipped'}
        </p>
      )}
    </div>

    <button
      type="button"
      onClick={togglePlay}
      aria-hidden={!showFloating}
      tabIndex={showFloating ? 0 : -1}
      aria-label={floatingLabel}
      title={floatingLabel}
      className={`fixed ${isReadingMode ? 'bottom-8 z-[450]' : 'bottom-24 z-[199]'} right-8 w-12 h-12 bg-cyan-700 hover:bg-cyan-800 dark:bg-brand-accent dark:hover:bg-brand-accent-soft text-white dark:text-brand-bg rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-bg ${
        showFloating ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}
    >
      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
    </button>
    </>
  );
}
