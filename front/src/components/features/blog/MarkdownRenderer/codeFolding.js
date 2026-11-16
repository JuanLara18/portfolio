// Code folding for blog code blocks, the way an editor folds by indentation,
// limited to definitions (functions, classes, Terraform blocks) so the gutter
// stays quiet: an `if` or a dict literal never gets a fold control.
//
// A region is { start, headerEnd, end, depth }:
//   start      first line of the definition (where the fold control sits)
//   headerEnd  last line of its signature (multi-line `def f(\n a,\n):`)
//   end        last line of the body; lines headerEnd+1..end hide when folded
// Lines are 0-based indexes into value.split('\n').

const DEFINITIONS = {
  python: /^\s*(?:async\s+def|def|class)\s+\w/,
  javascript: /^\s*(?:export\s+(?:default\s+)?)?(?:async\s+)?(?:function\b|class\s+\w)|^\s*(?:export\s+)?(?:const|let)\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>\s*\{/,
  go: /^\s*(?:func\s|type\s+\w+\s+(?:struct|interface)\b)/,
  hcl: /^\s*(?:resource|module|data|variable|output|provider|locals|terraform)\b/,
  scala: /^\s*(?:(?:private|protected|override|final|case|abstract|implicit|sealed)\s+)*(?:def|class|object|trait)\s+\w/,
};
DEFINITIONS.typescript = DEFINITIONS.javascript;

const LANG_KEY = { py: 'python', js: 'javascript', ts: 'typescript', terraform: 'hcl' };

const isBlank = (line) => /^\s*$/.test(line);
const indentOf = (line) => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
// Code part of a Python line, without a trailing comment (good enough for
// signatures: a '#' inside a default string value is rare).
const pyCode = (line) => line.replace(/\s+#.*$/, '').trimEnd();

const MAX_HEADER_LINES = 12;
const MIN_HIDDEN_LINES = 2;

export function findFoldRegions(value, language) {
  const lang = LANG_KEY[language] || language;
  const pattern = DEFINITIONS[lang];
  if (!pattern) return [];
  const lines = value.split('\n');
  const braces = lang !== 'python' && lang !== 'scala';
  const regions = [];

  for (let start = 0; start < lines.length; start++) {
    if (!pattern.test(lines[start])) continue;

    // End of the signature: the line that opens the body.
    let headerEnd = -1;
    for (let j = start; j < Math.min(lines.length, start + MAX_HEADER_LINES); j++) {
      if (braces) {
        const opens = (lines[j].match(/\{/g) || []).length;
        const closes = (lines[j].match(/\}/g) || []).length;
        if (opens > closes) { headerEnd = j; break; }
        if (opens > 0 && opens === closes) break; // one-liner: nothing to fold
      } else if (lang === 'python' ? /:$/.test(pyCode(lines[j])) : /(?:=|\{)\s*$/.test(lines[j])) {
        headerEnd = j; break;
      }
    }
    if (headerEnd < 0) continue;

    const base = indentOf(lines[start]);
    let k = headerEnd + 1;
    while (k < lines.length && (isBlank(lines[k]) || indentOf(lines[k]) > base)) k++;
    let end = k - 1;
    while (end > headerEnd && isBlank(lines[end])) end--;
    if (end - headerEnd < MIN_HIDDEN_LINES) continue;

    regions.push({ start, headerEnd, end, indent: base });
  }

  // Depth and leaves: a leaf region contains no other region. Folding the
  // leaves gives an outline (classes stay open, their methods close).
  return regions.map((r) => ({
    ...r,
    leaf: !regions.some((o) => o !== r && o.start > r.headerEnd && o.start <= r.end),
  }));
}

// Lines to draw, given the set of folded region starts. Each entry is either
// { type: 'line', index } or { type: 'fold', region, hidden }.
export function visibleLines(lineCount, regions, folded) {
  const byHeaderEnd = new Map();
  regions.forEach((r) => { if (folded.has(r.start)) byHeaderEnd.set(r.headerEnd, r); });
  const out = [];
  let i = 0;
  while (i < lineCount) {
    out.push({ type: 'line', index: i });
    const r = byHeaderEnd.get(i);
    if (r) {
      out.push({ type: 'fold', region: r, hidden: r.end - r.headerEnd });
      i = r.end + 1;
    } else {
      i++;
    }
  }
  return out;
}

// What a block shows when the page opens. Long blocks with definitions open
// as an outline (leaf definitions folded); everything else opens in full.
export const OUTLINE_FROM_LINES = 30;
export function initialFolds(lineCount, regions) {
  if (lineCount <= OUTLINE_FROM_LINES) return new Set();
  return new Set(regions.filter((r) => r.leaf).map((r) => r.start));
}

// Blocks still taller than this after folding show a preview first.
export const CLAMP_FROM_LINES = 32;
export const CLAMP_PREVIEW_LINES = 22;
