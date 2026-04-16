# Build & Tooling Scripts

Build-time utilities for the portfolio: content consistency, blog data
generation, image optimization, diagram validation, PDF export, and
narrated audio generation.

For day-to-day work you only need one command: **`npm run sync`**. It
orchestrates every step below in the right order with hash-aware caching,
so re-runs are cheap and safe. The individual scripts are still callable
for troubleshooting or surgical edits.

---

## Quick reference

| Script | npm alias | Purpose |
|---|---|---|
| `sync.py` | `sync` / `sync:fast` / `sync:check` | **Main entry point.** Clean orphans → validate Mermaid → optimize images → generate EN+ES audio → upload to R2 → rebuild blog data + knowledge base |
| `build-blog-data.js` | `build-blog-data` (auto via `prebuild`) | Scan `public/blog/posts/` and emit `src/data/blogData.json` |
| `build-knowledge-base.js` | `build-knowledge-base` (auto via `prebuild`) | Derive `knowledge-base/posts.json` (machine-queryable post index) and re-inject the auto-catalog into `knowledge-base/KNOWLEDGE_BASE.md`. Consumed by agents — see repo-root `CLAUDE.md` |
| `optimize-images.js` | `optimize-images` | WebP + size-capped variants (idempotent) |
| `validate-mermaid.js` | `validate-mermaid` | Lint Mermaid fences against the renderer's v11 normalization |
| `generate-blog-pdf.js` | `generate-pdf` | Compile all posts into `output/blog-compilation.pdf` |
| `generate_blog_audio.py` | — | Render narrated MP3s per post (EN or ES). Normally called via `sync` |
| `upload_audio.py` | — | Idempotent S3-compatible upload of MP3s to Cloudflare R2 |
| `translate_ollama.py` | — | Ollama client used by the ES audio path |
| `md_to_speech.py` | — | Markdown → narration-ready text preprocessor |

---

## The `sync` orchestrator

```bash
npm run sync                  # full pipeline
npm run sync:fast             # skip Spanish audio (quick iteration on text)
npm run sync:check            # validate only; no side effects (used in CI)

# Pass-through flags via -- :
npm run sync -- --only <slug>
npm run sync -- --force
npm run sync -- --dry-run
```

### What each step does

| # | Step | Notes |
|---|---|---|
| 1 | Discover posts | Scans `public/blog/posts/**/*.md` → canonical `(category, slug)` set |
| 2 | Clean orphan audio | Deletes MP3/JSON/narration.json whose post no longer exists (rename or category move). In `--check` mode, fails instead of deleting |
| 3 | Validate Mermaid | Fail-fast before any expensive work; errors block, warnings are advisory |
| 4 | Optimize images | Idempotent; warnings don't block |
| 5 | English audio | `generate_blog_audio.py --lang en` (hash cache) |
| 6 | Spanish audio | Auto-starts `ollama serve` if needed; if Ollama isn't installed, **warns and skips** instead of failing. Hash cache applies |
| 7 | Upload to R2 | Pushes new/changed MP3s to the Cloudflare R2 bucket. Skipped with a warning if no credentials are configured. See § R2 setup below |
| 8 | Rebuild blog data and knowledge base | Writes `src/data/blogData.json` with absolute audio URLs (if `AUDIO_BASE_URL_*` set), then runs `build-knowledge-base.js` to regenerate `knowledge-base/posts.json` and re-inject the auto-catalog into `knowledge-base/KNOWLEDGE_BASE.md`. Both are kept in lockstep with the posts on disk |

Steps 1–3 run in `--check`. All eight run in the full pipeline.

### Exit codes

- `0` — success (or intentional skips)
- `1` — inconsistency detected (`--check`) or a required step failed

### Typical workflows

**New post, full treatment:**
```bash
# edit public/blog/posts/<category>/<slug>.md
npm run sync
git add -A && git commit -m "post: <title>"
```

**Iterating on text (skip slow ES translation):**
```bash
npm run sync:fast
```

**Renaming or moving a post:** just rename the `.md` file and run `npm run sync`.
Step 2 detects the old audio as orphan and deletes it; step 5/6 regenerates
under the new name. No manual cleanup.

**Surgical regeneration of a single post:**
```bash
npm run sync -- --only <slug> --force
```

---

## Blog data generation

`build-blog-data.js` runs automatically before every `npm run build` (via the
`prebuild` hook), and is also step 8 of `sync`. It parses YAML front-matter from
each `.md` under `public/blog/posts/<category>/`, merges in audio manifest data
from `public/blog/audio/manifest.json` and `public/blog/audio-es/manifest-es.json`,
and writes `src/data/blogData.json`. The React app reads only this JSON — it
never touches raw markdown at runtime.

## Knowledge base generation

`build-knowledge-base.js` runs right after `build-blog-data.js` (chained by both
`prebuild` and `sync` step 8). It reads `src/data/blogData.json` plus the YAML
augmentation block in `../knowledge-base/KNOWLEDGE_BASE.md`, and produces:

