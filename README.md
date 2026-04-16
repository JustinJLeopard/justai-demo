# JustAi

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Tests: 479 passing](https://img.shields.io/badge/tests-479%20passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Multi-model AI orchestrator with swarm delegation, trajectory replay, and real-time dashboard.

JustAi gives AI agents what they're missing: **planning, memory, and accountability.** Give it a goal in plain English. It decomposes it into tasks, executes them locally or delegates to agent swarms, persists every decision in memory, and surfaces everything in a real-time dashboard.

Built on research from Princeton & Stanford's [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) (74% SWE-bench Verified).

---

## How It Works

```
You                    JustAi                         Agent Swarm
 |                       |                                  |
 |  "add /health         |                                  |
 |   endpoint"           |                                  |
 | ───────────────────► |  1. preflight (service health)    |
 |                       |  2. load session context          |
 |                       |  3. classify intent               |
 |                       |  4. decompose into tasks          |
 |                       |  5. review plan quality           |
 |                       |  6. evaluate risk gates           |
 |                       |  7. execute locally  ──── OR ───► |
 |                       |                                   |  execute
 |                       |  8. synthesize results  ◄──────── |
 | ◄──────────────────── |  9. store in memory               |
 |  "done — 1 task,      |                                  |
 |   10s, /health added" |                                  |
```

## Architecture

```
┌──────────────────────────────────────────────┐
│                  CLI / API                    │
├──────────────────────────────────────────────┤
│              Orchestrator                     │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ Planner │ │ Reviewer │ │ Intent Gate   │ │
│  └────┬────┘ └────┬─────┘ └───────┬───────┘ │
│       │           │               │          │
│  ┌────▼───────────▼───────────────▼────────┐ │
│  │            Execution Layer              │ │
│  │  ┌──────────┐  ┌────────────────────┐   │ │
│  │  │ Local    │  │ Swarm Delegator    │   │ │
│  │  │ Executor │  │ (parallel dispatch)│   │ │
│  │  └──────────┘  └────────────────────┘   │ │
│  └─────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  ┌──────────┐ ┌───────────┐ ┌────────────┐  │
│  │ Memory   │ │ Trajectory│ │ Learning   │  │
│  │ (persist)│ │ (replay)  │ │ (adaptive) │  │
│  └──────────┘ └───────────┘ └────────────┘  │
├──────────────────────────────────────────────┤
│              Dashboard (React)               │
│  Tasks · Runs · Memory · Traces · Health     │
└──────────────────────────────────────────────┘
```

**25 modules** · **479 tests** · **~11K lines**

### Core Modules

| Module | What It Does |
|--------|-------------|
| **Orchestrator** | 9-step pipeline: preflight → context → intent → plan → review → risk → execute → synthesize → memorize |
| **Planner** | Decomposes goals into dependency-ordered, well-scoped tasks |
| **Reviewer** | Quality gates — rejects vague or overlapping plans before execution |
| **Executor** | Local execution with sandboxing, timeout, and output capture |
| **Swarm Delegator** | Parallel task dispatch across multiple agents via claude-flow |
| **Delegator** | Single-agent delegation via SpacetimeDB to mini-swe-agent |
| **Memory** | Persistent session memory — decisions, outcomes, context across runs |
| **Trajectory** | Full execution replay — every step, every decision, searchable |
| **Learning** | Adaptive layer that enriches context from past runs |
| **Intent Gate** | Classifies incoming goals and routes to appropriate execution path |
| **Checkpoint** | Pause/resume long-running pipelines with human-in-the-loop review |
| **Dashboard** | React dashboard with 7 real-time views — tasks, runs, memory, traces, health |

### Key Design Decisions

- **Cheap model first, escalate only when needed** — Intent classification and simple tasks use fast/cheap models. Complex reasoning escalates to stronger models automatically.
- **Memory is not optional** — Every run persists its full context, decisions, and outcomes. Future runs learn from past ones.
- **Tests are not optional** — 479 tests with a ~1:1 code-to-test ratio. If it's not tested, it doesn't ship.
- **Local-first** — Everything runs on your machine. No cloud dependency, no API lock-in beyond the LLM calls themselves.

## CLI

```bash
justai run "goal"                  # full pipeline with agent delegation
justai run --auto "goal"           # skip confirmation checkpoint
justai run --auto --local "goal"   # execute locally (no agent needed)
justai run --auto --swarm "goal"   # parallel dispatch via agent swarm
justai plan "goal"                 # decompose into tasks (no execution)
justai status                      # service health + memory stats
justai history                     # recent runs from memory
```

## Dashboard

Seven real-time views:

| View | Description |
|------|------------|
| **Task Board** | Active tasks with status, assignee, progress |
| **Run History** | Every pipeline run with timing and outcomes |
| **Memory Explorer** | Browse and search persistent memory |
| **Trajectory Viewer** | Step-by-step execution replay |
| **Service Health** | Live health checks for all dependencies |
| **Tracing** | OpenTelemetry-style distributed traces |
| **Config** | Runtime configuration management |

## Status

JustAi is in active development and used daily as my primary AI development workflow. The full source is in a private repository.

**Interested in JustAi?** → [delegateandorchestrate@delegateandorchestrate.com](mailto:delegateandorchestrate@delegateandorchestrate.com)

## License

MIT
