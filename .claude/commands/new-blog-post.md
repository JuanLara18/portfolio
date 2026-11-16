# new-blog-post

Write a new blog post for the portfolio. The argument is the post topic and any additional instructions.

## Step 1 — Load Memory and Style Guide

Read the blog style guide memory before doing anything else:

```
Read the `project_blog_style.md` file in this project's Claude Code memory (`~/.claude/projects/<project>/memory/`; if it is not there, `docs/authoring.md`).
```

This file contains the complete writing conventions: frontmatter template, section structure, tone, Going Deeper format, category-specific rules, and word count targets. Every decision in this skill depends on it.

## Step 2 — Understand the Existing Blog

Read `front/src/data/blogData.json` to see all existing post slugs, dates, and categories:

```bash
python3 -c "
import json
with open('front/src/data/blogData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f'Total posts: {len(data[\"posts\"])}')
for p in data['posts']:
    print(p['slug'], '|', p['date'], '|', p['category'])
"
```

Goals:
- Know what's already covered so you don't repeat it
- Find the most recent post date to schedule the new post after it
- Understand which category fits (field-notes / research / curiosities)

For a lighter-weight view of what the blog already covers by concept/tech, you can also query `knowledge-base/posts.json`:

```bash
# Does the blog already cover this concept?
jq '.concept_index' knowledge-base/posts.json | grep -i "<concept keyword>"

# What posts already touch this tech?
jq '.tech_index["<tech>"]' knowledge-base/posts.json
```

If the topic might overlap with existing content, check headings:

```bash
grep "^## \|^# " front/public/blog/posts/{category}/FILENAME.md
```

## Step 3 — Research the Topic

Before writing a single word, determine today's date from the `currentDate` context in your system prompt. Then research the current state of the topic relative to that date. Posts must reflect the most recent realities available — do not hardcode years like "2024" or "2025" into queries.

**First:** Identify the current year from `currentDate`. Use it as the reference point for "recent" and "latest."

Use **WebSearch** to find:
- Current tool versions and their key features
- Recent papers, benchmarks, or industry shifts (from the last 12–18 months relative to today)
- What's genuinely new vs what's been stable for years
- Real-world adoption patterns and honest trade-offs

Run **3–5 searches** minimum. Use **WebFetch** on the most relevant pages to extract:
- Exact current tool versions
- Real arxiv paper IDs and author names (never invent)
- Specific benchmark numbers
- Honest limitations and failure modes

Search query patterns — replace `{YEAR}` and `{PREV_YEAR}` with the actual current and previous years from `currentDate`:
- `"[topic] {YEAR} best practices production"`
- `"[tool] version [X] new features {PREV_YEAR} {YEAR}"`
- `"[concept] paper arxiv {PREV_YEAR} {YEAR}"`
- `"[topic] benchmark comparison {YEAR}"`
- `"[topic] latest {YEAR}"` for general currency checks

### Practical completeness research (mandatory for tool/ML posts)

In addition to the general research above, run **2–3 targeted searches** for:

- `"[tool/model] common errors gotchas {YEAR}"` — known bugs, surprising behaviors, version incompatibilities
- `"[tool/model] free GPU Colab Kaggle {YEAR}"` — free and low-cost options for readers with limited hardware
- `"[tool/model] install download requirements setup"` — exact prerequisites, license terms, access requirements

This research feeds the **Prerequisites**, **Where to Run**, and **Known Gotchas** sections described below.

## Step 4 — Plan the Post Structure

**Category and word count targets:**
- `field-notes` — practical ML/software engineering, 15–25% code, 4,800–7,500 words, 20–30 min read
- `research` — paper deep-dives, research-heavy Going Deeper, ~28 min read, less code
- `curiosities` — math/science narrative, heavy derivations, 4,500–5,500 words

**Date:** most recent post date + 7 days minimum.

**Slug:** kebab-case, descriptive.

