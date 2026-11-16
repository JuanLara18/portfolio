import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import hcl from 'react-syntax-highlighter/dist/esm/languages/prism/hcl';
import cypher from 'react-syntax-highlighter/dist/esm/languages/prism/cypher';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import sparql from 'react-syntax-highlighter/dist/esm/languages/prism/sparql';
import rego from 'react-syntax-highlighter/dist/esm/languages/prism/rego';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import makefile from 'react-syntax-highlighter/dist/esm/languages/prism/makefile';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import turtle from 'react-syntax-highlighter/dist/esm/languages/prism/turtle';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
import ignore from 'react-syntax-highlighter/dist/esm/languages/prism/ignore';
import { ChevronDown, ChevronRight, AlertCircle, Maximize2, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { resolveInternalHref } from '../../../../utils/postLinks';
import { withChunkRetry, isChunkLoadError, reloadForNewBuild } from '../../../../utils/chunkRetry';
import { getMermaidConfig, diagramType } from './mermaidTheme';
import { CodeBlock as CodeSurface, MarkdownTable } from './ReadingSurfaces';
import { BRAND_COLORS } from '../../../../data/brand';

// Syntax highlighting: only the grammars the posts actually use (the full
// Prism build carries ~280). Grammar aliases come along: bash covers sh/shell,
// yaml covers yml, docker covers dockerfile, ignore covers gitignore.
// A fence in an unregistered language renders as plain monospace text.
// To add one: import it from react-syntax-highlighter/dist/esm/languages/prism.
Object.entries({
  python, bash, sql, yaml, json, hcl, cypher, docker, go, toml, scala, sparql,
  rego, powershell, makefile, javascript, typescript, markdown, turtle, graphql,
  ignore,
}).forEach(([name, grammar]) => SyntaxHighlighter.registerLanguage(name, grammar));
const LANGUAGE_ALIASES = { gql: 'graphql', terraform: 'hcl', py: 'python', js: 'javascript', ts: 'typescript' };

// Mermaid is ~600 KB gzipped, so it is fetched the first time a diagram
// scrolls into view instead of blocking the article text. One shared promise.
let mermaidModule = null;
const loadMermaid = () => {
  if (!mermaidModule) {
    mermaidModule = import('mermaid').then((m) => m.default);
    mermaidModule.catch(() => { mermaidModule = null; }); // allow a retry
  }
  return mermaidModule;
};

// Global cache for rendered Mermaid SVGs (limited size to prevent memory leaks)
const mermaidCache = new Map();
const MAX_CACHE_SIZE = 50;

// Simple hash function for generating stable IDs
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Add to cache with size limit
const addToCache = (key, value) => {
  if (mermaidCache.size >= MAX_CACHE_SIZE) {
    const firstKey = mermaidCache.keys().next().value;
    mermaidCache.delete(firstKey);
  }
  mermaidCache.set(key, value);
};

// Normalize Mermaid chart source before rendering.
// Authors write literal \n (backslash + n) inside quoted node labels for line
// breaks. Mermaid v11 with htmlLabels does not interpret that two-character
// sequence as a newline — it must be a real <br/> tag instead. This transform
// is safe because \n in non-label contexts (e.g. node IDs) is not valid Mermaid.
const normalizeMermaidChart = (chart) => {
  return chart
    .trim()
    .replace(/\r\n/g, '\n')    // normalize Windows line endings
    .replace(/\\n/g, '<br/>'); // literal backslash-n in labels → HTML line break
};

const MERMAID_RENDER_VERSION = 'brand-theme-v2';
const MERMAID_LABEL_VERTICAL_PADDING = 8;

const appendInlineStyle = (element, styleText) => {
  if (!element || !styleText) return;

  const existingStyle = element.getAttribute('style') || '';
  const separator = existingStyle && !existingStyle.trim().endsWith(';') ? '; ' : '';
  element.setAttribute('style', `${existingStyle}${separator}${styleText}`);
};

// Mermaid HTML labels are rendered inside <foreignObject> with a fixed height.
// On some browsers and fonts that box ends up a few pixels short, clipping
// descenders or the last line. Expand only those label boxes instead of
// changing the global flowchart layout for every diagram.
const expandMermaidLabelBounds = (svg) => {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return svg;
  }

  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.querySelector('parsererror')) {
      return svg;
    }

    root.querySelectorAll('foreignObject').forEach((foreignObject) => {
      if (!foreignObject.querySelector('div')) return;

      const height = Number.parseFloat(foreignObject.getAttribute('height') || '');
      const y = Number.parseFloat(foreignObject.getAttribute('y') || '');

      if (Number.isFinite(height)) {
        foreignObject.setAttribute('height', `${height + MERMAID_LABEL_VERTICAL_PADDING}`);
      }

      if (Number.isFinite(y)) {
        foreignObject.setAttribute('y', `${y - (MERMAID_LABEL_VERTICAL_PADDING / 2)}`);
      }

      appendInlineStyle(foreignObject, 'overflow: visible;');

      Array.from(foreignObject.children).forEach((child) => {
        appendInlineStyle(child, 'overflow: visible;');
      });
    });

    return new XMLSerializer().serializeToString(root);
  } catch (error) {
    console.warn('Failed to adjust Mermaid label bounds:', error);
    return svg;
  }
};

