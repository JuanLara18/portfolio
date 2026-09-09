'use strict';

/**
 * manifests.js — the compilation manifests the PDF builder renders.
 *
 * A manifest is a named, ordered list of post slugs plus an optional blurb.
 * Both the named series ("The Shape of a Problem (three-part series)") and the
 * cross-cutting reading paths ("Learn RAG from zero to production") are the
 * same shape, so one builder handles both.
 *
 * Source of truth is the `## Reading Paths` section of
 * knowledge-base/KNOWLEDGE_BASE.md — the curated list the author already
 * maintains by hand. Parsing it here avoids a second place to keep in sync.
 */

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '..', '..', '..', 'knowledge-base', 'KNOWLEDGE_BASE.md');

/** `The Shape of a Problem (three-part series)` → `the-shape-of-a-problem` */
function toId(title) {
  return title
    .replace(/\s*\((?:[a-z-]+)-part series\)\s*$/i, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripSeriesSuffix(title) {
  return title.replace(/\s*\((?:[a-z-]+)-part series\)\s*$/i, '').trim();
}

/**
 * Reading-path blocks look like:
 *
 *   ### Title (three-part series)
 *   Optional one-or-more prose lines describing the path.
 *   1. slug-one
 *   2. slug-two
 *   Optional trailing prose ("Branches from here: ...")
 *
 * Prose that follows the numbered list is navigation chatter for agents, not
 * part of the blurb, so only lines *before* the first numbered entry are kept.
 */
function parseManifests(kbText = fs.readFileSync(KB_PATH, 'utf8')) {
  const start = kbText.indexOf('## Reading Paths');
  const end = kbText.indexOf('## Cross-cutting Views');
  if (start === -1 || end === -1) {
    throw new Error('Could not locate the "## Reading Paths" section in KNOWLEDGE_BASE.md');
  }

  const blocks = kbText.slice(start, end).split(/\n### /).slice(1);
  const manifests = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const rawTitle = lines[0].trim();
    const slugs = [];
    const blurbLines = [];
    let seenList = false;

    for (const line of lines.slice(1)) {
      const t = line.trim();
      const listItem = t.match(/^\d+\.\s+(\S+)$/);
      if (listItem) {
        seenList = true;
        slugs.push(listItem[1]);
      } else if (!seenList && t) {
        blurbLines.push(t);
      }
    }

    if (!slugs.length) continue;

    manifests.push({
      id: toId(rawTitle),
      title: stripSeriesSuffix(rawTitle),
      rawTitle,
      /** Named series get part numbering ("Part 2 of 5"); ad-hoc paths do not. */
      isSeries: /-part series\)\s*$/i.test(rawTitle),
      blurb: blurbLines.join(' ').trim(),
      slugs,
    });
  }

  return manifests;
}

function getManifest(id) {
  const all = parseManifests();
  const found = all.find((m) => m.id === id);
  if (!found) {
    throw new Error(
      `Unknown manifest "${id}".\nAvailable:\n${all.map((m) => `  ${m.id}  (${m.slugs.length} posts)`).join('\n')}`,
    );
  }
  return found;
}

module.exports = { parseManifests, getManifest, toId };

if (require.main === module) {
  for (const m of parseManifests()) {
    console.log(`${m.isSeries ? '[series]' : '[path]  '} ${m.id.padEnd(46)} ${String(m.slugs.length).padStart(2)} posts  ${m.title}`);
  }
}
