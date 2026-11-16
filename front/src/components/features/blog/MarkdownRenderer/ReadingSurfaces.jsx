// Wide content inside a post: tables and code blocks.
//
// Both can be wider than a phone. They scroll sideways inside their own box,
// and the box fades out on the side where more content is waiting, so the
// reader sees there is more instead of guessing. Styles live in index.css
// under "Reading surfaces".
import { useEffect, useMemo, useRef, useState } from 'react';
import { PrismLight as SyntaxHighlighter, createElement } from 'react-syntax-highlighter';
import {
  Copy, Check, WrapText, ChevronDown, ChevronRight, ChevronUp, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react';
import codeTheme, { LANGUAGE_LABELS } from './codeTheme';
import {
  findFoldRegions, visibleLines, initialFolds, CLAMP_FROM_LINES, CLAMP_PREVIEW_LINES,
} from './codeFolding';

// Horizontal scroller that marks which edges hide content.
// `sticky` pins a table's first column while the rest scrolls, when that
// column is narrow enough to leave room for the others.
export function ScrollFade({ className = '', label, sticky = false, onOverflowChange, children }) {
  const ref = useRef(null);
  const [state, setState] = useState({ overflow: false, left: false, right: false, pinned: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const overflow = max > 1;
      const left = overflow && el.scrollLeft > 1;
      const right = overflow && el.scrollLeft < max - 1;
      let pinned = false;
      if (sticky && overflow) {
        const first = el.querySelector('tr > :first-child');
        pinned = !!first && first.getBoundingClientRect().width <= el.clientWidth * 0.4;
      }
      setState((s) => (
        s.overflow === overflow && s.left === left && s.right === right && s.pinned === pinned
          ? s : { overflow, left, right, pinned }
      ));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    el.addEventListener('scroll', schedule, { passive: true });
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(schedule);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    return () => {
      el.removeEventListener('scroll', schedule);
      if (ro) ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sticky]);

  useEffect(() => { if (onOverflowChange) onOverflowChange(state.overflow); }, [state.overflow, onOverflowChange]);

  return (
    <div
      ref={ref}
      className={`scroll-fade ${className}`}
      data-fade-left={state.left || undefined}
      data-fade-right={state.right || undefined}
      data-pinned={state.pinned || undefined}
      // A region that scrolls must be reachable by keyboard.
      tabIndex={state.overflow ? 0 : undefined}
      role={state.overflow ? 'region' : undefined}
      aria-label={state.overflow ? label : undefined}
    >
      {children}
    </div>
  );
}

const elementChildren = (n) => (n?.children || []).filter((c) => c.type === 'element');

// Number of columns, read from the header row of the Markdown table.
export function countColumns(node) {
  const head = elementChildren(node).find((c) => c.tagName === 'thead') || elementChildren(node)[0];
  const row = elementChildren(head).find((c) => c.tagName === 'tr') || head;
  return Math.max(1, elementChildren(row).filter((c) => c.tagName === 'th' || c.tagName === 'td').length);
}

// Tables wrap their text. Each column keeps a minimum width (9em on phones,
// 7.5em on wide screens, set in index.css); when the columns cannot all fit
// at that width the table scrolls instead of crushing words one per line.
export function MarkdownTable({ node, children, ...props }) {
  const cols = countColumns(node);
  return (
    <ScrollFade className="md-table-scroll" sticky label="Table, scrolls sideways">
      <div className="md-table-frame" style={{ '--md-table-cols': cols }}>
        <table className="md-table" {...props}>{children}</table>
      </div>
    </ScrollFade>
  );
}

// Line wrapping is a reader preference: turning it on in one block makes it
// the default for the blocks that render after (other posts, a reload).
// Blocks already on screen keep their state so the page does not jump.
const WRAP_KEY = 'code.wrap';
const readWrapPref = () => {
  try { return localStorage.getItem(WRAP_KEY) === '1'; } catch (e) { return false; }
};
const writeWrapPref = (on) => {
  try { localStorage.setItem(WRAP_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
};

const indentWidth = (line) => (line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length);

// Each line is drawn as its own block, so the newline the highlighter keeps at
// the end of a row would add a second, empty line. Drop it (min-height in the
// CSS keeps blank lines one line tall).
const withoutTrailingNewline = (node) => {
  if (node.type === 'text') return { ...node, value: node.value.replace(/\n$/, '') };
  if (!node.children || node.children.length === 0) return node;
  const children = node.children.slice();
  children[children.length - 1] = withoutTrailingNewline(children[children.length - 1]);
  return { ...node, children };
};

// Code blocks open in one of three ways:
//   short                 everything, fold controls on definitions
//   long with definitions as an outline: function bodies folded, one tap
//                         on a fold (or "Unfold") shows them
//   still long after that a preview of the first lines and "Show all N lines"
// Copy always copies the whole block.
export function CodeBlock({ language, value, highlightLanguage }) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(readWrapPref);
  const [overflow, setOverflow] = useState(false);
  const label = LANGUAGE_LABELS[language] || language || 'Code';
  const figureRef = useRef(null);

  const lines = useMemo(() => value.split('\n'), [value]);
  const regions = useMemo(() => findFoldRegions(value, highlightLanguage), [value, highlightLanguage]);
  const regionAt = useMemo(() => new Map(regions.map((r) => [r.start, r])), [regions]);
  const [folded, setFolded] = useState(() => initialFolds(lines.length, regions));
  const shown = useMemo(() => visibleLines(lines.length, regions, folded), [lines.length, regions, folded]);
  // Whether the block opens as a preview is decided once, from how it opens:
  // unfolding a function later must not suddenly cut the block short.
  const [clampable] = useState(() => shown.length > CLAMP_FROM_LINES);
  const [expanded, setExpanded] = useState(false);
  const clamped = clampable && !expanded;
  const drawn = clamped ? shown.slice(0, CLAMP_PREVIEW_LINES) : shown;

  const toggleFold = (start) => {
    setExpanded(true);
    setFolded((f) => {
      const next = new Set(f);
      if (next.has(start)) next.delete(start); else next.add(start);
      return next;
    });
  };
  const anyFolded = folded.size > 0;
  const foldAll = () => {
    if (anyFolded) setExpanded(true);
    setFolded(anyFolded ? new Set() : new Set(regions.filter((r) => r.leaf).map((r) => r.start)));
  };
  const collapse = () => {
    setExpanded(false);
    const el = figureRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
  };

  // Draws the highlighter's rows ourselves so lines can fold and carry a
  // gutter control. Long lines that wrap continue under their own
  // indentation plus two columns (a hanging indent).
  const renderer = ({ rows, stylesheet, useInlineStyles }) => drawn.map((entry) => {
    if (entry.type === 'fold') {
      const { region, hidden } = entry;
      const body = lines.slice(region.headerEnd + 1, region.end + 1).find((l) => l.trim()) || '';
      return (
        <span key={`fold-${region.start}`} className="md-line">
          <button
            type="button"
            className="md-fold-more"
            style={{ marginLeft: `${indentWidth(body)}ch` }}
            onClick={() => toggleFold(region.start)}
            aria-label={`Show ${hidden} hidden lines`}
          >
            {`⋯ ${hidden} lines`}
          </button>
        </span>
      );
    }
    const i = entry.index;
    const row = rows[i];
    const region = regionAt.get(i);
    const hang = wrap ? indentWidth(lines[i] || '') + 2 : 0;
    return (
      <span
        key={i}
        className="md-line"
        style={hang ? { paddingLeft: `${hang}ch`, textIndent: `-${hang}ch` } : undefined}
      >
        {region && (
          <button
            type="button"
            className="md-fold"
            onClick={() => toggleFold(i)}
            aria-expanded={!folded.has(i)}
            aria-label={folded.has(i) ? 'Unfold this definition' : 'Fold this definition'}
          >
            {folded.has(i) ? <ChevronRight size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
          </button>
        )}
        {row && createElement({ node: withoutTrailingNewline(row), stylesheet, useInlineStyles, key: `row-${i}` })}
      </span>
    );
  });

  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, () => {});
  };
  const toggleWrap = () => {
    setWrap((w) => { writeWrapPref(!w); return !w; });
  };

  return (
    <figure
      ref={figureRef}
      className="md-code"
      data-wrap={wrap || undefined}
      data-gutter={regions.length > 0 || undefined}
      data-clamped={clamped || undefined}
    >
      <figcaption className="md-code-head">
        <span className="md-code-lang">{label}</span>
        <span className="md-code-actions">
          {regions.length > 0 && (
            <button
              type="button"
              onClick={foldAll}
              aria-label={anyFolded ? 'Unfold all definitions' : 'Fold all definitions'}
              title={anyFolded ? 'Unfold all definitions' : 'Fold all definitions'}
              className="md-code-btn"
            >
              {anyFolded ? <ChevronsUpDown size={13} aria-hidden="true" /> : <ChevronsDownUp size={13} aria-hidden="true" />}
              <span className="md-code-btn-text">{anyFolded ? 'Unfold' : 'Fold'}</span>
            </button>
          )}
          {(overflow || wrap) && (
            <button
              type="button"
              onClick={toggleWrap}
              aria-pressed={wrap}
              aria-label={wrap ? 'Do not wrap long lines' : 'Wrap long lines'}
              title={wrap ? 'Do not wrap long lines' : 'Wrap long lines'}
              className="md-code-btn"
            >
              <WrapText size={13} aria-hidden="true" />
              <span className="md-code-btn-text">Wrap</span>
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            title={copied ? 'Copied' : 'Copy code'}
            className="md-code-btn"
          >
            {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            <span className="md-code-btn-text">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </span>
      </figcaption>
      <ScrollFade className="md-code-scroll" label={`${label} code, scrolls sideways`} onOverflowChange={setOverflow}>
        <SyntaxHighlighter
          style={codeTheme}
          language={highlightLanguage}
          wrapLines
          wrapLongLines={wrap}
          renderer={renderer}
          className="md-code-pre"
        >
          {value}
        </SyntaxHighlighter>
      </ScrollFade>
      {clampable && (
        <button
          type="button"
          className="md-code-more"
          onClick={expanded ? collapse : () => setExpanded(true)}
          aria-expanded={expanded}
        >
          {expanded
            ? <><ChevronUp size={14} aria-hidden="true" /> Show less</>
            : <><ChevronDown size={14} aria-hidden="true" /> {`Show all ${shown.length} lines`}</>}
        </button>
      )}
    </figure>
  );
}
