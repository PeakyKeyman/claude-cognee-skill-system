# Agent-Framing Failure Modes (Historical)

This file contains the historical context behind the agent-framing-and-competitive-scope rule. It's reference material, not a rule itself. Read when you want to understand the *why* behind the rule's mandate.

## The 2026-05-10 incident — original codification

Operating without an agent-framing rule produced a real session-level failure on 2026-05-10:

An audit + triage + sprint plan was scoped to fix v2's internal coherence on a narrow dimension (structured strategic analysis) without ever asking whether v2's surface area was correct against the competitive landscape.

A parallel framework (`agent_engine`) was built on `origin/main` over the same 3 days the audit was being authored.

The audit never asked "what's on main?"; the triage never asked "what would Devin / Manus / Cognition / SOTA agent_engine look like?"; the eval scoped defensively around v2's capability gaps.

**The result:** ~7 sessions of detailed work optimizing a single-dimension agent while the competitive landscape advanced unobserved. **Cost: ~7 sessions of misallocated work.**

This rule was codified to prevent the recurrence.

## The mental shape this incident revealed

The failure mode wasn't ignorance of the competitive landscape — it was working from inside one system's mental model without questioning whether the model itself was right. The audit's "fix v2's coherence" framing was a coherent task. The framing was wrong because the v2 surface area was wrong, not because v2's internal structure was wrong.

Catching this requires a step *outside* the framing — explicitly: "what would the SOTA do here?" and "what's on parallel branches that we haven't looked at?"

## Why the rule mandates dimensional enumeration

The 12 axes (see `~/.claude/rules/agent-framing/12-axes.md`) exist because "competitive scope" is too vague to act on. Enumeration is mechanical: list every axis, ask where we stand on each, compare to SOTA + competition. Then the gap is concrete and the scope is grounded in measurement, not vibe.

## Related rules

- `~/.claude/rules/agent-framing/` (the rule itself, decomposed into README + 12-axes + checks + red-flags)
- `~/.claude/rules/inventory-before-building.md` (the local-codebase variant — inventory the existing infrastructure before proposing new)
