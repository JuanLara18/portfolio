---
title: "ADK, Advanced: The Evolution of Agent Engineering"
date: "2027-12-09"
slug: adk-advanced-evolution-of-agent-engineering
category: "field-notes"
headerImage: "/blog/headers/vintage-aircraft-header.jpg"
readingTimeMinutes: 28
estimatedWordCount: 7000
excerpt: "The state of the art for building agents in 2026 is Google's ADK. But the fastest way to understand it deeply is not a tutorial. It is the history. This post narrates the year by year evolution of how we thought about building an agent with an LLM, and shows how every complexity that accumulated along the way is resolved, simplified, or quietly absorbed by ADK, including its limits."
tags: ["Agents", "Agentic AI", "LLMs", "AI Engineering", "LangChain", "Multi-Agent", "Orchestration", "Agent Engineering", "Tool Use", "GCP", "LLM Frameworks"]
---

# ADK, Advanced: The Evolution of Agent Engineering

Every framework is a fossil record. If you slice through ADK the way a geologist slices through rock, you find layers, and each layer is a problem that an earlier generation of agent builders hit hard enough to leave a mark. The `SessionService` interface is the scar tissue from the year we all pickled conversation history to disk. The `MemoryService` is the year we discovered that stuffing everything into the prompt does not scale. The `tool_trajectory_avg_score` is the year an agent we shipped produced the right answer through an insane and expensive path, and we had no way to even notice. Workflow agents are the year we admitted that not every decision should be made by a language model.

