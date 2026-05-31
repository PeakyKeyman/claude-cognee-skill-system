---
name: design-followups
description: "Post-inventory follow-up questions. Narrow, recursive, triggered by what the inventory surfaced. Bridges the gap between 'we thought X' and 'the code says Y'. Output: revised problem statement OR confirmation of original."
triggers: ["design followups", "post-inventory questions", "/custom:design-followups"]
---

# Design — Follow-ups

## When to use

- Sub-skill of `/custom:design` invoked after the Inventory phase completes
- Inventory surfaced surprises, contradictions, or facts that change the design's assumptions
- Typical triggers: existing code already covers part of the proposed design; a recent commit shifted the relevant module; two prior memos disagree; a load-bearing assumption from the First Interview turned out to be wrong

## When to skip

- Inventory was clean — no surprises, no contradictions, no recent activity in the area
- All surprises are minor and don't touch the design's core direction
- Operator explicitly waives ("inventory was fine, go straight to research")

In skip cases, hand off directly to the research fan-out phase with the original Pre-research Problem Statement unchanged.

## Process

### Pattern: recursive question-drilling

Lifted from Composio's question-drilling pattern. At each operator answer, surface ONE child question if the answer opens a new branch. Continue down that branch until it resolves, then return to the next inventory finding. Stop when the branch closes or the operator defers.

This is depth-first, not breadth-first: don't bounce between unrelated inventory findings. Walk one finding to resolution, then move to the next.

### Question shapes triggered by inventory findings

Map each inventory surprise to a follow-up question shape:

- **Existing code already does part of the design** → "Does this change the scope of what we're building? Are we now extending X rather than building Y?"
- **Inventory contradicts a load-bearing assumption from First Interview** → "Assumption A from the pre-research statement was wrong — how does this affect [specific decision] that depended on it?"
- **Recent commit changed the area materially** → "Were you aware of commit `<sha>` landing `<change>`? Does it shift the design's starting point?"
- **Two memos / decisions contradict** → "Memo X says A; memo Y says B. Which is the canonical decision? Should we reconcile them before proceeding?"
- **Deprecated infrastructure surfaced** (per `rules/inventory-before-building.md` corollary) → "The module we'd extend is built against deprecated API surface — does that change the build-vs-replace call?"
- **Capability already exists elsewhere in the codebase** → "Parallel framework Z already implements this. Steal from it, extend it, or build fresh and explain why not steal?"

### Multi-question OK

Cluster questions when they sharpen each other (same rule as First Interview — Cian thinks more sharply with clustered questions). Don't enforce one-at-a-time. But keep clusters tight: 2-4 related questions, not a dozen.

### Short by design

5-10 follow-up questions total is the typical envelope. If you find yourself drilling a deep tree again, that's a signal the First Interview terminated too early — note it explicitly in the output ("First Interview gap: <area> was not explored; surfaced via inventory") and proceed.

### Recommended-answer technique

When useful, offer a recommended answer in free-flowing prose (NOT binary confirm/reject) — same convention as First Interview. The operator either agrees, refines, or rejects. Don't ask "A or B?" when "here's what I'd recommend and why" gets a sharper answer.

## Output

Either a revised Pre-research Problem Statement OR a confirmation note that the original holds. Use the same format as First Interview's output so the downstream research fan-out phase doesn't have to special-case the input shape.

```markdown
# Post-Inventory Problem Statement (revised): <design topic>
## Date: <YYYY-MM-DD>

## Changes from pre-inventory version
- <what changed and why — cite the inventory finding that drove the change>

## Updated goal
<one paragraph>

## Updated locked / flexible / negotiable
<as in First Interview output — call out which items moved between categories>

## Open questions for research (refined)
1. <question, narrowed or broadened based on inventory>
2. <question>

## Recommended next phase
- RESEARCH FAN-OUT (almost always)
```

If the original holds unchanged, output a confirmation note instead:

```markdown
# Post-Inventory Confirmation: <design topic>
## Date: <YYYY-MM-DD>

Inventory surfaced no material contradictions. Pre-research Problem Statement from First Interview stands as-is.

Inventory findings considered:
- <finding 1> — does not affect <decision>
- <finding 2> — does not affect <decision>

## Recommended next phase
- RESEARCH FAN-OUT
```

## What NOT to do

- **DON'T re-litigate decisions already locked** unless inventory directly contradicted them. The First Interview's locked items are load-bearing; reopening them without cause restarts the arc.
- **DON'T expand into a second full interview.** This is a targeted follow-up, not a re-run. If the inventory was so disruptive that a full re-interview is warranted, name that explicitly and hand back to `/custom:design` First Interview.
- **DON'T accept "let's just keep going" if inventory contradicts a load-bearing assumption** — that's the bug this skill exists to prevent. Surface the contradiction, force the reconciliation, then proceed. Per `rules/inventory-before-building.md`, silently extending against contradicted assumptions is the failure mode.
- **DON'T propose the design itself** here. Follow-ups refine the problem statement; the design comes later in the arc.
- **DON'T validate prematurely.** If the operator's answer feels too quick on a load-bearing question, surface a child question rather than accepting and moving on.

## Sources

- Composio question-drilling (recursive child-question pattern)
- Matt Pocock grill-me — codebase-first override, depth-tree walking (https://github.com/mattpocock/skills)
- Obra Superpowers brainstorming — don't propose during interview, don't validate prematurely (https://github.com/obra/superpowers)
- Jekudy grillme-skill — wave structure adapted to single-pass follow-up (https://github.com/Jekudy/grillme-skill)
- `~/.claude/rules/inventory-before-building.md` — corollary on deprecated-infrastructure surfacing