// mermaid.initialize is global, and the config depends on the theme and the
// diagram type. Renders are chained so each one initializes and renders
// without another diagram swapping the config in between.
let mermaidConfigKey = null;
let mermaidQueue = Promise.resolve();
const renderMermaid = (renderId, chart, isDark) => {
  const run = async () => {
    const mermaid = await loadMermaid();
    const type = diagramType(chart);
    const key = `${isDark ? 'dark' : 'light'}:${type}`;
    if (mermaidConfigKey !== key) {
      mermaid.initialize(getMermaidConfig(isDark, type));
      mermaidConfigKey = key;
    }
    return mermaid.render(renderId, chart);
  };
  const result = mermaidQueue.then(run, run);
  mermaidQueue = result.catch(() => {});
  return result;
};

// Toggle Section — editorial: border-top/bottom hairlines, no fill, cyan chevron.
const ToggleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="my-[1.5em] border-y border-current/15">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-[0.7em] flex items-center justify-between text-left font-semibold transition-opacity hover:opacity-70"
      >
        <span className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={16} className="text-cyan-700 dark:text-brand-accent flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-cyan-700 dark:text-brand-accent flex-shrink-0" />
          )}
          {title}
        </span>
      </button>
      {isOpen && (
        <div className="pb-[1em] pt-[0.4em] border-t border-current/10">
          {children}
        </div>
      )}
    </div>
  );
};

// Custom hook for dark mode detection with debounce
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  useEffect(() => {
    let timeoutId;
    
    const checkDarkMode = () => {
      // Debounce theme changes to avoid rapid re-renders
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }, 100);
    };
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);
  
  return isDarkMode;
};

