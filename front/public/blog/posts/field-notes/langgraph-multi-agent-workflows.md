---
title: "LangGraph: Orchestrating Multi-Agent Workflows"
date: "2026-04-10"
tags: ["LangGraph", "Agents", "LLMs", "Orchestration", "LangChain", "Multi-Agent", "AI Engineering", "Production ML", "Tool Use", "Agentic AI"]
category: "field-notes"
headerImage: "/blog/headers/langgraph-multi-agent-workflows-header.jpg"
slug: "langgraph-multi-agent-workflows"
excerpt: "A practical guide to LangGraph 1.x: how StateGraph works, when to use agents vs. chains, the patterns that actually work in production (Supervisor, Subgraph, HITL, Map-Reduce), and an honest comparison with alternatives."
readingTimeMinutes: 22
estimatedWordCount: 5200
---

Agents are everywhere right now. Every LLM framework has a way to build them, every demo shows an autonomous system solving complex tasks, and every team has at least one Slack thread asking which orchestration library to pick.

LangGraph occupies an interesting position in this landscape. It's not a high-level "just describe your agents in YAML" abstraction — it's a graph-based state machine engine where you explicitly define nodes, edges, and state transitions. That explicitness is both its primary limitation and its primary strength: you get fine-grained control over execution flow, memory, and human-in-the-loop interaction at the cost of more boilerplate than higher-level alternatives.

LangGraph 1.0 went GA in October 2025. The 1.1.x series (current as of early 2026) added several production-hardening features. This post covers what actually matters: the primitives, the patterns, and where it fits.

---

## Why Graph-Based Orchestration

Before diving into the API, it's worth understanding the design choice. Most LLM application frameworks model agents as either:

1. **Linear chains**: A → B → C. Good for pipelines with no branching.
2. **ReAct loops**: Think → Act → Observe → repeat. Good for tool-using agents with a single thread of reasoning.
3. **DAGs**: Directed acyclic graphs. Good for parallelism but can't model cycles (which agents need for retry and reflection).

LangGraph uses **cyclic directed graphs** — nodes can loop back. This is the key difference. An agent that executes a tool, checks if the result is good, and retries if not is a cycle. Reflection patterns (generate → critique → revise) are cycles. Human-in-the-loop interruptions that resume after approval are cycles. DAGs can't represent these directly.

The graph model also makes the execution flow **visible and debuggable**. When an agent misbehaves, you can see exactly which node was executing, what the state was at that point, and which edge was taken.

---

## Core Concepts

### StateGraph and TypedDict State

Everything in LangGraph flows through a typed state object. The state is shared across all nodes in the graph — each node receives the current state and returns a partial update.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # append-only list
    current_step: str
    tool_results: dict
    retry_count: int
    final_answer: str
```

The `Annotated[list, operator.add]` pattern is important: it tells LangGraph to **append** to the messages list rather than replace it. Without this annotation, each node's return value would overwrite the field completely.

Custom reducers let you define any merge behavior:

```python
def take_latest(existing: str, update: str) -> str:
    return update  # always replace with the newest value

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    status: Annotated[str, take_latest]
    errors: Annotated[list, operator.add]
```

### Nodes

A node is any Python callable that takes the state and returns a partial update:

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

def reasoning_node(state: AgentState) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def tool_execution_node(state: AgentState) -> dict:
    last_message = state["messages"][-1]
    tool_calls = last_message.tool_calls
    results = []
    for call in tool_calls:
        result = execute_tool(call["name"], call["args"])
        results.append(ToolMessage(content=str(result), tool_call_id=call["id"]))
    return {"messages": results}
```

### Edges and Conditional Routing

Static edges always go from A to B. Conditional edges route based on the current state:

```python
def route_after_reasoning(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"

graph = StateGraph(AgentState)
graph.add_node("reason", reasoning_node)
graph.add_node("tools", tool_execution_node)

graph.set_entry_point("reason")
graph.add_conditional_edges(
    "reason",
    route_after_reasoning,
    {"tools": "tools", "end": END}
)
graph.add_edge("tools", "reason")  # loop back after tool execution

agent = graph.compile()
```

