# Juan Lara — Brand Book

Canonical source of truth for the verbal layer of the personal brand. Every external surface (portfolio, LinkedIn, GitHub, talks, podcasts, email signatures, slide decks) draws from this document. When in doubt, this file wins.

> Locked: 2026-05-01. Maintenance rules in §9.

---

## 1. Positioning

**Identity.** AI Engineer who takes state-of-the-art AI from research to production at enterprise scale. The title is deliberately unmodified: seniority is shown through scope (leading the knowledge-base cell of a bank's AI-First strategy), not claimed through adjectives.

**Hierarchy of what the brand projects.** A 70 / 25 / 5 split, in this order:

| Weight | Layer | Where it shows |
|---|---|---|
| ~70% | **Engineering** | Hero, About, LinkedIn headline, talk topics, every public surface |
| ~25% | **Applied Research** | Pillar 3, blog research category, "Why Work With Me" framing |
| ~5%  | **Foundations / Curiosities** | Personal corner of the blog. Never in bio, hero, pillars, or speaker tagline |

**Voice.** Formal B2B. Deeply technical. Engineer-to-engineer. **Apple-style cadence:** sentences as headlines, periods as rhythm, every word earns its place. Less, said well, says more. No hype. No corporate filler. No intensifier padding.

**North Star.** Be a recognized voice in production AI — speaking at conferences, cited as the reference for taking SOTA to production at enterprise scale.

---

## 2. Tagline

**Primary (headline form)** — for hero rendering, slide titles, business cards. Two sentences, period cadence, zero hyphens:

> **Frontier AI. Engineered for production.**

**Primary (prose form)** — when the tagline appears inside a paragraph (bios, descriptions). Same idea, comma form so it flows:

> Frontier AI, engineered for production.

**Sub-tagline** — when there's room for a second line (About hero, talk submissions, long-form bio header). Different vocabulary so it adds claim instead of repeating "frontier" and "production":

> From research to enterprise scale.

**Strap-line** — three-slot identity line, replaces all `Computer Scientist · Mathematician · AI Researcher` style strings:

> AI Engineer · Production AI · Knowledge Systems

**Usage rules.**

| Surface | Use |
|---|---|
| Home hero (large) | Primary tagline |
| About hero | Strap-line above name, primary tagline below |
| LinkedIn headline | `AI Engineer · Production AI at Davivienda · I take SOTA to production` (or current employer) |
| Email signature, slide footer | `Juan Lara — State-of-the-art AI, engineered for production.` |
| Speaker tagline (1 line on a slide) | Primary tagline |
| Talk-submission speaker bio | Sub-tagline + 100-word bio |

---

## 3. Bios

Three lengths. Pick the one whose word budget matches the surface.

### 3.1. Bio — short (~30 words)

For: Twitter/X bio, GitHub profile header line, talk speaker tagline, podcast intro.

```
AI Engineer building production AI since 2022. Banking, retail logistics,
healthcare AI, academic research. Currently at Davivienda. Previously:
Falabella, GenomAI, Harvard.
```

### 3.2. Bio — medium (~75 words)

For: LinkedIn About short form, conference speaker bio, podcast intro, guest-post author block.

```
AI Engineer building production AI at enterprise scale since 2022.

Currently leading the knowledge-base cell of Davivienda's AI-First strategy,
building the semantic layer that grounds the bank's AI agents in verifiable,
traceable business context. Previously: ML for logistics at Falabella, compliance-grade
generative AI at GenomAI, research engineering at Harvard.

My focus is what production demands that papers omit. Scale. Governance.
Evaluation. The engineering decisions between a working prototype and a system
you can run.
```

### 3.3. Bio — long (~165 words)

For: Portfolio `/about` page, full LinkedIn About, full conference / panel bio.

```
AI Engineer building production AI at enterprise scale since 2022.

Currently I lead the knowledge-base cell of Davivienda's AI-First strategy,
building the semantic layer that grounds the bank's AI agents in verifiable,
traceable, and governed business context. Before that: ML for logistics at Falabella
(a distribution center moving ~4.6M SKUs), compliance-grade generative AI in
healthcare at GenomAI, and three years of research engineering at Harvard
University.

My focus is the engineering layer between ML research and enterprise systems.
Retrieval platforms, from RAG to GraphRAG. Agentic architectures.
Knowledge-grounded LLM applications. The data foundations that make them
reliable.

Computer Science + Mathematics dual degree, 4.7/5.0. M.Sc. in Artificial
Intelligence in progress at Universidad de los Andes. Open to talks, technical
engagements, and collaborations on production AI systems.
```

> **Rendering note.** On the portfolio `/about` page, the bio is rendered with rich formatting: bold opener (`AI Engineer`), italic industries (`banking`, `retail logistics`, `healthcare AI`, `academic research`), and color-coded company names (Davivienda red, Falabella blue, GenomAI emerald, Harvard indigo). The plain-text version above is canonical for LinkedIn / Twitter / speaker submissions.

---

## 4. Content pillars

Three pillars. The ordering enforces the 70/25/5 hierarchy: two engineering-flavored pillars first, research third.

| # | Pillar | One-line description | Color (Tailwind) | Lucide icon |
|---|---|---|---|---|
| 1 | **Production AI Systems** | The systems themselves: RAG and GraphRAG platforms, agentic architectures, knowledge applications, LLM ops at scale. | `blue-600` | `Server` |
| 2 | **Engineering Practice** | How they ship: architecture decisions, MLOps, evaluation, governance, the engineering moves between prototype and production. | `indigo-600` | `Cpu` |
| 3 | **Applied Research** | Reading the research: paper-to-product translation, what survives contact with production. | `emerald-600` | `BrainCircuit` |

Replaces the previous home pillars `Applied Research / Scalable Engineering / Business Impact`.

These pillar names are reused verbatim across the home "Why Work With Me" section, the About page introduction, blog filtering UI labels, and any deck where you summarize what you do.

---

## 5. Anchor topics

The six things the brand wants Juan to be known for. Each maps to (a) a potential talk topic, (b) a potential blog series, (c) a specialization claim usable in bios.

| # | Topic | Specialization claim | Example talk title | Example blog series title |
|---|---|---|---|---|
| 1 | **Production RAG at scale** | Chunking, retrieval evaluation, hybrid search, latency under regulated constraints | *"Production RAG: what the papers leave out"* | *Production RAG Field Manual* |
| 2 | **Agentic architectures in production** | Agent patterns that ship vs. demos, tool design, failure modes, evaluation | *"Agents that survive production: patterns and anti-patterns"* | *Agent Architectures in Practice* |
| 3 | **Knowledge systems for LLM applications** | Knowledge graphs, ontologies, retrieval-grounded knowledge platforms | *"From documents to knowledge: building the substrate for LLM agents"* | *Knowledge Systems for LLMs* |
| 4 | **LLM ops in regulated industries** | Compliance, governance, audit trails, evaluation under banking / healthcare constraints | *"Shipping LLM features in a regulated bank"* | *LLM Ops in Regulated Industries* |
| 5 | **Evaluation in production** | Beyond static benchmarks; live evaluation harnesses, drift detection for LLM systems | *"Evaluation that survives production"* | *Evals in the Wild* |
| 6 | **Data foundations for AI** | Lakehouse-to-agent pipelines; the data layer agents actually need | *"The data layer your agents actually need"* | *Data Foundations for AI* |

When picking the next blog series or the next talk to submit, choose from this list. Don't introduce a 7th anchor without retiring one — six is the cap.

---

## 6. Tone of voice

Distilled from the actual writing voice of the high-performing posts already in the blog (RL in Practice, RAG fieldnotes, Manifold Hypothesis). The portfolio surface should sound like the blog.

### 6.1. Five DOs

1. **Lead with the engineer's problem, not the technology.** *"Your documents are not uniform Wikipedia paragraphs"* beats *"RAG systems require document preprocessing."*
2. **Direct second-person address.** *"You" / "your stack" / "your eval set."* The reader is an engineer like you, not an audience.
3. **Short declaratives anchor long explanations.** *"This is the gap."* Then explain it for two paragraphs.
4. **Concrete numbers, named tools, real constraints.** Cite specific values, libraries, versions, latencies. "p99 < 200 ms on a t4 GPU" beats "fast and scalable."
5. **Always bridge research → production.** Never describe a paper without stating what it means for shipping.

### 6.2. Five DON'Ts

1. **No hype words.** Drop: *revolutionary, cutting-edge, game-changing, leverage, paradigm shift, unleash, supercharge.*
2. **No corporate filler.** Drop: *driving measurable business impact, end-to-end solutions, robust enterprise-grade, scalable ML engineering, holistic.*
3. **No intensifier filler.** Drop: *really, super, truly, very, extremely, highly, deeply* (as adverbs). Drop adjectives that are claims without proof: *innovative, powerful*. *"Highly scalable"* and *"powerful platform"* are not claims.
4. **No three-identity strap-lines.** Never lead with *"Computer Scientist · Mathematician · AI Researcher."* One role at the top.
5. **No marketing-deck pillars.** Drop *"Innovation / Excellence / Impact"* abstractions — name the thing.

### 6.3. Length & cadence (the Apple discipline)

Less, said well, says more. Apply at every length scale:

- **Headlines and hero copy.** Sentence fragments are fine. Periods do the work of conjunctions. *"Production RAG. Agentic architectures. Knowledge systems."* beats *"production RAG, agentic architectures, and knowledge systems."*
- **Lists of three.** Three nouns + a punchline beats four+. Drop the fourth item if you can.
- **Two-beat hero structure.** List of three, then context. *"RAG. Agents. Knowledge. Built for regulated industries."*
- **Cut every word that doesn't carry weight.** If removing a word doesn't change the meaning, the word loses.
- **One idea per sentence.** Two ideas → two sentences. Apple writes lots of sentences. They're just short.
- **Long form is allowed when needed.** The 200-word bio doesn't shrink to 50 just because Apple-style. Long form gets *cadenced*, not chopped.

### 6.4. Em-dash discipline

Em-dashes (`—`) are the signature of AI-generated text in the 2024–2026 era. They also weaken cadence: a period commits to a stop, a comma keeps the rhythm, an em-dash hedges. Apple writes thousands of words across apple.com without one.

**Rules:**

- **Default to a period.** *"Built for regulated industries. Currently at Davivienda."* beats *"Built for regulated industries — currently at Davivienda."*
- **Default to a comma when you need flow.** *"Three things meet in my work, starting with…"* beats *"Three things meet in my work — starting with…"*
- **Allow at most one em-dash per major surface** (a hero block, a paragraph, a chip). Two em-dashes in the same paragraph is one too many.
- **Never use em-dashes in lists or to introduce subordinate clauses.** That's where they multiply fastest.
- **Audit before shipping.** `grep -n "—" front/src/data/brand.js` should return zero or one match per surface, not five.

### 6.5. Tab title discipline

Browser tab titles get truncated to ~30 characters at typical widths. Two competing separators (`|` and `—`) create visual noise and cause the truncated form to read as ambiguous fragments.

**Rules:**

- **One separator only.** Prefer `·` (middle dot) for editorial tone. Apple uses it across apple.com nav.
- **Front-load the identity.** Brand name first, role second. The truncated form should still identify the page.
- **Keep under 32 characters when possible.** SEO weight lives in the meta description, not the title. *"Juan Lara · AI Engineer"* (23 chars) beats *"Juan Lara | AI Engineer — Production AI at Enterprise Scale"* (60 chars, truncates to nonsense).

### 6.6. Before / after table

Real strings from the current repo, with their replacement:

| Surface | Before | After |
|---|---|---|
| Home hero strap (two-line) | "Bridging the gap from research to scalable production" | "Frontier AI." / "Engineered for production." |
| Home hero body | "I transform complex mathematical models and AI research into robust, enterprise-grade applications. Specializing in autonomous agents, distributed systems, and driving measurable business impact through scalable ML engineering." | "RAG & GraphRAG. Agentic architectures. Knowledge systems. Built for regulated industries. Currently at Davivienda." |
| Tab title | "Juan Lara \| AI Engineer — Research to Production" (66 chars, truncates ambiguously) | "Juan Lara · AI Engineer" (23 chars, single separator) |
| Home hero chips | Autonomous Agents · Distributed Systems · Enterprise MLOps · Scalable Architecture | RAG & GraphRAG · Agentic Architectures · Knowledge Systems · LLM Ops |
| Home pillar — Production AI Systems | (was "Applied Research" copy) "Translating SOTA mathematical models and papers into practical algorithms that solve complex problems." | "Production AI, shipped. RAG, agents, and knowledge applications in users' hands." |
| Home pillar — Engineering Practice | (was "Scalable Engineering" copy) "Building robust data pipelines, optimizing inference latency, and deploying ML systems on the cloud." | "From notebook to running system. Architecture, evaluation, and ops at scale." |
| Home pillar — Applied Research | (was "Business Impact" copy) "Creating AI solutions that automate workflows, reduce operational costs, and deliver measurable ROI." | "The frontier, translated. What survives contact with production." |
| Home value-card subtitle | "Value Delivered" | "What I build" |
| Home value-card item 1 ("Intelligent Systems") | "Automating complex enterprise workflows." | "Production RAG and agentic architectures inside regulated industries." |
| Home value-card item 2 ("Scalable Architecture") | "Low-latency models deployed at scale." | "Platforms that survive production: evaluation, governance, scale." |
| Home value-card item 3 ("Applied Research") | "Bridging theory and business solutions." | "Translating frontier ML research into systems that ship." |
| About hero strap | "Computer Scientist · Mathematician · AI Researcher" | "AI Engineer · Production AI · Knowledge Systems" |
| About bio (collapsed) | "AI Engineer with 3+ years building production AI systems across research, healthcare, banking, and enterprise domains. Focused on LLM systems, NLP, and taking ML from concept to deployment — with experience spanning Davivienda, Harvard University, GenomAI, and Falabella." | Use Bio 100. |
| About bio (expanded) | "Specializing in LLM fine-tuning, RAG architectures, NLP pipelines, and production ML systems on cloud infrastructure. Currently pursuing an M.S. in Artificial Intelligence at Universidad de los Andes, combining a dual foundation in Computer Science and Mathematics (4.7/5.0) with a drive to push AI research into real-world applications." | Use Bio 200 (last 2 paragraphs as the expanded section). |
| Footer connect blurb | "Open to research collaborations, technical challenges, and building enterprise-grade AI systems." | "Open to talks, technical engagements, and collaborations on production AI systems." |
| Mobile menu bio line | "Computer Scientist & Mathematician" | "AI Engineer · Production AI" |
| Projects page subtitle | "Production systems, research tools, and open-source contributions." | (keep — already on-brand) |
| SEO description | "Research-minded AI Engineer specializing in LLM systems, NLP, and taking ML from concept to production. CS + Mathematics foundation, experience spanning Harvard research to enterprise-scale AI." | "AI Engineer building production AI systems at enterprise scale. Knowledge systems for AI agents in banking, RAG and GraphRAG platforms, agentic architectures. Currently leading the knowledge-base cell of Davivienda's AI-First strategy." |
| RSS description | "Technical writing on machine learning, AI agents, NLP, and data engineering — research notes, field notes, and curiosities." | "Engineering notes on production AI — RAG systems, agentic architectures, LLM ops, and the patterns that survive contact with production." |

---

## 7. Forbidden phrases

Hard blocklist. Run the equivalent of `grep -rn` on the codebase before shipping any copy update — none of these may appear on a brand-facing surface.

**Hype words:**
- `cutting-edge` / `cutting edge`
- `revolutionary`
- `game-changing`
- `leverage` (verb)
- `paradigm shift`
- `unleash`
- `supercharge`
- `holistic`
- `synergy`

**Corporate filler:**
- `end-to-end solutions`
- `robust enterprise-grade`
- `driving measurable business impact`
- `scalable ML engineering` (as a noun phrase)
- `state of the art` as filler. Acceptable only as `state-of-the-art` (hyphenated, used precisely)

**Intensifier filler (Apple-style strict):**
- `really`, `super`, `truly`, `very`, `extremely`, `highly`, `deeply` (as adverbs)
- `innovative`, `powerful` (claims without proof)

**Retired strap-line:**
- `Computer Scientist · Mathematician · AI Researcher` — never reappear

OK to use sparingly: `production-grade`, `enterprise-scale`, `frontier`. These earn their place; the blocklist words don't.

---

## 8. Where this is applied

Application checklist. Each item gets ticked in Epic 3 (`BRAND_BACKLOG.md`):

- [ ] `front/src/pages/LandingPage.jsx` — hero, chips, value card, three pillars
- [ ] `front/src/pages/AboutPage.jsx` — strap-line, collapsed bio, expanded bio
- [ ] `front/src/components/layout/Footer.jsx` — connect blurb
- [ ] `front/src/components/layout/MobileMenu.jsx` — mobile bio line
- [ ] `front/src/components/common/SEO.jsx` — `defaultSEO.description`, `keywords`
- [ ] `front/src/pages/ProjectsPage.jsx` — SEO meta only (page copy already on-brand)
- [ ] `front/src/utils/blogUtils.js` — verify `BLOG_CONFIG.categories` (low priority; current copy is fine)
- [ ] `front/public/index.html` — `<title>`, `<meta description>`, `<og:*>`, `<twitter:*>`
- [ ] `front/public/manifest.json` — `name`, `short_name`
- [ ] `front/public/rss.xml` — `<description>` (regenerated by `npm run build-rss`, so update the generator)
- [ ] `README.md` — repo-root summary
- [ ] LinkedIn headline + About + featured (out-of-repo, Epic 5)
- [ ] GitHub profile README (out-of-repo, Epic 5)
- [ ] Twitter/X bio + pinned (out-of-repo, Epic 5)

When applying, prefer importing from `front/src/data/brand.js` over hardcoding — that file is the React-side mirror of this doc.

---

## 9. Maintenance

This file is not free to drift. Update it only on the following triggers:

- **Role change.** New employer / new role → bios + LinkedIn headline get rewritten. Keep the tagline; it's role-independent.
- **A new anchor topic emerges from the work.** If you wrote three substantive posts on a topic not on the list and they're getting traction, swap it in — but retire one of the existing six. The cap is hard.
- **A surface in §8 publishes copy that contradicts this file.** Either the copy is wrong (fix the copy), or this file is wrong (fix this file, then propagate). Never let two truths coexist.
- **Annual review.** Re-read the whole file once a year. Phrases that felt fresh become tired; replace.

The corresponding programmatic source is `front/src/data/brand.js`. Keep them in sync. If a constant changes here, change it there in the same commit.

The corresponding memory record is `project_brand_positioning.md` in the Claude memory store. Future sessions read it to bootstrap. Update it on the same triggers as this file.
