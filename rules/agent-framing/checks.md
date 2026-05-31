# 9 Operational Checks (Agent-Framing)

Run these in order when scoping any agent-related work.

## Check 1 — Session-start competitive landscape sweep (~5 min, mandatory)

For any agent / framework session, before opening the user's framing:

```bash
git fetch origin
git log origin/main..HEAD --oneline | wc -l   # commits on our branch
git log HEAD..origin/main --oneline           # commits on main since fork
git diff --name-status HEAD..origin/main -- <agent-related-paths>
```

If main has substantial divergence on agent-related paths, **surface this BEFORE accepting the user's session framing**. The user's framing assumes a baseline; if the baseline is stale, the framing is wrong.

## Check 2 — SOTA references pull (mandatory before any agent-design planning)

Pull current SOTA references via Context7 or web search. Minimum coverage:
- Anthropic's research-system (multi-agent orchestration patterns)
- ADK / Vertex AI Agent Development Kit patterns
- ReAct, Reflexion, Multi-Agent Debate, MoA (Mixture of Agents)
- Devin, Manus, Cognition agent architectures (insofar as public)
- Smolagents, BAML, AutoGen patterns
- Anthropic skills / cookbook patterns

You have training knowledge of these. Use it. Working in isolation from the field IS the failure mode the rule prevents.

## Check 3 — Dimensional enumeration BEFORE scoping work

When asked to plan, audit, or build an agent, enumerate every dimension that matters BEFORE accepting a scope. See [12-axes.md](12-axes.md) for the canonical list.

For each dimension: where do we stand, where does SOTA stand, where does the competition stand, where does the median human employee stand?

## Check 4 — Reject menu-of-three framings that lack the maximalist option

When an audit / planner / RFC offers a menu like "(i) fix gaps, (ii) salvage, (iii) rebuild," ask: "where is option (iv) — extend scope to dominate every dimension?" If the menu doesn't include it, the menu is wrong. Surface the missing option.

## Check 5 — Don't trust audits without dimensional verification

Audits self-scope. Their scope can be — and frequently is — wrong.

- List every dimension the audit DID examine.
- List every dimension the audit DID NOT examine.
- For each unexamined dimension, ask whether the system wins there. If unknown, investigate before any sprint work.
- "The audit found X gaps" is a lower bound on the gap count, not the total. Treat it as such.

## Check 6 — Reject "Future Ambitions" framing for competitive deficits

Distinguish:
- **Future Ambition**: a capability beyond every competitor's surface (legitimate parking lot).
- **Competitive Deficit**: a capability the competition has and we don't (must be in scope, not parked).

A "Future Ambitions Backlog" entry that is actually a competitive deficit is a self-deception. Surface deficits explicitly with the comparison cited (e.g. "agent_engine has X; we don't; this is a deficit not an ambition").

## Check 7 — Don't scope defensively around limits — attack the limits

When asked about a constraint or limit, do NOT make peace with the limit. Propose closing it.

- ❌ "v2 lacks BQ tools, so let's exclude CSVs from the eval"
- ✅ "v2 lacks BQ tools — register them in this sprint"
- ❌ "the verifier is inert; let's defer questions that need verification"
- ✅ "the verifier is inert; here's the work to wire it"
- ❌ "we have only 3 personas; let's avoid persona-sensitive questions"
- ✅ "we have only 2 personas; here's what it takes to author the missing 2"

The default disposition is "the gap is closing in this sprint." If the user wants to defer a gap, the user explicitly says so; you don't pre-defer on their behalf.

## Check 8 — When dimensions appear to conflict, find the meta-architecture

Apparent dimension-conflicts are usually solved by an additional layer that picks correctly per request:
- Latency vs depth → triage classifier routes per question.
- Cost vs quality → model routing routes per stage.
- Breadth vs specialization → tool registry + dispatch routes per capability need.
- Stability vs innovation → kill-switch + canary list routes per org.

Do NOT compromise a dimension when the resolution is "build the layer that picks." The mandate is win-on-every-dimension; the implementation is meta-architecture-resolves-conflicts.

## Check 9 — Steal aggressively from open source and adjacent codebases

Search order:
1. Existing repo code
2. Library / package
3. Adjacent codebases on the same project (different branches, parallel frameworks)
4. Context7 (library docs)
5. Known SOTA OSS repos (smolagents, agentic-cookbooks, ADK examples, LangGraph cookbook, LlamaIndex, BAML, Anthropic research-system patterns)
6. Build custom

When the user authorizes "we can steal things," that's permission to copy/adapt patterns from any of (3)-(5) into the system. Do it.