This is the classic ReAct loop: reason → (if tool calls) → execute tools → reason again → (if no tool calls) → end.

```mermaid
graph TD
    A[Entry] --> B[reason]
    B --> C{Has tool calls?}
    C -->|Yes| D[tools]
    C -->|No| E[END]
    D --> B
```

### The `invoke` vs `stream` vs `astream_events` API

```python
# Synchronous, blocking — returns final state
result = agent.invoke({"messages": [HumanMessage(content="What's 2+2?")]})

# Synchronous streaming — yields state snapshots after each node
for chunk in agent.stream({"messages": [HumanMessage(content="What's 2+2?")]}):
    print(chunk)  # {"reason": {"messages": [...]}} or {"tools": {...}}

# Async streaming with event types — most useful for production UIs
async for event in agent.astream_events(initial_state, version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="", flush=True)
    elif event["event"] == "on_tool_start":
        print(f"\n[Calling tool: {event['name']}]")
```

`astream_events` is what you want for a streaming chat UI — it gives you fine-grained events (model token, tool call start, tool result) rather than just node-level snapshots.

---

## Memory and Persistence

### Short-Term Memory: Checkpointers

A **checkpointer** persists the graph state after every node execution. This enables:
- Resuming interrupted runs
- Human-in-the-loop pauses
- Multi-turn conversations (the conversation history is the state)

```python
from langgraph.checkpoint.postgres import PostgresSaver
import psycopg

conn_string = "postgresql://user:pass@localhost:5432/langgraph"
with psycopg.connect(conn_string) as conn:
    checkpointer = PostgresSaver(conn)
    checkpointer.setup()  # creates the required tables

agent = graph.compile(checkpointer=checkpointer)

# Each run needs a thread_id — this is your conversation session ID
config = {"configurable": {"thread_id": "user-session-abc123"}}

# First turn
result = agent.invoke(
    {"messages": [HumanMessage(content="My name is Ana")]},
    config=config
)

# Second turn — agent remembers Ana from the persisted state
result = agent.invoke(
    {"messages": [HumanMessage(content="What's my name?")]},
    config=config
)
```

**Available checkpointers (LangGraph 1.1.x):**
- `MemorySaver` — in-memory, for development only
- `SqliteSaver` — SQLite file, good for single-process production
- `PostgresSaver` — production choice for distributed deployments
- `AsyncPostgresSaver` — async variant for FastAPI / async applications
- `RedisSaver` — community-maintained, for low-latency short-term memory

### Long-Term Memory: The Store API

LangGraph 1.0 introduced the `Store` API for cross-thread persistent memory — facts that should be remembered across different sessions, not just within one conversation thread.

```python
from langgraph.store.postgres import AsyncPostgresStore

store = AsyncPostgresStore.from_conn_string("postgresql://...")
await store.setup()

# Store memory — (namespace tuple, key, value)
await store.aput(
    namespace=("user_profiles", user_id),
    key="preferences",
    value={"preferred_language": "Spanish", "timezone": "America/Bogota"}
)

# Retrieve memory
item = await store.aget(namespace=("user_profiles", user_id), key="preferences")
print(item.value)  # {"preferred_language": "Spanish", ...}

# Semantic search — Store supports vector search over stored values
results = await store.asearch(
    namespace=("company_policies",),
    query="parental leave entitlement",
    limit=5
)
```

The semantic search capability turns the Store into a lightweight vector knowledge base — useful for agent memory systems where you want to retrieve relevant past interactions.

---

## Human-in-the-Loop: interrupt()

`interrupt()` is the mechanism for pausing execution mid-graph and waiting for human input. It was redesigned in LangGraph 1.0 to be simpler and more composable.

```python
from langgraph.types import interrupt

def human_review_node(state: AgentState) -> dict:
    # Execution pauses here — the graph state is checkpointed
    review_decision = interrupt({
        "question": "The agent wants to send this email. Approve?",
        "draft_email": state["draft_email"],
        "recipient": state["recipient"]
    })
    # Execution resumes here after the human provides input
    if review_decision["approved"]:
        return {"status": "approved"}
    else:
        return {
            "status": "rejected",
            "revision_instructions": review_decision.get("feedback", "")
        }
```

