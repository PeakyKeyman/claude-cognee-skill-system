---
name: design
description: "Multi-phase research-augmented design arc. Two interviews (before + after research), inventory, fan-out research, DA + peer-review + revision loop. Use for design-memo work where the question is real but the answer isn't settled. NOT for fast options (→ /custom:brainstorm) or implementation (→ /custom:plan)."
triggers:
  - "design memo"
  - "architecture session"
  - "let's design"
  - "/custom:design"
  - "let's research this and design"
  - "design conversation"
---

# Design Skill (Orchestrator)

This skill is the orchestrator that `/custom:design` invokes. It does NOT do the work itself — it sequences the eleven sub-skills that produce a research-augmented design memo. Each sub-phase is a separate Skill invocation; this file is the contract for the order and the skip rules.

## When to use

- Concrete locus exists: a scope change to make, a v1 to iterate, a specific architectural question.
- Multiple frameworks / disciplines bear on the answer (the choice is not mechanical).
- Research-augmented — facts you don't yet have would change the choice.
- A memo is the appropriate output, not a task list.

## When NOT to use

- Fast options for a sharp question → `/custom:brainstorm`.
- Single research lookup → `/custom:research` or `/deep-research`.
- Implementation decomposition → `/custom:plan`.
- Mechanical work with no design uncertainty → `/custom:execute`.
- Bug investigation → `/custom:debug`.

If the operator is reaching for `/custom:design` but the work fits one of the above, name the mismatch and recommend the correct skill before proceeding.

## Phase sequence

Invoke each phase in order via `Skill(skill="...")`. Skip a phase only with explicit operator confirmation against the criteria in the next section.

1. **First Interview** — `Skill(skill="design-first-interview")`
   - Surface what the operator already knows, what is locked vs flexible, and what genuinely needs research.
   - Codebase-first: if a question can be answered by reading code, read the code instead of asking.
   - Multi-question OK (clustered questions sharpen operator thinking); recommended-answer technique uses free-flowing prose, not binary confirm/reject.
   - Output: pre-research problem statement.

2. **Inventory** — `Skill(skill="design-inventory")`
   - What is already in the codebase touching this design? What is claimed vs what actually exists?
   - Produce inventory table with V/M/A/D triage (Verified / Missing / Aspirational / Deprecated).
   - Output: inventory table tied to file:line citations.

