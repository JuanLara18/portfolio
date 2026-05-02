# Brand Backlog — Juan Lara

Persistent backlog for personal brand work. We work through this across sessions.

---

## 0. Locked positioning

**Identity:** Senior AI Engineer who takes state-of-the-art AI research to production-grade systems at enterprise scale.

**Hierarchy of what the brand projects:**

1. **Engineering** (primary, ~70%) — production AI systems, scalable architecture, deployment, ops.
2. **Applied Research** (secondary, ~25%) — SOTA literacy, paper-to-product translation. Proof of depth, not the headline.
3. **Foundations / Curiosities** (background, ~5%) — exists in the blog as a personal interest. Not promoted in portfolio surface, not in pillars, not in bio.

**Tone:** formal B2B, deeply technical. No hype. No corporate fluff. Engineer talking to engineers and to technical leadership.

**North Star (mid-term goal):** become a recognized voice in production AI — speaking at conferences, cited as a reference for "how to take SOTA to production at enterprise scale."

**Tagline (locked 2026-05-01, refined):** *"Frontier AI. Engineered for production."* (period form for headlines, comma form `"Frontier AI, engineered for production."` for prose)

**Strap-line:** *Senior AI Engineer · Production AI · Knowledge Systems*

**Sub-tagline:** *From research to enterprise scale.*

> Full verbal layer (bios, pillars, tone, anchor topics, blocklist) lives in [`BRAND.md`](./BRAND.md). Programmatic constants for React import live in [`front/src/data/brand.js`](./front/src/data/brand.js).

---

## Backlog (epics, prioritized)

Priority: **P0** = foundation, blocks everything else. **P1** = high impact, do soon. **P2** = important but not blocking. **P3** = nice-to-have.

### EPIC 1 — Brand foundation (positioning lock-in) `P0` ✅ DONE 2026-05-01

**Status:** Locked. Canonical content in [`BRAND.md`](./BRAND.md). Programmatic constants in [`front/src/data/brand.js`](./front/src/data/brand.js).

The verbal layer is now the single source of truth for every later application.

- [x] **1.1** Tagline locked: *"Frontier AI. Engineered for production."* (refined from initial "State-of-the-art..." version to drop hyphens; comma form for prose, period form for headlines)
- [x] **1.2** Bios written at 50 / 100 / 200 words. See `BRAND.md` §3.
- [x] **1.3** Three pillars locked: Production AI Systems · Engineering Practice · Applied Research. See `BRAND.md` §4.
- [x] **1.4** Tone-of-voice one-pager: 5 dos, 5 don'ts, before/after table for every brand surface in the repo. See `BRAND.md` §6.
- [x] **1.5** Six anchor topics locked: Production RAG at scale · Agentic architectures in production · Knowledge systems for LLM applications · LLM ops in regulated industries · Evaluation in production · Data foundations for AI. See `BRAND.md` §5.

### EPIC 2 — Visual identity system `P1`

- [ ] **2.1** Decide logo evolution: keep current "jL" icon as avatar/favicon-only; design a **wordmark** "Juan Lara" in the existing serif. Lockup variants: full / compact / icon-only.
- [ ] **2.2** Color system cleanup: lock **2 functional colors** (primary blue + one accent). Demote multi-color chip system on home. Keep blog-category colors as the only place colors signal taxonomy.
- [ ] **2.3** Typography scale formalized in a single file (`STYLE.md` or Tailwind tokens): display serif, body sans, mono for technical taglines.
- [ ] **2.4** Blog header template: standardized "type-poster" (navy + grafo + serif title + mono category tag). Goal: instant recognition in LinkedIn shares.
- [ ] **2.5** Profile photo direction: brief for a single, neutral, B&W or low-saturation portrait. To replace current `Profile.jpeg`.
- [ ] **2.6** Drop generic "blob" decorations from hero in favor of the grafo/network motif (already aligned with knowledge-systems story).

### EPIC 3 — Portfolio site (juanlara18.github.io/portfolio) `P1` 🟡 PARTIAL 2026-05-01

**Status:** Verbal layer applied to all primary surfaces (home, about, footer, mobile menu, SEO defaults, index.html, manifest.json, README). Apple-style cadence applied. Visual system, "Now" section, and case studies remain.

