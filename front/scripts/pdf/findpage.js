#!/usr/bin/env node
'use strict';

/**
 * findpage.js — which page of a built PDF contains a given phrase.
 *
 *   node scripts/pdf/findpage.js output/series/x.pdf "default_rng(0)"
 *
 * Page numbers differ between layouts, so comparing the same content across
 * geometries means locating it per file rather than guessing an offset.
 * Diagram labels are searchable too: Mermaid output carries real vector text.
 */

const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const PDFTOTEXT = [
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64', 'pdftotext.exe'),
].find((p) => fs.existsSync(p)) || 'pdftotext';

/** 1-based page numbers whose text contains `phrase`. */
function findPages(pdfPath, phrase) {
  const text = execFileSync(PDFTOTEXT, ['-layout', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return text
    .split('\f')
    .map((page, i) => (page.includes(phrase) ? i + 1 : null))
    .filter(Boolean);
}

module.exports = { findPages };

if (require.main === module) {
  const [pdfPath, phrase] = process.argv.slice(2);
  if (!pdfPath || !phrase) {
    console.error('usage: findpage.js <pdf> <phrase>');
    process.exit(1);
  }
  const pages = findPages(pdfPath, phrase);
  console.log(pages.length ? pages.join(' ') : '(not found)');
}