On the client side, you resume the graph with the human's response:

```python
# Run until interrupt
result = agent.invoke(initial_state, config=config)
# result contains the interrupt payload

# Human reviews... then resume
resume_result = agent.invoke(
    Command(resume={"approved": True}),
    config=config
)
```

The `Command` primitive (new in LangGraph 1.0) is a clean way to pass control signals — you can also use it to dynamically change the next node:

```python
from langgraph.types import Command

def routing_node(state: AgentState) -> Command:
    if state["task_type"] == "sql":
        return Command(goto="sql_agent", update={"routed_to": "sql"})
    elif state["task_type"] == "document":
        return Command(goto="rag_agent", update={"routed_to": "rag"})
    return Command(goto="general_agent")
```

The full HITL cycle — from initial invocation through pause, human review, and resumption — involves three distinct actors across two separate API calls:

```mermaid
sequenceDiagram
    participant C as Client
    participant G as LangGraph
    participant H as Human Reviewer
    C->>G: invoke(initial_state)
    G->>G: run nodes...
    G->>G: interrupt() reached — checkpoint saved
    G-->>C: InterruptEvent(payload)
    C->>H: show draft + approval UI
    H-->>C: approved=True / feedback
    C->>G: invoke(Command(resume={approved: True}))
    G->>G: resume from checkpoint
    G-->>C: final result
```

---

## Multi-Agent Patterns

### Pattern 1: Supervisor

The Supervisor pattern has a coordinator LLM that decides which specialized agent to invoke next. It's the most common enterprise pattern because it's interpretable — you can always audit which agent was called and why.

```mermaid
graph TD
    U[User Request] --> S[Supervisor]
    S -->|sql task| Q[SQL Agent]
    S -->|doc lookup| R[RAG Agent]
    S -->|calculation| C[Calculator Agent]
    S -->|done| E[END]
    Q --> S
    R --> S
    C --> S
```

```python
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, MessagesState
from langgraph.prebuilt import create_react_agent

# Create specialized agents
sql_agent = create_react_agent(llm, tools=sql_tools)
rag_agent = create_react_agent(llm, tools=rag_tools)

# Supervisor decides which agent to invoke
SUPERVISOR_PROMPT = """You are a supervisor coordinating specialized agents.
Available workers: {workers}
Given the conversation, decide which worker should act next, or respond 'FINISH'.
Reply with just the worker name or 'FINISH'."""

def supervisor_node(state):
    decision = llm.invoke([
        SystemMessage(content=SUPERVISOR_PROMPT.format(workers=["sql_agent", "rag_agent"])),
        *state["messages"]
    ])
    return {"next": decision.content.strip()}

def route_to_worker(state) -> str:
    return state["next"] if state["next"] != "FINISH" else END

graph = StateGraph(MessagesState)
graph.add_node("supervisor", supervisor_node)
graph.add_node("sql_agent", lambda s: {"messages": sql_agent.invoke(s)["messages"]})
graph.add_node("rag_agent", lambda s: {"messages": rag_agent.invoke(s)["messages"]})

graph.set_entry_point("supervisor")
graph.add_conditional_edges("supervisor", route_to_worker)
graph.add_edge("sql_agent", "supervisor")
graph.add_edge("rag_agent", "supervisor")

supervisor = graph.compile(checkpointer=checkpointer)
```

### Pattern 2: Subgraphs

Subgraphs let you compose complex agents hierarchically — the outer graph sees a subgraph as a single node. This is essential for large systems that would otherwise become unmanageable as a single flat graph.

