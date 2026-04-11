# front/

React application for the portfolio and blog. See the
[root README](../README.md) for the project overview and stack.

## Getting started

```bash
npm install
npm start          # dev server on http://localhost:3000
npm run build      # production build (runs prebuild → build-blog-data.js)
```

## Layout

```
front/
├── public/
│   └── blog/
│       ├── posts/<category>/<slug>.md   # source markdown with YAML frontmatter
│       ├── audio/                       # English narration MP3s + manifest
│       └── audio-es/                    # Spanish narration MP3s + manifest
├── scripts/                             # build-time tooling — see scripts/README.md
├── src/
│   ├── components/                      # UI (blog renderer, audio player, etc.)
│   ├── data/blogData.json               # generated; do not edit by hand
│   └── ...
└── package.json
```

## npm scripts

| Command | What it does |
|---|---|
| `npm start` | CRA dev server |
| `npm run build` | Production build. `prebuild` regenerates `src/data/blogData.json` |
| `npm run sync` | **Main content pipeline.** Clean orphan audio, validate Mermaid, optimize images, generate EN + ES audio, rebuild blog data |
| `npm run sync:fast` | Same as `sync` but skips Spanish audio (fast text iteration) |
| `npm run sync:check` | Validate only; no side effects. Runs in CI before every deploy |
| `npm run build-blog-data` | Rebuild the blog manifest only |
| `npm run optimize-images` | Image optimization (WebP + resized variants) |
| `npm run validate-mermaid` | Lint Mermaid fences across all posts |
| `npm run generate-pdf` | Render all posts into `output/blog-compilation.pdf` |

For the full tooling reference — the Python audio pipeline, Ollama setup for
Spanish narration, Cloudflare R2 audio hosting, edge cases, and troubleshooting
— see [`scripts/README.md`](scripts/README.md).

## Environment variables

The audio pipeline reads configuration from `front/.env.local` (git-ignored).
Copy `front/.env.example` to `front/.env.local` and fill in the values when
you're ready to enable R2 uploads. Without those variables, audio is served
from `public/blog/audio{,-es}/` locally — no setup required for development.

## Adding or updating a blog post

```bash
# 1. Edit the markdown
vim public/blog/posts/<category>/<slug>.md

# 2. Sync (incremental; auto-detects what needs regenerating)
npm run sync            # full — EN + ES audio, ~minutes per new post in Spanish
# or:
npm run sync:fast       # skip ES if you're just iterating on text

# 3. Commit everything that changed
git add -A && git commit -m "post: <title>"
```

`sync` handles the edge cases so you don't have to:

- **Rename a post** (change the `.md` filename) — old audio is detected as
  orphan and deleted automatically.
- **Move between categories** — same: orphan cleanup catches it.
- **Edit only code blocks, diagrams, math, or frontmatter** — audio cache
  stays valid; no regeneration, no waiting.
- **Edit prose** — only the affected post's audio regenerates.
- **Ollama not installed** — Spanish audio is skipped with a warning; English
  still works.

## Deployment

`.github/workflows/deploy.yml` runs on every push touching `front/**`:

1. Set up Node 18 and Python 3.11
2. `npm ci`
3. **`npm run sync:check`** — fail-fast on orphans or Mermaid errors before
   spending minutes on a doomed build
4. Optimize new images (only if unoptimized files are detected)
5. `npm run build` (which runs `prebuild → build-blog-data.js`)
6. Deploy `build/` to the `gh-pages` branch

Audio is **not** regenerated in CI — MP3s are committed to the repo. The local
`npm run sync` is what produces them.
