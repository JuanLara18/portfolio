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
| `npm run build-blog-data` | Rebuild the blog manifest only |
| `npm run optimize-images` | Run image optimization (WebP + resized variants) |
| `npm run validate-mermaid` | Lint Mermaid fences across all posts |
| `npm run generate-pdf` | Render all posts into `output/blog-compilation.pdf` |
| `npm run generate-audio` | Regenerate English audio narration |

For the full tooling reference — including the Python audio pipeline, Ollama
setup for Spanish narration, and the one-shot `generate_audio.sh` /
`generate_audio.ps1` wrappers — see [`scripts/README.md`](scripts/README.md).

## Adding a new blog post

1. Create `public/blog/posts/<category>/<slug>.md` with YAML frontmatter
   (title, date, category, tags, excerpt, readingTime, …).
2. (Optional) Add audio narration:
   ```bash
   ./scripts/generate_audio.sh          # bash / WSL / git-bash
   .\scripts\generate_audio.ps1         # Windows PowerShell
   ```
3. Commit the markdown, any images, and the generated MP3 + sidecar JSON
   files. GitHub Actions deploys on push to `main`.

## Deployment

`.github/workflows/deploy.yml` builds on every push touching `front/**`,
runs `build-blog-data.js` via `prebuild`, conditionally optimizes new images,
and deploys the build to the `gh-pages` branch. Audio is **not** regenerated
in CI — MP3s are committed to the repo.