```python
# Build a specialized SQL subgraph
sql_state = TypedDict("SQLState", {
    "question": str,
    "schema": str,
    "sql": str,
    "result": str,
    "error": str
})

sql_graph = StateGraph(sql_state)
sql_graph.add_node("schema_linking", schema_linking_node)
sql_graph.add_node("sql_gen", sql_generation_node)
sql_graph.add_node("execute", execution_node)
# ... add edges ...
sql_subgraph = sql_graph.compile()

# Use it as a node in the parent graph
def sql_agent_node(state: AgentState) -> dict:
    result = sql_subgraph.invoke({
        "question": state["messages"][-1].content,
        "schema": state["available_schema"]
    })
    return {"messages": [AIMessage(content=result["result"])]}

parent_graph.add_node("sql_agent", sql_agent_node)
```

The key design rule for subgraphs: **minimize shared state**. The interface between parent and child should be a clean API — pass in what the subgraph needs, get back what the parent needs. Avoid making the subgraph depend on parent state fields it shouldn't know about.

### Pattern 3: Map-Reduce

The Send API enables dynamic fan-out — spawning multiple parallel subgraph instances without knowing the number at compile time:

```python
from langgraph.types import Send

def fan_out_node(state: AgentState) -> list[Send]:
    """Spawn one analysis agent per document."""
    return [
        Send("analyze_document", {"document": doc, "question": state["question"]})
        for doc in state["retrieved_documents"]
    ]

def analyze_document(state: dict) -> dict:
    analysis = llm.invoke(f"Analyze this document: {state['document']}\nQuestion: {state['question']}")
    return {"analysis": analysis.content, "source": state["document"]["id"]}

def aggregate_node(state: AgentState) -> dict:
    """Combine all parallel analyses."""
    all_analyses = state["analyses"]  # automatically collected via reducer
    synthesis = llm.invoke(f"Synthesize these analyses: {all_analyses}")
    return {"final_answer": synthesis.content}

graph.add_node("fan_out", fan_out_node)
graph.add_node("analyze_document", analyze_document)
graph.add_node("aggregate", aggregate_node)
graph.add_conditional_edges("fan_out", lambda x: x, ["analyze_document"])
graph.add_edge("analyze_document", "aggregate")
```

Map-Reduce is particularly useful for:
- Analyzing multiple retrieved documents in parallel
- Running the same agent on multiple inputs and combining results
- Batch evaluation tasks

The fan-out/fan-in shape is what makes this pattern distinct from the Supervisor — the number of parallel branches isn't known until runtime:

```mermaid
flowchart LR
    Q[User Question] --> FO[fan_out_node]
    FO -->|doc 1| A1[analyze_document]
    FO -->|doc 2| A2[analyze_document]
    FO -->|doc N| A3[analyze_document]
    A1 --> AGG[aggregate_node]
    A2 --> AGG
    A3 --> AGG
    AGG --> ANS[Final Answer]
    style FO fill:#4a90d9,color:#fff
    style AGG fill:#4a90d9,color:#fff
```

### Pattern 4: Multi-Agent Network (Handoff)

Rather than a central supervisor, agents pass control directly to each other. This is useful when you know the routing logic upfront and want to avoid the latency of an additional LLM call for routing decisions.

```python
# Agent A hands off to Agent B when it needs SQL
def agent_a_node(state):
    if needs_database_query(state):
        return Command(goto="sql_agent", update={"handoff_from": "agent_a"})
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Agent B hands back when done
def sql_agent_node(state):
    result = execute_sql_workflow(state)
    return Command(
        goto=state.get("handoff_from", END),  # return to whoever called us
        update={"sql_result": result}
    )
```

---

## LangGraph Platform: Deployment in Production

LangGraph Platform (the managed cloud offering, separate from the open-source library) provides:

- **LangGraph Server**: FastAPI-based REST + WebSocket server that wraps your graphs. Handles thread management, checkpointing, and streaming out of the box.
- **LangGraph Studio**: Visual debugger with a live graph view, state inspection per node, and time-travel debugging (replay from any checkpoint).
- **LangGraph Cloud**: Fully managed deployment on GCP infrastructure (as of 2026).

For self-hosted deployments:

```dockerfile
# Dockerfile for self-hosted LangGraph Server
FROM langchain/langgraph-api:latest

COPY ./your_graph.py /app/graphs/
ENV LANGGRAPH_CONFIG='{"graphs": {"your_agent": "./graphs/your_graph.py:agent"}}'
```

