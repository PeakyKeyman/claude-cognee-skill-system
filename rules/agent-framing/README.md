# Agent-System Framing & Competitive Scope (MANDATORY)

**Trigger:** Building, designing, auditing, planning, evaluating, or scoping any agent, agentic framework, multi-agent system, or LLM-driven workflow. Fires on words like "agent," "framework," "pipeline," "orchestrator," "synthesis," "tool-calling," "agentic," and on file paths under `agent_*`, `*_agent*`, `multi_agent`, `strategic_advisor*`, `orchestrator/`, `agent_engine/`, etc.

## Rule (mandate, no softening)

**When building agents, the default target is to dominate every GTM agent on every dimension that matters for replacing a human employee.** Not "match the audit's scope." Not "fix what's broken." Not "ship a working version." The bar is: this agent absolutely destroys every existing GTM/enterprise agent across all 12 axes (see [12-axes.md](12-axes.md)). Trade-offs apparent in this list are almost always resolved by adding a meta-architecture layer rather than by compromising any single axis.

If the user's framing implies a smaller bar ("just fix this," "good enough for now," "we'll handle that later"), **challenge the framing before scoping.** The user's framing will have blindspots — always. Surface them.

## Sub-rules (read these in order)

1. [12-axes.md](12-axes.md) — the canonical list of dimensions that matter
2. [checks.md](checks.md) — 9 operational checks to run when scoping
3. [red-flags.md](red-flags.md) — what to watch for during sessions

## Historical context

For the 2026-05-10 incident that this rule was codified to prevent, see `~/.claude/references/agent-framing-failure-modes.md`.

## Honest tension

This rule expands scope. Sessions that would have shipped a 2-week sprint plan now produce 6-8 weeks (or longer) addressing every dimension. **That is the correct outcome.** The audit's "ship faster, narrower" instinct is the failure mode. If the user wants a narrower bet, the user EXPLICITLY says so after seeing the full dimensional picture — not by default through under-scoped framing.

## Scope of this rule

Applies to: agent system design, multi-agent orchestration, LLM workflow architecture, RAG systems, autonomous agents, conversational systems.

Does NOT apply to: pure data engineering, pure UI work, pure DevOps, single-component fixes that don't touch agent architecture. (For those, the other rules in this directory govern.)
