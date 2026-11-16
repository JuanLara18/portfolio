// Syntax theme for code blocks, built from the brand colour roles.
//
// Restrained on purpose: when everything is coloured nothing stands out, so
// only four things get a colour. Comments (the explanation the post is making)
// stay readable in the muted role, strings take the primary role, constants
// and numbers the harmonic role, and keywords carry structure through weight
// instead of hue. Punctuation steps back. Amber never appears: it belongs to
// the logo node and the period that closes a title.
//
// Every value is a CSS variable, so one theme serves day, night and the
// reading-mode themes (the .dark class switches the variables), and the text
// colour is inherited, which keeps sepia reading mode legible.

// Strings are the most common token in config-heavy blocks (JSON, YAML), so
// the primary role is mixed toward the text colour to keep it from becoming a
// wall of cyan at night.
const primary = 'color-mix(in srgb, rgb(var(--brand-primary)) 62%, currentColor)';
const harmonic = 'rgb(var(--brand-harmonic))';
const muted = 'rgb(var(--brand-muted))';

const base = {
  color: 'inherit',
  background: 'none',
  fontFamily: 'var(--font-mono)',
  fontSize: '1em',
  fontVariantLigatures: 'none',
  textAlign: 'left',
  wordSpacing: 'normal',
  wordBreak: 'normal',
  wordWrap: 'normal',
  tabSize: 4,
  hyphens: 'none',
};

// No whiteSpace here: the highlighter sets it on <code> (pre or pre-wrap,
// from the wrap toggle) and a theme value would override that choice.
const codeTheme = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, margin: 0, overflow: 'visible' },

  comment: { color: muted, fontStyle: 'italic' },
  prolog: { color: muted, fontStyle: 'italic' },
  doctype: { color: muted },
  cdata: { color: muted },

  punctuation: { color: muted },
  operator: { color: 'inherit' },

  keyword: { fontWeight: 600 },
  important: { fontWeight: 600 },
  atrule: { fontWeight: 600 },
  rule: { fontWeight: 600 },
  selector: { fontWeight: 600 },
  tag: { fontWeight: 600 },

  string: { color: primary },
  char: { color: primary },
  'attr-value': { color: primary },
  'template-string': { color: primary },
  regex: { color: primary },
  url: { color: primary },
  inserted: { color: primary },

  number: { color: harmonic },
  boolean: { color: harmonic },
  constant: { color: harmonic },
  symbol: { color: harmonic },
  decorator: { color: harmonic },
  annotation: { color: harmonic },
  variable: { color: harmonic },
  entity: { color: harmonic },

  deleted: { color: muted, textDecoration: 'line-through' },

  bold: { fontWeight: 600 },
  italic: { fontStyle: 'italic' },
};

export default codeTheme;

// Names shown in the block header. Unknown languages show as written.
export const LANGUAGE_LABELS = {
  python: 'Python', py: 'Python', bash: 'Shell', sh: 'Shell', shell: 'Shell', zsh: 'Shell',
  sql: 'SQL', yaml: 'YAML', yml: 'YAML', json: 'JSON', hcl: 'Terraform', terraform: 'Terraform',
  cypher: 'Cypher', dockerfile: 'Dockerfile', docker: 'Dockerfile', go: 'Go', toml: 'TOML',
  scala: 'Scala', sparql: 'SPARQL', rego: 'Rego', powershell: 'PowerShell', makefile: 'Makefile',
  javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript',
  markdown: 'Markdown', turtle: 'Turtle', graphql: 'GraphQL', gql: 'GraphQL',
  gitignore: '.gitignore', lookml: 'LookML', text: 'Text',
};
