#!/usr/bin/env node

// Extract every book and academic paper cited in the "Going Deeper" sections of
// all blog posts, dedupe them into canonical works, and count how many distinct
// posts cite each. Emits src/data/booksData.json for the /blog/books page.
//
// Reads src/data/blogData.json (each post carries its full markdown `content`),
// mirroring build-knowledge-base.js / build-sitemap.js / build-rss.js.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const BLOG_DATA = path.join(DATA_DIR, 'blogData.json');
const ALIASES_FILE = path.join(DATA_DIR, 'book-aliases.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'booksData.json');

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

// --- Section isolation -------------------------------------------------------

// Return the text of the "Going Deeper" section (to end of document), or ''.
function goingDeeperBlock(content) {
  const m = content.match(/^#{1,3}\s+Going Deeper\s*$/im);
  if (!m) return '';
  return content.slice(m.index + m[0].length);
}

// Given the Going Deeper block, return the lines under a bold subsection header
// (e.g. **Books:**) up to the next **Header:** or markdown heading.
function subsection(block, labelRe) {
  const lines = block.split('\n');
  let i = 0;
  for (; i < lines.length; i += 1) {
    if (labelRe.test(lines[i].trim())) break;
  }
  if (i >= lines.length) return [];
  const out = [];
  for (i += 1; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (/^\*\*[^*]+:\*\*$/.test(t)) break; // next subsection header
    if (/^#{1,6}\s+/.test(t)) break; // next heading
    out.push(lines[i]);
  }
  return out;
}

// Split a subsection into top-level list entries (a "- "/"* " item plus any of
// its indented annotation lines, which we discard). Returns the entry lines only.
function topLevelEntries(lines) {
  const entries = [];
  for (const line of lines) {
    if (/^[-*]\s+/.test(line)) {
      entries.push(line.replace(/^[-*]\s+/, '').trim());
    }
    // indented "  - " annotation lines and blanks are ignored
  }
  return entries;
}

// --- Entry parsing (three citation styles) -----------------------------------

function extractArxiv(url) {
  if (!url) return '';
  const m = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/i) || url.match(/\b(\d{4}\.\d{4,5})\b/);
  return m ? m[1] : '';
}

function cleanTitle(t) {
  return (t || '')
    .replace(/^["'“‘]+|["'”’.,\s]+$/g, '') // strip wrapping quotes / trailing punct
    .replace(/\s*\((?:\d+(?:st|nd|rd|th)|revised|updated|new)[^)]*ed\.?[^)]*\)\s*$/i, '') // trailing (2nd ed.)
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAuthors(a) {
  return (a || '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;—–-]+|[\s,;—–-]+$/g, '')
    .trim();
}

// Parse one entry line into { title, authors, year, url }.
function parseEntry(raw) {
  let line = raw.trim();
  let title = '';
  let authors = '';
  let year = '';
  let url = '';

  const yearMatch = line.match(/\((\d{4})[a-z]?\)/);
  if (yearMatch) year = yearMatch[1];

  const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (linkMatch) url = linkMatch[2];

  const boldMatch = line.match(/^\*\*(.+?)\*\*/);

  if (boldMatch && !yearMatch) {
    // Style C: **[Title](url) — Authors**  or  **Title — Authors**
    let inner = boldMatch[1];
    const lm = inner.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (lm) {
      url = lm[2];
      inner = inner.replace(lm[0], lm[1]);
    }
    const parts = inner.split(/\s+[—–]\s+|\s+-\s+/);
    title = parts[0];
    authors = parts.slice(1).join(' — ');
  } else {
    // Style A/B (books) and paper style: Author(s). (Year). *Title.* / "Title" / [Title](url)
    if (yearMatch) authors = line.slice(0, yearMatch.index);
    const quoted = line.match(/["“]([^"”]+)["”]/);
    const italic = line.match(/\*([^*]+)\*/);
    if (quoted) title = quoted[1];
    else if (italic) title = italic[1];
    else if (linkMatch) title = linkMatch[1];
    else {
      // last resort: text after the year up to the first period
      const after = yearMatch ? line.slice(yearMatch.index + yearMatch[0].length) : line;
      title = after.replace(/^[\s.]+/, '').split(/\.\s/)[0];
    }
  }

  return {
    title: cleanTitle(title),
    authors: cleanAuthors(authors),
    year,
    url,
  };
}

// --- Aggregation -------------------------------------------------------------

function normKey(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function build() {
  const blog = loadJSON(BLOG_DATA, { posts: [] });
  const aliases = loadJSON(ALIASES_FILE, { merge: {}, titles: {}, ignore: [] });
  const merge = aliases.merge || {};
  const titleOverrides = aliases.titles || {};
  const ignore = new Set(aliases.ignore || []);

  // works: kind -> key -> record
  const works = { books: new Map(), papers: new Map() };

  function record(kind, parsed, post) {
    if (!parsed.title || parsed.title.length < 3) return;
    let key = kind === 'papers'
      ? (extractArxiv(parsed.url) || normKey(parsed.title))
      : normKey(parsed.title);
    if (merge[key]) key = merge[key];
    if (ignore.has(key)) return;
    if (!key) return;

    const map = works[kind];
    let rec = map.get(key);
    if (!rec) {
      rec = {
        key,
        title: parsed.title,
        authors: parsed.authors,
        year: parsed.year,
        url: parsed.url,
        arxivId: kind === 'papers' ? extractArxiv(parsed.url) : '',
        slugs: new Set(),
        posts: [],
      };
      map.set(key, rec);
    }
    // Keep the longest/cleanest display variant and fill missing metadata.
    if (parsed.title.length > rec.title.length) rec.title = parsed.title;
    if (!rec.authors && parsed.authors) rec.authors = parsed.authors;
    if (!rec.year && parsed.year) rec.year = parsed.year;
    if (!rec.url && parsed.url) rec.url = parsed.url;
    if (kind === 'papers' && !rec.arxivId) rec.arxivId = extractArxiv(parsed.url);
    if (!rec.slugs.has(post.slug)) {
      rec.slugs.add(post.slug);
      rec.posts.push({ slug: post.slug, title: post.title, category: post.category });
    }
  }

  const BOOKS_RE = /^\*\*Books:\*\*$/i;
  const PAPERS_RE = /^\*\*(?:Academic Papers|Papers):\*\*$/i;

  for (const post of blog.posts || []) {
    const gd = goingDeeperBlock(post.content || '');
    if (!gd) continue;
    for (const raw of topLevelEntries(subsection(gd, BOOKS_RE))) {
      record('books', parseEntry(raw), post);
    }
    for (const raw of topLevelEntries(subsection(gd, PAPERS_RE))) {
      record('papers', parseEntry(raw), post);
    }
  }

  function finalize(map) {
    return Array.from(map.values())
      .map((r) => ({
        key: r.key,
        title: titleOverrides[r.key] || r.title,
        authors: r.authors,
        year: r.year,
        url: r.url,
        arxivId: r.arxivId,
        count: r.slugs.size,
        posts: r.posts,
      }))
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  }

  const books = finalize(works.books);
  const papers = finalize(works.papers);

  const out = {
    generatedAt: new Date().toISOString(),
    stats: {
      books: books.length,
      papers: papers.length,
      bookMentions: books.reduce((n, b) => n + b.count, 0),
      paperMentions: papers.reduce((n, p) => n + p.count, 0),
    },
    books,
    papers,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2));

  console.log(`[OK] books data written -> ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`  books: ${books.length} (mentions ${out.stats.bookMentions}), papers: ${papers.length} (mentions ${out.stats.paperMentions})`);
  console.log('  Top books:');
  books.slice(0, 8).forEach((b) => console.log(`    x${b.count}  ${b.title}${b.year ? ` (${b.year})` : ''}`));
  console.log('  Top papers:');
  papers.slice(0, 8).forEach((p) => console.log(`    x${p.count}  ${p.title}`));

  // Diagnostic: prefix-overlapping titles are likely subtitle variants to merge.
  const diag = [];
  for (const list of [books, papers]) {
    for (let i = 0; i < list.length; i += 1) {
      for (let j = 0; j < list.length; j += 1) {
        if (i !== j && list[i].key && list[j].key
          && list[i].key !== list[j].key
          && list[j].key.startsWith(list[i].key + ' ')) {
          diag.push(`    merge candidate: "${list[j].key}" -> "${list[i].key}"`);
        }
      }
    }
  }
  if (diag.length) {
    console.log(`  Possible merges (add to book-aliases.json "merge"): ${diag.length}`);
    diag.slice(0, 25).forEach((d) => console.log(d));
  }
}

if (require.main === module) build();

module.exports = { build };
