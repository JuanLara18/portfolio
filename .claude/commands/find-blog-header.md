# find-blog-header

Find, evaluate, and download a header image for a new blog post. Use this as a sub-skill inside `/new-blog-post`, or call it standalone when a post needs a fresh header.

The portfolio's header aesthetic is distinctive and deliberate. Generic stock art or direct logos will look wrong. Follow the process below.

---

## The aesthetic — what a good header looks like

Reviewing the 70+ headers already in `front/public/blog/headers/` shows a consistent pattern:

- **High-resolution photography, editorial quality.** Unsplash-grade or equivalent. No clip art, no generic corporate stock, no AI-generated renders.
- **Single dominant subject with breathing room.** The subject sits off-center and leaves negative space — usually the left half or lower third — so the post's title overlay sits cleanly. The page renders a dark gradient over the bottom of the image, so composition should tolerate that.
- **One metaphorical hop away from the topic, never the literal logo.** If the topic is Docker, you show a real humpback whale (because Docker's logo is a whale), not the logo. If the topic is Fourier analysis, you show a long-exposure light trail that *looks like a waveform*, not a signal plot.
- **Landscape orientation, wide enough for the hero.** Target ≥1600px wide, ideally 2000–2400px. Aspect ratio between 16:9 and 16:10 works best.
- **Avoid:** logos, UI screenshots, portraits of people, text-heavy posters, obvious AI renders, generic handshakes / team-at-desk corporate stock.

### Reference table of existing choices

These are real examples from the current blog. Study the *type* of metaphor, not the specific image.

| Post topic | Header shows | Type of hop |
|---|---|---|
| Docker for ML engineers | humpback whale breaching | logo-as-real-thing (whale logo → actual whale) |
| DAMA DMBOK data governance | chess king and queen on board | power/strategy metaphor |
| Mamba selective state spaces | green mamba snake in tree | name-as-literal-animal |
| Fourier transform | long-exposure blue light trail | physical referent of the math |
| 1+2+3+... = -1/12 | spray-painted arithmetic symbols on a wall | the symbols themselves as found art |
| RLHF / DPO alignment | bunch of smiley-face balloons | human feedback made tactile |
| Dataiku enterprise platform | kingfisher on a branch | naturalist / wordplay |
| Apache Airflow | air-flow / wind visualization | name-as-literal-phenomenon |
| Anthropic emotion concepts paper | Anthropic's own circuit illustration | author-native illustration (acceptable for research deep-dives) |

For a new post, the first question is *which column matches the topic*, then search accordingly.

---

## Input

Expect the caller to provide:

- **Post title**
- **Post excerpt** (1–3 sentences of topic summary)
- **Post slug** (kebab-case, used to derive the filename)
- **Category** (`field-notes` / `research` / `curiosities`)

If any are missing, ask once before starting.

---

## Step 1 — Generate 4–6 metaphor candidates

Before searching, write out the candidates. Do this in plain text in your response so the user can see the reasoning and redirect you cheaply.

For each candidate, capture:

- **Angle** — the metaphor type (logo-as-real-thing / physical referent / wordplay / authority-metaphor / process-metaphor / emotional-referent).
- **Search query** — 1–3 concrete nouns you will actually type into a stock-photo search. Single concrete words work better than abstractions.
- **Why it fits** — one sentence tying it to the post topic.

A good candidate list has *different* metaphor types, not five variations of the same idea. If all five of your candidates are "abstract neural network", you haven't thought hard enough.

**Examples of good diversification** (for a hypothetical "Vector Databases" post):

1. Physical referent — "library card catalog, wooden drawers"
2. Wordplay — "arrows pointing through space, long exposure"
3. Process metaphor — "librarian shelving, archive"
4. Literal-but-secondary — "constellation, points connected by lines"
5. Aesthetic abstraction — "dense grid of lights at night"

---

## Step 2 — Search for candidates

### ⚠️ Source priority (Unsplash is blocked — use Wikimedia Commons)

**Unsplash and Pexels both block automated access.** WebFetch returns 403 and `curl` (even with a browser User-Agent) gets served an Anubis proof-of-work anti-bot challenge page. Do not waste cycles trying them — they were the original plan for this skill but cannot be used from the tool environment as of 2026-04.

**Primary source: Wikimedia Commons** — free, CC-licensed, high-resolution, and exposes a clean JSON API with direct `upload.wikimedia.org` URLs. The image quality is excellent for nature, objects, animals, landscapes, and historical photography. It is weaker for stylized editorial compositions, so for those topics expect to search a bit harder.

Search pattern — use **WebFetch** directly against the MediaWiki API:

```
https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={keywords}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json
```

Ask WebFetch to return each result's `title`, `imageinfo.url` (direct original URL), `width`, `height`, and the photographer/author from `extmetadata`. Use single concrete keywords, the same way you would search Unsplash: `emperor penguin jumping water`, `humpback whale breaching`, `long exposure light trail`.

Filter results: prefer landscape orientation (width > height, ideally 16:9 to 16:10), width ≥ 2400px, and ignore banner crops, PDFs, and obviously low-res thumbnails.

**Fallbacks** — if Commons doesn't have a good match:

- Check if a public-domain museum collection (Met, Smithsonian Open Access, Rijksmuseum) has a relevant image. These have open APIs too.
- For research-category posts deep-diving a specific paper, the paper's own hero illustration is acceptable *if* the authors' blog post has one (e.g., Anthropic research posts have rendered PNGs at `cdn.sanity.io/images/4zrzovbb/...`). Only use a paper-native image when it is genuinely striking and the authors are a well-known research lab with an illustration practice. Never scrape a figure from inside a paper and pass it off as a header.

---

## Step 3 — Extract the direct image URL

For Wikimedia results, the API already returns `imageinfo.url` pointing at the full-resolution file on `upload.wikimedia.org/wikipedia/commons/{a}/{ab}/{filename}`. No extraction step needed.

To get a sized-down version, Wikimedia serves thumbnails at:

```
https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{filename}/{N}px-{filename}
```

**Important:** Wikimedia only generates thumbnails at specific widths, not arbitrary ones. Safe widths that almost always exist: `1280`, `1920`, `2560`, `3840`. Asking for `2400px-...` will return HTML 404. If you want ~2400px for the final header, request `2560px-...` or `3840px-...` and let the optimizer downscale. To confirm a valid thumb URL programmatically, call the API with `iiurlwidth=2400` and read the `thumburl` it returns — Wikimedia rounds to the nearest bucket.

If the API call fails or returns no usable image, skip that candidate — do not guess URLs.

---

## Step 4 — Visually evaluate before committing

**Download the top 2–3 candidates at thumbnail size into the project root** (not `/tmp/` — on Windows the Read tool cannot access `/tmp/` or `C:\tmp\`). Then `Read` each as an image to see it. This is the key step — you cannot judge a header from its filename.

```bash
curl -sL -A "Mozilla/5.0" -o candidate-1.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/.../1280px-....jpg"
curl -sL -A "Mozilla/5.0" -o candidate-2.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/.../1280px-....jpg"
```

Then `Read` each file. Delete the candidate files from the project root after picking the winner so they don't pollute the working tree. Score each candidate against:

- Does the composition leave room for the title overlay on the lower-left?
- Is the subject clear and dominant, not cluttered?
- Does the color palette feel editorial (saturated-contrasty or muted-cinematic), not corporate-stock?
- Would a reader who sees this in a grid of existing posts immediately think "this is one of that blog's posts"?
- Most importantly: does it *not* look like the topic's logo, and *not* look like generic stock?

If none of the candidates pass, go back to Step 1 and generate a different metaphor angle. Do not settle. A mediocre header permanently drags a good post down.

---

## Step 5 — Download the final full-resolution image

Once you've picked a winner, download it into the headers folder with a descriptive kebab-case filename. For Wikimedia, use the `2560px-...` or `3840px-...` thumbnail URL (remember: Wikimedia only generates specific bucket sizes):

```bash
curl -sL -A "Mozilla/5.0" -o front/public/blog/headers/{descriptive-name}-header.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{filename}/3840px-{filename}"
```

The `npm run optimize-images` step later will downscale and generate the WebP variant, so 3840px is fine as the source. File size usually lands between 1–3 MB for landscape photos at this width.

**Naming rules for the filename:**

- Use the *metaphor subject*, not the post topic. If the post is about vector databases and the header is a constellation, the filename is `constellation-header.jpg`, not `vector-db-header.jpg`. This keeps the filename meaningful and reusable.
- Kebab-case, `.jpg` extension, `-header` suffix.
- Check that the name isn't already taken: `ls front/public/blog/headers/ | grep {name}`. If it is, pick a more specific name (e.g., `whale-breaching-header.jpg` not `whale-header.jpg` when `whale-header.jpg` exists).

Verify the download succeeded and the file is a real image:

```bash
file front/public/blog/headers/{name}-header.jpg
ls -la front/public/blog/headers/{name}-header.jpg
```

Expect: `JPEG image data`, size between ~100 KB and ~2 MB at 2400px wide.

---

## Step 6 — Record attribution

Create or append to `front/public/blog/headers/ATTRIBUTIONS.md`:

```markdown
- `{name}-header.jpg` — Photo by {Photographer Name} on [Unsplash]({photo page URL})
```

This keeps the Unsplash license obligation visible even though Unsplash does not strictly require attribution. For paper-native illustrations, cite the source post URL and the research lab.

---

## Step 7 — Run the optimizer

After adding a new header, run the site's image optimizer so the WebP variant exists and the original is compressed:

```bash
cd front && npm run optimize-images
```

This creates `{name}-header.webp` next to the JPG, which the `<picture>` element in `BlogPostPage.jsx` prefers. Skipping this step means mobile users load the full-size JPG every time.

---

## Step 8 — Return the filename to the caller

The final output of this skill is just the `headerImage` value to paste into frontmatter:

```
/blog/headers/{name}-header.jpg
```

Also report: which metaphor angle you picked, one sentence on why it fits the post, and the photographer attribution. Keep this under ~60 words so the caller can paste it into a commit message if they want.

---

## Failure modes to avoid

- **Trying Unsplash or Pexels.** Both block WebFetch with 403 and serve curl an Anubis anti-bot challenge. Use Wikimedia Commons instead. (If you do try Unsplash and it works in the future, great — but verify with an actual image download, not a page fetch.)
- **Searching for the literal topic.** `emperor penguin` returns better photos than `bash shell`. Search for the *metaphor*, not the topic.
- **Picking based on URL or dimensions without viewing the image.** Always `Read` the downloaded file before committing to it. A 3989×2652 "emperor penguin jumping" could be a distant dot in a landscape or a cinematic mid-leap — you cannot tell from metadata.
- **Requesting an arbitrary Wikimedia thumb width.** Only specific bucket sizes exist (`1280`, `1920`, `2560`, `3840`). `2400px-...` returns HTML 404. Use the API's `iiurlwidth` to get a guaranteed-valid URL, or request `2560`/`3840`.
- **Using an existing header.** Before finalizing, check `python3 -c "import json; d=json.load(open('front/src/data/blogData.json', encoding='utf-8')); print(sorted({p['headerImage'] for p in d['posts']}))"` and make sure the target filename is not already in use. Re-using a header across posts makes the blog's grid view look broken.
- **Forgetting the optimizer.** Without `npm run optimize-images`, the WebP variant the site prefers will not exist and performance will regress.
- **Using AI-generated images.** The blog's aesthetic depends on photographic authenticity. Do not use Midjourney/DALL-E/Imagen outputs.
- **Leaving candidate files in the project root.** Delete `candidate-*.jpg` after picking the winner.
- **Picking something "close enough" to avoid a third search round.** If you wouldn't show it to a designer with pride, pick again.
