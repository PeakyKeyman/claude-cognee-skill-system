---
name: design-first-interview
description: "First-pass design interview before research. Surfaces what operator knows, where they're uncertain, what's locked vs flexible. Codebase-first; multi-question OK; no hard ceiling; conversational not interrogative."
triggers: ["design interview", "first interview", "let's talk through this design", "/custom:design-interview-1"]
---

# Design — First Interview

## When to use
- Sub-skill of `/custom:design` (orchestrator); also invocable standalone via `/custom:design-interview-1`
- Concrete design locus identified, but multiple aspects fuzzy
- Operator wants to talk through the problem space BEFORE research dispatches

## When NOT to use
- `/custom:brainstorm` for fast 2-3 options on a sharp question
- `/custom:plan` if design is already settled

## Pre-interview (silent, 3-5 min)
- Read project `CLAUDE.md`, `KNOWN_ISSUES.md`, and `TODO_SESSIONS.md`
- Recent commits in the relevant area: `git log --oneline -10 -- <relevant-paths>`
- Form 3 priors on what the user probably wants
- DO NOT share priors yet — they bias the early conversation

## Discipline (lifted from Matt Pocock grill-me + Obra Superpowers)

**Codebase-first override (non-negotiable):** If a question would be answered by reading code, READ THE CODE and present the finding instead of asking the operator to look it up. Use CodeGraph or grep.

**Depth-tree walking:** Pick a branch of the design space and explore it until it resolves or operator defers. Then move to the next branch. Don't jump between branches mid-thought.

**Multi-question OK:** Questions can cluster when they sharpen each other. The operator has explicitly said his thinking is stronger with multi-Q exchanges. Do NOT enforce one-question-at-a-time — that's marketplace orthodoxy that doesn't fit this operator.

**No question-category constraint:** ANY question that helps the design is valid. Examples of question shapes you might draw from (NOT an exhaustive list):
- Goal: what user-facing outcome does this serve?
- Constraints: what's locked vs flexible?
- Scope: what's explicitly out?
- Alternatives: what other approaches considered and rejected?
- Failure modes: what worries you?

These are examples to anchor on, not a checklist to complete.

**Recommended-answer technique (free-flowing prose):** When you have a strong hunch, share it as a paragraph — describe how you're thinking about it. The operator responds conversationally. DO NOT use binary "confirm / change / lock" framings.

**Periodic structured summary every ~8-10 exchanges:** Show resolved / open / under-examination state so both parties see where the conversation is. Don't force the pace; just make state visible.

## What NOT to do
- Do NOT propose a design — that's the memo's job downstream
- Do NOT validate prematurely ("great answer!" / "perfect")
- Do NOT skip codebase-first — the cheapest answer is the one already in the code
- Do NOT answer your own questions
- Do NOT enforce one-question-at-a-time
- Do NOT impose a turn ceiling

## Termination (natural lock)
End when ONE of:
- The conversation has resolved enough that INVENTORY (read what exists) or RESEARCH (look beyond) is the obvious next step
- Operator signals "I think you have enough" / "let's move on"
- The same question keeps surfacing — signals a fuzzy area better suited to research, not more interview

## Output

A "Pre-research Problem Statement" with:

```markdown
# Pre-research Problem Statement: <design topic>
## Date: <YYYY-MM-DD>
## Goal
<one paragraph in operator's words, confirmed verbatim>

## Locked vs Flexible vs Negotiable
- LOCKED: <constraints, decisions already made>
- FLEXIBLE: <approach, sequencing, scope of v1>
- NEGOTIABLE: <areas where operator wants Claude's recommendation>

## Open questions worth researching
1. <question> — disciplines/sources to consult
2. ...

## Pre-existing patterns / code referenced
- <path:line> — <what it does>
- ...

## Recommended next phase
- INVENTORY (most cases) — read what already exists before research
- RESEARCH (if no relevant code exists or scope is greenfield)
```

## Sources for patterns
- grill-me by Matt Pocock: https://github.com/mattpocock/skills
- Obra Superpowers brainstorming: https://github.com/obra/superpowers
