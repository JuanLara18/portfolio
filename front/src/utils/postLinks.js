// Internal links between posts.
//
// Authoring rule: a post links to another post as `/blog/<slug>` (optionally
// `/blog/<slug>#section`). The slug is the stable ID; the category is
// presentation and can change, so it is resolved here at render time, and the
// rendered href is always the canonical `/blog/<category>/<slug>`.
//
// `scripts/validate-links.js` enforces the rule at build time. The resolver is
// still lenient with the older forms (absolute site URLs, the HashRouter
// `#/blog/<slug>` form, a stale category) so a stray one keeps working.

import blogData from '../data/blogData.json';

const SITE_PREFIX_RE = /^https?:\/\/juanlara18\.github\.io\/portfolio(?=\/|#|$)/i;

// First-level /blog/<x> segments that are pages, not posts.
const RESERVED = new Set(['category', 'tag', 'series', 'books', 'graph']);

const CATEGORY_BY_SLUG = new Map(
  (blogData.posts || []).map((p) => [p.slug, p.category])
);

/** Canonical app path for a post slug, or null if no such post exists. */
export function postPath(slug, categoryBySlug = CATEGORY_BY_SLUG) {
  const category = categoryBySlug.get(slug);
  return category ? `/blog/${category}/${slug}` : null;
}

/**
 * Map an href to an in-app route if it points inside this site.
 * Returns the route path (with any #fragment) or null for external links,
 * in-page anchors and anything that is not a site route.
 */
export function resolveInternalHref(href, categoryBySlug = CATEGORY_BY_SLUG) {
  if (!href || typeof href !== 'string') return null;

  let rest;
  if (SITE_PREFIX_RE.test(href)) {
    rest = href.replace(SITE_PREFIX_RE, '');
  } else if (href.startsWith('#/')) {
    rest = href; // HashRouter-era link without the origin
  } else if (href.startsWith('/') && !href.startsWith('//')) {
    rest = href;
  } else {
    return null;
  }

  if (rest.startsWith('/#/')) rest = rest.slice(2);
  else if (rest.startsWith('#/')) rest = rest.slice(1);
  if (rest === '' || rest === '/#' || rest === '#') return '/';

  const hashAt = rest.indexOf('#');
  const fragment = hashAt >= 0 ? rest.slice(hashAt) : '';
  const pathname = (hashAt >= 0 ? rest.slice(0, hashAt) : rest).replace(/\/+$/, '') || '/';

  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'blog' && !RESERVED.has(parts[1])) {
    // /blog/<slug>  or  /blog/<category>/<slug>
    const slug = parts.length === 2 ? parts[1] : parts.length === 3 ? parts[2] : null;
    const canonical = slug && postPath(slug, categoryBySlug);
    if (canonical) return canonical + fragment;
  }
  return pathname + fragment;
}