3. **Follow-ups** — `Skill(skill="design-followups")`
   - Recursive follow-up questions triggered by inventory surprises (deprecated paths, missing infrastructure, claims that didn't pan out).
   - Output: revised problem statement OR explicit confirmation that the pre-research statement holds.

4. **Research Fan-out** — `Skill(skill="design-research-fanout")`
   - Decompose the design question into N sub-questions. Dispatch `/deep-research` once per sub-question in parallel.
   - No agent-count cap — decompose into smaller sub-areas for deeper research where the surface area justifies it.
   - Each `/deep-research` invocation handles its own fan-out, adversarial verification, and cited synthesis.
   - Output: cited research returns (Appendix A of the eventual memo).

5. **Second Interview** — `Skill(skill="design-second-interview")`
   - Five waves: SURFACE → NECESSITY → DEEP → INSIGHT → REFRAMING.
   - NECESSITY wave is the taste-and-strategic-necessity check: "should this even exist?" / "are we overcomplicating?" / "what's the 5-line, 50-line, 500-line version?" / "what pre-existing solution covers this?" / "is this emotion-driven?"
   - If three or more NECESSITY concerns surface, the recommended verdict is ABANDON or NARROW-SCOPE — name it explicitly.
   - REFRAMING wave is where operator reframes land (e.g., "skill loadouts ARE the identity-of-investigation" from the prompt-system arch session) — this phase is decisive, not ceremonial.
   - Output: locked design statement OR ABANDON / NARROW-SCOPE verdict.

6. **Memo Draft** — `Skill(skill="design-memo-draft")`
   - 10-15 sections with `file:line` citations to the codebase + research citations to Appendix A.
   - Enumerate D1-Dn decisions with reasons. Name deferrals. List open questions.
   - Implementation estimates are honest, not aspirational (DA usually revises upward — record the revision openly).
   - Output: design memo v1.

7. **Revision Loop** — `Skill(skill="design-revision-loop")`
   - DA pass + peer-review pass + multi-pass revision until convergence.
   - Multiple revision passes are the norm, not a sign of failure (real sessions ran five passes through twelve sections).
   - Convergence = DA + peer-review return no new structural concerns and operator signals lock.
   - Output: design memo vN (locked).

8. **Handoff** — `Skill(skill="design-handoff")`
   - Lock decisions in the memo. Write the kickoff phrase the next session will open with.
   - Persist to project memory (`~/.claude/projects/<project>/memory/`) AND Cognee via `save_interaction` — both, per the memory write policy in `~/.claude/rules/cognee-usage.md`.
   - Output: hand-off artifact for the next session.

The phases above are eight named sub-skills. When the design arc requires it (large research surface, many open decisions), the Research Fan-out, Second Interview, and Revision Loop phases each expand internally into multiple passes — the orchestrator counts the expanded passes as part of the eleven-phase total, but the operator-visible phase boundary remains at the eight sub-skill invocations.

## Phase skip criteria

- **Skip Inventory + Follow-ups**: only if the operator explicitly says "this is net-new, nothing exists yet." Default is to run them — most "net-new" claims are wrong on inspection.
- **Skip Research Fan-out**: only if the problem statement is fully grounded in existing code and specs, and the First Interview surfaced no facts the operator wants to verify. Rare.
- **Skip Peer-Review (within Revision Loop)**: only for low-stakes design notes, not architectural memos. If the memo will be cited in future sessions, peer-review is mandatory.
- **NEVER skip First Interview, Second Interview, or DA review.** These three are the load-bearing operator-engagement phases; skipping any of them collapses the arc into a worse version of `/custom:plan`.

## What NOT to do

- Don't run phases out of order — each builds on the prior phase's output.
- Don't compress two phases into one — multi-pass discipline is the point of the arc.
- Don't accept "let's just plan" mid-arc — that's `/custom:plan`'s job. If the operator wants to pivot, close the design arc with a NARROW-SCOPE verdict and hand off to `/custom:plan` explicitly.
- Don't lock the memo without the Second Interview's REFRAMING wave — operator reframing is where the largest architectural moves land.
- Don't propose your own design during the First or Second Interview — that's the operator's seat. The orchestrator surfaces options and asks; it does not advocate until after Research Fan-out.
- Don't validate prematurely. Don't answer your own questions. Don't enforce one-question-at-a-time in the First Interview — multi-question is fine when the operator's thinking is sharper with clustered questions.

## Termination

The arc terminates at one of three points:

1. **Lock at Handoff**: memo vN is locked, decisions are recorded, kickoff phrase is written, memory + Cognee are updated.
2. **ABANDON / NARROW-SCOPE at Second Interview**: three or more NECESSITY concerns surfaced; the recommended verdict is to not build this, or to build a much smaller version. Record the reasoning and stop.
3. **Operator signal**: the operator explicitly says "we're done" or "park this." Record current state to memory and stop at the current phase boundary.

Do not continue past natural lock just because phases remain on the list. The phase sequence is a guide, not a checklist to exhaust.

## Sources

Patterns sequenced by this orchestrator are lifted from:

- grill-me (Matt Pocock): https://github.com/mattpocock/skills — interview discipline, codebase-first override, depth-tree walking, periodic structured summary, termination heuristics.
- Obra Superpowers: https://github.com/obra/superpowers — brainstorming structure, design contract, hard gate against premature implementation.
- grillme-skill (Jekudy): https://github.com/Jekudy/grillme-skill — wave structure (surface → deep → insight), analytical lenses (strategic / systemic / psychological / adversarial).

The NECESSITY wave, the multi-pass revision loop, and the two-interview structure (before + after research) are Cian-specific additions calibrated from three real design-memo sessions on this project. They are load-bearing — do not collapse them back to the marketplace defaults.
