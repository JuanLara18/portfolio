#!/usr/bin/env node
/**
 * build-sitemap.js — generate public/sitemap.xml from blogData.json.
 *
 * Runs as part of prebuild, after build-blog-data.js. The resulting file is
 * copied into the build/ output by CRA like any other public/ asset. Keeps the
 * sitemap in sync with the live post set so new posts are indexed without
 * manual edits.
 *
 * SITE_URL can be overridden via env; defaults to the GitHub Pages URL.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DATA = path.join(__dirname, '..', 'src', 'data', 'blogData.json');
const OUTPUT = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Load .env.local for local overrides (same pattern as build-blog-data.js).
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
} catch (_) {
  // dotenv optional
}

const SITE_URL = (process.env.SITE_URL || 'https://juanlara18.github.io/portfolio').replace(/\/$/, '');

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return (
    `  <url>\n` +
    `    <loc>${escapeXml(loc)}</loc>\n` +
    (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
    (changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : '') +
    (priority ? `    <priority>${priority}</priority>\n` : '') +
    `  </url>`
  );
}

function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function build() {
  if (!fs.existsSync(BLOG_DATA)) {
    console.warn(`build-sitemap: ${BLOG_DATA} not found — run build-blog-data first`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(BLOG_DATA, 'utf8'));
  const posts = Array.isArray(data.posts) ? data.posts : [];

  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  // Static top-level routes.
  entries.push(urlEntry(`${SITE_URL}/`, today, 'monthly', '1.0'));
  entries.push(urlEntry(`${SITE_URL}/about`, today, 'monthly', '0.8'));
  entries.push(urlEntry(`${SITE_URL}/projects`, today, 'monthly', '0.8'));
  entries.push(urlEntry(`${SITE_URL}/blog`, today, 'weekly', '0.9'));

  // Category pages (derived from post set).
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  for (const category of categories) {
    entries.push(urlEntry(`${SITE_URL}/blog/category/${encodeURIComponent(category)}`, today, 'weekly', '0.7'));
  }

  // Individual posts.
  for (const post of posts) {
    if (!post || !post.slug || !post.category) continue;
    const loc = `${SITE_URL}/blog/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}`;
    const lastmod = toIsoDate(post.updatedDate) || toIsoDate(post.date) || today;
    entries.push(urlEntry(loc, lastmod, 'monthly', '0.7'));
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT, xml, 'utf8');
  console.log(`[OK] sitemap written: ${entries.length} URLs -> ${path.relative(process.cwd(), OUTPUT)}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
