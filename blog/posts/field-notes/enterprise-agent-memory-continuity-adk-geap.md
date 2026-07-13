---
title: "The Agent That Remembers You: Continuity Engineering on ADK 2.0 and Gemini Enterprise"
date: "2028-06-29"
excerpt: "Hermes and OpenClaw feel alive because they remember and compound. Most production agents feel frozen. Here is how to engineer that continuity into real enterprise agents on ADK 2.0 and the Gemini Enterprise Agent Platform, without reinventing the wheel, with a BI dashboard agent for durable facts and an on-call agent for durable procedures, plus how the same ideas map to LangGraph and the Anthropic and OpenAI SDKs."
tags: ["Agents", "Agentic AI", "LLMs", "Production ML", "MLOps", "RAG", "Knowledge Bases", "BigQuery", "Cloud Computing", "Data Engineering", "Best Practices"]
headerImage: "/blog/headers/card-catalog-header.jpg"
readingTimeMinutes: 29
slug: enterprise-agent-memory-continuity-adk-geap
estimatedWordCount: 6800
---

# The Agent That Remembers You: Continuity Engineering on ADK 2.0 and Gemini Enterprise

The two agents I wrote about over the last few weeks — [OpenClaw](https://juanlara18.github.io/portfolio/#/blog/openclaw-anatomy-viral-agent-platform) and [Hermes](https://juanlara18.github.io/portfolio/#/blog/hermes-self-improving-agent-persistent-memory) — share a quality that is hard to name until you have used them for a month. They feel *alive*. Not in any mystical sense. In a very concrete one: they remember. You told Hermes last Tuesday that your staging database lives behind a bastion host, and this Tuesday it just knows. OpenClaw watched you triage the same class of email three mornings running and, on the fourth, offered to do it. The agent you are talking to today is measurably more useful than the one you met, and it got that way without anyone shipping a new version.

Now hold that feeling next to the agent you most recently deployed to production. Mine was a perfectly competent analytics assistant. It answered the same question with the same fluency in June as it did in January. It also answered it with the same fluency for the CFO as for a summer intern, having learned precisely nothing about either in six months of daily use. It was, in the most literal sense, the same agent every single time — and it would stay that way until I redeployed a new one. Thousands of conversations flowed through it and evaporated.

That gap is the subject of this post. Not "how do I clone Hermes at work" — you do not want to, and I will spend a good part of this essay on *why* not. The interesting question is subtler. The hobbyist agents expose a real capability that the enterprise ones mostly lack: **continuity**. Memory that accrues, experience that compounds, a relationship that deepens. The question is how much of that you can and *should* engineer into a multi-user production agent — and it turns out that if you are building on Google's stack, you already have most of the parts. The work is not invention. It is **memory engineering**: deciding what to remember, at what scope, how it compounds, and how you keep one user's memory from poisoning another's.

I am going to make this concrete with one running example, carried the whole way through: a **business-intelligence agent** that builds dashboards from datasets in BigQuery, used by a handful of VPs who each care about very different numbers. By the end you should be able to see exactly which Google-managed primitive does which job, where the seams are, and where you have to write the interesting code yourself.

Let me start by being precise about the thing we are chasing, because "memory" is doing an enormous amount of unexamined work in most conversations about agents.

## A taxonomy of agent memory

When someone says an agent "has memory," they could mean any of at least four different mechanisms, and conflating them is how you end up building the wrong thing. Let me separate them along two axes: how long the information survives (ephemeral to durable), and what kind of thing it captures (content and facts, versus procedures and skills).

```mermaid
quadrantChart
    title Agent memory, what survives and what it captures
    x-axis Ephemeral --> Durable
    y-axis Facts and content --> Procedures and skills
    quadrant-1 Durable procedures
    quadrant-2 Ephemeral procedures
    quadrant-3 Ephemeral facts
    quadrant-4 Durable facts
    Session state: [0.18, 0.32]
    Temp state: [0.1, 0.45]
    Vertex Memory Bank: [0.82, 0.3]
    ADK artifacts: [0.78, 0.18]
    OpenClaw user notes: [0.7, 0.28]
    Hermes skill files: [0.85, 0.82]
    User scoped state: [0.6, 0.4]
```

The bottom-left quadrant is **working memory**: the current conversation. In ADK this is the `Session` — a `session_id`, an append-only list of `Event` objects (user messages, tool calls, model responses), and a mutable `state` dictionary the agent scribbles in as it works. It is precise, it is cheap, and it dies when the conversation ends unless you deliberately persist it. Everyone builds this by default; nobody confuses it with a relationship.

The bottom-right quadrant is **durable facts**: things worth remembering *about a user or a domain* across conversations. "This VP measures the business in weekly active seats, not monthly revenue." "The finance mart's canonical date column is `close_date`, not `created_at`." OpenClaw's "user notes" — vectorized snippets stored in Chroma or Milvus and retrieved by similarity — live here. So does Google's **Vertex AI Memory Bank**, which I will come back to. This is the quadrant that produces the feeling of *being known*.

The top-right quadrant is **durable procedures**: not facts but *know-how*. This is where Hermes made its bet — the `SKILL.md` file that captures "here is how I successfully migrated a schema, including the two things that went wrong." It is memory of *how to do something*, written down so it can be replayed and improved. Almost no enterprise agent has this, and it is the hardest and most interesting quadrant to reach responsibly.

The crucial thing every one of these shares — and I want to nail this down before we go further, because the marketing around both hobbyist agents smudges it — is that **none of them touch the model's weights**. Hermes is not fine-tuning itself at 3am. OpenClaw is not doing gradient descent on your inbox. "Self-improving" and "learns from you" describe an agent accumulating *external, inspectable state* — text, embeddings, files — that gets fed back into the context window at the right moment. That is a profoundly good thing for enterprise work, because it means the memory is auditable, deletable, and governable in a way that a fine-tuned weight delta never is. The entire discipline of memory engineering lives outside the model. Once you internalize that, the enterprise problem stops looking like ML research and starts looking like what it actually is: **data engineering with a language model in the loop**.

So the taxonomy gives us our shopping list. To make an agent that feels continuous, we need working memory (have it), durable facts about users (need it), durable artifacts they produce (need it), and — ambitiously — durable procedures (want it, carefully). Let us see what Google already hands us for each.

## What Google already solved, and what it leaves to you

Here is the temptation I want to talk you out of. You read the Hermes post, you get excited, and you start sketching a Postgres schema for a bespoke memory store, a vector index, a file service, a background job that summarizes conversations. Two months later you have rebuilt, badly, a system that ADK and the Gemini Enterprise Agent Platform (GEAP) already ship, and you have taken on the operational burden of running it. Don't. The wheel is built. Your job is to decide how to *drive*.

Let me lay out the parts, because knowing their exact shape is what lets you avoid reinventing them.

**Sessions and state scopes.** ADK's `Session` handles working memory. What most people miss is that the `state` dictionary is not flat — keys carry *scope prefixes* that decide how long a value lives and who sees it:

- A bare key like `state["draft_query"]` is **session-scoped**. It vanishes with the conversation.
- `state["user:preferred_granularity"]` is **user-scoped**. It follows one user across every session they ever have with this app.
- `state["app:fiscal_year_start"]` is **app-scoped**. It is shared across every user of the agent.
- `state["temp:raw_api_blob"]` is **temporary**. It is explicitly never persisted, even when everything else is.

That prefix convention is doing quiet, load-bearing work. It is, in miniature, the entire multi-tenant memory problem — *whose* memory is this? — solved at the key level. We will lean on it hard.

**Vertex AI Memory Bank.** This is the managed durable-facts store, and it is more clever than a vector database. You do not write memories to it directly; you hand it *completed sessions*, and a Gemini model reads the transcript and **extracts** what is worth keeping — the durable facts, distilled from the chatter. The relevant ADK surface is small:

```python
from google.adk.memory import VertexAiMemoryBankService

memory_service = VertexAiMemoryBankService(
    project="my-project",
    location="us-central1",
    agent_engine_id="1234567890",
)

# At the end of a conversation, ingest it. Gemini extracts the durable bits.
await memory_service.add_session_to_memory(session)

# Later, in another session, retrieve what is relevant to the current query.
response = await memory_service.search_memory(
    app_name="bi_agent",
    user_id="vp_ana",
    query="what revenue metric does this user care about",
)
# response.memories -> list[MemoryEntry], each a distilled fact
```

Note the `user_id` in `search_memory`. Memory Bank is namespaced by user out of the box. Ana's extracted facts are retrieved only for Ana. That single parameter is the difference between "an agent that knows its users" and "a data breach."

There are two sibling services worth knowing so you pick correctly: `VertexAiRagMemoryService` gives you classic vector-indexed retrieval over documents (the right tool when the durable knowledge is a *corpus*, not *conversation-derived facts*), and `InMemoryMemoryService` does keyword matching in process for local development. Same interface, three storage strategies. Choose by what your durable knowledge actually is.

**Artifacts.** Facts are not the only thing worth keeping. Agents *produce* things — a chart, a compiled report, a `.sql` file, a dashboard specification. In ADK these are **artifacts**: named, versioned binary blobs with a MIME type, stored through an `ArtifactService`. `InMemoryArtifactService` for dev, `GcsArtifactService` for production (it writes to a Cloud Storage bucket). The API is deliberately filesystem-shaped:

```python
from google.genai import types

async def save_dashboard(spec_json: bytes, tool_context) -> dict:
    artifact = types.Part.from_bytes(
        data=spec_json,
        mime_type="application/json",
    )
    # Plain filename -> scoped to THIS session.
    version = await tool_context.save_artifact("dashboard.json", artifact)
    return {"saved_version": version}
```

And here is the detail that makes artifacts a memory primitive and not just a file dump: the **same `user:` prefix convention** applies to filenames. `save_artifact("dashboard.json", ...)` is scoped to the current session and disappears with it. `save_artifact("user:latest_dashboard.json", ...)` follows the user across every session. One character decides whether the VP's dashboard is a throwaway or a durable possession.

**Agent Runtime.** Finally, the thing that runs all of this in production. GEAP's Agent Runtime is a managed environment that deploys your ADK agent and, critically, *provisions the Sessions, Memory Bank, and Artifact services for you*, wires in an agent identity for IAM, and adds tracing. It gives you sub-second cold starts, per-instance scaling controls, and — the feature that quietly matters most for continuity — support for **long-running agents that stay resident for days**. An agent that can live for days is an agent that can hold a working context across a VP's whole quarter-close week, not just a single chat.

```python
from vertexai import agent_engines
from vertexai import types as ve_types   # note: NOT google.genai.types

remote_agent = agent_engines.create(
    agent=root_agent,
    config={
        "requirements": ["google-cloud-aiplatform[agent_engines,adk]", "google-adk>=2.0"],
        "staging_bucket": "gs://my-agent-staging",
        # Give the agent its own identity so IAM, not the caller, bounds its reach.
        "identity_type": ve_types.IdentityType.AGENT_IDENTITY,
    },
)
```

That is the whole deploy call. Scaling and resource controls — minimum instances (0 to 10, keep at least one warm for latency), maximum instances (1 to 1000), CPU and memory limits, and container concurrency — are Agent Runtime resource settings you configure on the runtime rather than kwargs on `create`, and long-running agents are enabled at the runtime level too. A precision note worth internalizing, because it is exactly the kind of thing that rots: the *content* types (`Part`, `Content`) come from the Google Gen AI SDK, `from google.genai import types`, while *deployment* types like `IdentityType` still live under `from vertexai import types`. Two modules named `types`, two different jobs. Keep them straight.

Put the parts side by side and the shape of the work becomes clear. Google gives you working memory, durable-fact memory, artifact memory, and a runtime that hosts all three with identity and isolation. What Google does *not* do — what it cannot do, because it is domain-specific judgment — is decide **what your agent should remember, at what scope, and when**. That decision is the entire craft.

### You are not locked into ADK

Before we build, a word so this does not read as an advertisement for one vendor. The four needs — working memory, durable facts, durable procedures and outputs, and a governed way to change behavior — are universal. Every serious agent framework has grown an answer to each. What differs is how much is *managed* for you versus how much you *assemble*.

| Need | ADK and GEAP | LangGraph | Anthropic SDK | OpenAI Agents SDK |
| --- | --- | --- | --- | --- |
| Working memory | `Session` and `state` | checkpointer, thread scoped | messages plus context editing | `Session`, SQLite or Conversations |
| Durable facts across sessions | Memory Bank, a model extracts them | `store`, plus a reflection step or LangMem | memory tool, the agent writes files | assemble it, vector store or a memory service |
| Scope and isolation | `user:` `app:` `temp:` prefixes | store namespace tuples, like a path | your filesystem layout | your own keying |
| Durable procedures and outputs | Artifact service, versioned | `store` or external storage | memory files | files and containers |
| Human approval gate | ADK 2.0 pause and resume | `interrupt()` | your own loop | your own loop |

The columns are not interchangeable, and the differences are instructive rather than cosmetic. LangGraph makes the *graph* the first-class object and hangs memory off it as a `store` namespaced by tuples like `("users", "ana", "facts")` — which is why its `interrupt()` is the cleanest human-in-the-loop model in the field. Anthropic hands the agent a memory *directory* and lets it decide what to write, the closest thing to Hermes in a mainstream SDK. OpenAI gives you excellent working-memory sessions and leaves durable cross-user memory for you to build. ADK's distinctive bet is that inside an *enterprise* the extraction, the versioning, the isolation, and the identity should be managed and audited rather than hand-rolled. Read the rest of this post through that lens: the primitives below are Google's, but the *decisions* transfer to whichever column you live in.

Let us make it, for a real agent.

## Worked example A: a BI agent that builds dashboards

The agent I keep coming back to, because it is the one my actual job keeps demanding, is a BI assistant. A VP types "show me seat expansion in the enterprise segment this quarter versus last," and a dashboard appears. Under the hood this is less exotic than it sounds, because ADK ships a `BigQueryToolset` that does the heavy lifting.

```python
import google.auth
from google.adk.agents import Agent
from google.adk.tools.bigquery import BigQueryToolset, BigQueryCredentialsConfig

credentials, _ = google.auth.default()
bq_toolset = BigQueryToolset(
    credentials_config=BigQueryCredentialsConfig(credentials=credentials),
)

bi_agent = Agent(
    model="gemini-3.5-flash",
    name="bi_agent",
    instruction=(
        "You help executives explore company data in BigQuery and assemble "
        "dashboards. Discover the right tables before you query. Prefer the "
        "user's known metric definitions when they exist."
    ),
    tools=[bq_toolset],
)
```

That `bq_toolset` is not one tool but a suite, and the specific members matter for a BI use case, so let me name the ones that earn their place:

- `search_catalog` — Dataplex-powered semantic search over your data catalog. The VP says "seat expansion"; this is what finds the `fct_subscription_seats` table without the VP knowing it exists. This is the single most underrated tool in the set, because in a real warehouse the hard part is never the SQL, it is *finding the right table among four thousand*.
- `get_table_info` / `list_table_ids` — schema discovery, so the model writes correct column names instead of hallucinating them.
- `execute_sql` — runs the query the model composes.
- `ask_data_insights` — a natural-language-to-answer path for when you want a number, not a query.
- `forecast` — wraps BigQuery ML time-series forecasting. "Project seat growth to year-end" becomes a real statistical forecast, not the model guessing.
- `detect_anomalies` and `analyze_contribution` — the tools that turn a dashboard from decoration into insight. Contribution analysis in particular ("*what drove* the seat jump?") is exactly the follow-up question a VP asks second.

So far this is a competent, *stateless* BI agent. It would answer identically for everyone, forever. Now we make it produce something durable. When the agent finishes composing a view, it should not just stream chart JSON into the chat and forget it. It should save a **dashboard artifact**:

```python
from google.genai import types

async def publish_dashboard(
    title: str,
    spec: dict,          # a Vega-Lite / Looker-style spec the model built
    tool_context,
) -> dict:
    """Persist the assembled dashboard so the user can return to it."""
    blob = json.dumps({"title": title, "spec": spec}).encode("utf-8")
    part = types.Part.from_bytes(data=blob, mime_type="application/json")

    # user: prefix -> this dashboard belongs to the VP across all sessions.
    filename = f"user:dashboard::{slugify(title)}.json"
    version = await tool_context.save_artifact(filename, part)

    # Leave a breadcrumb in user-scoped state so the agent can list them later.
    boards = tool_context.state.get("user:dashboards", [])
    boards.append({"title": title, "file": filename, "version": version})
    tool_context.state["user:dashboards"] = boards

    return {"status": "published", "file": filename, "version": version}
```

Two design choices in that small function are the whole point. First, the `user:` prefix on the artifact name means the dashboard is not a message that scrolls away — it is a durable object the VP owns, retrievable next week in a brand-new conversation. Second, I mirror a lightweight index into `user:dashboards` state, so the agent can answer "what dashboards have I built?" without scanning storage. The `ArtifactService` is versioned automatically, so when the VP says "update my seat dashboard with October," `save_artifact` returns version 4 and the prior three are still there if finance needs to audit what changed.

Here is the architecture assembled — the agent in Agent Runtime, reaching into BigQuery for data and into the managed memory and artifact services for continuity.

```mermaid
flowchart TD
    VP[VP asks a question] --> RT[Agent Runtime on GEAP]
    RT --> AG[ADK bi_agent]
    AG -->|search_catalog, execute_sql, forecast| BQ[(BigQuery warehouse)]
    AG -->|save user dashboard| ART[Artifact Service]
    ART --> GCS[(Cloud Storage bucket)]
    AG -->|read known metrics| MEM[Vertex Memory Bank]
    AG -->|user and app scoped keys| ST[Session state]
    RT -->|end of conversation| MEM
    classDef g fill:#e8f0fe,stroke:#4285f4;
    class BQ,GCS,MEM g;
```

This agent is now genuinely useful. It is not yet continuous. Answer the same VP tomorrow and it will re-discover her tables, re-learn her definitions, and re-derive that she always wants the enterprise segment split out. The dashboards persist, but the *understanding* does not. That is the second half of the example, and it is where the interesting engineering lives.

## Worked example B: making it feel like *her* agent

Ana is a VP of Sales. She has talked to the BI agent maybe forty times. Every single time she has, at some point, corrected it in the same way: "seats, not revenue — I run the number on weekly active seats." A stateless agent makes her do this on interaction forty-one. A continuous agent should have learned it by interaction three.

The mechanism is Memory Bank, and the discipline is knowing *what* to feed it and *when* to read it back. Let me walk the full loop of a single conversation, then show it as a sequence.

At the **start** of Ana's turn, before the model plans anything, we want her durable facts in context. ADK gives you two documented ways to do this. The blunt, reliable one is the `preload_memory` tool: drop it into the agent's tool list and ADK runs a memory search at the top of each turn and injects the results automatically. The surgical one is to call `search_memory` yourself from *inside a tool* via the `ToolContext`, so you control the query and how the results are framed:

```python
from google.adk.tools import preload_memory

# Option 1, automatic: let ADK preload relevant memories every turn.
bi_agent = Agent(
    model="gemini-3.5-flash",
    name="bi_agent",
    tools=[bq_toolset, preload_memory],
    instruction="...prefer the user's known metric definitions when they exist...",
)

# Option 2, surgical: a tool that pulls this user's conventions on demand.
async def recall_user_conventions(tool_context) -> dict:
    """Load what we durably know about this specific user before we query."""
    resp = await tool_context.search_memory(
        "this user's preferred metrics, segments, and reporting conventions"
    )
    facts = [m.content.parts[0].text for m in resp.memories]
    # temp: prefix -> re-fetched each turn, so never persist it.
    tool_context.state["temp:user_facts"] = facts
    return {"known_conventions": facts}
```

Notice the `temp:` prefix on where I stash the retrieved facts: they are re-fetched every turn, so there is no reason to persist them and every reason not to. Either way, the model begins its work already knowing that Ana means seats.

During the conversation, ordinary tool calls happen — `search_catalog`, `execute_sql`, `publish_dashboard`. Ana corrects something, refines a filter, approves a chart. All of that lands in the session's event log.

At the **end** of the conversation, an `after_agent_callback` calls `add_session_to_memory()`. This is the step that makes tomorrow better than today:

```python
async def remember_this_session(callback_context) -> None:
    # Gemini reads the transcript and extracts the durable facts, filed by user_id.
    await callback_context.add_session_to_memory()

bi_agent = Agent(
    model="gemini-3.5-flash",
    name="bi_agent",
    tools=[bq_toolset, preload_memory],
    after_agent_callback=remember_this_session,
    instruction="...",
)
```

When you deploy this on the ADK Agent Runtime template, `VertexAiMemoryBankService` is the default backing store, so that one callback is the whole write path. Gemini extracts the durable residue — *"Ana measures the business in weekly active seats"*, *"Ana's default view excludes the SMB segment"* — and files it under her `user_id`. Not the raw transcript. The *distilled facts*. Next week, `search_memory` surfaces them, and Ana never has to say "seats, not revenue" again.

*How memory gets **written** is where the frameworks diverge most visibly, and it is worth pausing on because it foreshadows the next example. ADK extracts facts for you with a model. In LangGraph you add the extraction yourself — a reflection node, or the LangMem helper — and write the result into the `store`. Anthropic inverts the whole thing: it hands the agent a memory directory and lets it decide what to persist, the same instinct that drives Hermes's self-written `SKILL.md` files. None of these is simply "correct." Managed extraction is safer and less flexible; agent-authored memory is more flexible and more dangerous. In an enterprise I want the safe default for facts — and, carefully gated, the flexible one for procedures.*

```mermaid
sequenceDiagram
    participant Ana as VP Ana
    participant RT as Agent Runtime
    participant Agent as bi_agent
    participant Mem as Memory Bank
    participant Art as Artifact Service

    Ana->>RT: New session, quarter close
    RT->>Mem: search_memory(user_id=ana)
    Mem-->>Agent: Ana measures weekly active seats
    Note over Agent: Starts already knowing her conventions
    Ana->>Agent: Seat expansion, enterprise segment
    Agent->>Art: save user dashboard v5
    Ana->>Agent: Correction, exclude trials
    RT->>Mem: add_session_to_memory at end
    Note over Mem: Gemini extracts, Ana excludes trials
```

The result is an agent that, from Ana's chair, is *learning her*. And — this is the part the hobbyist agents cannot do and the enterprise context demands — it is doing so inside hard walls. When the CFO opens his own session, `search_memory(user_id="cfo_marco")` returns *his* facts. Ana's conventions never leak into Marco's context, because the retrieval is namespaced by identity and Agent Runtime binds that identity through IAM. The `user:` scope on artifacts and state does the same for dashboards and preferences. Multi-tenancy is not a feature you add later; it is the property that lets you offer continuity to a thousand VPs without offering each of them a window into the others.

This is precisely why "just run Hermes at work" is the wrong instinct. Hermes's beautiful single `~/.hermes/` memory directory assumes one trusted principal. Point it at an organization and that assumption becomes the vulnerability. The enterprise version of continuity is not *less* engineered than the hobbyist version — it is *more*, because it has to be continuous **and** isolated at the same time.

### The gotcha nobody warns you about: memory quality and drift

Before I move on, a warning that cost me real debugging time. Memory Bank extracts facts with a model, which means it can extract *wrong* facts, or over-general ones. One frustrated session where Ana said "no, not that segment, ugh, revenue is fine for this one" got distilled into "Ana wants revenue" — the exact opposite of her durable preference — and polluted her next three sessions. Durable memory is durable bugs. Treat what goes into Memory Bank with the same care you treat a write to your production database, because that is what it is. In practice this means: prefer to summarize into memory *deliberately* at well-defined moments rather than dumping every session, give users a way to see and delete what the agent believes about them (Memory Bank supports deletion — expose it), and periodically sample extracted memories in evaluation. An agent that remembers is an agent that can remember wrong, confidently, forever.

## The other quadrant: an agent that accumulates know-how

The BI agent lives almost entirely in one corner of the taxonomy: durable *facts*. Ana's metric definitions, the canonical date column, the segment she excludes — content, not procedure. That is the easy, safe quadrant, and Memory Bank owns it. But look back at the opening diagram; there is a whole region we have not touched. The top-right: durable *procedures*. Know-how. The quadrant where Hermes made its home with self-written `SKILL.md` files. Reaching it responsibly in an enterprise is the more interesting problem, and it takes a different agent to see it clearly.

So take a second example: an **on-call agent** that helps engineers work incidents. It can read logs, query metrics, page a human, and roll back a deploy. On the surface it is just another tool-using agent. What makes it interesting is what should survive an incident. When a sev-2 is finally cleared at 3am, the valuable residue is not a *fact* — it is a *procedure*: "when the checkout queue backs up, it is almost always the stuck-consumer bug; here is the exact sequence that cleared it, and here are the two dead ends that wasted twenty minutes." That is a runbook, and it is precisely a Hermes `SKILL.md` in enterprise clothing.

Here is the shape of capturing it. Notice that, unlike Ana's facts, we do *not* let a background extractor guess at the procedure — the engineer authored it deliberately, at the moment of resolution, which is exactly the agent-authored-memory pattern from the aside above:

```python
async def capture_runbook(
    symptom: str,
    procedure: list[str],
    dead_ends: list[str],   # the time-wasters, like a SKILL.md pitfalls block
    tool_context,
) -> dict:
    """At incident resolution, persist the procedure that actually worked."""
    runbook = {
        "symptom": symptom,
        "procedure": procedure,
        "dead_ends": dead_ends,
        "authored_by": tool_context.state.get("user:engineer_id"),
    }
    blob = json.dumps(runbook, indent=2).encode("utf-8")
    part = types.Part.from_bytes(data=blob, mime_type="application/json")

    # user: scope -> the engineer owns their runbook immediately, versioned.
    version = await tool_context.save_artifact(
        f"user:runbook::{slugify(symptom)}.json", part
    )
    # But its VALUE is to the whole rotation. Queue it for promotion.
    # The agent may NOT activate a fleet-wide procedure on its own.
    proposals = tool_context.state.get("app:runbook_proposals", [])
    proposals.append({"symptom": symptom, "version": version})
    tool_context.state["app:runbook_proposals"] = proposals
    return {"status": "captured", "queued_for_review": True, "version": version}
```

Two moves make this enterprise-grade rather than Hermes-grade. First, the procedure becomes a **user-scoped artifact** the instant it is written — versioned, auditable, owned by a named engineer. Second, and this is the entire difference between a hobbyist agent and a production one, the runbook is *not* self-activated across the fleet. It lands in an `app:`-scoped **proposal queue**. The agent can accumulate know-how all night; it cannot unilaterally change how the on-call rotation behaves. Who promotes a proposal into a live, fleet-wide procedure, and how — that is the next section, and it is where an enterprise finally earns the continuity that Hermes gets for free.

## Making the *fleet* improve, not just the individual

Everything so far buys per-user continuity: each VP gets an agent that learns *them*, and each engineer accumulates their own runbooks. But re-read the complaint I opened with. It had two halves. One was "it does not know me" — solved. The other was "it does not get better unless I redeploy it." That is a different problem, and it is about the agent as a *product* serving everyone, not the agent as a *companion* serving one person.

Here is the distinction that unlocks it. Per-user memory improves the *individual experience* but, by design, is walled off — Ana's facts must not change Marco's agent. So per-user memory *cannot* be the mechanism by which the product improves for everyone. For that you need to learn across users, at the `app:` scope, and you need to do it deliberately, because aggregating across users is exactly where privacy and governance bite.

The raw material is already being produced. ADK 2.0's **BigQuery Agent Analytics** plugin streams every interaction — every LLM call, tool call, latency, token count, and outcome — into BigQuery views (`v_llm_request`, `v_tool_completed`, and friends) with essentially one line of configuration. Your agent is, without any extra work, generating a rich event log of how ten thousand conversations actually went. That log is a goldmine for *product-level* improvement:

```sql
-- Which tables do people ask for that our catalog search keeps missing?
SELECT
  JSON_VALUE(payload, '$.query') AS user_query,
  COUNT(*) AS attempts,
  COUNTIF(status = 'error') AS failures
FROM `bi_agent_analytics.v_tool_completed`
WHERE tool_name = 'search_catalog'
GROUP BY user_query
HAVING failures > 0
ORDER BY attempts DESC
LIMIT 50;
```

Run that and you are not guessing at what to improve — you are reading it. The failures cluster: a whole segment of the business uses a term your catalog does not map to a table. The fix is not to redeploy a smarter model. It is to write one `app:`-scoped fact — a synonym mapping, a canonical-metric glossary — that *every* user's agent now benefits from. This is the fleet analogue of a Hermes skill: a piece of durable know-how, learned from experience, that raises the floor for everyone. The difference is the governance gate. A Hermes-style agent writes its own skills and runs them. An enterprise agent should *propose* the improvement and let a human approve it.

And here ADK 2.0 hands you exactly the right tool, almost as if it were designed for this: the **pause/resume human-in-the-loop** capability. The graph-based Workflow Runtime can pause an execution, surface a proposed change through the ADK Web UI, wait for a human to approve or reject it, and then resume. The candidate can be either kind of durable knowledge we have met — a synonym mapping mined from the BI agent's failures, or a runbook the on-call agent captured and queued — and the gate is identical. So the self-improvement loop for the fleet looks like this:

```mermaid
stateDiagram-v2
    [*] --> Observing
    Observing --> Mining: analytics in BigQuery
    Mining --> Proposing: candidate app level fact or tool
    Proposing --> Review: pause for human approval
    Review --> Promoting: approved
    Review --> Discarding: rejected
    Promoting --> Observing: app scope updated for all users
    Discarding --> Observing
```

*If that interruptible loop feels familiar from elsewhere, it should: LangGraph's `interrupt()` pioneered the pattern, persisting graph state to a database so an agent can wait minutes, hours, or days for a human without holding compute. Anthropic and OpenAI leave the approval gate for you to build in your own loop. ADK 2.0's contribution is not the idea but the packaging — the same pause-and-resume, managed inside the enterprise runtime with the identity and audit trail already attached.*

That loop is the honest, enterprise-appropriate version of "self-improving." It compounds like Hermes — experience becomes durable capability — but every increment passes a human gate and lands in a governed, versioned, auditable scope. You escape "it only improves when I redeploy" not by making the model rewrite itself unsupervised, but by turning the *organization's* accumulated experience into `app:`-scoped knowledge, continuously, with a person in the loop. The agent gets better every week. Nobody ships a new model to make that happen.

## The frontier is opening

I want to end by widening the lens, because the ground here is moving fast and it would be a disservice to present the current Google stack as the finished state of the art.

Two forces are pulling agent memory in different directions. One is the **managed-and-governed** direction this whole post has lived in: memory as an external, inspectable, access-controlled data layer, with a human in the loop for anything that changes behavior for many users. This is where enterprise reality lives, and it will only get more capable.

The other is the **local-and-autonomous** direction that Hermes and NVIDIA are pushing. Hermes running on a DGX Spark with a resident Qwen mixture-of-experts model, rewriting its own skills in seconds, points at a world where the loop between *experience* and *capability* closes without a round trip to a data center or a human approver. NVIDIA's whole bet — unified memory big enough to keep a serious model plus its accumulated context resident, inference fast enough that "refine my own procedure" is a sub-minute operation — is a bet that the compounding loop wants to run *hot and close to the metal*. It is genuinely exciting, and it is genuinely dangerous, and the interesting engineering question of the next two years is where the boundary between those two worlds should sit. My strong suspicion is that the enterprise answer is a hybrid: fast local memory for the *individual's* working continuity, governed cloud memory for anything that touches *other people*. The `user:` versus `app:` distinction we have been leaning on all post may turn out to be the same line, drawn in hardware.

But you do not have to wait for any of that to build something that feels alive. The whole argument of this post is that the parts are already on the shelf. Sessions for working memory. Memory Bank for durable facts, namespaced by user. Artifacts for the things your agent makes, owned by the people it makes them for. Analytics and `app:` scope and human-gated promotion for the slow compounding of the whole fleet. None of it is model training. All of it is memory engineering — the deliberate, auditable, scope-aware design of what an agent is allowed to remember. Do that work, and the agent your VPs talk to in December will be visibly wiser than the one they met in June, and it will have gotten that way the same way good colleagues do: by paying attention, and not forgetting.

## Prerequisites and gotchas

If you want to build the agent in this post, here is the honest checklist and the places I stubbed my toes.

**Prerequisites.** A Google Cloud project with Vertex AI and BigQuery enabled; ADK 2.0 (`google-adk>=2.0`); an Agent Engine instance to back Memory Bank and to host the runtime; a GCS bucket for `GcsArtifactService`; and IAM roles wired so the agent's service identity can read the specific BigQuery datasets you intend to expose and nothing more.

**Gotchas, learned the hard way.**

- **Scope every key on purpose.** The difference between `dashboard.json` and `user:dashboard.json` is one string and a completely different product. Decide scope at design time, in writing, for every piece of state and every artifact. An un-prefixed key that should have been `user:` is a feature that silently does not work; an un-prefixed key that should have been `temp:` is a slow storage leak.
- **Memory Bank stores what a model decided, not what the user said.** Sample extracted memories in your evals. Give users a delete button. Assume it will sometimes be wrong and design so that wrong is recoverable.
- **`add_session_to_memory` is a write to production.** Do not call it on every trivial session reflexively. Call it when a session contains something worth keeping. Extraction costs a model call and, more importantly, extraction *pollutes* if you feed it noise.
- **BigQuery permissions are the real security boundary.** The agent is exactly as safe as the IAM grants on its identity. `search_catalog` will happily surface a table the VP should never see if the agent's identity can read it. Scope dataset access to the agent's role, not to the humans behind it.
- **Long-running agents hold state you must reason about.** An agent resident for days is wonderful for continuity and a liability if its in-memory working state drifts. Persist what matters through the managed services; treat the resident process as a cache, not a source of truth.
- **Use the current SDKs, and know which is which.** The generative modules of the old Vertex AI SDK (`vertexai.generative_models` and friends) were deprecated in June 2025 and *removed* on June 24, 2026. Content types now come from the Google Gen AI SDK (`from google.genai import types`). Agent *deployment* and identity types still live under `from vertexai import agent_engines` / `from vertexai import types`. Copy-pasting a 2024 tutorial is the fastest way to write code that no longer imports.
- **Test the isolation, not just the happy path.** Write an explicit test that runs a query as user A, then user B, and asserts that none of A's memories, artifacts, or state keys are visible to B. Multi-tenant leakage is the failure that will not show up in a demo and will end your project.

## Going Deeper

**Books:**
- Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly.
  - The best available treatment of ML systems as *data and infrastructure* problems; the mental model that turns "agent memory" into "a data layer you engineer."
- Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly.
  - Not about agents at all, and exactly the right book for reasoning about durability, isolation, and versioning of the memory stores in this post.
- Bommasani, R. et al. (2021). *On the Opportunities and Risks of Foundation Models.* Stanford CRFM.
  - Useful framing for why capability that lives *outside* the weights (memory, tools, retrieval) is where most practical agent progress happens.

**Online Resources:**
- [Gemini Enterprise Agent Platform documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform) — the canonical reference for Agent Runtime, deployment, and the managed memory services.
- [ADK documentation: Sessions, State, and Memory](https://adk.dev/sessions/memory/) — exact API surfaces for `MemoryService`, `Session`, and state scoping.
- [ADK documentation: Artifacts](https://adk.dev/artifacts/) — the artifact service, versioning, and the `user:` scoping convention.
- [Introducing BigQuery Agent Analytics](https://cloud.google.com/blog/products/data-analytics/introducing-bigquery-agent-analytics) — how to stream agent telemetry into BigQuery for the fleet-improvement loop.
- [LangGraph persistence: checkpointers and long-term memory store](https://docs.langchain.com/oss/python/langgraph/persistence) — the same working-memory-versus-durable-memory split, with namespaced stores and `interrupt()` for human-in-the-loop.
- [Anthropic memory tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) — the agent-authored, file-based memory model that most resembles Hermes.
- [OpenAI Agents SDK: Sessions](https://openai.github.io/openai-agents-python/sessions/) — working-memory sessions over the Responses and Conversations APIs, and where you must add durable memory yourself.

**Videos:**
- [Google I/O 2026 developer keynote](https://www.youtube.com/results?search_query=google+io+2026+developer+keynote) — the ADK 2.0 and Gemini Enterprise Agent Platform announcements in context.
- [Google Cloud Tech: agent memory and state with ADK](https://www.youtube.com/results?search_query=ADK+agent+memory+state+google+cloud) — walkthroughs of Memory Bank and session state from the team that built them.

**Academic Papers:**
- Packer, C. et al. (2023). ["MemGPT: Towards LLMs as Operating Systems."](https://arxiv.org/abs/2310.08560) *arXiv:2310.08560.*
  - The clearest articulation of hierarchical, paged memory for agents; the intellectual ancestor of much of what Memory Bank automates.
- Park, J. S. et al. (2023). ["Generative Agents: Interactive Simulacra of Human Behavior."](https://arxiv.org/abs/2304.03442) *arXiv:2304.03442.*
  - The memory-stream-and-reflection architecture that reframed agent memory as retrieval plus periodic distillation, which is exactly what `add_session_to_memory` implements.

**Questions to Explore:**
- If per-user memory improves the individual and `app:`-scoped memory improves the fleet, what is the right mechanism for *team*-scoped memory — a VP's whole org sharing conventions without leaking to another org?
- When Memory Bank and a fine-tuned model disagree about a user's preference, which should win, and how would the agent even detect the conflict?
- Is a human-approval gate on fleet improvement a permanent feature of enterprise agents, or a transitional one we will look back on the way we look back on manual database migrations?
- Where should the boundary between fast local memory and governed cloud memory actually sit — and is that an engineering decision, a regulatory one, or both?
- If an agent can be resident for days, at what point does its working context become a record the organization is legally obliged to retain, disclose, or delete?