- **`knowledge-base/posts.json`** — machine-queryable index with per-post
  metadata (concepts, prereqs, teaches, tech, depth, audio availability),
  plus derived indexes: `concept_index`, `prereq_graph`, `tech_index`,
  `tag_index`, `category_index`. Meant for `jq`-style lookups by agents.
- **Auto-catalog inside `knowledge-base/KNOWLEDGE_BASE.md`** — the section
  between `<!-- AUTO-CATALOG:START -->` and `<!-- AUTO-CATALOG:END -->` is
  regenerated with one line per post (slug, title, excerpt, concepts, tech).
  Everything above the markers is human-curated (manifest, reading paths,
  cross-cutting views, augmentation YAML) and is left untouched.

Posts without an explicit augmentation entry get sensible defaults
(`concepts ← tags`, `depth ← word_count`, `prereqs/teaches/tech ← []`). To
enrich a post, edit the YAML under `## Augmentation` in `KNOWLEDGE_BASE.md`
and re-run `npm run build-knowledge-base`.

The repo-root `CLAUDE.md` tells Claude Code how to consume these files;
`KNOWLEDGE_BASE.md` alone is self-sufficient for Claude Projects (web) where
no filesystem tools are available.

---

## Audio narration pipeline

Posts can have optional narrated MP3s in English and Spanish, served from
`public/blog/audio/` and `public/blog/audio-es/`. The front-end's `AudioPlayer`
loads them via the generated manifests.

### Requirements

- **Python 3.10+** with:
  ```bash
  pip install -r front/scripts/requirements-audio.txt
  ```
  (`edge-tts` for Microsoft Edge TTS voices, `mutagen` for MP3 duration probing.)
- **Ollama** installed and on `PATH` — required **only** for Spanish, which
  translates the English narration with a local LLM. Default model:
  `gemma4:latest`. Install models with `ollama pull gemma4:latest`.
  If Ollama is not present, `npm run sync` skips Spanish audio with a warning
  instead of failing.
- **ffmpeg** is **not** required — `edge-tts` emits MP3 directly.

### How it works

Per post, `generate_blog_audio.py`:

1. Reads the markdown and runs it through `md_to_speech.markdown_to_narration()`,
   which strips code blocks, diagrams, math, tables, and frontmatter, replacing
   each with a short spoken placeholder ("Code example omitted — see the written post.").
2. Hashes the resulting narration (`sourceHash`). For Spanish, it also calls
   `translate_ollama.translate_narration()` and caches the Spanish text in a
   sibling `<slug>.narration.json` keyed by `sourceHash`, so re-runs skip the LLM
   unless the English source changed.
3. Synthesizes MP3 via `edge_tts` using the language's configured voice
   (`en-US-AndrewMultilingualNeural` / `es-CO-GonzaloNeural`).
4. Writes a sidecar `<slug>.json` with duration, byte size, hashes, and word count.
5. Rewrites the per-language manifest so `build-blog-data.js` can merge it.

The cache is content-addressable: if neither the narration source nor the voice
changed, the post is skipped. Edits to code blocks, diagrams, math, or front-matter
do **not** invalidate the audio cache — only changes to narratable prose do.

### Output layout

```
front/public/blog/
├── audio/                        # English
│   ├── manifest.json
│   └── <category>/<slug>.{mp3,json}
└── audio-es/                     # Spanish
    ├── manifest-es.json
    └── <category>/<slug>.{mp3,json,narration.json}
```

JSON sidecars and manifests are committed to the repo. MP3 bytes are hosted
on Cloudflare R2 (see § Audio hosting below) — CI never regenerates or uploads
audio; it only validates consistency via `sync:check`.

### Troubleshooting

**ES generation hangs forever.** Historical bug: when `ollama serve` wasn't
running, Python sat in TCP `SYN_SENT` retries. The current client
(`translate_ollama.py`) does a fast socket pre-check, retries with exponential
backoff, and respects `OLLAMA_CALL_TIMEOUT` / `OLLAMA_MAX_RETRIES` env vars.
Additionally, `sync.py` auto-starts `ollama serve` if it's not already running.

**"Ollama did not become ready in 30s."** Check `curl -sf http://localhost:11434/api/tags`.
Run `ollama list` to confirm the requested model is pulled
(`ollama pull gemma4:latest`).

**Long initial run.** Full Spanish regeneration of ~70 posts takes **hours**
on CPU-only or modest GPUs (≈80 s per 3.5k-char chunk on an 8B model × ~5 chunks
per post). The job is resumable — interrupting and restarting skips everything
already done via the hash cache.

**I only want to iterate on text and skip ES.** Use `npm run sync:fast`.

---

## Audio hosting: Cloudflare R2

MP3 audio files are the only asset that grows without bound as posts are added.
To keep the git repository small and stay under the 1 GB GitHub Pages deploy
cap, audio lives in a **Cloudflare R2** bucket (S3-compatible object storage
with zero egress charges) rather than in `public/`. The repo only commits
JSON sidecars and manifests — everything needed to _describe_ an audio track,
without the bytes.

The split:

- **In repo:** `public/blog/audio/<cat>/<slug>.json`, `manifest.json`,
  `.narration.json` (ES translation cache), and the markdown itself.