The LangGraph Server exposes standard endpoints:
```
POST /threads                         # create new thread
POST /threads/{thread_id}/runs        # start a run
GET  /threads/{thread_id}/runs/{id}   # get run status/result
POST /threads/{thread_id}/runs/{id}/join  # stream results
```

This separation — graph logic in Python, server infra provided — is the right abstraction for production. You don't want to reinvent thread management, WebSocket streaming, and auth for every agent deployment.

---

## Observability: LangSmith Integration

LangSmith is the observability layer for LangGraph deployments. Enable it with two environment variables:

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_key_here
```

Every graph execution is now traced: you can see the full node execution sequence, state at each step, LLM calls (with token counts and latency), tool calls, and errors. For production debugging, this is essential.

Custom metadata for filtering in LangSmith:

```python
result = agent.invoke(
    initial_state,
    config={
        "configurable": {"thread_id": thread_id},
        "metadata": {
            "user_id": user_id,
            "session_type": "sql_query",
            "department": "engineering"
        }
    }
)
```

You can then filter LangSmith traces by `department` to identify which team's queries are generating the most errors.

---

## Honest Comparison: LangGraph vs. Alternatives

### vs. CrewAI

CrewAI is the most popular high-level agent framework. It offers a clean abstraction: define Agents (with roles and backstories), assign them Tasks, form a Crew, and kick off.

```python
# CrewAI — high-level, less code
from crewai import Agent, Task, Crew

researcher = Agent(role="Researcher", goal="Find relevant information")
writer = Agent(role="Writer", goal="Write a clear summary")

research_task = Task(description="Research {topic}", agent=researcher)
write_task = Task(description="Write a report based on research", agent=writer)

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task])
result = crew.kickoff(inputs={"topic": "enterprise knowledge bases"})
```

**CrewAI strengths:** Much less code, built-in role/goal structure, faster to prototype.

**CrewAI weaknesses:** Limited control over execution flow (you don't define the graph), harder to implement custom routing logic, less flexible for HITL patterns, not designed for stateful multi-turn conversations.

**When to choose CrewAI:** Prototype quickly, use case fits naturally into role/task model, don't need fine-grained control over execution flow.

**When to choose LangGraph:** Production systems requiring HITL, complex conditional routing, persistent state across turns, or subgraph composition.

### vs. AutoGen (Microsoft)

AutoGen is conversational multi-agent: agents exchange messages in a group chat, and termination is based on conversation patterns. It's powerful for open-ended collaborative agents.

**AutoGen strengths:** Strong for open-ended collaborative tasks (two agents debating a problem), good for code generation + execution patterns, solid Microsoft research backing.

**AutoGen weaknesses:** Harder to make deterministic (conversation-based flow is inherently open-ended), less suited for structured workflows with defined steps, HITL is less mature than LangGraph's.

**When to choose AutoGen:** Research prototypes, code assistant workflows, use cases where you want agents to have open-ended discussion.

### vs. Microsoft Semantic Kernel

Semantic Kernel is more of a framework for integrating LLMs into applications (plugins, planners) than a pure multi-agent orchestrator. It's the best choice for teams deeply invested in the Microsoft/Azure/.NET ecosystem.

**When to choose Semantic Kernel:** .NET applications, Azure-first deployments, tight integration with Microsoft 365.

### Framework Selection Matrix

| Requirement | LangGraph | CrewAI | AutoGen | Semantic Kernel |
|---|---|---|---|---|
| Fine-grained execution control | Best | Limited | Limited | Limited |
| Human-in-the-loop | Native, robust | Basic | Moderate | Basic |
| Persistent memory | Native (Store API) | Plugin | Plugin | Plugin |
| Multi-turn conversations | Native | Limited | Moderate | Moderate |
| Easy prototyping | Moderate | Best | Good | Moderate |
| Production debugging | LangSmith | Limited | Limited | Limited |
| .NET support | No | No | Yes | Best |
| Open-source | Yes | Yes | Yes | Yes |

The choice usually comes down to two dimensions: how much control you need over execution flow, and how quickly you need something running:

```mermaid
quadrantChart
    title Agent Framework: Control vs Prototyping Speed
    x-axis Slower to Prototype --> Faster to Prototype
    y-axis Less Execution Control --> More Execution Control
    quadrant-1 Most control, slower
    quadrant-2 Control + fast
    quadrant-3 Limited control, slower
    quadrant-4 Limited control, fast
    LangGraph: [0.30, 0.90]
    AutoGen: [0.50, 0.60]
    CrewAI: [0.82, 0.35]
    Semantic Kernel: [0.25, 0.55]
