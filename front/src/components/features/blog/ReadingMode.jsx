// Reading mode: the post alone, set for long reading on a phone or a laptop.
//
// A thin bar (close, progress, contents, text settings) that slides away
// while reading down and returns when scrolling up. Settings live in one
// "Aa" panel with full-size touch targets. The reader's place is remembered
// per post. Every size in the text scales from one base size, so headings,
// tables and code keep their proportion at any setting. Styles: index.css,
// "Reading mode".
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, List, Type, Minus, Plus } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer/MarkdownRenderer';

const THEMES = [
  { key: 'day', label: 'Day', dark: false },
  { key: 'sepia', label: 'Sepia', dark: false },
  { key: 'night', label: 'Night', dark: true },
];
const LEGACY_THEME = { light: 'day', dark: 'night', sepia: 'sepia' };
const FONTS = {
  sans: { label: 'Sans', stack: 'var(--font-sans)' },
  serif: { label: 'Serif', stack: 'var(--font-serif)' },
};
// Column width in em of the text size, so the line holds about the same
// number of characters at any size (Standard is about 70).
const WIDTHS = [
  { key: 'narrow', label: 'Narrow', value: '32em' },
  { key: 'normal', label: 'Standard', value: '36em' },
  { key: 'wide', label: 'Wide', value: '42em' },
];
const SIZE_MIN = 14;
const SIZE_MAX = 28;
const LEADING_MIN = 1.4;
const LEADING_MAX = 2.2;

const read = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, String(value)); } catch (e) { /* private mode */ }
};

