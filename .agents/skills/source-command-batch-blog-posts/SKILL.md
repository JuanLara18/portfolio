---
name: "source-command-batch-blog-posts"
description: "Migrated source command `batch-blog-posts`"
---

# source-command-batch-blog-posts

Use this skill when the user asks to run the migrated source command `batch-blog-posts`.

## Command Template

# batch-blog-posts

Create N blog posts end-to-end: headers, writing, audio, optimization, registration, commits. The argument is a list of post topics with brief angle descriptions.

This skill orchestrates the FULL pipeline. Sub-agents do the writing; the main agent handles headers, audio, build steps, and commits (because sub-agents crash on image-Read and overwrite shared files like manifest.json).

---

## Phase 0 — Parse Input and Plan

### 0.1 Load context

```
Read: C:\Users\LaraJ\.Codex\projects\C--Users-LaraJ-OneDrive-Documentos-Repositorios-Portfolio\memory\project_blog_style.md
```

Then read existing posts:

```bash
python -c "
import json
with open('src/data/blogData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f'Total posts: {len(data[\"posts\"])}')
for p in sorted(data['posts'], key=lambda x: x['date'], reverse=True)[:5]:
    print(p['slug'], '|', p['date'], '|', p['category'])
"
```

### 0.2 Build the post manifest

For each topic in the input, determine:

| Field | How to decide |
|-------|---------------|
| **title** | Descriptive, specific, matches the blog's editorial voice |
| **slug** | Kebab-case, descriptive, no collision with existing slugs |
| **category** | `field-notes` (practical ML/eng), `research` (paper deep-dive), `curiosities` (math/science narrative) |
| **date** | Most recent existing post date + 7×N days (one post per week) |
| **header metaphor** | One metaphorical hop from the topic (see find-blog-header skill for examples) |
| **search queries** | 2–3 concrete noun phrases to search Wikimedia Commons |
| **word count target** | field-notes: 5,000–7,500 / research: ~7,000 / curiosities: 4,500–5,500 |

Present the manifest as a table to the user for review before proceeding. Wait for confirmation.

### 0.3 Detect the correct Python binary

The Windows Store `python3` stub often breaks imports. Detect the right one:

```bash
python -c "import edge_tts; print('python')" 2>/dev/null || python3 -c "import edge_tts; print('python3')" 2>/dev/null || echo "MISSING: install edge-tts"
```

Store the result (usually `python` on this machine). Use it for ALL Python commands throughout this skill.

---

## Phase 1 — Headers (main context, NOT sub-agents)

### Why main context?

Sub-agents crash with `API Error: 400 Could not process image` when they `Read` downloaded JPEGs for visual evaluation. This is an unresolved platform limitation. The main agent handles all header work.

### 1.1 Search Wikimedia Commons

For each post, search using the metaphor queries from Phase 0. Use `WebFetch` against the MediaWiki API:

```
https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={keywords}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json
```

Prompt WebFetch to return: title, width, height, mime, url, author. Filter for:
- JPEG or PNG only (skip PDF, SVG, TIFF, DJVU, WebM)
- Landscape orientation (width > height)
- Width >= 2000px preferred

Run searches for **all posts in parallel** (multiple WebFetch calls in one message) to save time.

### 1.2 Select winners

For each post, pick the best image based on metadata:
- Landscape, high-res, photographic quality
- Subject matches the metaphor (not generic)
- Filename suggests editorial quality

**Skip visual verification** (the Read-on-image crash). Trust metadata and Wikimedia's curation quality. This is the key trade-off: we lose visual confirmation but gain reliability.

### 1.3 Download all headers

**Use Python urllib, NOT curl.** Curl gets HTTP 429 rate-limited by Wikimedia. Python urllib with 1.5s delays between downloads works reliably.

