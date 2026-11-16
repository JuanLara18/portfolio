#!/usr/bin/env node
/**
 * inject-blog-meta.js — generate per-route static HTML shards (every post plus
 * the non-post pages: about, projects, blog index, series, books, graph,
 * categories) with correct
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
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

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

// Social preview image for a post: its header (the JPEG, not the WebP twin —
// LinkedIn and some other crawlers do not render WebP previews).
function resolveImage(post) {
  const candidate = post.headerImage;
  if (!candidate) return DEFAULT_IMAGE;
  if (/^https?:\/\//.test(candidate)) return candidate;
  const rel = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${SITE_URL}${rel}`;
}

// Same category names the app shows (src/utils/blogUtils.js BLOG_CONFIG).
const CATEGORY_NAMES = {
  curiosities: 'Mathematical Curiosities',
  research: 'Research Notes',
  'field-notes': 'Field Notes',
};

// Routes that are not posts but should still answer 200 with their own meta.
// Titles and descriptions mirror each page's <SEO> so the pre-JS and post-JS
// heads agree.
function staticPages(categories) {
  return [
    {
      path: 'about',
      title: 'About · Juan Lara',
      description: "AI Engineer building production AI systems at enterprise scale. Knowledge systems for AI agents in banking, RAG and GraphRAG platforms, agentic architectures. Currently leading the knowledge-base cell of Davivienda's AI-First strategy.",
    },
    {
      path: 'projects',
      title: 'Projects · Juan Lara',
      description: 'Portfolio of AI and machine learning projects including TextInsight, RAG systems, and production-ready generative AI solutions. Explore ML engineering work and research implementations.',
    },
    {
      path: 'blog',
      title: 'Blog · Juan Lara',
      description: 'Technical articles about AI, machine learning, NLP, and computer science. Deep dives into research papers, curiosities, and practical ML engineering.',
    },
    {
      path: 'blog/series',
      title: 'Reading Series · Juan Lara',
      description: 'Curated, multi-part reading series from the blog — ordered arcs on RAG, agents, graph engineering, knowledge systems, ML fundamentals, data engineering, and more.',
    },
    {
      path: 'blog/books',
      title: 'Books & Papers · Juan Lara',
      description: 'Every book and academic paper cited across the blog, ranked by how many posts reference it — the recurring canonical sources behind the writing.',
    },
    {
      path: 'blog/graph',
      title: 'Topic Graph · Juan Lara',
      description: 'An interactive map of the blog: every topic as a node, linked by the posts that share it.',
    },
    ...categories.map((category) => {
      const name = CATEGORY_NAMES[category] || category;
      return {
        path: `blog/category/${category}`,
        title: `${name} · Juan Lara`,
        description: `Browse ${name} posts by Juan Lara. Engineering notes on production AI, RAG systems, agentic architectures, and LLM ops.`,
      };
    }),
  ];
}

// Rewrite the head of index.html for one page. `url` is the canonical URL
// (trailing slash: GitHub Pages serves <path>/index.html there with a 200).
function injectMeta(sourceHtml, { title, description, url, image = DEFAULT_IMAGE, type = 'website' }) {
  let html = sourceHtml;
  html = replaceTitle(html, title);
  html = replaceMeta(html, 'name', 'title', title);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:type', type);
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

function injectForPost(sourceHtml, post) {
  const title = `${post.title} · Juan Lara`;
  const description = truncate(post.excerpt || post.description || '', 200) || title;
  const url = `${SITE_URL}/blog/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}/`;
  return injectMeta(sourceHtml, { title, description, url, image: resolveImage(post), type: 'article' });
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

  // Non-post routes. Without a shard GitHub Pages answers these with 404.html
  // (status 404), which the SPA redirect hides from readers but not from
  // search engines.
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const pages = staticPages(categories);
  for (const page of pages) {
    const html = injectMeta(sourceHtml, { ...page, url: `${SITE_URL}/${page.path}/` });
    writeShard(page.path, html);
  }

  console.log(`[OK] meta injected: ${count} post shard(s) + ${pages.length} page shard(s) -> build/`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