- [x] **3.1** Hero copy: tagline "Frontier AI. Engineered for production." (two-line, period cadence) + body "Production RAG. Agentic architectures. Knowledge systems. Built for regulated industries. Currently inside a major bank." Imported from `brand.js`.
- [x] **3.2** Hero chips: replaced with `Production RAG / Agentic Architectures / Knowledge Systems / LLM Ops`. Imported from `brand.js`.
- [x] **3.3** "What I build" card (formerly "Value Delivered"): three items now reflect the three pillars with concrete framing.
- [x] **3.4** Three "Why Work With Me" pillars → `Production AI Systems` / `Engineering Practice` / `Applied Research`. Imported from `brand.js`.
- [x] **3.5** About strap-line `Senior AI Engineer · Production AI · Knowledge Systems`. Bio uses `BIO_200` split into collapsed (paragraphs 1–2) and expanded (3–5).
- [ ] **3.6** Add **"Now"** section on `/about` (what I'm working on, reading, exploring this month). Manually maintained, ~5 bullets. Refresh monthly.
- [ ] **3.7** Featured case studies (3–5) in **STAR format** with quantified outcomes. One per major engagement: Davivienda, Falabella, GenomAI, Harvard, Ipsos. Sanitize as needed.
- [ ] **3.8** Technical Proficiency section → reorder to lead with *Production ML & MLOps* and *Cloud & Data Engineering*; demote *Core ML & Research*.
- [ ] **3.9** Blog landing: surface *Field Notes* and *Research* prominently; keep *Curiosities* present but secondary.
- [x] **3.10** SEO pass on all primary surfaces: `defaultSEO`, `index.html`, `manifest.json`, `LandingPage`, `AboutPage`. Title and description now lead with "Senior AI Engineer / Production AI at Enterprise Scale".

### EPIC 4 — Content strategy `P1`

Your blog is the strongest existing brand asset. Sharpen its strategic intent.

- [ ] **4.1** Define publishing cadence (e.g., 1 *Field Notes* / 2 weeks, 1 *Research* / month, *Curiosities* opportunistic).
- [ ] **4.2** Plan **1 signature anchor post** that defines the brand. Working title: *"Taking SOTA to Production: A Field Manual"* — a long-form synthesis of patterns across your engagements. This becomes the post that ranks, gets cited, and grounds talks.
- [ ] **4.3** Plan **2–3 long-running series** (multi-post depth proves authority better than scattered posts). Candidates: Production RAG series, Agent Architectures in Practice series, LLM Ops in Regulated Industries series.
- [ ] **4.4** Cross-post template: each *Field Notes* post → LinkedIn carousel (5–8 slides) + Twitter/X thread (8–12 tweets). Define a reusable Figma carousel template.
- [ ] **4.5** Newsletter decision: yes/no. If yes, pick provider (Substack vs. Beehiiv vs. self-hosted via current site) and define cadence.

### EPIC 5 — Distribution & external surface `P2`

- [ ] **5.1** LinkedIn: rewrite headline + about + featured. Banner using the new visual system.
- [ ] **5.2** GitHub profile README: align to engineer-first positioning, link to top 3 posts and top 3 projects.
- [ ] **5.3** Twitter/X bio + pinned tweet (a thread of the anchor post from 4.2).
- [ ] **5.4** Consider domain: `juanlara.eng` / `juanlara.dev` / similar. Current GitHub Pages URL is fine but a custom domain reads more senior.
- [ ] **5.5** RSS + canonical links audit so the blog is portable (already partially done — verify after copy changes).

### EPIC 6 — Voice building & speaking `P2`

This is where the multi-quarter work happens. Don't start until 1.x and 4.2 are in place.

- [ ] **6.1** Define **2–3 signature talk topics**, each grounded in a real engagement and a corresponding blog post or series. E.g.:
    - "Production RAG in regulated industries: lessons from banking"
    - "From paper to pipeline: agent architectures we actually shipped"
    - "Evaluation that survives contact with production"
- [ ] **6.2** Build a **target conference list** (LATAM AI events, GCP Summit, MLOps Community, banking AI events, Spanish-language tech podcasts). 15–20 venues, ranked by reach × accessibility.
- [ ] **6.3** Talk proposal template (problem → why now → what you'll learn → speaker creds). Reusable.
- [ ] **6.4** Submit first proposal. Don't aim high — aim *credible and shippable*. Local meetup or LATAM conference first.
- [ ] **6.5** Record one talk (even a self-recorded version of an internal presentation) to seed the speaking-reel.

### EPIC 7 — Proof of authority `P3`

Things that quietly compound.

- [ ] **7.1** Curate top 5 blog posts as "start here" on the blog landing.
- [ ] **7.2** Public open-source artifact aligned with anchor topics (a small library, an evaluation harness, a reference RAG implementation).
- [ ] **7.3** Guest post on a known engineering blog (Towards Data Science, Eugene Yan-style network, or a company blog from a past employer).
- [ ] **7.4** Quote-able one-liners — extract 10 sharp sentences from existing posts to seed Twitter / LinkedIn.

---

## Suggested order for next ~6 sessions

1. **Session A (next):** Epic 1.1 + 1.2 + 1.3 + 1.4 — lock the verbal layer. Everything else depends on this.
2. **Session B:** Epic 3.1 + 3.2 + 3.4 + 3.5 — apply locked positioning to home + about. High-visibility change, cheap to do once 1.x is set.
3. **Session C:** Epic 2.2 + 2.3 + 2.4 — visual system tightening + blog header template.
4. **Session D:** Epic 3.6 + 3.7 — Now section + STAR case studies.
5. **Session E:** Epic 4.1 + 4.2 — content strategy + plan the signature anchor post.
6. **Session F:** Epic 5.1 + 5.2 + 5.3 — propagate the new brand outward (LinkedIn, GitHub, Twitter).

Speaking work (Epic 6) starts after Session E at earliest.

---

## Out of scope (explicitly deferred)

- Math/curiosities promotion. They stay as a personal corner of the blog; the brand surface ignores them.
- Multi-language brand identity (English vs Spanish). Default to English on portfolio surfaces; revisit later.
- Sponsorship / monetization of the blog. Not now.