// Full-screen pan-and-zoom viewer for Mermaid diagrams
const MermaidFullscreenViewer = memo(({ svg, onClose, isDarkMode }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const touchRef = useRef({ dist: 0 });

  // Read SVG intrinsic size from its viewBox (most reliable source)
  const getSvgSize = useCallback(() => {
    const svgEl = wrapperRef.current?.querySelector('svg');
    if (!svgEl) return { w: 800, h: 600 };
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
      const parts = vb.trim().split(/[\s,]+/).map(Number);
      if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
        return { w: parts[2], h: parts[3] };
      }
    }
    const rect = svgEl.getBoundingClientRect();
    return { w: rect.width || 800, h: rect.height || 600 };
  }, []);

  // Scale and center the diagram to fill the available canvas
  const fitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { w: svgW, h: svgH } = getSvgSize();
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const pad = 80;
    const fitScale = Math.max(
      0.05,
      Math.min((cW - pad * 2) / svgW, (cH - pad * 2) / svgH, 10)
    );
    setTransform({
      scale: fitScale,
      x: (cW - svgW * fitScale) / 2,
      y: (cH - svgH * fitScale) / 2,
    });
  }, [getSvgSize]);

  // On mount: fix SVG size from viewBox so it has explicit pixel dimensions, then fit to view
  useEffect(() => {
    const svgEl = wrapperRef.current?.querySelector('svg');
    if (svgEl) {
      const vb = svgEl.getAttribute('viewBox');
      if (vb) {
        const parts = vb.trim().split(/[\s,]+/).map(Number);
        if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
          svgEl.setAttribute('width', String(parts[2]));
          svgEl.setAttribute('height', String(parts[3]));
        }
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(fitToView));
  }, [svg, fitToView]);

  // Lock body scroll while viewer is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('mermaid-fullscreen-toggle', { detail: true }));
    return () => { 
      document.body.style.overflow = prev;
      window.dispatchEvent(new CustomEvent('mermaid-fullscreen-toggle', { detail: false }));
    };
  }, []);

  // Zoom by a multiplier factor, optionally centred on canvas point (cx, cy)
  const changeScale = useCallback((factor, cx, cy) => {
    setTransform(t => {
      const newScale = Math.max(0.05, Math.min(10, t.scale * factor));
      if (cx != null && cy != null) {
        return {
          scale: newScale,
          x: cx - (cx - t.x) * (newScale / t.scale),
          y: cy - (cy - t.y) * (newScale / t.scale),
        };
      }
      return { ...t, scale: newScale };
    });
  }, []);

  // Reset to 100% centered
  const resetTo100 = useCallback(() => {
    const { w, h } = getSvgSize();
    const cW = containerRef.current?.clientWidth ?? 800;
    const cH = containerRef.current?.clientHeight ?? 600;
    setTransform({ scale: 1, x: (cW - w) / 2, y: (cH - h) / 2 });
  }, [getSvgSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'Escape': onClose(); break;
        case '+': case '=': e.preventDefault(); changeScale(1.25); break;
        case '-': case '_': e.preventDefault(); changeScale(1 / 1.25); break;
        case 'f': case 'F': case '0': fitToView(); break;
        case '1': resetTo100(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, fitToView, resetTo100, changeScale]);

  // Wheel zoom (non-passive so we can prevent page scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      changeScale(factor, cx, cy);
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [changeScale]);

  // Mouse drag to pan
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    setTransform(t => {
      dragStartRef.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
      return t;
    });
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const { x, y, tx, ty } = dragStartRef.current;
    setTransform(t => ({ ...t, x: tx + e.clientX - x, y: ty + e.clientY - y }));
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Touch: single-finger pan, two-finger pinch-zoom.
  // Attached imperatively (non-passive) so e.preventDefault() can suppress page scroll.
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setTransform(t => {
        dragStartRef.current = {
          x: e.touches[0].clientX, y: e.touches[0].clientY,
          tx: t.x, ty: t.y,
        };
        return t;
      });
      touchRef.current.dist = 0;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.dist = Math.hypot(dx, dy);
      setTransform(t => {
        dragStartRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          tx: t.x, ty: t.y,
        };
        return t;
      });
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault(); // works because the listener is non-passive
    if (e.touches.length === 1) {
      const { x, y, tx, ty } = dragStartRef.current;
      setTransform(t => ({
        ...t,
        x: tx + e.touches[0].clientX - x,
        y: ty + e.touches[0].clientY - y,
      }));
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (touchRef.current.dist > 0) {
        const factor = dist / touchRef.current.dist;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        changeScale(factor, cx, cy);
      }
      touchRef.current.dist = dist;
    }
  }, [changeScale]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      touchRef.current.dist = 0;
    }
    // If one finger remains, reset pan anchor to prevent jumping
    if (e.touches.length === 1) {
      setTransform(t => {
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          tx: t.x,
          ty: t.y,
        };
        return t;
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Theming helpers
  // Same canvas as the diagram itself, so edge-label backgrounds disappear into it.
  const brand = BRAND_COLORS[isDarkMode ? 'night' : 'day'];
  const bg = brand.bg;
  const dotColor = brand.border;
  const toolbarCls = isDarkMode
    ? 'bg-brand-bg-soft border-brand-border text-brand-fg'
    : 'bg-white border-gray-200 text-gray-900';
  const btnCls = isDarkMode
    ? 'text-gray-300 hover:bg-white/10 hover:text-white min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0';
  const dividerCls = isDarkMode ? 'bg-brand-border' : 'bg-gray-200';
  const zoomCls = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const hintCls = isDarkMode ? 'text-gray-600' : 'text-gray-400';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col" aria-modal="true" role="dialog">
      {/* ── Toolbar ── */}
      <div className={`flex items-center justify-between px-3 py-2 border-b flex-shrink-0 ${toolbarCls}`}>
        {/* Zoom controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => changeScale(1 / 1.25)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-base font-bold transition-colors ${btnCls}`}
            title="Zoom out (−)"
          >−</button>
          <span className={`text-xs font-mono tabular-nums w-12 text-center select-none ${zoomCls}`}>
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            onClick={() => changeScale(1.25)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-base font-bold transition-colors ${btnCls}`}
            title="Zoom in (+)"
          >+</button>
          <div className={`w-px h-4 mx-1.5 ${dividerCls}`} />
          <button
            onClick={fitToView}
            className={`px-2.5 h-7 text-xs font-medium rounded-md transition-colors ${btnCls}`}
            title="Fit diagram to view (F)"
          >Fit</button>
          <button
            onClick={resetTo100}
            className={`px-2.5 h-7 text-xs font-medium rounded-md transition-colors ${btnCls}`}
            title="Reset to 100% (1)"
          >100%</button>
        </div>

        {/* Hint text */}
        <span className={`text-xs hidden md:block ${hintCls}`}>
          Scroll to zoom · Drag to pan · Esc to close
        </span>

        {/* Close */}
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${btnCls}`}
          aria-label="Close fullscreen"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundColor: bg,
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchEnd={onMouseUp}
      >
        <div
          ref={wrapperRef}
          className="mermaid-diagram-fullscreen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            lineHeight: 0,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>,
    document.body
  );
});

// Optimized Mermaid Diagram Component with caching and lazy loading
const MermaidDiagram = memo(({ chart }) => {
  const containerRef = useRef(null);
  const idRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const renderCountRef = useRef(0);
  const isDarkMode = useDarkMode();

  // Normalize source once per chart prop change
  const normalizedChart = useMemo(() => normalizeMermaidChart(chart), [chart]);

  // Generate stable ID based on normalized content
  const chartHash = useMemo(() => hashCode(normalizedChart), [normalizedChart]);
  
  // Initialize ID ref once per component instance
  if (!idRef.current) {
    idRef.current = `mermaid-${chartHash}-${Date.now().toString(36)}`;
  }
  
  // Cache key includes theme so both light/dark results are stored independently
  const cacheKey = `${chartHash}-${isDarkMode ? 'dark' : 'light'}-${MERMAID_RENDER_VERSION}`;
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );
    
    observer.observe(currentRef);
    
    return () => observer.disconnect();
  }, []);
  
  // Render diagram only when visible
  useEffect(() => {
    if (!isVisible) return;
    
    // Check cache first
    const cached = mermaidCache.get(cacheKey);
    if (cached) {
      setSvg(cached);
      setIsLoading(false);
      return;
    }
    
    let isCancelled = false;
    renderCountRef.current += 1;
    const currentRenderCount = renderCountRef.current;
    
    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use unique ID for each render attempt
        const renderId = `${idRef.current}-${currentRenderCount}`;
        // Mermaid and each diagram type load on demand; retry if the network drops a chunk.
        const { svg: renderedSvg } = await withChunkRetry(() => renderMermaid(renderId, normalizedChart, isDarkMode));
        const adjustedSvg = expandMermaidLabelBounds(renderedSvg);
        
        if (isCancelled) return;
        
        // Cache the result
        addToCache(cacheKey, adjustedSvg);
        setSvg(adjustedSvg);
      } catch (err) {
        if (isCancelled) return;
        console.error('Mermaid rendering error:', err);
        if (isChunkLoadError(err)) {
          // The code for this diagram is gone: a new version was deployed. Reload once to get it.
          if (reloadForNewBuild()) return;
          setError('The diagram could not load. Refresh the page to try again.');
        } else {
          setError(err.message || 'Failed to render diagram');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    
    renderDiagram();
    
    return () => {
      isCancelled = true;
    };
  }, [isVisible, cacheKey, normalizedChart, isDarkMode]);
  
  // Placeholder before visible
  if (!isVisible) {
    return (
      <div 
        ref={containerRef}
        className="my-10 p-6 rounded-xl border border-gray-200 dark:border-brand-border min-h-[200px]"
      >
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <span className="text-sm">Diagram</span>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading && !svg) {
    return (
      <div 
        ref={containerRef}
        className="my-10 p-6 rounded-xl border border-gray-200 dark:border-brand-border"
      >
        <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Rendering diagram...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !svg) {
    return (
      <div ref={containerRef} className="my-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Failed to render diagram
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-mono">
              {error}
            </p>
            <details className="mt-3">
              <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer hover:underline">
                Show diagram code
              </summary>
              <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs overflow-x-auto text-red-800 dark:text-red-200">
                {normalizedChart}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {isFullscreen && (
        <MermaidFullscreenViewer
          svg={svg}
          isDarkMode={isDarkMode}
          onClose={() => setIsFullscreen(false)}
        />
      )}
      <div
        ref={containerRef}
        className="my-10 group relative rounded-xl border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-bg overflow-hidden"
      >
        {/* Fullscreen button — always visible on touch, hover-reveal on desktop */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-brand-bg-soft/90 hover:bg-white dark:hover:bg-brand-border rounded-lg shadow-sm border border-gray-200 dark:border-brand-border text-gray-600 dark:text-brand-fg-muted opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10"
          aria-label="View fullscreen"
          title="View fullscreen"
        >
          <Maximize2 size={16} />
        </button>

        {/* Inline diagram */}
        <div className="px-3 py-5 sm:px-8 sm:py-8 overflow-x-auto">
          <div
            className="mermaid-diagram flex justify-center min-w-fit [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => prevProps.chart === nextProps.chart);

// Fenced blocks: Mermaid diagrams, toggle sections, and code.
const CodeBlock = ({ language, value }) => {
  if (language === 'mermaid') {
    return <MermaidDiagram chart={value} />;
  }

  if (language === 'toggle') {
    const lines = value.split('\n');
    const title = lines[0] || 'Toggle Section';
    const content = lines.slice(1).join('\n');
    return (
      <ToggleSection title={title}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </ToggleSection>
    );
  }

  return (
    <CodeSurface
      language={language}
      value={value}
      highlightLanguage={LANGUAGE_ALIASES[language] || language || 'text'}
    />
  );
};

const BlogMarkdownRenderer = memo(({ content, className = "", baseImagePath = "" }) => {
	// Safely extract plain text from React children trees
	const extractText = (node) => {
		if (node == null) return '';
		if (typeof node === 'string' || typeof node === 'number') return String(node);
		if (Array.isArray(node)) return node.map(extractText).join('');
		if (typeof node === 'object' && 'props' in node) return extractText(node.props?.children);
		return '';
	};

	const withPublicUrl = (p) => {
		if (!p) return '';
		const base = process.env.PUBLIC_URL || '';
		if (p.startsWith('http')) return p;
		if (p.startsWith('/')) return `${base}${p}`;
		return `${base}/${p}`;
	};
	// Custom components for markdown elements
	const components = {
		// Enhanced headings with IDs for linking
	h1: ({ children, ...props }) => (
			<h1 
		id={slugify(extractText(children))}
				className="type-section text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 mt-8 sm:mt-12 text-gray-900 dark:text-brand-fg border-b border-gray-200 dark:border-brand-border pb-4 leading-tight"
				{...props}
			>
				{children}
			</h1>
		),
	h2: ({ children, ...props }) => (
			<h2 
		id={slugify(extractText(children))}
				className="type-section text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 mt-10 sm:mt-14 text-gray-900 dark:text-brand-fg leading-snug"
				{...props}
			>
				{children}
			</h2>
		),
	h3: ({ children, ...props }) => (
			<h3 
		id={slugify(extractText(children))}
				className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 mt-8 sm:mt-10 text-gray-900 dark:text-gray-100 leading-snug"
				{...props}
			>
				{children}
			</h3>
		),
	h4: ({ children, ...props }) => (
			<h4 
		id={slugify(extractText(children))}
				className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 mt-6 sm:mt-8 text-gray-900 dark:text-gray-100"
				{...props}
			>
				{children}
			</h4>
		),
	h5: ({ children, ...props }) => (
			<h5 
		id={slugify(extractText(children))}
				className="text-base md:text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100"
				{...props}
			>
				{children}
			</h5>
		),
	h6: ({ children, ...props }) => (
			<h6 
		id={slugify(extractText(children))}
				className="text-sm md:text-base font-semibold mb-2 mt-4 text-gray-700 dark:text-gray-300"
				{...props}
			>
				{children}
			</h6>
		),
    
		// Enhanced paragraphs
		p: ({ children, ...props }) => (
			<p className="mb-6 leading-7 sm:leading-8 text-gray-700 dark:text-gray-300 text-base sm:text-lg font-normal" {...props}>
				{children}
			</p>
		),
    
		// Enhanced images with responsive design and error handling
		img: ({ src = '', alt, title, ...props }) => {
			let imageSrc = '';
			if (src.startsWith('http')) {
				imageSrc = src;
			} else if (src.startsWith('/')) {
				imageSrc = withPublicUrl(src);
			} else if (src.startsWith('figures/')) {
				// Allow markdown to reference `figures/...` from blog root
				imageSrc = withPublicUrl(`/blog/${src}`);
			} else {
				// Default: relative to provided baseImagePath
				const base = baseImagePath?.endsWith('/') ? baseImagePath.slice(0, -1) : baseImagePath;
				imageSrc = withPublicUrl(`${base}/${src}`.replace(/\/+/, '/'));
			}
      
			return (
				<div className="my-8">
					<img
						src={imageSrc}
						alt={alt || ''}
						title={title}
						className="w-full h-auto rounded-md"
						loading="lazy"
						onError={(e) => {
							// Fallback to a default placeholder image instead of disappearing
							const fallback = withPublicUrl('/blog/headers/default.jpg');
							if (e.target.src !== fallback) {
								e.target.src = fallback;
							} else {
								e.target.style.display = 'none';
							}
						}}
						{...props}
					/>
					{(alt || title) && (
						<div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
							{title || alt}
						</div>
					)}
				</div>
			);
		},
    
		// Enhanced links with external link detection
		a: ({ href, children, ...props }) => {
			const linkClass = "text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft underline decoration-1 underline-offset-2 transition-colors";

			// Links into this site (posts, blog pages) go through React Router so
			// the GitHub Pages basename "/portfolio" is preserved and they open in
			// the same tab. `/blog/<slug>` resolves to the canonical
			// `/blog/<category>/<slug>`; see utils/postLinks.js.
			const internalRoute = resolveInternalHref(href);
			if (internalRoute) {
				return <RouterLink to={internalRoute} className={linkClass} {...props}>{children}</RouterLink>;
			}

			const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:'));
			if (isExternal) {
				return (
					<a
						href={href}
						className={linkClass}
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					>
						{children}
						<svg
							className="inline ml-1 w-3 h-3"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				);
			}

			return <a href={href} className={linkClass} {...props}>{children}</a>;
		},
    
	// Enhanced code blocks
	code: ({ className, children, ...props }) => {
		// Detect if it's a code block or inline code
		// In react-markdown v8+, the 'inline' prop is no longer passed
		// Code blocks have a className with language-* or contain newlines
		const hasLanguageClass = /language-([\w-]+)/.exec(className || '');
		const content = String(children);
		const hasNewlines = content.includes('\n');
		
		// It's inline if: no language class AND no newlines AND content is short
		const isInline = !hasLanguageClass && !hasNewlines;
		
		// Inline code — subtle cyan tint, no border, font-mono inherits from RM theme
		if (isInline) {
			return (
				<code
					className="px-[0.35em] py-[0.05em] bg-cyan-700/10 dark:bg-brand-accent/10 text-cyan-800 dark:text-brand-accent text-[0.88em] font-mono"
					{...props}
				>
					{children}
				</code>
			);
		}
		
		// Handle code blocks with syntax highlighting
		const language = hasLanguageClass ? hasLanguageClass[1] : '';
		const value = content.replace(/\n$/, '');
		
		// Use CodeBlock component for syntax highlighting
		return <CodeBlock language={language} value={value} />;
	},
    
	// Enhanced pre blocks - just pass through children without extra styling
	pre: ({ children, ...props }) => {
		// Simply return children without wrapper - CodeBlock handles all styling
		return <>{children}</>;
	},
    
		// Lists — color inherits from parent (RM-aware)
		ul: ({ children, ...props }) => (
			<ul className="mb-[1em] ml-[1.5em] space-y-[0.4em] list-disc" {...props}>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol className="mb-[1em] ml-[1.5em] space-y-[0.4em] list-decimal" {...props}>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li className="leading-relaxed pl-[0.25em]" {...props}>
				{children}
			</li>
		),

		// Blockquote — editorial: thin cyan left rule, italic, inherits color
		blockquote: ({ children, ...props }) => (
			<blockquote
				className="my-[1.5em] pl-[1em] border-l-2 border-cyan-700/40 dark:border-brand-accent/40 italic"
				{...props}
			>
				{children}
			</blockquote>
		),
    
		// Tables wrap their text and scroll sideways when the columns cannot fit;
		// see ReadingSurfaces.jsx and "Reading surfaces" in index.css.
		table: MarkdownTable,

		// Horizontal rule
		hr: ({ ...props }) => (
			<hr className="my-8 border-gray-300 dark:border-brand-border" {...props} />
		),
	};

	return (
		<div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
			<ReactMarkdown
				components={components}
				remarkPlugins={[remarkMath, remarkGfm, remarkFrontmatter]}
				rehypePlugins={[rehypeKatex]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
});

// Helper function for creating URL-friendly slugs
function slugify(text) {
	return text
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-');
}

export default BlogMarkdownRenderer;
