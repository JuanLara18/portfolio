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
    <div ref={containerRef} className="mb-6 sm:mb-8 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
      <audio ref={audioRef} src={publicUrl(current.url)} preload="none" />

      {/* Desktop: single row. Mobile: stacked rows. */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 min-w-0">
              <Headphones size={14} className="flex-shrink-0" />
              <span className="truncate">
                {lang === 'es' ? 'Escucha este post' : 'Listen to this post'}
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 tabular-nums flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <button
            type="button"
            onClick={onSeek}
            aria-label="Seek"
            className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900/60 cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <div
              className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </button>
        </div>

        {/* Secondary controls — hidden on mobile, shown inline on sm+ */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {showLangToggle && (
            <div
              role="group"
              aria-label="Audio language"
              className="inline-flex items-center rounded-md bg-white/60 dark:bg-blue-950/40 p-0.5 border border-blue-200 dark:border-blue-800/60"
              title="Switch audio language"
            >
              <Languages size={12} className="ml-1 mr-0.5 text-blue-600 dark:text-blue-300" />
              {available.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  aria-pressed={l === lang}
                  className={`px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    l === lang
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Playback speed: ${currentSpeed}x`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Change playback speed"
          >
            <Gauge size={14} />
            <span className="tabular-nums">{currentSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Mobile-only secondary controls row */}
      <div className="mt-3 flex items-center justify-end gap-1.5 sm:hidden">
        {showLangToggle && (
          <div
            role="group"
            aria-label="Audio language"
            className="inline-flex items-center rounded-md bg-white/60 dark:bg-blue-950/40 p-0.5 border border-blue-200 dark:border-blue-800/60"
          >
            <Languages size={12} className="ml-1 mr-0.5 text-blue-600 dark:text-blue-300" />
            {available.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                aria-pressed={l === lang}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  l === lang
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${currentSpeed}x`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-700 dark:text-blue-200 bg-white/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Gauge size={14} />
          <span className="tabular-nums">{currentSpeed}x</span>
        </button>
      </div>

      {!isReady && (
        <p className="mt-2 text-[11px] text-blue-700/80 dark:text-blue-300/80">
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
      className={`fixed ${isReadingMode ? 'bottom-8 z-[450]' : 'bottom-24 z-[199]'} right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        showFloating ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}
    >
      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
    </button>
    </>
  );
}
