#!/usr/bin/env node
/**
 * build-rss.js — generate public/rss.xml from blogData.json.
 *
 * Runs at prebuild. RSS gives feed readers, AI ingestion pipelines, and
 * aggregators a simple poll endpoint so new posts propagate without having
 * to crawl the sitemap + render HTML.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DATA = path.join(__dirname, '..', 'src', 'data', 'blogData.json');
const OUTPUT = path.join(__dirname, '..', 'public', 'rss.xml');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
} catch (_) {
  // dotenv optional
}

const SITE_URL = (process.env.SITE_URL || 'https://juanlara18.github.io/portfolio').replace(/\/$/, '');
const FEED_URL = `${SITE_URL}/rss.xml`;
const SITE_NAME = 'Juan Lara — Writing';
const SITE_DESC = 'Technical writing on machine learning, AI agents, NLP, and data engineering — research notes, field notes, and curiosities.';

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(s) {
  return `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function rfc822(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function postUrl(post) {
  return `${SITE_URL}/blog/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}`;
}

function itemXml(post) {
  const url = postUrl(post);
  const title = escapeXml(post.title || post.slug);
  const desc = cdata(post.excerpt || post.description || '');
  const pub = rfc822(post.date);
  const categories = []
    .concat(post.category ? [post.category] : [])
    .concat(Array.isArray(post.tags) ? post.tags : [])
    .map((c) => `    <category>${escapeXml(c)}</category>`)
    .join('\n');

  const audio = post.audio?.en;
  const enclosure = audio?.url && audio?.byteSize
    ? `    <enclosure url="${escapeXml(audio.url)}" length="${audio.byteSize}" type="audio/mpeg" />`
    : '';

  return [
    '  <item>',
    `    <title>${title}</title>`,
    `    <link>${escapeXml(url)}</link>`,
    `    <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    `    <pubDate>${pub}</pubDate>`,
    `    <description>${desc}</description>`,
    categories,
    enclosure,
    `    <dc:creator>Juan Lara</dc:creator>`,
    '  </item>',
  ].filter(Boolean).join('\n');
}

function main() {
  if (!fs.existsSync(BLOG_DATA)) {
    console.warn(`build-rss: ${BLOG_DATA} not found — skipping`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(BLOG_DATA, 'utf8'));
  const posts = (data.posts || [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const latest = posts[0];
  const lastBuild = rfc822(latest?.date || new Date().toISOString());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>build-rss.js</generator>
${posts.map(itemXml).join('\n')}
  </channel>
</rss>
`;

  fs.writeFileSync(OUTPUT, xml, 'utf8');
  console.log(`[OK] rss.xml: ${posts.length} item(s) -> ${path.relative(path.join(__dirname, '..'), OUTPUT)}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