```

---

## Production Patterns and Gotchas

### State Size Management

LangGraph state is fully checkpointed after every node. If you store large objects (full retrieved documents, binary data) in state, your checkpoint storage grows fast. Keep large data in external storage and store only identifiers in state:

```python
# Bad: storing full documents in state
class BadState(TypedDict):
    retrieved_documents: list[dict]  # could be megabytes

# Good: store in external cache, reference by ID
class GoodState(TypedDict):
    document_ids: list[str]  # store IDs only
    # retrieve actual content from Redis/S3 in each node that needs it
```

### Timeouts and Error Boundaries

LangGraph doesn't automatically handle node-level timeouts. Add them explicitly:

```python
import asyncio
from functools import wraps

def with_timeout(seconds: int):
    def decorator(func):
        @wraps(func)
        async def wrapper(state):
            try:
                return await asyncio.wait_for(func(state), timeout=seconds)
            except asyncio.TimeoutError:
                return {"error": f"Node timed out after {seconds}s", "status": "timeout"}
        return wrapper
    return decorator

@with_timeout(30)
async def tool_execution_node(state: AgentState) -> dict:
    # This node will timeout after 30 seconds
    result = await execute_tool(state["tool_call"])
    return {"tool_result": result}
```

### Infinite Loop Prevention

Cycles are the feature, but infinite loops are the bug. Always include a guard:

```python
MAX_ITERATIONS = 10

def route_after_execution(state: AgentState) -> str:
    if state.get("retry_count", 0) >= MAX_ITERATIONS:
        return "max_retries_exceeded"
    if state.get("error"):
        return "retry"
    return "success"
```

### Thread ID Strategy

Thread IDs define conversation scope. Your ID strategy determines memory behavior:

```python
# Per-user, per-session: most common
thread_id = f"user_{user_id}_session_{session_id}"

# Per-user, persistent: all conversations share memory
thread_id = f"user_{user_id}"

# Per-request: no memory across requests (stateless)
thread_id = str(uuid.uuid4())
```

Choose deliberately — the wrong strategy either causes memory leakage between users or loses important context.

---

## When Not to Use LangGraph

LangGraph is not always the right tool:

- **Simple single-LLM calls**: Use the model API directly. No orchestration needed.
- **Deterministic pipelines with no branching**: A LangChain LCEL chain is simpler and faster.
- **One-off scripts or prototypes**: The boilerplate overhead isn't worth it for experiments.
- **Very low latency requirements (< 200ms)**: Graph compilation and state management add overhead that may be unacceptable for real-time use cases.

The pattern that consistently works: start simple (direct LLM calls), add structure when you hit limitations (tool use, multi-step reasoning), reach for LangGraph when you need reliable HITL, persistent memory, or complex conditional routing that requires explicit state management.

---

## Further Reading

- LangGraph Documentation. (2025). *LangGraph — Build and deploy agents*. [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/)
- LangGraph Blog. (2025). *LangGraph 1.0: Generally Available*. [blog.langchain.dev](https://blog.langchain.dev/langgraph-v1/)
- Harrison Chase. (2024). *Why I built LangGraph the way I did*. LangChain Blog.
- Woźniak, P. (2025). *Multi-Agent Patterns with LangGraph*. Towards Data Science.
- Microsoft. (2025). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*. [microsoft.github.io/autogen](https://microsoft.github.io/autogen/)
- CrewAI Documentation. (2025). *CrewAI: Framework for Orchestrating Role-Playing AI Agents*. [docs.crewai.com](https://docs.crewai.com/)
