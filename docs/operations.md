# Operations

Running, building, deploying, and fixing the site. For the internals of each script, see [`front/scripts/README.md`](../front/scripts/README.md).

## Requirements

| Tool | Needed for |
|---|---|
| Node.js 18+ | everything |
| Python 3.10+ | the `sync` pipeline and narration |
| Ollama | Spanish narration (optional: without it, Spanish audio is skipped with a warning) |
| pandoc, MiKTeX or TeX Live, `@mermaid-js/mermaid-cli` | print PDFs only |

All commands run from `front/`.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Development server on http://localhost:3000 |
| `npm run build` | `prebuild` (indexes, link check, sitemap, RSS), production build, then per-route HTML |
| `npm test` | Unit tests |
| `npm run sync` | Content pipeline: orphan cleanup, Mermaid check, image optimization, EN and ES narration, R2 upload, data rebuild |
| `npm run sync:fast` | Same, without Spanish narration |
| `npm run sync:check` | Validation only, no side effects. Runs in CI |
| `npm run validate-links` | Check every link between posts. `-- --fix` rewrites the mechanical cases |
| `npm run validate-mermaid` | Parse-check every Mermaid diagram |
| `npm run optimize-images` | WebP twins and size-capped variants for new images |
| `npm run build-blog-data` | Rebuild `src/data/blogData.json` only |
| `npm run build-knowledge-base` | Rebuild `knowledge-base/posts.json` and the catalog in `KNOWLEDGE_BASE.md` |
| `npm run pdf:series:list` | Series and reading paths that can be compiled to PDF |
| `npm run pdf:series -- <id> --layout=all` | Compile one of them in every page layout |

## Continuous delivery

`.github/workflows/deploy.yml` runs on every push to `main` that touches `front/`, and on demand.

1. Install with `npm ci` on Node 18 and Python 3.11.
2. `npm run sync:check`: fails on orphaned audio or broken diagrams before the expensive steps.
3. `npm test`.
4. Optimize any images that lack a WebP twin.
5. `npm run build`: `prebuild` regenerates every index and fails on a broken link between posts.
6. Publish `front/build` to the `gh-pages` branch, which GitHub Pages serves.

Narration is never generated in CI. `npm run sync` produces it locally and uploads it to R2. The build only needs the public base URLs, which the workflow sets.

## Narration and audio hosting

Each post is narrated with edge-tts. The Spanish version is translated first by a local Ollama model (`gemma4` by default, override with `OLLAMA_MODEL`). Results are cached by a hash of the narration text, so only prose changes trigger new audio.

MP3s are hosted on a public Cloudflare R2 bucket. Copy `front/.env.example` to `front/.env.local` and fill in:

| Variable | Used by |
|---|---|
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | `upload_audio.py`, local only |
| `AUDIO_BASE_URL_EN`, `AUDIO_BASE_URL_ES` | `build-blog-data.js`, locally and in CI |

Without them, local development serves audio from `public/blog/audio{,-es}/`.

## Troubleshooting

**The build fails with `broken or non-canonical post link(s)`.**
A post links to a slug that does not exist, or writes the link in a form other than `/blog/<slug>`. Run `npm run validate-links -- --fix`, then fix what remains by hand using `knowledge-base/posts.json` to find the right slug.

**`sync:check` fails on orphans.**
A post was renamed or moved and its old audio is still on disk. Run `npm run sync`; it removes orphans and regenerates under the new name.

**A diagram shows an error box on the site.**
Run `npm run validate-mermaid` and check the post against the diagram rules in [authoring.md](authoring.md#diagrams-enforced).

**An equation renders small and inline instead of centered.**
The `$$` delimiters are on the same line as the formula. Put each on its own line.

**A post page says "Post not found".**
The slug in the URL does not match any file. If the post was renamed, the old URL cannot redirect, because slugs are identifiers. Restore the old name or update the links.

**A social preview shows the generic site image.**
The preview comes from the static HTML written at build time. Check the post's `headerImage` path, rebuild, and refresh the preview cache of the platform (LinkedIn Post Inspector, for example).