```bash
python -c "
import urllib.request, time

urls = {
    'descriptive-name-header.jpg': 'https://upload.wikimedia.org/wikipedia/commons/...',
    # ... one per post
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for name, url in urls.items():
    path = f'public/blog/headers/{name}'
    try:
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=30)
        data = resp.read()
        with open(path, 'wb') as f:
            f.write(data)
        print(f'OK {name}: {len(data)} bytes')
    except Exception as e:
        print(f'FAIL {name}: {e}')
    time.sleep(1.5)
"
```

**URL strategy:**
- Try the original (non-thumbnail) URL first — it bypasses thumb-generation rate limits
- If the original is too large (>8 MB), use a `2560px-` or `3840px-` thumbnail
- Wikimedia only serves thumbnails at bucket sizes: 1280, 1920, 2560, 3840 — other widths return 404

**Filename rules:**
- Use the metaphor subject, not the post topic: `whale-breaching-header.jpg` not `docker-header.jpg`
- Kebab-case, `.jpg`, `-header` suffix
- Check for collision: `ls public/blog/headers/ | grep {name}`

### 1.4 Verify downloads

```bash
for f in name1-header.jpg name2-header.jpg ...; do
    echo -n "$f: "
    file "public/blog/headers/$f" | sed 's/.*: //'
done
```

Every file must report `JPEG image data` or `PNG image data`. If any downloaded HTML (a 429/404 error page), delete and retry after waiting.

### 1.5 Record attributions

Append to `public/blog/headers/ATTRIBUTIONS.md`:

```markdown
- `name-header.jpg` — Photo by Author, [Wikimedia Commons](URL) (License)
```

### 1.6 Optimize images

```bash
npm run optimize-images
```

This creates the `.webp` variant the site's `<picture>` element prefers. Verify:

```bash
for f in name1 name2 ...; do ls public/blog/headers/${f}-header.webp; done
```

---

## Phase 2 — Write Posts (sub-agents, parallel)

### Why sub-agents?

Writing is the most context-intensive step. Each post requires 30–40 tool calls (research, reading style guide, composing 5,000+ words). Sub-agents isolate this context and run in parallel.

### 2.1 Launch N sub-agents in a SINGLE message

**Critical:** launch all N `Agent` calls in one message block so they run in true parallel. Each agent gets a self-contained brief.

### 2.2 Sub-agent brief template

Each sub-agent prompt MUST include:

```
You are an expert technical writer for the portfolio blog at
`c:\Users\LaraJ\OneDrive\Documentos\Repositorios\Portfolio\front\`.
Write ONE complete blog post. Your working directory is that front folder.

## Required reading (do this first, in order)
1. `C:\Users\LaraJ\.Codex\projects\C--Users-LaraJ-OneDrive-Documentos-Repositorios-Portfolio\memory\project_blog_style.md` — full style guide
2. Skim 1–2 recent {category} posts in `public/blog/posts/{category}/`
3. `src/data/blogData.json` for date/slug collision check

## Topic and angle
{DETAILED topic description with the distinctive angle, what to cover,
what NOT to cover, and how it connects to the blog's existing content}

## Output
- File: `public/blog/posts/{category}/{slug}.md`
- Category: {category}
- Slug: {slug}
- Word count target: {target}
- Reading time: ~{minutes} min
- headerImage: `/blog/headers/{header-filename}`
- Date: {exact date, pre-computed by orchestrator}
- Tags: {list of 8-12 tags — verified against canonical names in project_blog_style.md Tag Taxonomy section}

## Research mandate (before writing)
Run WebSearch + WebFetch 4–6 times. Hit: {specific sources to check}.
Today is {currentDate}.

## Structure outline
{numbered list of ## sections, topic-specific}

## Requirements (non-negotiable)
- 8-12 tags per post, using exact canonical names from project_blog_style.md. No abbreviations ("Hugging Face" not "HF"). Don't tag implementation language unless the post IS about it. Mix broad + specific tags. Check blogData.json for existing tag names before creating new ones — singleton tags fragment the Knowledge Graph.
- 2–4 Mermaid diagrams, at least 2 different types
- EVERY fence MUST start with ` ```mermaid `, NEVER ` ```flowchart `
- No special chars in Mermaid labels: no <, >, —, |, parentheses in quadrant labels
- Python code examples (production quality)
- Prerequisites / gotchas / testing sections per style guide
- Going Deeper with 3+ books, 3+ resources, 2+ VERIFIED videos, 2+ papers, 3–5 questions
- NEVER invent arxiv IDs, paper titles, or YouTube video IDs

## DO NOT
- Do not register in `src/data/blogData.json` — the orchestrator handles this
- Do not run optimize-images or build scripts
- Do not create headers or modify ATTRIBUTIONS.md
- Do not make git commits
- Do not add emoji

## Report back
Output ONLY: (1) file path, (2) word count, (3) one-sentence angle summary.
Under 80 words.
```

