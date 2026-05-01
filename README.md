<div align="center">

# JustAi

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-7c8aef.svg)](https://justai-demo.vercel.app)
[![Status: pre-public](https://img.shields.io/badge/status-pre--public-orange.svg)](#status)
[![Tag: v0.4.0](https://img.shields.io/badge/tag-v0.4.0-blue.svg)](#status)

**A thin project-orchestration layer over a safe-by-construction local-execution substrate for mini-swe-agent–style coding agents.**

[**🌐 Try the live demo**](https://justai-demo.vercel.app) · [**📐 The thesis**](#the-thesis) · [**🧱 Architecture**](#three-repo-architecture) · [**📊 Status**](#status)

[![Mission Control screenshot](screenshots/mission-control.png)](https://justai-demo.vercel.app)

</div>

---

JustAi sits between an engineering goal and the bash actions that fulfill it. It decomposes goals into chunks sized to a budgeted bash-action loop, dispatches each chunk through a sandboxed runner, classifies failures with a structured taxonomy, and learns from every run. The substrate underneath — `safe-mini` — is what makes the loop trustworthy on private repos: scoped worktrees, scrubbed environment, command/path guards, and an incident artifact for every action.

## Why JustAi

Coding agents that decide one bash command at a time are powerful and dangerous in the same breath. A single misstep — a stray `rm -rf`, an accidental commit of a `.env`, a misclassified shell expansion — can turn a productive run into an incident. Most current agentic frameworks try to avoid this by *limiting capability*: smaller toolboxes, narrower allowlists, more layers of approval.

JustAi takes the opposite approach. **Sandbox the boundary, not the capability.** Inside a properly-scoped boundary — a fresh worktree, scrubbed env, guarded path — give the agent broad capability. Outside the boundary, deny by default. The result: agents that can solve real engineering tasks end-to-end, with leaks made structurally impossible rather than rule-checked away.

JustAi is the **orchestration UX** on top of that boundary. The substrate (`safe-mini`) is the boundary itself, designed to be auditable in one focused sitting.

## What JustAi is for

- Engineering teams who want autonomous coding-agent runs *on their actual private code* without unbounded risk.
- Researchers who want to reason about agent capability vs. safety as separable axes.
- Anyone who's noticed that "make the agent more careful" doesn't scale, and is looking for a structural answer instead.

## What JustAi is **not**

- Not a model. Brings your own LLM via LiteLLM.
- Not a benchmark harness. That's `local-resident`'s job (separate repo, post-closure).
- Not a runtime substrate by itself. The substrate is `safe-mini` (separate repo, post-closure).
- Not a finished product. See [Status](#status) — currently pre-public, in stabilization.

## The thesis

[mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) decides one bash command at a time within a budget — about a hundred lines of agent loop. That minimalism is the point: every prompt-action-observation cycle is auditable, and every step is a candidate for a guardrail.

JustAi's bet: **sandbox the boundary, not the capability.** Inside a properly-scoped boundary, give the agent generous capability. Outside the boundary, deny by default. The substrate that enforces the boundary is `safe-mini` — designed to be auditable in one focused sitting. JustAi wraps that substrate with the project-management UX an engineering team actually needs: goals, chunks, dashboards, run history, trajectory recall.

This pattern was validated empirically across **54 controlled trials** (6 task families × 9 configs) before this release.

> **Headline finding.** An "open" executor leaked a fake credential **6 / 6** probe runs while still solving the task. The "safe" executor blocked **6 / 6** probes and still solved **6 / 6** tasks. Capability is preserved; the leak surface isn't.

Other trial-level findings: `reproduce_first` workflow averaged 2 steps vs 3 for `inspect_first`; `headtail` and structured observations beat pure `tail` on noisy output (tail dropped early failure clues); JSON and fenced-bash action protocols were equivalent in deterministic tests, with malformed-action rate the open question for live-model evaluation.

## What the orchestrator does

`justai/` — the orchestrator (this is what JustAi ships).

| Module | Role |
|---|---|
| `scope_planner.py` | Decomposes a goal into chunks fitted to a bash-move budget. Chunks know their move budget AND their observation budget. |
| `intent_gate.py` | Classifies the goal type before any execution — execution / multi-step / research / ambiguous. |
| `reviewer.py` | Pre-dispatch quality gate — catches ambiguous descriptions and missing success criteria. |
| `checkpoint.py` | Risk-level approval (R0 auto through R3 manual). |
| `agent_dispatch.py` | Runs each chunk through the substrate runner. |
| `runner_protocol.py` | Local stub of the AgentRunner Protocol — moves to `safe-mini` once that repo is stood up. |
| `trajectory.py` + `memory.py` | Per-step record of every run: action type, file touched, observation, outcome. Vector-indexed, queryable across runs and projects. |
| `dashboard/` | Mission Control · Task Board · Trajectories · Memory · Agents · Observability views. |

What does **not** ship in JustAi, by design:

- The runner itself, the observation policies, the executor policies, the failure classifier, the worktree provisioner — those live in `safe-mini` (substrate layer, separate repo).
- The benchmark task corpus and the experiment-driver harness — those live in `local-resident` (researcher repo, separate).

## Three-repo architecture

JustAi is one of three repos that share a substrate.

![Three-repo architecture](architecture.png)

Both consumers depend on `safe-mini` as a peer. `safe-mini` does not know about its consumers' domain models — it's intentionally generic, so future projects can ship on top of the same substrate.

### The substrate's failure taxonomy

| Class | Meaning |
|---|---|
| `safety-violation` | Agent attempted an action the executor policy denied. |
| `action-protocol-violation` | Output didn't parse as a valid action. |
| `exhausted-ideas` | Budget remained but loop converged without progress. |
| `budget-exhausted` | Move or observation budget hit the cap. |
| `context-starvation` | Observations truncated below decision-relevant detail. |
| `reward-hacking` | Test passed by means unrelated to the requested change. |
| `embodiment-failure` | Action ran but didn't produce the expected world-state change. |

Failure-classified runs feed back into the planner: chunks that hit `context-starvation` get larger observation budgets next time; chunks that hit `safety-violation` get re-decomposed around the boundary that tripped.

## The dashboard

[![Try the live demo](https://img.shields.io/badge/▶-Try%20the%20live%20demo-7c8aef?style=for-the-badge)](https://justai-demo.vercel.app)

The interactive demo at [justai-demo.vercel.app](https://justai-demo.vercel.app) runs a full simulated sprint — eight tasks, three agents, real-time dashboard updates — entirely in the browser. No backend dependencies. The simulation drives the same UI components the real orchestrator uses; it's a fair preview of the production experience.

### Mission Control
Active runs, per-model cost, stage latency, sprint timeline at a glance.

![Mission Control](screenshots/mission-control.png)

### Task Board
Kanban with attempt count, retry, duration, escalation history per task.

![Task Board](screenshots/task-board.png)

### Trajectories
Per-run timeline with phase markers, AI-generated post-mortem analysis.

![Trajectory post-mortem](screenshots/trajectory-postmortem.png)

### Observability
Cost-vs-quality scatter, p50/p90/p99 latency by stage, token usage trends.

![Observability](screenshots/observability.png)

### Agents and Memory
Agent-pool status with current assignments; searchable trajectory + run-result corpus.

<table><tr><td>

![Agents](screenshots/agents.png)

</td><td>

![Memory Browser](screenshots/memory-browser.png)

</td></tr></table>

Sprint controls live in the top bar: pause, replay, speed multiplier. The simulation is deterministic at a given speed — replay produces identical trajectories.

## Status

Engineering surface is currently being prepared for public release. The repo is private during stabilization; the live demo (above) is the public-facing artifact, alongside this landing page.

Phase summary:

- **Phase 1–3** — closed.
- **Phase 4** — A through F landed 2026-04-29 (control-plane reframe, dead-code amputation, module renames, Protocol stub). G+H landed 2026-04-30 (ruff/mypy clean, test cleanup, docs-contract test lock-in).
- **Phase 5** — ratification: secrets scrub (gitleaks), dependency audit (pip-audit + npm audit), license check, install-verify in clean venv, dashboard build verify, 3-repo plan consistency. Verified 2026-04-30.
- **Phase 6** — closure: tag `v0.4.0`, squash-merge to main, sync demo-build with main. Landed 2026-04-30.

Verification at closure: 370 pytest passes, ruff clean, mypy clean, gitleaks clean (with narrow historical allowlist), pip-audit clean, npm-audit clean, install-verify in clean venv passes, dashboard build + smoke pass, 3-repo plan consistent.

Once post-closure polish + the historical-secret rotation gate completes, `safe-mini` and `local-resident` will be stood up as their own public repos.

## Built by

**Justin Leopard** — [Delegate & Orchestrate](https://delegateandorchestrate.com).

For research/collaboration inquiries — open an issue, or contact via the website.

## License

MIT — see [LICENSE](./LICENSE).