**Section outline** — write out `##` headings before starting. A good Field Notes post has:
1. Opening hook (first 100 words justify reading)
2. 6–10 `##` sections with progressive complexity
3. Python code examples, production-quality
4. **2–4 diagrams**, planned with the `blog-diagrams` skill: one per visual moment, at least 2 types, and an `architecture-beta` whenever the post is about a production system
5. Comparison tables
6. `## Going Deeper` as the final section

### Reader Journey Check (mandatory)

Before writing, walk through the post as a reader who knows the general domain but has never used this specific tool/technique. Ask:

1. **"Can they start?"** — Does the post explain what to install, what to download, what license or access is needed, and what hardware is required? If the reader can't begin the first code example without googling something external, you're missing a prerequisites section.

2. **"Can they follow?"** — Does every code block have enough context that someone can run it? Are imports shown? Are variable names from previous blocks reused consistently? Is the execution environment clear (local machine, Colab, specific OS)?

3. **"Can they finish?"** — If the post teaches how to build/train/configure something, does it show how to verify the result works? Can the reader test, run, or deploy the output? A post that ends at "save the model" without "load and test the model" is incomplete.

4. **"Can they afford it?"** — For ML/infrastructure posts: does the post acknowledge that readers have different hardware budgets? Does it mention free tiers, cheap alternatives, and minimum viable hardware?

If any answer is "no," add the missing section to your outline.

### Standard sections for tool/ML posts

When the post involves running code, training models, or configuring tools, these sections are **required** unless genuinely irrelevant:

**Prerequisites & Environment** — What the reader needs before starting: language runtime version, GPU/VRAM requirements, package installations, model/data downloads, license or access requirements. Include the exact install commands. Mention if something auto-downloads on first run and how large it is.

**Where to Run** — Explicitly state whether the workflow runs locally, in the cloud, or both. For GPU-dependent workflows, include:
- Free options (Google Colab Free, Kaggle Notebooks — with GPU type and VRAM)
- Low-cost cloud (RunPod, Vast.ai, Lambda Labs, Colab Pro — with approximate $/hour)
- Local hardware tiers (which consumer GPUs can handle it, minimum VRAM)
- A clear recommendation for where to start (usually: "start free, move to local/cloud once stable")

**Testing / Verification** — How to confirm the output works. For trained models: load the saved artifact and run inference. For pipelines: verify end-to-end with sample data. For configurations: a smoke test command. The reader should never be left wondering "did it work?"

**Known Gotchas** — Bugs, version incompatibilities, surprising behaviors, confusing error messages, and their fixes. Research these during Step 3. Even 3–4 bullet points save readers hours of debugging. Place this before or within "Honest Limitations."

## Step 5 — Write the Post

Create the file at:
```
front/public/blog/posts/{category}/{slug}.md
```

### Frontmatter

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
excerpt: "1-3 sentence compelling summary. Should make someone who sees this in a list want to click."
tags: ["Tag1", "Tag2", ..., "Tag10"]   # 8-12 tags — see Tag Taxonomy rules in project_blog_style.md
headerImage: "/blog/headers/{image}"
readingTimeMinutes: XX
slug: post-slug-kebab-case
estimatedWordCount: XXXX
---
```

**Tag selection — critical for the Knowledge Graph:**

Before finalizing tags, verify each one against the canonical tag list in `project_blog_style.md` (Tag Taxonomy Rules section). Then run:

```bash
python -c "
import json
with open('front/src/data/blogData.json', encoding='utf-8') as f:
    d = json.load(f)
all_tags = {}
for p in d['posts']:
    for t in p.get('tags', []):
        all_tags[t] = all_tags.get(t, 0) + 1