**Key detail:** Pre-compute the exact date for each post in the orchestrator. Do NOT let sub-agents compute dates independently (they'll collide or drift). Space posts 7 days apart from the most recent existing post.

### 2.3 Wait for all sub-agents

All N agents will complete and send notifications. Do NOT proceed to Phase 3 until all have finished. If any fail, relaunch with the same brief.

### 2.4 Verify all posts exist

```bash
for slug in slug1 slug2 ...; do
    path=$(find public/blog/posts -name "${slug}.md" 2>/dev/null)
    if [ -n "$path" ]; then
        wc=$(wc -w < "$path")
        echo "OK $slug: $wc words"
    else
        echo "MISSING $slug"
    fi
done
```

---

## Phase 3 — Register Posts

Register all N posts in `blogData.json` with a single Python script. This MUST run in the main context (not sub-agents) to avoid race conditions.

```bash
python -c "
import json, re, os

posts_info = [
    ('category', 'slug'),
    # ... one tuple per post
]

with open('src/data/blogData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_slugs = {p['slug'] for p in data['posts']}
added = 0

for category, slug in posts_info:
    if slug in existing_slugs:
        print(f'SKIP (exists): {slug}')
        continue

    md_path = f'public/blog/posts/{category}/{slug}.md'
    if not os.path.exists(md_path):
        print(f'MISSING: {md_path}')
        continue

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not fm_match:
        print(f'NO FRONTMATTER: {slug}')
        continue

    fm_text = fm_match.group(1)
    body = content[fm_match.end():].strip()

    def get_fm(key, text=fm_text):
        m = re.search(rf'^{key}:\s*[\"\\']?(.+?)[\"\\']?\s*$', text, re.MULTILINE)
        return m.group(1).strip('\"\\' ') if m else None

    title = get_fm('title')
    date = get_fm('date')
    excerpt = get_fm('excerpt')
    header = get_fm('headerImage')
    slug_fm = get_fm('slug') or slug

    tags_match = re.search(r'tags:\s*\[(.*?)\]', fm_text)
    tags = [t.strip().strip('\"\\' ') for t in tags_match.group(1).split(',')] if tags_match else []

    rt = get_fm('readingTimeMinutes')
    reading_time = int(rt) if rt and rt.isdigit() else 25

    new_post = {
        'title': title, 'date': date, 'excerpt': excerpt, 'tags': tags,
        'headerImage': header, 'readingTimeMinutes': reading_time,
        'slug': slug_fm, 'estimatedWordCount': len(body.split()),
        'content': body, 'category': category, 'readingTime': reading_time
    }

    data['posts'].insert(0, new_post)
    added += 1
    print(f'ADDED: {slug} | {date} | {len(body.split())} words')

data['posts'].sort(key=lambda p: p.get('date', ''), reverse=True)

with open('src/data/blogData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Done. Added {added}. Total: {len(data[\"posts\"])}')
"
```

---

## Phase 4 — Audio

### 4.1 Generate English audio (foreground)

Run a FULL pass (not `--only`) so the manifest rebuilds correctly. Individual `--only` runs overwrite the manifest with a single entry each time.

```bash
python scripts/generate_blog_audio.py --lang en --concurrency 4 -v
```

Wait for completion (takes ~2–5 minutes for 8 posts). Verify:

```bash
python -c "
import json
m = json.load(open('public/blog/audio/manifest.json', encoding='utf-8'))
print(f'Total in manifest: {len(m[\"posts\"])}')
# check each new slug exists
"
```

### 4.2 Start Spanish audio in background

```bash
python scripts/generate_blog_audio.py --lang es --concurrency 3 -v
```

Run this with `run_in_background: true`. It needs Ollama for translation and takes much longer. The user will be notified when it finishes.

### 4.3 Rebuild blog data and knowledge base

```bash
npm run build-blog-data && npm run build-knowledge-base && npm run build-sitemap && npm run build-rss
```

Verify audio matching:

```
audio matched: EN {expected}/N, ES ...
```

EN should match 100% of posts. ES will catch up when the background job finishes.

`build-knowledge-base` regenerates `knowledge-base/posts.json` and re-injects the catalog into `knowledge-base/KNOWLEDGE_BASE.md`. New posts appear automatically with defaults (concepts ← tags, depth ← word count). If you want to enrich any of the new posts with explicit `concepts` / `prereqs` / `teaches` / `tech`, add entries to the YAML block under `## Augmentation` in `knowledge-base/KNOWLEDGE_BASE.md` and re-run `npm run build-knowledge-base`.

### 4.4 Upload audio to Cloudflare R2

**This step is mandatory.** Audio files must be uploaded to R2 so the CDN serves them in production.

```bash
python scripts/upload_audio.py
```

The script is idempotent — it skips files already present with the same size. If it fails with an R2 `InternalError`, just retry. Verify with a dry run:

```bash
python scripts/upload_audio.py --dry-run 2>&1 | tail -5
```

Expected output after a successful upload: `OK: 0 uploaded, N skipped` (all skipped = all current).

---

## Phase 5 — Verification

### 5.1 Check everything

```bash
python -c "
import json

with open('src/data/blogData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_slugs = [...]  # list of new slugs

issues = []
for p in data['posts']:
    if p['slug'] in new_slugs:
        # Check header exists
        import os
        header_path = 'public' + p.get('headerImage', '')
        if not os.path.exists(header_path):
            issues.append(f'{p[\"slug\"]}: header missing at {header_path}')

        # Check WebP exists
        webp = header_path.rsplit('.', 1)[0] + '.webp'
        if not os.path.exists(webp):
            issues.append(f'{p[\"slug\"]}: WebP variant missing')

        # Check audio exists
        audio_path = f'public/blog/audio/{p[\"category\"]}/{p[\"slug\"]}.mp3'
        if not os.path.exists(audio_path):
            issues.append(f'{p[\"slug\"]}: EN audio missing')

        # Check word count
        wc = p.get('estimatedWordCount', 0)
        if wc < 4000:
            issues.append(f'{p[\"slug\"]}: word count too low ({wc})')

        # Check no duplicate dates
        dates = [x['date'] for x in data['posts'] if x['slug'] in new_slugs]
        if len(dates) != len(set(dates)):
            issues.append('Duplicate dates detected among new posts')

        print(f'OK {p[\"slug\"]}: {p[\"date\"]} | {wc} words | {p.get(\"headerImage\",\"?\")}')

if issues:
    print(f'\nISSUES ({len(issues)}):')
    for i in issues:
        print(f'  - {i}')
else:
    print('\nAll checks passed.')
"
```

### 5.2 Fix any issues

If any check fails, fix it before proceeding to commits. Common fixes:
- Missing WebP: rerun `npm run optimize-images`
- Missing audio: rerun `python scripts/generate_blog_audio.py --lang en --only {slug}`
  then a full `--lang en` run to rebuild manifest
- Duplicate dates: edit the frontmatter in the markdown file, then `npm run build-blog-data`

---

## Phase 6 — Commits

Make one commit per post, each including that post's markdown, header image (+ WebP + original), and audio files. Shared files (blogData.json, manifest, sitemap, rss) go in a final commit.

### 6.1 Per-post commits

For each post (in date order, oldest first):

```bash
git add \
    "public/blog/posts/{category}/{slug}.md" \
    "public/blog/headers/{header-name}-header.jpg" \
    "public/blog/headers/{header-name}-header.webp" \
    "public/blog/audio/{category}/{slug}.mp3" \
    "public/blog/audio/{category}/{slug}.json"

# Note: *-original.jpg files are gitignored — do not try to add them

git commit -m "feat(blog): add {short title} post"
```

### 6.2 Shared files commit

Includes blog data, the regenerated knowledge base (`posts.json` + the auto-catalog block injected back into `KNOWLEDGE_BASE.md`), sitemap, RSS, and the audio manifest.

```bash
git add \
    public/blog/headers/ATTRIBUTIONS.md \
    public/blog/audio/manifest.json \
    public/rss.xml \
    public/sitemap.xml \
    src/data/blogData.json \
    ../knowledge-base/posts.json \
    ../knowledge-base/KNOWLEDGE_BASE.md

git commit -m "chore: rebuild blog data, knowledge base, sitemap, RSS, audio manifest"
```

Note: paths are relative to `front/` since that's the working directory for the batch. `knowledge-base/` lives at the repo root, hence the `../` prefix.

### 6.3 Verify clean tree

```bash
git status --short
git log --oneline -{N+1}
```

Working tree should be clean (except possibly ES audio files if the background job is still running).

---

## Known Pitfalls (hard-won from production runs)

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| Sub-agents for headers | Crash with "Could not process image" on Read of JPEG | Do headers in main context |
| `curl` to Wikimedia | HTTP 429 rate limiting after 2–3 requests | Use Python `urllib` with 1.5s delays |
| `python3` on Windows | Points to Store stub, missing packages | Detect correct binary in Phase 0 |
| `--only` flag for audio | Each run overwrites `manifest.json` with single entry | Always do a full run at the end |
| Sub-agents touching blogData.json | Race conditions, duplicate entries | Explicitly forbid in brief; register in main context |
| Sub-agents making commits | Uncontrolled commit structure | Explicitly forbid in brief |
| Wikimedia thumbnail widths | Only 1280/1920/2560/3840 exist; others return 404 | Use original URL or known bucket sizes |
| `-original.jpg` gitignored | `git add` fails for `*-original.jpg` files | Skip originals in commits — they're gitignored |
| Forgetting R2 upload | Audio works locally but not in production | Always run `python scripts/upload_audio.py` after audio generation |
| R2 InternalError | Transient R2 failures on large batches | Just retry — the script is idempotent |
| Duplicate dates | Two sub-agents pick the same date independently | Pre-compute all dates in orchestrator |
| Working directory confusion | `front/` prefix when already inside `front/` | Verify with `pwd` at start |
| CRLF timestamp diffs | Build scripts write files with minor timestamp changes | Discard with `git checkout --` if diff is only timestamps |

---

## Timing Expectations

For a batch of 8 posts:
- Phase 1 (headers): ~5 minutes (search + download + optimize)
- Phase 2 (writing): ~8–10 minutes (all in parallel via sub-agents)
- Phase 3 (register): ~30 seconds
- Phase 4 (EN audio): ~3–5 minutes
- Phase 5 (verification): ~30 seconds
- Phase 6 (commits): ~2 minutes
- **Total: ~20–25 minutes**

ES audio runs in background and takes ~30–60 minutes (Ollama translation + TTS).
