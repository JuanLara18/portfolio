#!/usr/bin/env node
/**
 * inject-blog-meta.js — generate per-post static HTML shards with correct
 * Open Graph / Twitter meta tags so social crawlers (Twitter, LinkedIn,
 * Discord, Slack, Facebook) see post-specific titles, descriptions and images
 * when a link is shared.
 *
 * Why: the React app is client-rendered. Crawlers that don't execute JS fetch
 * the server HTML once — without this step every blog URL returns the generic
 * root index.html, so every shared link shows the same generic preview.
 *
 * How: clone build/index.html into build/blog/<category>/<slug>/index.html,
 * replacing the head meta tags with values from blogData.json. React hydrates
 * normally for real users, so the client-side Helmet flow is unchanged.
 *
 * Runs as a `postbuild` step so it sees the final CRA bundle paths.
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const SOURCE_HTML = path.join(BUILD_DIR, 'index.html');
const BLOG_DATA = path.join(__dirname, '..', 'src', 'data', 'blogData.json');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
} catch (_) {
  // dotenv optional
}

const SITE_URL = (process.env.SITE_URL || 'https://juanlara18.github.io/portfolio').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/portfolio.png`;

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function truncate(s, max = 200) {
  if (!s) return '';
  const clean = String(s).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

// Replace a single <meta ... content="..."> tag by key (name or property).
function replaceMeta(html, attr, key, newContent) {
  const safeContent = escapeHtmlAttr(newContent);
  const pattern = new RegExp(
    `<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`,
    'i'
  );
  const replacement = `<meta ${attr}="${key}" content="${safeContent}">`;
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  // Also try with attributes reversed (content first). Unusual but safe.
  const reversed = new RegExp(
    `<meta\\s+content="[^"]*"\\s+${attr}="${key}"\\s*/?>`,
    'i'
  );
  if (reversed.test(html)) {
    return html.replace(reversed, replacement);
  }
  return html;
}

function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtmlAttr(title)}</title>`);
}

function resolveImage(post) {
  const candidate = post.coverImage || post.image || post.thumbnail;
  if (!candidate) return DEFAULT_IMAGE;
  if (/^https?:\/\//.test(candidate)) return candidate;
  const rel = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${SITE_URL}${rel}`;
}

function injectForPost(sourceHtml, post) {
  const title = post.title ? `${post.title} | Juan Lara` : 'Juan Lara | Portfolio';
  const description = truncate(post.excerpt || post.description || '', 200) ||
    'Research Assistant at Harvard Business School writing about Machine Learning, AI Agents, and NLP.';
  const url = `${SITE_URL}/blog/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}`;
  const image = resolveImage(post);

  let html = sourceHtml;
  html = replaceTitle(html, title);
  html = replaceMeta(html, 'name', 'title', title);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:type', 'article');
  html = replaceMeta(html, 'property', 'og:url', url);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'property', 'og:image', image);
  html = replaceMeta(html, 'property', 'twitter:url', url);
  html = replaceMeta(html, 'property', 'twitter:title', title);
  html = replaceMeta(html, 'property', 'twitter:description', description);
  html = replaceMeta(html, 'property', 'twitter:image', image);

  return html;
}

function writeShard(outRelDir, html) {
  const outDir = path.join(BUILD_DIR, outRelDir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

function main() {
  if (!fs.existsSync(SOURCE_HTML)) {
    console.warn(`inject-blog-meta: ${SOURCE_HTML} not found — skipping`);
    return;
  }
  if (!fs.existsSync(BLOG_DATA)) {
    console.warn(`inject-blog-meta: ${BLOG_DATA} not found — skipping`);
    return;
  }

  const sourceHtml = fs.readFileSync(SOURCE_HTML, 'utf8');
  const data = JSON.parse(fs.readFileSync(BLOG_DATA, 'utf8'));
  const posts = Array.isArray(data.posts) ? data.posts : [];

  let count = 0;
  for (const post of posts) {
    if (!post || !post.slug || !post.category) continue;
    const html = injectForPost(sourceHtml, post);
    writeShard(path.join('blog', post.category, post.slug), html);
    count += 1;
  }

  // Top-level /blog shard with aggregated meta.
  const blogHtml = injectForPost(sourceHtml, {
    title: 'Writing',
    excerpt: 'Technical writing on machine learning, AI agents, NLP, and data engineering — research notes, field notes, and curiosities.',
    category: '',
    slug: '',
  }).replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${SITE_URL}/blog">`
  ).replace(
    /<meta property="twitter:url" content="[^"]*">/,
    `<meta property="twitter:url" content="${SITE_URL}/blog">`
  );
  writeShard('blog', blogHtml);

  console.log(`[OK] blog meta injected: ${count} post shard(s) + /blog -> build/blog/...`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