# Check your proposed tags against existing ones
proposed = ['YourTag1', 'YourTag2']  # replace with actual tags
for t in proposed:
    if t in all_tags:
        print(f'  OK: {t} ({all_tags[t]} existing posts)')
    else:
        # Check for near-duplicates
        similar = [k for k in all_tags if t.lower() in k.lower() or k.lower() in t.lower()]
        if similar:
            print(f'  NEW but similar to {similar}: {t}')
        else:
            print(f'  NEW (singleton risk): {t}')
"
```

Rules: 8-12 tags per post. Mix broad ("Deep Learning") + specific ("Attention Mechanism"). Don't tag implementation language unless the post IS about it. No abbreviations. A singleton tag (only 1 post) adds noise to the graph — reconsider or plan to use it in future posts.

**Header image — always find a fresh one, never reuse.**

Invoke the `/find-blog-header` skill as a sub-step. Pass it the post title, excerpt, slug, and category. It will:

1. Generate 4–6 metaphor candidates (one hop away from the literal topic, never the direct logo).
2. Search Unsplash / Pexels for each.
3. Download the top 2–3 candidates as thumbnails and visually evaluate them.
4. Download the winner at 2400px wide into `front/public/blog/headers/` with a descriptive filename.
5. Record attribution in `ATTRIBUTIONS.md`.
6. Run `npm run optimize-images` to generate the WebP variant.
7. Return the `headerImage` path to paste into the frontmatter.

Do NOT pick from an existing header file. Every post gets its own image. The blog's grid view depends on visual distinctness across posts, and reusing a header makes two posts look like the same one.

Before finalizing, verify no other post already uses the chosen filename:

```bash
python3 -c "
import json
with open('front/src/data/blogData.json', encoding='utf-8') as f:
    d = json.load(f)
used = {p['headerImage'] for p in d['posts']}
target = '/blog/headers/{candidate}-header.jpg'
print('COLLISION' if target in used else 'ok', target)
"
```

If the target collides, go back to `/find-blog-header` Step 5 and pick a different filename.

### Writing conventions

**Links to other posts:** always `[text](/blog/<slug>)` — slug only, site-relative, optionally `/blog/<slug>#section`. The app resolves the category and `/blog/<slug>` is a real redirecting route. Never the absolute site URL, never `https://juanlara18.github.io/portfolio/#/blog/...`, never `./<slug>`, never `/blog/<category>/<slug>`. Take slugs from `knowledge-base/posts.json`; `npm run validate-links` (run in Step 6 and in every build) fails on an unknown slug or any other form, and `npm run validate-links -- --fix` rewrites the mechanical cases.

**Tone:** Conversational but technically rigorous. Direct address ("Let's...", "Imagine...", "You've seen..."). Mix short punchy sentences with longer explanatory ones.

**Code blocks:**
- Python only (unless the post is specifically about SQL or another language)
- Production-quality — real imports, realistic variable names, comments on non-obvious lines only
- One concept per block — don't dump 100+ lines in one block
- Comments explain *why*, never narrate *what* the code does
- **Every code block must be runnable in context** — if it depends on variables or imports from a previous block, either repeat the import or note "continuing from Step N"

**Practical completeness in code:**
- The first code block a reader encounters must include all imports and setup needed to run it
- If a function or variable is defined in block A and used in block B, make sure block B either re-imports or clearly states the dependency
- Show realistic output where helpful (as comments or as prose after the block)
- When showing how to build something, always show how to use the built thing afterward

---

### Diagrams — use the `blog-diagrams` skill

Diagrams are planned, written and checked with the **`blog-diagrams` skill** (`.claude/skills/blog-diagrams/`). Invoke it once the outline exists. It holds the visual grammar, the type picker, syntax verified against the site's Mermaid for every type, and the render-and-look loop. Do not draft diagrams from memory: most past problems (overflowing text, colours outside the brand, timelines too small to read) came from that.

The minimum, which the skill expands:

- Every block opens with ` ```mermaid `. Never ` ```flowchart ` or any other type as the fence.
- No colours in posts: `:::accent` / `:::muted` only.
- Math inside labels is LaTeX (`$$…$$`).
- Before finishing: `cd front && npm run diagrams:lint -- <slug>` (no errors) and `npm run diagrams:render -- <slug>`, then **Read the PNGs** in `front/.diagram-preview/` and fix what looks wrong.

---

**Tables** — use for:
- Feature comparisons (Tool A vs B vs C)
- When-to-use summaries
- Configuration reference
- Before/After contrasts
- **Hardware/cost requirements** — always use a table for hardware tiers and pricing

**LaTeX math:**
- Inline: `$...$`
- Display block: `$$...$$`
- Use for formulas, not as decoration

---

### Going Deeper section format (mandatory, always last)

```markdown
## Going Deeper

**Books:**
- Author(s). (Year). *Title.* Publisher.
  - 1-2 sentence annotation explaining relevance to this specific post

**Online Resources:**
- [Resource Name](URL) — Brief description of what you'll find there

**Videos:**
- [Video Title](URL) by Creator/Channel — What it covers and why it's worth watching

**Academic Papers:**
- Author(s). (Year). ["Title."](URL) *Venue*, details.
  - Annotation on why this paper matters for the topic

**Questions to Explore:**
- 3-5 open-ended, intellectually provocative questions that extend the topic
- Should be questions the post itself doesn't answer
- Philosophical, architectural, or empirical — mix the types
```

**Minimum:** 3–4 books, 3–4 online resources, 2–3 videos, 2–3 papers.

**CRITICAL — Videos:** Only use YouTube URLs you have verified exist. Do not invent video IDs.
1. Search `site:youtube.com "[topic]" OR "[author]"` with WebSearch
2. Look for YouTube links in documentation pages or conference pages via WebFetch
3. If a URL isn't confirmed, omit the video — 2 real videos is better than 3 invented ones

## Step 6 — Regenerate blog data and check links

`front/src/data/blogData.json` is generated from the markdown files — never edit it by hand. It holds metadata only (the post body is fetched from the `.md` at runtime), so there is nothing to paste in. From `front/`:

```bash
npm run build-blog-data   # picks up the new post's frontmatter
npm run validate-links    # every /blog/<slug> link resolves and is in canonical form
```

If `validate-links` fails, fix the reported links (or run `npm run validate-links -- --fix` for the mechanical ones) before going on. The same two commands re-sync after editing an existing post.

## Step 7 — Audio, R2 Upload, and Blog Data Refresh

A new post needs three things to appear on the live site with narration:

1. An MP3 file at `front/public/blog/audio/{category}/{slug}.mp3` (plus the `.json` sidecar + `.narration.json`) so the audio player has something to play.
2. The R2 upload, so the MP3 is served from the CDN instead of the repo.
3. A fresh `front/src/data/blogData.json` with the post's `audio.en.url` pointing at the CDN URL (not the local `/blog/audio/...` path).

The `sync.py` orchestrator runs the whole pipeline. For a new post, **use the fast variant** — it runs English audio generation, R2 upload, and blogData rebuild, skipping the (very slow) Spanish generation which is handled separately in a batch run:

```bash
cd front
npm run sync:fast
```

