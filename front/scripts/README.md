# Build & Tooling Scripts

Build-time utilities for the portfolio: blog data generation, image optimization,
diagram validation, PDF export, and narrated audio generation. Most are wired into
npm scripts in `front/package.json`; a few are invoked directly.

---

## Quick reference

| Script | npm alias | Purpose |
|---|---|---|
| `build-blog-data.js` | `build-blog-data` (auto via `prebuild`) | Scan `public/blog/posts/` and emit `src/data/blogData.json` with metadata + audio manifest refs |
| `optimize-images.js` | `optimize-images` | Produce WebP and size-capped JPEG/PNG variants under `public/images/` and `public/blog/` |
| `validate-mermaid.js` | `validate-mermaid` | Lint Mermaid fenced blocks in every post against the renderer's v11 normalization |
| `generate-blog-pdf.js` | `generate-pdf` | Compile all posts into a single styled PDF (`output/blog-compilation.pdf`) |
| `generate_blog_audio.py` | `generate-audio` (EN only) | Render narrated MP3s per post in English or Spanish |
| `generate_audio.sh` / `generate_audio.ps1` | — | One-shot wrapper: ensure Ollama is running, then run EN + ES |
| `translate_ollama.py` | — | Ollama client used by the ES audio path (not invoked directly) |
| `md_to_speech.py` | — | Markdown → narration-ready text preprocessor (imported by `generate_blog_audio.py`) |

---

## Blog data generation

`build-blog-data.js` runs automatically before every `npm run build` (via the
`prebuild` hook) and whenever you want a fresh manifest in dev:

```bash
npm run build-blog-data
```

It parses YAML front-matter from each `.md` under `public/blog/posts/<category>/`,
merges in audio manifest data from `public/blog/audio/manifest.json` and
`public/blog/audio-es/manifest-es.json` when present, and writes
`src/data/blogData.json`. The React app reads only this JSON — it never touches
raw markdown at runtime.

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
- **ffmpeg** is **not** required — `edge-tts` emits MP3 directly.

### One-shot generation (recommended)

Use the wrapper script. It pings Ollama, launches `ollama serve` in the
background if needed, waits up to 30 s for readiness, then runs both
languages in sequence.

```bash
# Bash / WSL / macOS / git-bash
./front/scripts/generate_audio.sh

# Windows PowerShell
.\front\scripts\generate_audio.ps1
```

Both accept pass-through flags that forward to `generate_blog_audio.py`:

```bash
./front/scripts/generate_audio.sh --only attention-is-all-you-need
./front/scripts/generate_audio.sh --force
./front/scripts/generate_audio.sh --limit 5
```

### Direct invocation

If you only need one language or want finer control:

```bash
cd front
python -u scripts/generate_blog_audio.py --lang en
python -u scripts/generate_blog_audio.py --lang es --translate-model gemma4:latest
```

Flags: `--only <slug>`, `--force`, `--limit N`, `--dry-run`, `--verbose`.

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
changed, the post is skipped. Safe to re-run as often as you like.

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

All of the above is committed to the repo — audio is **not** regenerated on
deploy (see commit `c743647`).

### Troubleshooting

**ES generation hangs forever.** Historically this happened when `ollama serve`
wasn't running and Python sat in TCP `SYN_SENT` retries. The current client
(`translate_ollama.py`) does a fast socket pre-check, retries with exponential
backoff, and respects `OLLAMA_CALL_TIMEOUT` / `OLLAMA_MAX_RETRIES` env vars.
If it still stalls, verify `curl -sf http://localhost:11434/api/tags` responds.

**"Cannot reach Ollama" after several retries.** Either Ollama isn't installed,
the binary isn't on `PATH`, or the model you requested isn't pulled. Run
`ollama list` and `ollama pull gemma4:latest`.

**Long initial run.** Full regeneration of ~70 posts in Spanish takes **hours**
on CPU-only or modest GPUs (≈80 s per 3.5k-char chunk on an 8B model × ~5 chunks
per post). The job is resumable — the hash cache means interrupting and restarting
skips everything already done.

**PowerShell execution policy blocks the wrapper.** Run it once with
`powershell -ExecutionPolicy Bypass -File .\front\scripts\generate_audio.ps1`
or set the policy permanently for your user.

---

## Image optimization

```bash
npm run optimize-images                 # all directories
node scripts/optimize-images.js --blog  # blog images only
```

Creates WebP versions and resized JPEG/PNG variants in place. Idempotent —
re-runs skip files that already have a `-optimized` counterpart. Originals are
preserved with a `-original` suffix and git-ignored (see `front/.gitignore`).
CI runs this only when new unoptimized images are detected.

---

## Mermaid validation

```bash
npm run validate-mermaid
```

Parses every fenced \`\`\`mermaid block in `public/blog/posts/**`, applies the
same normalization `PostRenderer` uses at runtime, and flags patterns that
Mermaid v11 rejects. Use before pushing a post that contains diagrams.

> **Gotcha:** diagram fences must open with \`\`\`mermaid — never
> \`\`\`flowchart or \`\`\`timeline. The renderer keys off the fence language.

---

## PDF export

```bash
npm run generate-pdf
```

Renders every post into a single styled PDF at `output/blog-compilation.pdf`
using PDFKit. Cover page, TOC, per-category chapters, inline KaTeX via
MathJax-rendered SVG, and syntax-highlighted code blocks. Not part of the
deploy pipeline — run on demand when you want a printable snapshot.