- **In R2:** `audio/<cat>/<slug>.mp3` and `audio-es/<cat>/<slug>.mp3`.

At build time, `build-blog-data.js` reads `AUDIO_BASE_URL_EN` /
`AUDIO_BASE_URL_ES` from the environment (or `front/.env.local`) and rewrites
the `audioUrl` entries in `blogData.json` to absolute CDN URLs. The
`AudioPlayer` component already passes absolute URLs through unchanged, so no
frontend changes are required.

**Local fallback.** If the env vars are unset, URLs stay relative
(`/blog/audio/...`) and the site serves MP3s from `public/` as before. This
keeps development friction-free before you set up R2 — you only need the
bucket once you're ready to deploy at scale.

### One-time setup

1. **Create a Cloudflare account** (free) and enable R2 from the dashboard
   sidebar. R2 requires adding a payment method, but the free tier covers 10 GB
   storage and unlimited egress — enough for thousands of posts.
2. **Create a bucket.** Pick any name (e.g. `juanlara-portfolio-audio`).
   Region: _Automatic_.
3. **Enable public access.** Bucket → _Settings_ → _Public access_ → _Allow
   public access_ → _Connect domain_ or copy the `pub-xxxxxxxxxxxxxxxx.r2.dev`
   URL. Your audio URLs will be `https://<public-host>/audio/...`.
4. **Create an API token.** Cloudflare dashboard → _R2_ → _Manage R2 API
   Tokens_ → _Create API Token_. Permissions: _Object Read & Write_. Scope:
   the bucket you just created. Save the access key ID and secret — you can't
   view the secret again after leaving the page.
5. **Fill in `front/.env.local`** (copy `front/.env.example` if you haven't
   already):
   ```ini
   R2_ACCOUNT_ID=<your cloudflare account id>
   R2_ACCESS_KEY_ID=<token access key id>
   R2_SECRET_ACCESS_KEY=<token secret>
   R2_BUCKET=<bucket name>
   AUDIO_BASE_URL_EN=https://pub-xxxxxxxxxxxxxxxx.r2.dev/audio
   AUDIO_BASE_URL_ES=https://pub-xxxxxxxxxxxxxxxx.r2.dev/audio-es
   ```
6. **Install Python deps** if you haven't:
   ```bash
   pip install -r front/scripts/requirements-audio.txt
   ```
7. **Run `npm run sync`.** Step 7 uploads every MP3 to the bucket, step 8
   rebuilds `blogData.json` with absolute CDN URLs. Re-runs only upload changed
   files (MD5 vs. remote ETag).

### Direct upload (without running the whole pipeline)

```bash
python scripts/upload_audio.py               # upload EN + ES
python scripts/upload_audio.py --lang en     # one language
python scripts/upload_audio.py --dry-run     # list what would upload
```

### Removing local MP3s from the repo (after you've verified R2 works)

Once the bucket is populated and the deployed site successfully loads audio
from R2, you can stop tracking MP3s in git to shrink the working tree and
future clones. This is a one-time operation:

```bash
# From the repo root, remove MP3s from the index (keep local files):
git rm --cached front/public/blog/audio/**/*.mp3
git rm --cached front/public/blog/audio-es/**/*.mp3

# Add a gitignore rule so they don't come back:
echo "public/blog/audio/**/*.mp3" >> front/.gitignore
echo "public/blog/audio-es/**/*.mp3" >> front/.gitignore

git commit -m "chore: stop tracking audio MP3s (now hosted on R2)"
```

JSON sidecars and manifests stay in the repo — they're tiny and
`build-blog-data.js` needs them. Cleaning the **git history** of old MP3 blobs
(`git filter-repo`) is a separate, destructive step best done only if repo
clone size becomes painful.

---

## Image optimization

```bash
npm run optimize-images                 # all directories (invoked by sync step 4)
node scripts/optimize-images.js --blog  # blog images only
```

Creates WebP versions and resized JPEG/PNG variants in place. Idempotent —
re-runs skip files that already have a counterpart. Originals are preserved
with a `-original` suffix and git-ignored (see `front/.gitignore`). CI runs
this only when new unoptimized images are detected.

---

## Mermaid validation

```bash
npm run validate-mermaid
```

Parses every fenced \`\`\`mermaid block in `public/blog/posts/**`, applies the
same normalization `PostRenderer` uses at runtime, and flags patterns that
Mermaid v11 rejects.

- **Errors** (exit 1): block deploy. Currently none emitted.
- **Warnings** (exit 0): advisory; review when possible.
- **Info**: stylistic notes.

> **Gotcha:** diagram fences must open with \`\`\`mermaid — never
> \`\`\`flowchart or \`\`\`timeline. The renderer keys off the fence language.

---

## PDF export

```bash
npm run generate-pdf
```

Renders every post into a single styled PDF at `output/blog-compilation.pdf`
using PDFKit. Cover page, TOC, per-category chapters, KaTeX via MathJax-rendered
SVG, and syntax-highlighted code blocks. Not part of the deploy pipeline — run
on demand when you want a printable snapshot.