What this does under the hood, in order:
1. Discovers posts from `public/blog/posts/**/*.md`
2. Deletes orphan audio files (posts you removed)
3. Validates Mermaid diagrams
4. Optimizes any new images
5. Generates English audio for new/changed posts via `scripts/generate_blog_audio.py --lang en`
6. **Skips** Spanish generation (that's `npm run sync` without `:fast`)
7. Uploads all audio to R2 via `scripts/upload_audio.py` (idempotent — only new/changed MP3s transfer)
8. Rebuilds `src/data/blogData.json` via `scripts/build-blog-data.js`, rewriting every `audio.en.url` / `audio.es.url` to the CDN domain read from `AUDIO_BASE_URL_EN` / `AUDIO_BASE_URL_ES` in `front/.env.local`

**Requirements for this to work:**
- `front/.env.local` must contain `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `AUDIO_BASE_URL_EN`, `AUDIO_BASE_URL_ES` (see project root `tokens.md` for the values — file is gitignored).
- Edge-TTS must be available (`pip install edge-tts`) for audio generation.

**Verification after `sync:fast`:**

```bash
cd front && node -e "
const d=require('./src/data/blogData.json');
const p=d.posts.find(x=>x.slug==='YOUR-SLUG');
console.log('audio.en.url:', p?.audio?.en?.url);
"
```

Expect a full `https://pub-...r2.dev/audio/{category}/{slug}.mp3` URL. If it's `undefined` or a local `/blog/audio/...` path, something went wrong — check `front/public/blog/audio/manifest.json` for the sidecar entry and re-run `node scripts/build-blog-data.js`.

**Spanish audio** is not generated here because each ES post takes ~20–50 min via a local Ollama translation pipeline. ES is produced in big batches with `python scripts/generate_blog_audio.py --lang es --verbose` — usually left running overnight. The player auto-detects per-post whether `audio.es` exists; posts without it simply don't show the language toggle, so shipping EN first is safe.

**Alternatives** (only if `sync:fast` is unavailable or fails halfway):

```bash
# Run pieces individually from front/
python scripts/generate_blog_audio.py --lang en --only YOUR-SLUG
python scripts/upload_audio.py
node scripts/build-blog-data.js
```

**Knowledge base** — `sync:fast` already regenerates `knowledge-base/posts.json` and the auto-catalog inside `knowledge-base/KNOWLEDGE_BASE.md` as part of step 8, so the new post is indexed for agents automatically with defaults (concepts ← tags, depth ← word count). No extra command needed.

**Optional — enrich the augmentation** for the new post. If the post introduces concepts, prereqs, or tech worth indexing explicitly, add an entry to the YAML block under `## Augmentation` in `knowledge-base/KNOWLEDGE_BASE.md`:

```yaml
{slug}:
  concepts: [concept 1, concept 2, ...]
  prereqs: [slug-of-prereq-post, ...]
  teaches: [what the reader can do after reading]
  tech: [neo4j, anthropic-sdk, ...]
  depth: deep  # intro | working | deep
```

Then run `npm run build-knowledge-base` (from `front/`) to pick up the enrichment into `posts.json` and the auto-catalog.

**Branch first.** `main` only accepts pull requests (see `docs/workflow.md`). Before committing, work on `post/{slug}` created from an up-to-date `main`:

```bash
git switch main && git pull && git switch -c post/{slug}
```

**Scoped commit** after the refresh — stage only what the pipeline produced, never `git add -A`:

```bash
git add \
  front/public/blog/audio/{category}/{slug}.mp3 \
  front/public/blog/audio/{category}/{slug}.json \
  front/public/blog/audio/{category}/{slug}.narration.json \
  front/public/blog/audio/manifest.json \
  front/public/blog/posts/{category}/{slug}.md \
  front/src/data/blogData.json \
  knowledge-base/posts.json \
  knowledge-base/KNOWLEDGE_BASE.md
git commit -m "feat(blog): add post '{slug}' with EN audio"
```

**Open the pull request** only when the user asks to publish. CI (content check, tests, link check, build) must pass; the squash merge publishes the post:

```bash
git push -u origin post/{slug}
gh pr create --fill --title "feat(blog): add {short title} post"
gh pr checks --watch && gh pr merge --squash
```

## Step 8 — Quality Check

```bash
python3 -c "
import json
with open('front/src/data/blogData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
p = data['posts'][0]
print('Slug:', p['slug'])
print('Date:', p['date'])
print('Category:', p['category'])
print('Word count:', p['estimatedWordCount'])
print('Tags:', p['tags'])
print('Content length (chars):', len(p['content']))
"
```

**Self-check before finishing:**

*Structure:*
- [ ] Frontmatter complete — all 8 fields present, `estimatedWordCount` computed with `len(body.split())`
- [ ] Hook in first paragraph — does it answer "why read this"?
- [ ] Progressive complexity across sections (beginner → advanced)
- [ ] Going Deeper has books, resources, videos (verified URLs), papers, questions
- [ ] Registered in blogData.json at index 0
- [ ] Word count in expected range for category
- [ ] Date is after all existing posts

*Practical completeness (the "can they actually do it?" check):*
- [ ] **Prerequisites stated** — language version, hardware requirements, packages to install, model/data to download
- [ ] **Environment explicit** — reader knows whether this runs locally, in cloud, or both, and what the minimum viable setup is
- [ ] **Free/cheap options mentioned** — for GPU/infra-dependent posts, at least one $0 path exists (Colab, Kaggle, etc.)
- [ ] **First code block is self-contained** — reader can copy-paste it and run it without external context
- [ ] **Output is testable** — if the post builds something, there's a section showing how to verify it works
- [ ] **Known gotchas documented** — common errors, version issues, surprising behaviors, with fixes
- [ ] **Cost/hardware table present** — for posts requiring GPU or cloud resources

*Diagrams:*
- [ ] Planned with the `blog-diagrams` skill: one diagram per visual moment, at least **2 different types**
- [ ] Production-system post → has an `architecture-beta` diagram
- [ ] `npm run diagrams:lint -- <slug>` reports no errors; warnings fixed or justified
- [ ] `npm run diagrams:render -- <slug>` PNGs looked at; no TOO WIDE, no OVERFLOW
- [ ] Each diagram has a lead-in sentence saying what to look at
- [ ] Charts and quadrants use real numbers from cited sources, never invented ones

*Code:*
- [ ] Python only (unless explicitly about another language)
- [ ] Production-quality — real imports, realistic variable names
- [ ] Comments explain *why*, not *what*
- [ ] Code blocks are runnable in sequence — imports and variables carry through or are restated

## Common Mistakes to Avoid

**DO NOT:**
- Invent YouTube video IDs — verify every URL or omit the video
- Draft diagrams without the `blog-diagrams` skill, or publish them without rendering and looking at them
- Write colours (`style`, `classDef`) in a diagram — the theme owns colour
- Repeat content covered by existing posts — check headings first
- Fabricate benchmark numbers in xychart-beta — only use numbers from cited sources in the post
- Write abstract theory without a real use case
- Add sections that exist only for length — every section must earn its place
- Use fewer than 8 tags — the Knowledge Graph needs 8-12 tags per post to build meaningful connections
- Tag the implementation language (e.g., "Python") unless the post IS about that language
- Invent new tags without checking `blogData.json` for existing canonical names — duplicates fragment the graph
- Use abbreviations in tags ("HF" instead of "Hugging Face", "TF" instead of "TensorFlow")
- End a tutorial at "save the output" without showing how to load and test the output
- Assume the reader has expensive hardware — always mention the cheapest viable path
- Skip install/download steps — "obvious" prerequisites are only obvious to you
- Leave the execution environment ambiguous — state "local machine", "Colab", or "any GPU machine" explicitly

**DO:**
- Start with research before writing a single word
- Use actual library versions in examples (`ragas==0.4.3`, `pyspark 4.0`)
- Cite real papers with real arxiv IDs
- Acknowledge limitations and honest trade-offs
- Include practical grounding — every concept needs a "in production, this means..."
- Verify all header image filenames with `ls front/public/blog/headers/` before using
- Use `$ARGUMENTS` to receive the topic and any specific instructions from the user
- Show the complete journey: install → configure → build → test → deploy/use
- Include a hardware/cost table for any post requiring GPU or cloud resources
- Research known gotchas and bugs before writing — readers shouldn't discover them on their own
- Test the post's narrative by asking: "Could someone with zero setup replicate this?"