export default function ReadingMode({ post, content, baseImagePath, onClose }) {
  const [size, setSize] = useState(() => {
    const n = parseInt(read('rm.fontSize', ''), 10);
    if (n >= SIZE_MIN && n <= SIZE_MAX) return n;
    return window.innerWidth < 640 ? 17 : 19;
  });
  const [leading, setLeading] = useState(() => {
    const n = parseFloat(read('rm.lineHeight', ''));
    return n >= LEADING_MIN && n <= LEADING_MAX ? n : 1.7;
  });
  const [font, setFont] = useState(() => (FONTS[read('rm.fontFamily', '')] ? read('rm.fontFamily', '') : 'sans'));
  const [width, setWidth] = useState(() => (WIDTHS.some((w) => w.key === read('rm.width', '')) ? read('rm.width', '') : 'normal'));
  const [theme, setTheme] = useState(() => {
    const raw = read('rm.theme', '');
    const saved = THEMES.some((th) => th.key === raw) ? raw : LEGACY_THEME[raw];
    if (saved) return saved;
    return document.documentElement.classList.contains('dark') ? 'night' : 'day';
  });
  const [panel, setPanel] = useState(null); // 'settings' | 'contents' | null
  const [barHidden, setBarHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState([]);
  const [current, setCurrent] = useState('');
  const posKey = `rm.pos.${post.slug}`;
  const [resumeAt] = useState(() => {
    const p = parseFloat(read(posKey, '0'));
    return p > 0.03 && p < 0.97 ? p : 0;
  });
  const [showResume, setShowResume] = useState(resumeAt > 0);

  const scrollRef = useRef(null);
  const lastY = useRef(0);
  const lastSave = useRef(0);
  const originalDark = useRef(document.documentElement.classList.contains('dark'));

  useEffect(() => { write('rm.fontSize', size); }, [size]);
  useEffect(() => { write('rm.lineHeight', leading); }, [leading]);
  useEffect(() => { write('rm.fontFamily', font); }, [font]);
  useEffect(() => { write('rm.width', width); }, [width]);
  useEffect(() => { write('rm.theme', theme); }, [theme]);

  // Code, diagrams and the brand variables follow the .dark class, so night
  // reading switches it; the page's own setting comes back on close.
  useEffect(() => {
    const dark = THEMES.find((t) => t.key === theme)?.dark;
    document.documentElement.classList.toggle('dark', !!dark);
  }, [theme]);
  useEffect(() => () => {
    document.documentElement.classList.toggle('dark', originalDark.current);
  }, []);

  // Lock the page behind, let other components know, focus the text so
  // Space and the arrow keys scroll it.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('reading-mode-toggle', { detail: true }));
    if (scrollRef.current) scrollRef.current.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('reading-mode-toggle', { detail: false }));
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || document.querySelector('[aria-modal="true"]')) return;
      if (panel) setPanel(null); else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, onClose]);

  // A fullscreen diagram hides the reading chrome.
  const [diagramOpen, setDiagramOpen] = useState(false);
  useEffect(() => {
    const onToggle = (e) => setDiagramOpen(!!e.detail);
    window.addEventListener('mermaid-fullscreen-toggle', onToggle);
    return () => window.removeEventListener('mermaid-fullscreen-toggle', onToggle);
  }, []);

  // Section list, read from the rendered text.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hs = [...el.querySelectorAll('.prose h2[id]')].map((h) => ({ id: h.id, text: h.textContent }));
    setHeadings(hs);
  }, [content]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? el.scrollTop / max : 0;
    setProgress(p);

    const y = el.scrollTop;
    if (y > lastY.current + 12 && y > 160) { setBarHidden(true); lastY.current = y; }
    else if (y < lastY.current - 12 || y < 80) { setBarHidden(false); lastY.current = y; }

    const now = Date.now();
    if (now - lastSave.current > 600) { lastSave.current = now; write(posKey, p.toFixed(4)); }
    if (p > 0.02) setShowResume(false);

    const hs = el.querySelectorAll('.prose h2[id]');
    let id = '';
    hs.forEach((h) => { if (h.offsetTop - el.scrollTop < el.clientHeight * 0.3) id = h.id; });
    setCurrent(id);
  }, [posKey]);

  const close = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const max = el.scrollHeight - el.clientHeight;
      write(posKey, (max > 0 ? el.scrollTop / max : 0).toFixed(4));
    }
    onClose();
  }, [onClose, posKey]);

  // A tap on the text closes an open panel, or shows and hides the bar
  // (as in a book reader). Taps on links and controls inside the post keep
  // their own meaning.
  const onTextTap = (e) => {
    if (panel) { setPanel(null); return; }
    if (e.target.closest('a, button, input, summary, label, .md-code, .md-table-scroll, .md-math-scroll, .mermaid-diagram')) return;
    if (window.getSelection && String(window.getSelection())) return;
    setBarHidden((h) => !h);
  };

  const resume = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: resumeAt * (el.scrollHeight - el.clientHeight) });
    setShowResume(false);
  };

  const goTo = (id) => {
    const el = scrollRef.current;
    const h = el && el.querySelector(`#${CSS.escape(id)}`);
    if (h) el.scrollTo({ top: h.offsetTop - 24 });
    setPanel(null);
  };

  const minutesLeft = Math.max(1, Math.ceil((post.readingTime || 1) * (1 - progress)));
  const chromeHidden = barHidden && !panel;
  const widthValue = WIDTHS.find((w) => w.key === width)?.value;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="rm reading-mode-active"
      data-theme={theme}
      role="dialog"
      aria-label={`Reading mode: ${post.title}`}
      style={{ '--rm-font-size': `${size}px`, '--rm-line-height': String(leading) }}
    >
      {!diagramOpen && (
        <div className="rm-bar" data-hidden={chromeHidden || undefined}>
          <button type="button" className="rm-icon" onClick={close} aria-label="Exit reading mode" title="Exit (Esc)">
            <X size={20} aria-hidden="true" />
          </button>
          <span className="rm-bar-title">{post.title}</span>
          {headings.length > 1 && (
            <button
              type="button"
              className="rm-icon"
              onClick={() => setPanel(panel === 'contents' ? null : 'contents')}
              aria-expanded={panel === 'contents'}
              aria-label="Contents"
              title="Contents"
            >
              <List size={20} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="rm-icon"
            onClick={() => setPanel(panel === 'settings' ? null : 'settings')}
            aria-expanded={panel === 'settings'}
            aria-label="Text settings"
            title="Text settings"
          >
            <Type size={20} aria-hidden="true" />
          </button>
          <div className="rm-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
        </div>
      )}

      {panel === 'settings' && (
        <div className="rm-panel" role="group" aria-label="Text settings">
          <div className="rm-row">
            <span className="rm-row-label">Size</span>
            <div className="rm-stepper">
              <button type="button" onClick={() => setSize((s) => Math.max(SIZE_MIN, s - 1))} disabled={size <= SIZE_MIN} aria-label="Smaller text"><span className="rm-a-small">A</span></button>
              <span className="rm-value">{size}</span>
              <button type="button" onClick={() => setSize((s) => Math.min(SIZE_MAX, s + 1))} disabled={size >= SIZE_MAX} aria-label="Larger text"><span className="rm-a-large">A</span></button>
            </div>
          </div>
          <div className="rm-row">
            <span className="rm-row-label">Spacing</span>
            <div className="rm-stepper">
              <button type="button" onClick={() => setLeading((l) => Math.max(LEADING_MIN, +(l - 0.1).toFixed(1)))} disabled={leading <= LEADING_MIN} aria-label="Tighter lines"><Minus size={16} aria-hidden="true" /></button>
              <span className="rm-value">{leading.toFixed(1)}</span>
              <button type="button" onClick={() => setLeading((l) => Math.min(LEADING_MAX, +(l + 0.1).toFixed(1)))} disabled={leading >= LEADING_MAX} aria-label="Looser lines"><Plus size={16} aria-hidden="true" /></button>
            </div>
          </div>
          <div className="rm-row">
            <span className="rm-row-label">Font</span>
            <div className="rm-segment">
              {Object.entries(FONTS).map(([key, f]) => (
                <button key={key} type="button" aria-pressed={font === key} onClick={() => setFont(key)} style={{ fontFamily: f.stack }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="rm-row rm-row-wide">
            <span className="rm-row-label">Width</span>
            <div className="rm-segment">
              {WIDTHS.map((w) => (
                <button key={w.key} type="button" aria-pressed={width === w.key} onClick={() => setWidth(w.key)}>{w.label}</button>
              ))}
            </div>
          </div>
          <div className="rm-row">
            <span className="rm-row-label">Theme</span>
            <div className="rm-swatches">
              {THEMES.map((t) => (
                <button key={t.key} type="button" className={`rm-swatch rm-swatch-${t.key}`} aria-pressed={theme === t.key} onClick={() => setTheme(t.key)} aria-label={`${t.label} theme`}>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {panel === 'contents' && (
        <nav className="rm-panel rm-contents" aria-label="Contents">
          <ol>
            {headings.map((h) => (
              <li key={h.id}>
                <button type="button" aria-current={current === h.id ? 'true' : undefined} onClick={() => goTo(h.id)}>{h.text}</button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div
        ref={scrollRef}
        className="rm-scroll"
        onScroll={onScroll}
        onClick={onTextTap}
        tabIndex={-1}
      >
        <article
          className="rm-content"
          style={{ maxWidth: widthValue, fontFamily: FONTS[font].stack, fontSize: 'var(--rm-font-size)' }}
        >
          <h1 className="rm-title type-title">
            {post.title}
            {!/[.!?]$/.test(post.title) && <span className="text-brand-contrast">.</span>}
          </h1>
          {post.excerpt && <p className="rm-excerpt">{post.excerpt}</p>}
          <MarkdownRenderer content={content} baseImagePath={baseImagePath} />
          <p className="rm-end">End of the post</p>
        </article>
      </div>

      {showResume && (
        <div className="rm-resume" role="status">
          <span>Continue where you left off?</span>
          <button type="button" onClick={resume}>{`Go to ${Math.round(resumeAt * 100)}%`}</button>
          <button type="button" className="rm-icon" onClick={() => setShowResume(false)} aria-label="Dismiss"><X size={16} aria-hidden="true" /></button>
        </div>
      )}

      {!diagramOpen && (
        <div className="rm-status" data-hidden={chromeHidden || undefined}>
          <span>{`${Math.round(progress * 100)}%`}</span>
          <span>{progress > 0.995 ? 'Done' : `${minutesLeft} min left`}</span>
        </div>
      )}
    </motion.div>
  );
}