I have written a long, careful how-to on ADK before — the [four-pillar mental model, the runnable code for every abstraction, the end-to-end finance assistant](https://juanlara18.github.io/portfolio/#/blog/google-adk-agent-development-deep-dive). This post is deliberately not that. If you want to learn the API, read that one first; I will lean on it throughout and try not to repeat it. This post is for the engineer who already knows roughly what ADK does and wants to understand *why it is shaped the way it is* — which turns out to be the same thing as understanding the last six years of agent engineering.

The thesis is simple. The current state of the art for building production agents is Google's Agent Development Kit. But ADK did not spring from nothing. It is the consolidation of a decade-compressed-into-six-years accumulation of hard-won intuitions, each of which solved a problem and created a new one. The most honest way to teach ADK deeply, and the only way to see its limits clearly, is to walk that history forward and watch each accumulated complexity get resolved, simplified, or quietly absorbed. By the end you will understand ADK better than a tutorial could teach you, and you will know exactly where it still leaks.

A note on prerequisites. This is an advanced post. I assume you have built at least one agent, that you know what a tool call and a ReAct loop are, and that you have at least skimmed the companion pieces on [agent architectures](https://juanlara18.github.io/portfolio/#/blog/agent-architectures-productive-patterns), [production agent patterns](https://juanlara18.github.io/portfolio/#/blog/production-llm-agents-patterns), and [LangGraph orchestration](https://juanlara18.github.io/portfolio/#/blog/langgraph-multi-agent-workflows). If those words are unfamiliar, start there. Here I move fast.

---

## The Year by Year Evolution of Agent Intuition

Let us draw the timeline first, then walk it.

```mermaid
timeline
    title The Evolution of Agent Intuition
    2020 to 2021 : Prompt and completion : Brittle output parsing : The model as a one shot oracle
    2022 : Chain of thought reasoning : Few shot exemplars : Let the model think before it answers
    2022 to 2023 : ReAct reason and act : The agent loop and tool use : LangChain and the abstraction explosion
    2023 : Native function calling : RAG bolted on for knowledge : Memory as prompt stuffing
    2023 to 2024 : Multi agent systems : Orchestration graphs and state machines : State and observability become first class
    2024 to 2025 : The production agent era : Sessions and tiered memory : Registries guardrails tracing eval and interop with MCP and A2A
    2025 to 2026 : ADK as the consolidation : A batteries included framework : Model and deployment aware runtime
```

### 2020 to 2021: the model as oracle

In the GPT-3 era the mental model for using a large language model was a vending machine. You put a prompt in, a completion came out, and your job was to write the prompt well enough that the completion was usable, then to parse that completion with regular expressions and string slicing. There was no loop. There was no state beyond the few thousand tokens you could fit in the context. There was certainly no concept of the model *taking an action*. If you wanted the model to do arithmetic, you asked it nicely and prayed.

The defining pain of this era was *brittle parsing*. You would coax the model into emitting something that looked like JSON, then watch it emit a trailing comma, a markdown code fence, an apology, or a hallucinated extra field, and your downstream code would explode. Half of all "prompt engineering" in 2021 was really *output engineering*: heroics to make a probabilistic text stream behave like a typed function return. Hold that thought. Everything ADK does with tool schemas and typed function tools is a direct descendant of this wound.

### 2022: let the model reason

Two ideas changed the shape of the field in 2022, and they are worth naming precisely because their authorship matters and the internet routinely garbles it. The first was *chain-of-thought prompting*, from Wei et al., which showed that simply prompting a model to produce intermediate reasoning steps before its final answer dramatically improved performance on arithmetic and commonsense tasks. The second, and the more consequential for agents, was *few-shot in-context exemplars* as a reliable steering mechanism.

The intuition that crystallized here is the one every agent rests on: a language model is not just a text completer, it is a *reasoner you can interrogate step by step*. If you let it externalize its thinking, it makes better decisions. That sounds obvious in 2026. In 2022 it was a small revolution, because it meant the model could be trusted to decide *what to do next* and not merely *what to say*. The door to agency cracked open.

### 2022 to 2023: ReAct, the loop, and the abstraction explosion

The door was kicked fully open by a single paper. In October 2022, Yao et al. published *ReAct: Synergizing Reasoning and Acting in Language Models* (arXiv:2210.03629, later ICLR 2023). ReAct interleaved reasoning traces with actions: the model produces a thought, then an action, observes the result, and decides again. Think, act, observe, repeat. This is the structural ancestor of every agent loop running in production today, and I have written about [why the thought track is what gives the loop memory of intent](https://juanlara18.github.io/portfolio/#/blog/production-llm-agents-patterns) across iterations.

What is delightful, and historically precise, is the timing of what came next. Eighteen days after the ReAct preprint went up, on 25 October 2022, Harrison Chase pushed the first release of LangChain (`0.0.1`) to PyPI; the ReAct chain itself was merged into the repository two days after that. The paper and the first framework to operationalize it were separated by less than three weeks. That tells you how starved the field was for abstraction.

And then the abstraction *exploded*. LangChain grew, in about a year, from a thin wrapper around prompt templates into a sprawling ecosystem of chains, agents, memory classes, document loaders, retrievers, output parsers, and callbacks. This was both the most productive and the most chaotic period in agent engineering. Everybody could suddenly build an agent in ten lines. Nobody could debug one. The abstractions leaked, the names changed between minor versions, and the gap between a demo that worked once and a system that worked reliably became the defining engineering problem of the field. ADK's relentless minimalism — four core concepts, not forty — is a direct reaction to this era.

### 2023: function calling, RAG, and memory as a hack

2023 brought three bolt-ons that each solved a problem and each left a residue.

First, *native function calling*. When OpenAI shipped function calling in mid-2023, and the other labs followed, the brittle-parsing wound from 2021 finally got real stitches. Instead of begging the model for JSON and parsing it by hand, you declared a schema and the model emitted a structured, validated tool call. Tool use stopped being a hack and became a first-class capability of the model. This is why, in ADK, a plain typed Python function *is* a tool: the framework can lean on native tool-calling to do the heavy lifting.

Second, *retrieval-augmented generation*. The context window was small and the model's knowledge was frozen at training time, so we bolted on a retriever: embed the corpus, search it at query time, stuff the top-k chunks into the prompt. RAG worked, and it is still everywhere, but in 2023 it was almost always glued onto an agent rather than designed into it. The seam shows. (For the framework-level view of retrieval, see the [LlamaIndex versus LangChain breakdown](https://juanlara18.github.io/portfolio/#/blog/llamaindex-langchain-llm-frameworks).)

Third, and most painfully, *memory as prompt stuffing*. The first answer to "how does the agent remember the conversation?" was: keep a Python list of every turn and prepend it to every prompt. This works until it does not. It does not when the list outgrows the context window. It does not when you restart the process and lose everything. It does not when the same user comes back tomorrow and the agent has total amnesia. Memory in 2023 was a `list` that you pickled, and the entire `Session` / `State` / `Memory` architecture in ADK exists to retire that `list` with dignity.

### 2023 to 2024: multi-agent, graphs, and the realization that agents need infrastructure

By late 2023, single agents were hitting a hard ceiling. Pile forty tools onto one agent and its attention smears; the model picks the wrong tool, hallucinates arguments, and loses the plot. The field's answer was to *decompose*: supervisors and workers, specialists with narrow tool sets, agents that hand off to other agents. I have written at length about [why this works at the level of the attention matrix](https://juanlara18.github.io/portfolio/#/blog/agent-architectures-productive-patterns) — splitting personas keeps each agent's context sharp.

Simultaneously, the control flow itself got formalized. LangGraph modeled agent workflows as explicit cyclic state machines with typed shared state, checkpointing, and the ability to pause and resume. The intuition that matured here is the most important one in the whole timeline: *not every decision should be delegated to the LLM.* Some steps are genuinely fixed and ordered, and encoding them in deterministic code makes the system dramatically more reliable. This realization is exactly why ADK ships *workflow agents* alongside its LLM-driven agent, a point we will return to.

And this is the year the field finally admitted that an agent is an infrastructure problem, not a prompting problem. You need real state. You need persistent memory. You need tracing, because you cannot debug a nondeterministic loop with print statements. You need evaluation, because you cannot tell whether a prompt change made things better or worse without numbers. None of these are about intelligence. All of them are about operations.

### 2024 to 2025: the production agent era

This is the era where the scattered intuitions hardened into a checklist. To run an agent in production by 2025 you needed, at minimum: sessions with persistence; a distinction between short-term state and long-term memory; a registry of tools with consistent interfaces; guardrails on input, output, and tool calls; tracing wired into a real observability backend; an offline eval harness in CI; a deployment story; and increasingly, interoperability protocols so your agent could talk to tools and other agents it did not author. The *Model Context Protocol* (MCP), released by Anthropic in late 2024, standardized how agents talk to tools. The *Agent2Agent* protocol (A2A) standardized how agents talk to each other.

The painful truth of 2025 was that assembling all of this yourself was a multi-month platform project, and most teams did it badly, reinventing session storage and retry semantics from scratch. The market was begging for a framework that shipped the entire checklist in the box.

### 2025 to 2026: ADK as consolidation

That framework is ADK. Its pitch is not "a new way to call an LLM." Its pitch is "all the production scaffolding the field spent six years discovering, packaged so that the same agent code runs on your laptop and on a managed cloud runtime without modification." It is batteries-included, model-aware (deeply integrated with Gemini but not exclusively), and deployment-aware (it knows about Vertex AI Agent Engine, Cloud Run, and GKE). It is, in the most literal sense, the sediment of the timeline compressed into an API.

Now let us go layer by layer and show the resolution.

---

## Each Accumulated Complexity, and How ADK Resolves It

Here is the map of the territory, then the deep dives.

| Era | Accumulated complexity | What it cost you | How ADK resolves it |
|---|---|---|---|
| 2020 to 2021 | Brittle output parsing | Regex heroics on probabilistic text | Typed function tools, schema generated from signatures |
| 2022 | Reasoning is ad hoc prompting | No reuse across projects | Reasoning lives inside `LlmAgent`, instructions are first class |
| 2022 to 2023 | The agent loop is hand rolled and unbounded | Infinite loops, runaway cost | The `Runner` owns the loop and emits an inspectable event stream |
| 2022 to 2023 | Orchestration versus reasoning tension | One model doing everything, unreliably | Agent taxonomy splits deterministic workflow agents from LLM agents |
| 2023 | Tool integration is bespoke per vendor | N integrations for N tools | Function, OpenAPI, built-in, and MCP tools share one interface |
| 2023 | Memory is a pickled list | Amnesia on restart, context overflow | `Session` and `State` for short term, `MemoryService` for long term |
| 2023 to 2024 | Multi agent wiring is manual | Fragile handoffs, no standard | `sub_agents`, `AgentTool`, and A2A for cross boundary agents |
| 2023 to 2024 | No visibility into the loop | Undebuggable failures | Every step is an `Event`, OpenTelemetry tracing by default |
| 2024 to 2025 | Cross cutting concerns tangle the logic | Guardrails baked into prompts | Callbacks per component, plugins globally on the `Runner` |
| 2024 to 2025 | No way to measure quality | Vibes-based prompt changes | Built-in evalsets, trajectory and response scoring |
| 2024 to 2025 | Tool and agent interop is proprietary | Vendor lock per integration | First-party MCP and A2A support |
| 2025 to 2026 | Deployment is a platform project | Months of infra work | `adk deploy` to Agent Engine, Cloud Run, or GKE |

### Resolving the orchestration versus reasoning tension: the agent taxonomy

The single most important design decision in ADK is that it has *more than one kind of agent*, and the kinds correspond exactly to the 2024 realization that some control flow should be deterministic and some should be delegated to the model.

```mermaid
classDiagram
    BaseAgent <|-- LlmAgent
    BaseAgent <|-- SequentialAgent
    BaseAgent <|-- ParallelAgent
    BaseAgent <|-- LoopAgent
    class BaseAgent {
        +name
        +sub_agents
        +run_async
    }
    class LlmAgent {
        +model
        +instruction
        +tools
        +sub_agents
        decides at runtime
    }
    class SequentialAgent {
        runs children in order
        +output_key chaining
    }
    class ParallelAgent {
        runs children concurrently
        +isolated branches
    }
    class LoopAgent {
        +max_iterations
        repeats until escalate
    }
```

`LlmAgent` (also exported simply as `Agent`) is the descendant of the ReAct loop: it reasons, decides which tool to call, which sub-agent to hand to, and when it is done. It is where you want nondeterminism, because the task genuinely needs judgment.

The three *workflow agents* are the descendants of the LangGraph-era insight. `SequentialAgent` runs its children in a fixed order, passing data forward through shared state via `output_key`. `ParallelAgent` fans them out concurrently. `LoopAgent` repeats its children until one of them signals completion. None of these consult an LLM to decide control flow; the flow is code, and therefore reliable.

This taxonomy resolves the central tension of the field. For years we oscillated between "let the model orchestrate everything" (flexible, unreliable) and "hard-code the pipeline" (reliable, rigid). ADK's answer is that you do not choose globally — you choose per node. The productive pattern, and the one I reach for almost every time, is *deterministic shells around LLM nodes*: wrap the steps you know are fixed in a `SequentialAgent`, and only spend an `LlmAgent`'s nondeterminism inside the steps that need it.

Here is a `SequentialAgent` whose stages chain through state, with a `LoopAgent` doing a refine-until-good critique cycle inside one of them:

```python
from google.adk.agents import LlmAgent, SequentialAgent, LoopAgent
from google.adk.tools import exit_loop

# A drafting agent writes a summary into state under "draft".
drafter = LlmAgent(
    name="drafter",
    model="gemini-2.5-flash",
    instruction=(
        "Write a one paragraph summary of the user's request. "
        "Return only the paragraph."
    ),
    output_key="draft",
)

# A critic reads state.draft and either approves (calling exit_loop)
# or returns concrete revision notes for the next iteration.
critic = LlmAgent(
    name="critic",
    model="gemini-2.5-flash",
    instruction=(
        "Review the draft in state under the key draft. "
        "If it is clear, specific, and under 80 words, call the exit_loop "
        "tool to stop. Otherwise return concrete revision notes."
    ),
    tools=[exit_loop],
    output_key="critique",
)

# A reviser consumes the critique and rewrites the draft.
reviser = LlmAgent(
    name="reviser",
    model="gemini-2.5-flash",
    instruction=(
        "Rewrite the draft in state.draft using the notes in state.critique. "
        "Return only the revised paragraph."
    ),
    output_key="draft",
)

# Loop the critic and reviser until the critic escalates or we hit the cap.
refine_loop = LoopAgent(
    name="refine_loop",
    sub_agents=[critic, reviser],
    max_iterations=3,
)

# The whole pipeline: draft once, then refine in a bounded loop.
pipeline = SequentialAgent(
    name="summarize_pipeline",
    sub_agents=[drafter, refine_loop],
)
```

Notice what the framework gave you for free: a hard iteration cap (`max_iterations=3`), so the 2022-era unbounded loop simply cannot happen here; a clean way for a child to stop the loop (`exit_loop`, a built-in tool); and state-based handoff between stages with no glue code. The bounded refinement loop that I described as a hand-rolled pattern in the [production patterns post](https://juanlara18.github.io/portfolio/#/blog/production-llm-agents-patterns) is now a declarative `LoopAgent`.

### Resolving the loop and visibility problem: the Runner and the event stream

In the hand-rolled era, *you* wrote the `while` loop, and that loop was where every failure mode lived: the infinite retry, the lost budget, the silent wedging. ADK takes the loop away from you and gives it to the `Runner`. The runner invokes the agent, dispatches tool calls, persists events to the session, and yields a stream of typed `Event` objects — one per model output, tool call, tool response, and state mutation.

The consequence is that visibility, the 2024-era requirement, is not something you add; it is the default substrate. Every arrow in the system is an event, and events are JSON-serializable. ADK emits OpenTelemetry traces out of the box, so the same event stream that drives the local `adk web` inspector also drives Cloud Trace in production. The undebuggable nondeterministic loop becomes a list of events you can replay and assert against. I covered the wiring of runner, session, and event iteration in the [companion how-to](https://juanlara18.github.io/portfolio/#/blog/google-adk-agent-development-deep-dive), so I will not repeat the code; the point here is *why* the runner sits at the center. It is the place the field's hardest operational lessons got absorbed.

### Resolving bespoke tool integration: one interface, four authoring styles

The 2023-era pain was that every tool was a bespoke integration and every vendor had its own format. ADK collapses tool authoring into a single agent-facing interface (`BaseTool`) with four ways to produce one, depending on where the tool's contract already lives.

A plain typed Python function becomes a `FunctionTool` automatically when you drop it in `tools=[...]`; the framework introspects the signature into a schema and uses the docstring as the model-facing description. An OpenAPI spec becomes a full toolset. Managed Google Cloud services ship as first-party tools. And, crucially for interop, a remote MCP server plugs in through `McpToolset`. There are also built-in tools you simply import: `google_search`, `load_memory`, `preload_memory`, `exit_loop`, `transfer_to_agent`, `load_artifacts`, `url_context`, and more. Long-running and human-in-the-loop operations get `LongRunningFunctionTool`, which pauses the run and lets the client decide when to resume.

Here is the MCP path, with the *current* API — note `McpToolset` (the older `MCPToolset` name is deprecated) and the nested `StdioConnectionParams` wrapping `StdioServerParameters` from the `mcp` package:

```python
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool import StdioConnectionParams
from mcp import StdioServerParameters

# Connect a local filesystem MCP server over stdio. McpToolset discovers the
# server's tools at startup and adapts them into ADK BaseTool instances, so the
# agent treats remote MCP tools exactly like native function tools.
filesystem_tools = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-filesystem", "/tmp/agent_workspace"],
        ),
        timeout=5,
    ),
    # Optionally restrict which discovered tools the agent may use.
    tool_filter=["read_file", "list_directory"],
)

root_agent = LlmAgent(
    name="file_assistant",
    model="gemini-2.5-flash",
    instruction="Help the user inspect files. Use the available tools.",
    tools=[filesystem_tools],
)
```

For remote servers you swap in `SseConnectionParams` or `StreamableHTTPConnectionParams`. The standardization is the point: an agent does not know or care whether a tool is a local Python function or a remote server written by a different team in a different language. That uniformity is the 2024 interop intuition, baked in.

### Resolving tangled cross-cutting concerns: callbacks and plugins

Guardrails, logging, redaction, rate limits, content safety — the cross-cutting concerns that the 2024 production checklist demanded — used to get jammed into the agent's instructions or smeared across the loop. ADK gives them two clean homes. *Callbacks* attach to a single component (agent, model, or tool) with hooks before and after each, plus error hooks; the companion post shows a before-model guardrail and an after-tool redactor. *Plugins* are the newer, more powerful sibling: a `BasePlugin` is registered once on the `Runner` or `App` and its callbacks apply globally to every agent, tool, and model call. Plugins take precedence over component callbacks and, uniquely, expose `on_model_error` and `on_tool_error` hooks for global graceful recovery.

ADK even ships built-in plugins for the most common needs, including `ContextFilterPlugin` (trims old conversation turns to keep the context window manageable while preserving function call and response pairs) and `GlobalInstructionPlugin` (applies a consistent identity or safety preamble to every agent). The context-window-hygiene pattern that I described as a manual discipline in the production post — summarize and evict before the bill arrives — is now a plugin you register in one line.

### Resolving vibes-based prompt changes: built-in evaluation

The 2024 insight that you cannot improve what you cannot measure became, in ADK, a first-party eval harness. An *evalset* is a JSON file of cases, each a multi-turn session with expected tool calls and an expected final response. You run it from the CLI with `adk eval`, from the dev UI, or programmatically through `pytest`:

```python
import pytest
from google.adk.evaluation.agent_evaluator import AgentEvaluator


@pytest.mark.asyncio
async def test_summarize_pipeline():
    # Runs the agent against every case in the evalset, scores trajectory and
    # final response against the configured thresholds, and fails the test
    # (and your CI build) if either falls below threshold. num_runs averages
    # over several runs to absorb nondeterminism.
    await AgentEvaluator.evaluate(
        agent_module="summarize_pipeline",
        eval_dataset_file_path_or_dir="tests/summarize.test.json",
        num_runs=4,
    )
```

The criteria live in a `test_config.json`. The two defaults are `tool_trajectory_avg_score` (exact match on the sequence of tool calls and arguments, defaulting to a strict 1.0) and `response_match_score` (ROUGE-1 word overlap against the reference, defaulting to a more forgiving 0.8). For open-ended answers where lexical overlap is meaningless, `final_response_match_v2` uses an LLM judge to score semantic equivalence. The discipline is layered, exactly as the field learned the hard way: trajectory matching as the cheap, fast gate that catches structural regressions in CI; LLM-judge scoring as the slower gate that catches quality regressions. The point worth dwelling on is that *agent* eval scores the trajectory, not just the output — because two agents can reach the same answer by paths that differ tenfold in cost, and the path is the thing you ship.

---

## Deep Dive: ADK Memory and State

Memory deserves its own section because it is where the most intuition accumulated and where ADK's resolution is the most elegant — and the most misunderstood. Recall the 2023 pain: memory was a `list` you pickled. The fix is not one mechanism but a layered model. Let me draw it before explaining it.

```mermaid
flowchart TB
    subgraph ShortTerm[Short term, this conversation]
        Session[Session, append only event log]
        State[State, key value scratchpad]
        Session --- State
    end
    subgraph SessBackends[SessionService backends]
        InMem[InMemory, dev only]
        DB[Database, Postgres MySQL SQLite]
        Vertex[VertexAi, Agent Engine managed]
        Redis[Redis or Memorystore, via BaseSessionService]
    end
    subgraph LongTerm[Long term, across conversations]
        MemSvc[MemoryService, searchable recall]
    end
    subgraph MemBackends[MemoryService backends]
        InMemMem[InMemory, keyword dev]
        Bank[VertexAiMemoryBank, LLM extracted facts]
        Rag[VertexAiRag, vector over transcripts]
    end
    State --> SessBackends
    Session --> SessBackends
    Session -. ingest at session end .-> MemSvc
    MemSvc --> MemBackends
    MemSvc -. retrieve at turn start .-> State
```

### The short-term layer: Session and State

A `Session` is one conversation. It is an append-only log of events plus a `State` dictionary. You never mutate an old event; the runner appends. `State` is the structured working memory of *this* conversation — a shopping cart, a partial form, the intermediate `output_key`s that workflow agents pass between stages.

The subtle, powerful part is state *scoping by key prefix*. A bare key like `draft` is scoped to the session. A key prefixed `user:` (for example `user:preferred_language`) is scoped to the user across all their sessions. A key prefixed `app:` is shared across the whole application. And `temp:` keys live only for the current turn and are never persisted. This one convention quietly resolves a whole category of problems that used to require separate stores: per-user preferences that survive across conversations, app-wide configuration, and ephemeral turn-local scratch space all live in the same `state` API, distinguished only by prefix. The discipline that matters — and the one trap to internalize — is that everything in non-temporary state becomes part of subsequent context, so bloated state silently degrades the model's reasoning. Write to state only what the next turn or sub-agent will actually read.

### Short-term memory is, effectively, a Redis-style store

Here is the part the user-facing docs underplay. `SessionService` is an *interface* (`BaseSessionService`), and the backend you choose determines the operational character of your short-term memory. ADK ships three first-party implementations: `InMemorySessionService` (a dict, dev only, lost on restart); `DatabaseSessionService` (any SQLAlchemy-compatible relational store — Postgres, MySQL, SQLite — with the caveat that it needs an async driver like `asyncpg` or `sqlite+aiosqlite`); and `VertexAiSessionService` (fully managed persistence through Vertex AI Agent Engine, the zero-ops production default on Google Cloud).

But conceptually, session state is exactly the workload a Redis-style key-value store was built for: small, hot, per-conversation reads and writes on every single turn, with low latency as the dominant requirement. Because `SessionService` is a pluggable interface, you can back it with precisely that. The Redis team ships an official integration, `adk-redis`, whose `RedisWorkingMemorySessionService` implements `BaseSessionService` against a Redis Agent Memory Server, giving you persistent working memory with automatic summarization when the token budget is hit and horizontal scaling across stateless agent replicas. On Google Cloud the natural managed equivalent is Memorystore (managed Redis). The mental model is worth stating plainly: *short-term agent memory is a low-latency KV store keyed by session, and ADK lets you choose how fancy that store is* — a dict in dev, a relational table for self-managed durability, Agent Engine for managed simplicity, or Redis/Memorystore when you need Redis-grade latency and throughput under a stateless fleet.

```python
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.adk.memory import VertexAiMemoryBankService
from google.adk.tools import preload_memory
from google.genai import types

# Short term: a self-managed Postgres backend for session state. Swap this line
# for VertexAiSessionService in managed prod, InMemorySessionService in dev, or
# a Redis-backed BaseSessionService for Redis-grade latency. The agent code
# below does not change.
session_service = DatabaseSessionService(
    db_url="postgresql+asyncpg://agent:secret@db.internal:5432/agents"
)

# Long term: managed, LLM-extracted, cross-session memory. The agent_engine_id
# comes from the Agent Engine you deploy to.
memory_service = VertexAiMemoryBankService(
    agent_engine_id="projects/acme-prod/locations/us-central1/reasoningEngines/8273"
)

agent = LlmAgent(
    name="support_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are a support agent. Use the preload_memory tool to recall what "
        "you know about this user before answering. Personalize your reply "
        "using any preferences you find."
    ),
    # preload_memory injects relevant long-term memories before the turn.
    tools=[preload_memory],
)

runner = Runner(
    app_name="support_app",
    agent=agent,
    session_service=session_service,
    memory_service=memory_service,
)


async def main():
    session = await session_service.create_session(
        app_name="support_app", user_id="u-42"
    )
    msg = types.Content(role="user", parts=[types.Part(text="What's my plan tier?")])
    async for event in runner.run_async(
        user_id="u-42", session_id=session.id, new_message=msg
    ):
        if event.is_final_response() and event.content:
            print(event.content.parts[0].text)
    # At the end of a meaningful conversation, promote it to long-term memory.
    await memory_service.add_session_to_memory(session)


asyncio.run(main())
```

### The long-term layer: MemoryService

Long-term memory is a different problem with a different shape. It is not ordered, it is *searchable*. The agent does not iterate its memory; it queries it. The canonical lifecycle is: a session ends, the runner ingests its events into memory, and future sessions retrieve relevant memories — through the built-in `load_memory` or `preload_memory` tools, or a custom tool calling `tool_context.search_memory`.

ADK offers three `MemoryService` backends, and the distinction between the last two is the genuinely advanced part. `InMemoryMemoryService` is dev-only keyword matching. `VertexAiMemoryBankService` is the sophisticated one: at session end it sends events to Memory Bank, which uses an LLM to *extract, consolidate, and reconcile* facts about the user, storing distilled memories rather than raw transcript, and serving them back by semantic search. If the user said "I'm moving to New York" last week and "actually I moved to Chicago" today, Memory Bank resolves the conflict rather than storing both verbatim — exactly the behavior that bespoke memory-as-a-service tools were built to provide. `VertexAiRagMemoryService` is the third option: it stores raw conversation transcripts in Knowledge Engine and retrieves them by vector similarity, which is what you want when you already have RAG infrastructure or want retrieval over verbatim transcripts rather than LLM-distilled facts.

The deep point — the bottom of how ADK simplifies the memory problem — is that it refuses to pretend memory is one thing. It separates the *short-term, ordered, low-latency, per-conversation* store (Session/State, naturally a KV/Redis-style workload) from the *long-term, searchable, cross-conversation* store (MemoryService, naturally a vector or LLM-extraction workload). These have different access patterns, different update rates, and different failure modes, and the cardinal sin — the one I called out in the [production patterns post](https://juanlara18.github.io/portfolio/#/blog/production-llm-agents-patterns) — is collapsing them into one system. ADK's architecture makes that collapse hard to do by accident. The empirical justification for the separation is the lost-in-the-middle phenomenon: bloating short-term state with everything degrades the model's ability to use any of it, so the long-term, rarely-relevant material belongs behind a search interface, not in the prompt.

### A turn, drawn through the memory lens

The companion post drew the agent loop as runner-agent-tool. Here is the same turn drawn through the memory dimension, which is the view that matters for this section:

```mermaid
sequenceDiagram
    actor User
    participant Runner
    participant Session as Session and State
    participant Mem as MemoryService
    participant Agent
    participant Tool

    User->>Runner: send message
    Runner->>Session: append user event, load state
    Runner->>Mem: search relevant long term memories
    Mem-->>Runner: distilled memories
    Runner->>Agent: invoke with state plus memories
    Agent->>Tool: call tool
    Tool-->>Agent: result
    Agent->>Session: write output_key to state
    Agent-->>Runner: yield final event
    Runner-->>User: stream answer
    Runner->>Mem: at session end, ingest events to memory
```

Read it twice. The retrieval happens *before* the agent reasons (so memories are context, not an afterthought), and the ingestion happens *after* the session, asynchronously, so writing to long-term memory never sits on the critical path of a turn. That ordering is the whole design.

---

## ADK vs LangChain and LangGraph

The most common question I get is how ADK compares to the incumbent, LangChain and its orchestration library LangGraph. The honest answer is that they sit at different points on a philosophy axis, and the choice is about fit, not capability — the same conclusion the [framework comparison post](https://juanlara18.github.io/portfolio/#/blog/llamaindex-langchain-llm-frameworks) reaches for LlamaIndex versus LangChain.

| Dimension | ADK | LangChain / LangGraph |
|---|---|---|
| Origin and philosophy | Google, 2025, batteries-included production framework | LangChain since Oct 2022, composability-first; LangGraph 1.x adds graph orchestration |
| Core abstraction | Small agent taxonomy: LlmAgent plus workflow agents | LangGraph: explicit cyclic StateGraph of nodes and edges |
| Orchestration model | Code-first agents, deterministic shells around LLM nodes | Graph-first, you wire nodes and conditional edges by hand |
| State and memory | Session, State, and tiered MemoryService in the box | TypedDict state with reducers, checkpointers you choose |
| Tools | Function, OpenAPI, built-in, MCP, agent-as-tool, one interface | Rich tool ecosystem, MCP support, more assembly required |
| Eval | First-party evalsets, trajectory and response scoring, CLI and pytest | LangSmith for tracing and eval, separate product |
| Observability | OpenTelemetry by default, Cloud Trace integration | LangSmith tracing, OTel increasingly supported |
| Interop | First-party A2A expose and consume, MCP client | MCP support, A2A via add-ons |
| Deployment | adk deploy to Agent Engine, Cloud Run, GKE | Bring your own, or LangGraph Platform |
| Cloud gravity | Strong pull toward Vertex and Gemini | Cloud and model agnostic by design |
| Maturity | Younger, fast-moving API | Large, battle-tested, also fast-moving |
| Best fit | GCP shops wanting the whole production checklist in one SDK | Cross-cloud, unusual graph topologies, model-vendor flexibility |

The fair summary in two sentences: ADK is the framework you choose when you want the production checklist — sessions, memory, tools, guardrails, eval, tracing, deployment — to ship in the box and you are comfortable with a gentle but real pull toward Google Cloud and Gemini. LangGraph is the framework you choose when your orchestration is genuinely a complicated graph, when you must run across clouds or swap model vendors quarterly, or when you want maximum control of the runtime and are willing to assemble the operational pieces yourself.

There is also a philosophical difference worth naming. LangGraph makes the *graph* the explicit, first-class artifact: you see every node and edge, which is its great strength for audit-heavy, branchy workflows and its great cost in boilerplate. ADK makes the *agent* the first-class artifact and hides the graph inside the runner. For a clean hierarchy of specialists, ADK is less code and less ceremony. For a genuinely cyclic, conditional, human-in-the-loop state machine, LangGraph's explicitness is worth its weight. Neither is wrong; they optimize for different shapes of problem.

---

## Limitations: When Not ADK

A post that only praised ADK would be marketing, not field notes. ADK is young, it has gravity, and there are places where another tool still wins. Here is the honest decision lens.

**Google and Vertex gravity is real.** ADK runs against non-Google models and deploys to non-Google targets, but the path of least resistance — the deepest integration, the smoothest examples, the managed `VertexAiSessionService` and `VertexAiMemoryBankService` — all pull toward Gemini and Vertex AI Agent Engine. If your organization is committed to AWS or Azure, you will be fighting the current. On AWS, Strands Agents and Bedrock AgentCore are the natural fits; on Azure, the Microsoft Agent Framework. Choosing ADK is, partly, choosing a cloud.

**It is young, and the API moves.** The session database schema changed in a recent minor version and required a migration. The MCP toolset class was renamed (`MCPToolset` to `McpToolset`) with the old name deprecated. These are healthy signs of an actively developed framework, but if you need a frozen, decade-stable API, ADK is not yet that. Pin your versions and read the release notes.

**Unusual orchestration topologies still favor LangGraph.** ADK's agent taxonomy is a clean abstraction for hierarchies and pipelines. When your real design is a dense, cyclic graph with many conditional edges, fine-grained interrupts, and time-travel debugging, you can express it in ADK — but you may be working against the grain, and LangGraph's explicit `StateGraph` will feel more natural.

**Maximal control or minimal dependencies favor raw or PydanticAI.** If you want to understand and own every token of every prompt and every line of the loop, a thin provider SDK with your own bounded loop — the [minimal production-minded agent](https://juanlara18.github.io/portfolio/#/blog/production-llm-agents-patterns) I sketched elsewhere — is still the most transparent option, and the best way to *learn*. If you want strong typing and Pydantic-native validation as the organizing principle with a lighter footprint than ADK, PydanticAI is a serious contender. Batteries-included is a feature until the batteries are in your way.

**What to do about it.** The decision lens I use: if you are on GCP or model-agnostic-leaning-Gemini, want the full production checklist fast, and your orchestration is a hierarchy or pipeline — choose ADK, and lean into Agent Engine. If you are cross-cloud, vendor-flexible, or graph-heavy — choose LangGraph. If you are learning, prototyping, or need total control — start raw with a provider SDK and graduate to a framework only when the patterns hurt. And if ADK is *almost* right but one limitation bites, remember that its interfaces are pluggable: you can back the `SessionService` with Redis, point tools at non-Google MCP servers, and expose or consume other frameworks' agents over A2A. The lock-in is gravitational, not absolute. Wait for the young edges to mature where you can; route around them with the open interfaces where you cannot.

---

## Closing the Loop

Walk back up the timeline one last time and the shape of ADK is no longer arbitrary. Brittle parsing became typed tools. Ad-hoc reasoning became the `LlmAgent`. The hand-rolled loop became the `Runner` and its event stream. The orchestration-versus-reasoning war became a peace treaty in the form of workflow agents around LLM agents. Bespoke integrations became one tool interface with MCP at the edge. The pickled list became Session, State, and a tiered MemoryService. Tangled guardrails became callbacks and plugins. Vibes became evalsets. Proprietary interop became A2A. And the multi-month platform project became `adk deploy`.

ADK is not magic and it is not the end of history. It is the current consolidation — the moment the field's accumulated intuitions cooled into a framework. Understanding it through its history is the difference between using it and *understanding* it, and understanding it is what lets you see, clearly and without marketing, exactly where the next layer of sediment will need to form.

---

## Going Deeper

**Books:**
- Russell, S., and Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th ed.).* Pearson.
  - The agent abstraction in ADK descends from the AIMA agent-program and agent-function distinction. Chapters 2 and 12 are the classical scaffolding under the whole timeline.
- Huyen, C. (2024). *AI Engineering: Building Applications with Foundation Models.* O'Reilly.
  - The most useful single book on building real LLM systems; the chapters on evaluation and cost management map directly onto ADK's eval harness and the memory-hygiene discipline.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly.
  - Session and memory services are distributed-systems problems in an agent costume. Read the chapters on consistency, replication, and stream processing before backing a SessionService with Redis or Postgres.
- Hohpe, G., and Woolf, B. (2003). *Enterprise Integration Patterns.* Addison-Wesley.
  - Multi-agent orchestration and A2A recapitulate decades-old messaging patterns. This is the unsung prior art for agent-to-agent interop.

**Online Resources:**
- [Agent Development Kit documentation](https://google.github.io/adk-docs/) — Canonical docs for agents, tools, sessions, memory, callbacks, plugins, evaluation, and deployment.
- [ADK Sessions and Memory guide](https://adk.dev/sessions/memory/) — The authoritative comparison of InMemory, Memory Bank, and RAG-backed memory services, and the short-term versus long-term split.
- [adk-redis on GitHub](https://github.com/redis-developer/adk-redis) — The Redis-backed BaseSessionService and BaseMemoryService implementations; the clearest concrete example of treating short-term memory as a Redis-style store.
- [Vertex AI Agent Engine documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview) — The managed runtime and deployment target, including managed session and Memory Bank services.
- [Model Context Protocol specification](https://modelcontextprotocol.io/) and [Agent2Agent Protocol](https://a2a-protocol.org/) — The two interop standards ADK speaks natively.

**Videos:**
- [Harrison Chase: LangChain and The Future of LLM Applications](https://www.youtube.com/watch?v=8E6uPB4U0E8) by Alejandro AO — Chase narrates LangChain's origin in late October 2022, the firsthand account of the abstraction explosion described above.
- [Build Agents with Long-Term Memory: InMemory vs Memory Bank](https://www.youtube.com/watch?v=5onUg-YJBZA) — A hands-on walkthrough of ADK's short-term session memory versus long-term Memory Bank, with the tradeoffs spelled out.

**Academic Papers:**
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y. (2022). ["ReAct: Synergizing Reasoning and Acting in Language Models."](https://arxiv.org/abs/2210.03629) *ICLR 2023.*
  - The reason-act-observe loop that every ADK LlmAgent implements. The structural origin of the whole field.
- Wei, J., et al. (2022). ["Chain-of-Thought Prompting Elicits Reasoning in Large Language Models."](https://arxiv.org/abs/2201.11903) *NeurIPS 2022.*
  - The 2022 result that made "let the model reason step by step" a reliable technique, the intuition agency was built on.
- Schick, T., et al. (2023). ["Toolformer: Language Models Can Teach Themselves to Use Tools."](https://arxiv.org/abs/2302.04761) *NeurIPS 2023.*
  - The conceptual foundation for tool selection as a learned behavior, which is what your function-tool docstrings steer at inference time.
- Liu, N. F., et al. (2023). ["Lost in the Middle: How Language Models Use Long Contexts."](https://arxiv.org/abs/2307.03172) *TACL 2024.*
  - The empirical reason ADK separates short-term state from long-term memory: bloated context degrades the model's ability to use any of it.

**Questions to Explore:**
- If short-term agent memory is a Redis-style KV store and long-term memory is a vector or LLM-extraction store, what is the right *third* tier, if any? Where does a knowledge graph of entities the agent has discovered belong, and which service interface should own it?
- ADK's workflow agents make some control flow deterministic. Is there a principled way to decide, per node, whether a step should be an LlmAgent or a workflow agent, beyond intuition and incident reports?
- Memory Bank reconciles conflicting facts about a user with an LLM. What happens when that reconciliation is wrong, and what does an audit trail and a right-to-correction look like for LLM-distilled memories?
- The framework consolidates six years of intuition. What is the accumulated complexity of 2026 that ADK does not yet resolve, and what would the next layer of sediment, the framework after ADK, have to absorb?
- If you backed every agent's SessionService with Redis and exposed every agent over A2A, you would have a fleet of stateless agents over a shared low-latency store talking over a protocol. How is that different from a microservices architecture with probabilistic CPUs, and what does that comparison teach you about operating it?
