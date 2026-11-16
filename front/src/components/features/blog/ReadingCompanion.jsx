// The post sidebar on wide screens: it travels with the reader.
//
// Contents shows where the reader is: sections already read, the current one
// (with how far into it), and what is left, plus the time left for the post.
// The category and tags sit at the bottom. The panel never grows taller than
// the window; a long contents list scrolls inside it and keeps the current
// section in view. Styles: index.css, "Reading companion".
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { categoryToneClass, scrollToElementCentered } from '../../../utils/blogUtils';

// The line in the window where a heading counts as "reached".
const READ_LINE = 0.28;

export default function ReadingCompanion({ post, categoryName, articleRef }) {
  const [headings, setHeadings] = useState([]); // [{ id, text, level, parent }]
  const [state, setState] = useState({ current: -1, fraction: 0, progress: 0, sub: '' });
  const listRef = useRef(null);

  // Headings come from the rendered post, so ids always match the page.
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return undefined;
    const read = () => {
      const nodes = [...article.querySelectorAll('.prose > h2[id], .prose > h3[id]')];
      let parent = -1;
      const hs = nodes.map((n) => {
        const level = n.tagName === 'H2' ? 2 : 3;
        if (level === 2) parent += 1;
        return { id: n.id, text: n.textContent, level, parent };
      });
      setHeadings((prev) => (prev.length === hs.length && prev.every((h, i) => h.id === hs[i].id) ? prev : hs));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(article, { childList: true, subtree: false });
    return () => mo.disconnect();
  }, [articleRef, post.slug]);

  const measure = useCallback(() => {
    const article = articleRef.current;
    if (!article || headings.length === 0) return;
    const vh = window.innerHeight;
    const line = vh * READ_LINE;
    const h2s = headings.filter((h) => h.level === 2).map((h) => document.getElementById(h.id));
    const tops = h2s.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
    const ar = article.getBoundingClientRect();
    let current = -1;
    tops.forEach((t, i) => { if (t <= line) current = i; });
    let fraction = 0;
    if (current >= 0) {
      const start = tops[current];
      const end = current + 1 < tops.length ? tops[current + 1] : ar.bottom - vh * (1 - READ_LINE);
      fraction = end > start ? Math.min(1, Math.max(0, (line - start) / (end - start))) : 1;
    }
    const total = ar.height - vh;
    const progress = total > 0 ? Math.min(1, Math.max(0, -ar.top / total)) : 1;
    // Current sub-section (h3) inside the current section.
    let sub = '';
    headings.forEach((h) => {
      if (h.level === 3 && h.parent === current) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= line) sub = h.id;
      }
    });
    setState((s) => (
      s.current === current && Math.abs(s.fraction - fraction) < 0.01 && Math.abs(s.progress - progress) < 0.005 && s.sub === sub
        ? s : { current, fraction, progress, sub }
    ));
  }, [articleRef, headings]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); }); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  // Keep the current section visible inside a long list, without moving the page.
  useEffect(() => {
    const list = listRef.current;
    if (!list || state.current < 0) return;
    const item = list.querySelector(`[data-index="${state.current}"]`);
    if (!item) return;
    const top = item.offsetTop - list.offsetTop;
    if (top < list.scrollTop + 24 || top + item.offsetHeight > list.scrollTop + list.clientHeight - 24) {
      list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' });
    }
  }, [state.current]);

  const go = (e, id) => {
    e.preventDefault();
    scrollToElementCentered(id, { navbarHeight: 80, updateURL: true, highlightElement: true });
  };

  const minutesLeft = Math.max(1, Math.ceil((post.readingTime || 1) * (1 - state.progress)));
  const sections = headings.filter((h) => h.level === 2);

  return (
    <div className="companion">
      {sections.length > 1 && (
        <nav className="companion-contents" aria-label="Contents">
          <div className="companion-head">
            <span>Contents</span>
            <span className="companion-meta">
              {state.progress > 0.995 ? 'Done' : `${Math.round(state.progress * 100)}% · ${minutesLeft} min left`}
            </span>
          </div>
          <ol ref={listRef} className="companion-list">
            {sections.map((h, i) => {
              const status = i < state.current ? 'done' : i === state.current ? 'current' : 'next';
              const subs = status === 'current' ? headings.filter((s) => s.level === 3 && s.parent === i) : [];
              return (
                <li key={h.id} data-index={i} data-status={status} style={status === 'current' ? { '--fill': state.fraction } : undefined}>
                  <a href={`#${h.id}`} onClick={(e) => go(e, h.id)} aria-current={status === 'current' ? 'location' : undefined}>
                    {h.text}
                  </a>
                  {subs.length > 0 && (
                    <ol className="companion-sub">
                      {subs.map((s) => (
                        <li key={s.id} data-active={state.sub === s.id || undefined}>
                          <a href={`#${s.id}`} onClick={(e) => go(e, s.id)}>{s.text}</a>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="companion-foot">
        <div className="companion-label">Category</div>
        <Link to={`/blog/category/${post.category}`} className={`companion-category ${categoryToneClass(post.category)}`}>
          {categoryName}
        </Link>
        {post.tags && post.tags.length > 0 && (
          <>
            <div className="companion-label">Tags</div>
            <div className="companion-tags">
              {post.tags.map((tag) => (
                <Link key={tag} to={`/blog/tag/${encodeURIComponent(tag)}`}>{tag}</Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
