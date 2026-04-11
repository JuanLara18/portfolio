#!/usr/bin/env node
/**
 * validate-mermaid.js
 *
 * Scans all blog posts for Mermaid fenced code blocks, applies the same
 * normalization the renderer uses, and reports any patterns that may not
 * render correctly in Mermaid v11.
 *
 * Usage:
 *   node scripts/validate-mermaid.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'public', 'blog', 'posts');

// Mirror of the normalizeMermaidChart function in MarkdownRenderer.jsx
function normalizeMermaidChart(chart) {
  return chart
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '<br/>');
}

// Extract all ```mermaid ... ``` blocks from a markdown string.
// Uses \r?\n to handle both Unix (LF) and Windows (CRLF) line endings.
function extractMermaidBlocks(content) {
  const blocks = [];
  const regex = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Normalize CRLF → LF inside the captured block for consistent analysis
    blocks.push(match[1].replace(/\r\n/g, '\n'));
  }
  return blocks;
}

// Check a single (already-normalized) block for known risky patterns
function auditBlock(raw, normalized, file, idx) {
  const issues = [];

  // Raw source contained literal \n — normalization converts them
  if (/\\n/.test(raw)) {
    const count = (raw.match(/\\n/g) || []).length;
    issues.push({
      severity: 'info',
      message: `${count} literal \\n sequence(s) found — converted to <br/> by renderer`,
    });
  }

  // Unclosed double-quoted strings (odd number of " inside a line)
  const lines = normalized.split('\n');
  lines.forEach((line, lineIdx) => {
    // Skip comment lines
    if (line.trimStart().startsWith('%%')) return;
    const quotesInLine = (line.match(/"/g) || []).length;
    if (quotesInLine % 2 !== 0) {
      issues.push({
        severity: 'warning',
        message: `Possible unclosed double-quote on line ${lineIdx + 1}: ${line.trim()}`,
      });
    }
  });

  // Detect `%%{init:...}%%` directives (fine, but note them)
  if (/^%%\{/.test(normalized)) {
    issues.push({
      severity: 'info',
      message: 'Uses %%{init} directive — ensure config is compatible with Mermaid v11',
    });
  }

  // Detect HTML tags other than <br> in labels (may be stripped in strict mode)
  const htmlTagsInLabels = normalized.match(/"\s*[^"]*<(?!br\s*\/?>)[a-zA-Z]+[^"]*"/g);
  if (htmlTagsInLabels) {
    issues.push({
      severity: 'warning',
      message: `HTML tags other than <br/> inside labels: ${htmlTagsInLabels.join(', ')}`,
    });
  }

  return issues;
}

function scanDirectory(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function run() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('Posts directory not found:', POSTS_DIR);
    process.exit(1);
  }

  const files = scanDirectory(POSTS_DIR);
  let totalDiagrams = 0;
  let totalIssues = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`\nMermaid diagram validator — scanning ${files.length} markdown files\n`);
  console.log('='.repeat(70));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const blocks = extractMermaidBlocks(content);
    if (blocks.length === 0) continue;

    const relPath = path.relative(POSTS_DIR, file);
    let fileHadIssues = false;

    blocks.forEach((raw, idx) => {
      const normalized = normalizeMermaidChart(raw);
      const issues = auditBlock(raw, normalized, relPath, idx);

      if (issues.length > 0) {
        if (!fileHadIssues) {
          console.log(`\n[FILE] ${relPath}`);
          fileHadIssues = true;
        }
        console.log(`  Diagram #${idx + 1} (${raw.trim().split('\n')[0]}):`);
        issues.forEach(issue => {
          let prefix;
          if (issue.severity === 'error') {
            prefix = '  [ERROR] ';
            totalErrors++;
          } else if (issue.severity === 'warning') {
            prefix = '  [WARN] ';
            totalWarnings++;
          } else {
            prefix = '  [INFO] ';
          }
          console.log(`${prefix}${issue.message}`);
        });
        totalIssues += issues.length;
      }
    });

    totalDiagrams += blocks.length;
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\nSummary:`);
  console.log(`  Files scanned : ${files.length}`);
  console.log(`  Diagrams found: ${totalDiagrams}`);
  console.log(
    `  Issues found  : ${totalIssues} ` +
      `(${totalErrors} errors, ${totalWarnings} warnings, ${totalIssues - totalErrors - totalWarnings} info)`
  );

  if (totalErrors > 0) {
    console.log('\n[FAIL] Validation found blocking errors. Fix them before deploying.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n[WARN] Validation finished with warnings (non-blocking). Review when possible.');
  } else {
    console.log('\n[OK] No issues. Diagrams appear compatible with Mermaid v11.');
  }
}

run();
