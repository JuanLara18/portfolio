#!/usr/bin/env node
/**
 * validate-links.js — check every link from one post to another.
 *
 * The rule (see CLAUDE.md, KNOWLEDGE_BASE.md): a post links to another post as
 *
 *     [text](/blog/<slug>)          or   [text](/blog/<slug>#section)
 *
 * Slug only, site-relative. The app resolves the category at render time
 * (src/utils/postLinks.js), and /blog/<slug> is also a real route that
 * redirects, so the link survives a post moving between categories.
 *
 * Errors (exit 1):
 *   - a link into the site written any other way: the absolute site URL, the
 *     HashRouter form `#/blog/<slug>`, `/blog/<category>/<slug>`, `./<slug>`
 *   - a link to a slug that does not exist
 *
 * Allowed as-is: blog pages (/blog/category/<c>, /blog/tag/<t>, /blog/series,
 * /blog/books, /blog/graph) and assets (/blog/figures/..., anything with a file
 * extension).
 *
 * Usage:
 *   node scripts/validate-links.js          # report; exit 1 on any error
 *   node scripts/validate-links.js --fix    # rewrite every link whose target
 *                                           # resolves to the canonical form,
 *                                           # then report what is left
 *
 * Code blocks and inline code are ignored.
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'public', 'blog', 'posts');
const FIX = process.argv.includes('--fix');

const SITE_RE = /^https?:\/\/juanlara18\.github\.io\/portfolio(?=\/|#|$)/i;
const PAGES = new Set(['category', 'tag', 'series', 'books', 'graph']);
const ASSET_DIRS = new Set(['figures', 'headers', 'posts', 'audio', 'audio-es']);

function listPosts() {
  const posts = [];
  for (const category of fs.readdirSync(POSTS_DIR)) {
    const dir = path.join(POSTS_DIR, category);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.md')) {
        posts.push({ category, slug: file.slice(0, -3), file: path.join(dir, file) });
      }
    }
  }
  return posts;
}

// Blank out frontmatter, fenced code and inline code, keeping offsets intact,
// so link positions found in the mask are valid in the original text.
function maskNonProse(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/^﻿?---\r?\n[\s\S]*?\r?\n---(?=\r?\n)/, blank)
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]+`/g, blank);
}

/**
 * Classify one href. Returns null when the link is not ours to judge
 * (external, in-page anchor, mailto, blog page, asset), otherwise
 *   { slug, fragment, canonical: boolean }
 * where `canonical` says whether it is already written as /blog/<slug>.
 */
function classify(href) {
  let rest;
  let rewritten = false;
  if (SITE_RE.test(href)) {
    rest = href.replace(SITE_RE, '');
    rewritten = true;
  } else if (href.startsWith('#/')) {
    rest = href.slice(1);
    rewritten = true;
  } else if (href.startsWith('./') && !/\.[a-z0-9]{2,4}$/i.test(href)) {
    rest = `/blog/${href.slice(2)}`; // sibling-relative: resolves wrongly in the browser
    rewritten = true;
  } else if (href.startsWith('/') && !href.startsWith('//')) {
    rest = href;
  } else {
    return null;
  }
  if (rest.startsWith('/#/')) rest = rest.slice(2);

  const hashAt = rest.indexOf('#');
  const fragment = hashAt >= 0 ? rest.slice(hashAt) : '';
  const pathname = (hashAt >= 0 ? rest.slice(0, hashAt) : rest).replace(/\/+$/, '');
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] !== 'blog' || parts.length < 2) return null; // home, about, projects...
  if (PAGES.has(parts[1]) || ASSET_DIRS.has(parts[1])) return null;
  if (/\.[a-z0-9]{2,4}$/i.test(pathname)) return null; // a file

  if (parts.length === 2) return { slug: parts[1], fragment, canonical: !rewritten };
  if (parts.length === 3) return { slug: parts[2], fragment, canonical: false };
  return { slug: parts.slice(1).join('/'), fragment, canonical: false };
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function main() {
  const posts = listPosts();
  const slugs = new Set(posts.map((p) => p.slug));
  const errors = [];
  let checked = 0;
  let fixed = 0;
  let filesFixed = 0;

  for (const post of posts) {
    const original = fs.readFileSync(post.file, 'utf8');
    const mask = maskNonProse(original);
    // [text](href) or [text](href "title"); `!` images are links too but only
    // ever point at assets, which classify() lets through.
    const re = /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
    const edits = [];
    let m;
    while ((m = re.exec(mask))) {
      const href = m[1];
      const info = classify(href);
      if (!info) continue;
      checked += 1;
      const where = `${post.category}/${post.slug}.md:${lineOf(original, m.index)}`;
      const exists = slugs.has(info.slug);

      if (exists && !info.canonical && FIX) {
        const start = m.index + m[0].indexOf(href);
        edits.push({ start, end: start + href.length, value: `/blog/${info.slug}${info.fragment}` });
        continue;
      }
      if (!exists) {
        errors.push(`${where}  unknown post "${info.slug}"  (${href})`);
      } else if (!info.canonical) {
        errors.push(`${where}  write as /blog/${info.slug}${info.fragment}  (${href})`);
      }
    }

    if (edits.length) {
      let text = original;
      for (const e of edits.sort((a, b) => b.start - a.start)) {
        text = text.slice(0, e.start) + e.value + text.slice(e.end);
      }
      fs.writeFileSync(post.file, text, 'utf8');
      fixed += edits.length;
      filesFixed += 1;
    }
  }

  if (FIX) console.log(`[fix] rewrote ${fixed} link(s) in ${filesFixed} post(s)`);
  if (errors.length) {
    console.error(`[FAIL] ${errors.length} broken or non-canonical post link(s) — write links between posts as /blog/<slug>:`);
    for (const e of errors) console.error(`  ${e}`);
    if (!FIX) console.error('Run `npm run validate-links -- --fix` to rewrite the ones whose target exists.');
    process.exit(1);
  }
  console.log(`[OK] post links: ${checked} checked across ${posts.length} posts, all canonical and resolvable`);
}

if (require.main === module) main();

module.exports = { classify, maskNonProse };
