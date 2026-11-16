#!/usr/bin/env node
// Check Mermaid diagrams against the blog's visual grammar
// (docs/authoring.md#diagrams-enforced). Static and fast: no browser.
//
//   npm run diagrams:lint -- <slug> [...]     one or more posts
//   npm run diagrams:lint -- --all           every post, summary first
//   add --strict to exit 1 on errors (for CI on changed posts)
//
// Errors break the grammar outright. Warnings are judgment calls that an
// author should look at, usually with `npm run diagrams:render`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(FRONT, 'public/blog/posts');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const all = args.includes('--all');
const slugs = args.filter((a) => !a.startsWith('--'));

const MAX_NODES = 9;
const MAX_TITLE = 32;        // characters of a node title, outside <small> and $$math$$
const MAX_SERIES = 4;
const LR_MAX = 4;
const ASCII_MATH = /\b(theta|alpha|beta|gamma|delta|lambda|sigma|mu|epsilon|eta|phi|psi|omega|pi)_[a-z0-9{]|\b[a-zA-Z]_\{?t(\+1)?\}?\b|\bsum_|\bprod_|\bargmax\b|\b(sqrt|log)\(/i;

const postFiles = () => {
  const files = [];
  for (const cat of fs.readdirSync(POSTS)) {
    const dir = path.join(POSTS, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) files.push(path.join(dir, f));
  }
  return files;
};

const blocksOf = (file) => {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const out = [];
  const re = /^```mermaid\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(text))) out.push({ line: text.slice(0, m.index).split('\n').length, src: m[1] });
  return out;
};

const typeOf = (src) => (src.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('%%')) || '').split(/\s/)[0];

// Node labels of a flowchart: id["label"], id("label"), id{"label"}, id[label] ...
const flowNodes = (src) => {
  const nodes = new Map();
  const re = /(?:^|[\s;>-])([A-Za-z_][\w-]*)\s*(\(\[|\[\[|\[\(|\(\(|\[\/|\[\\|[[({>])\s*"?([^"\]\)}]*)"?\s*[\])}]/gm;
  let m;
  while ((m = re.exec(src))) {
    if (['subgraph', 'end', 'style', 'classDef', 'class', 'click', 'linkStyle'].includes(m[1])) continue;
    if (!nodes.has(m[1])) nodes.set(m[1], m[3]);
  }
  // `subgraph X["Title"]` defines a group, not a node.
  for (const g of src.matchAll(/^\s*subgraph\s+([A-Za-z_][\w-]*)/gm)) nodes.delete(g[1]);
  return nodes;
};

const titleOf = (label) =>
  label
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .split(/<br\s*\/?>/i)[0]
    .replace(/<small>[\s\S]*?<\/small>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();

const lint = (src) => {
  const type = typeOf(src);
  const issues = [];
  const err = (msg) => issues.push(['error', msg]);
  const warn = (msg) => issues.push(['warn', msg]);

  if (/^\s*style\s+\S+\s+[^\n]*(fill|stroke|color)\s*:\s*#/m.test(src)) err('hex colours in `style`: use :::accent or :::muted');
  if (/^\s*classDef\s+\S+\s+[^\n]*#[0-9a-f]{3,6}/im.test(src)) err('hex colours in `classDef`: use :::accent or :::muted');
  if (/%%\{\s*init/.test(src)) warn('init directive overrides the site theme');
  if (ASCII_MATH.test(src) && !/\$\$/.test(src)) warn('ASCII math (theta_t, sum_, argmax): write it as $$LaTeX$$ in the label');
  if (/\$\$[^$]*<[^$]*\$\$/.test(src)) err('`<` inside $$math$$ is escaped by Mermaid: use \\lt and \\gt');

  if (type === 'flowchart' || type === 'graph') {
    const dir = (src.match(/^\s*(?:flowchart|graph)\s+(\w+)/m) || [])[1] || 'TD';
    const nodes = flowNodes(src);
    if (nodes.size > MAX_NODES) warn(`${nodes.size} nodes (max ${MAX_NODES}): split it, or group with a subgraph`);
    if (dir === 'LR' || dir === 'RL') {
      const chain = Math.max(0, ...src.split('\n').map((l) => (l.match(/-->|-\.->|==>/g) || []).length + 1));
      if (nodes.size > LR_MAX && chain >= LR_MAX) warn(`LR with ${nodes.size} nodes: the column is narrow, use TD`);
    }
    const long = [...nodes.entries()].filter(([, l]) => titleOf(l).length > MAX_TITLE);
    if (long.length) warn(`${long.length} long node title(s), e.g. "${titleOf(long[0][1]).slice(0, 50)}": short title + <small>detail</small>`);
  }

  if (type === 'pie') {
    const slices = (src.match(/^\s*"[^"]+"\s*:/gm) || []).length;
    if (slices > MAX_SERIES) err(`pie with ${slices} slices (max ${MAX_SERIES}): use a bar chart or a table`);
  }
  if (type === 'xychart-beta') {
    const series = (src.match(/^\s*(line|bar)\b/gm) || []).length;
    if (series > MAX_SERIES) err(`xychart with ${series} series (max ${MAX_SERIES})`);
    if (series > 1) warn('xychart has no legend: name every series in the sentence before the chart');
  }
  if (type === 'quadrantChart') warn('quadrant: only if the coordinates are measured, otherwise a table');
  if (type === 'sequenceDiagram') {
    const actors = new Set((src.match(/^\s*(?:participant|actor)\s+(\w+)/gm) || []).map((l) => l.trim().split(/\s+/)[1]));
    const longMsg = (src.match(/:\s*([^\n]+)/g) || []).filter((m) => m.length > 48).length;
    if (actors.size > 5) warn(`${actors.size} participants: more than 5 does not fit the column`);
    if (longMsg) warn(`${longMsg} long message(s): keep messages under ~45 characters`);
  }
  if (type === 'timeline') {
    if (!/^\s*timeline\s+TD\b/m.test(src)) warn('horizontal timeline: write `timeline TD`, horizontal renders below half size');
  }
  return { type, issues };
};

const files = all
  ? postFiles()
  : slugs.map((s) => postFiles().find((f) => path.basename(f, '.md') === s) || (console.error(`no post "${s}"`), process.exit(2)));

if (!files.length) {
  console.error('usage: npm run diagrams:lint -- <slug> [...] | --all  [--strict]');
  process.exit(2);
}

let errors = 0; let warnings = 0;
const byRule = new Map();
for (const file of files) {
  const slug = path.basename(file, '.md');
  const lines = [];
  for (const b of blocksOf(file)) {
    const { type, issues } = lint(b.src);
    for (const [level, msg] of issues) {
      level === 'error' ? errors++ : warnings++;
      const rule = msg.split(/[:(]/)[0].replace(/\d+/g, 'N').trim();
      byRule.set(rule, (byRule.get(rule) || 0) + 1);
      lines.push(`  line ${b.line}  ${type}  ${level === 'error' ? 'ERROR' : 'warn '}  ${msg}`);
    }
  }
  if (lines.length && !all) console.log(`${slug}\n${lines.join('\n')}`);
  if (all && lines.length) byRule.set(`@${slug}`, lines.length);
}

if (all) {
  console.log(`${files.length} posts, ${errors} errors, ${warnings} warnings\n`);
  [...byRule.entries()].filter(([k]) => !k.startsWith('@')).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`${String(n).padStart(5)}  ${k}`));
  const worst = [...byRule.entries()].filter(([k]) => k.startsWith('@')).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log('\nMost issues:');
  worst.forEach(([k, n]) => console.log(`${String(n).padStart(5)}  ${k.slice(1)}`));
} else {
  console.log(`\n${errors} error(s), ${warnings} warning(s)`);
}
if (strict && errors) process.exitCode = 1;
