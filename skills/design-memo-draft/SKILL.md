---
name: design-memo-draft
description: "Memo draft phase. Structures the locked design into a 10-15 section memo with file:line citations, V/M/A/D triage of inventory, D1-Dn decisions with reasons, deferrals named. Output: design memo v1 ready for DA + peer-review."
triggers: ["design memo draft", "draft design memo", "/custom:design-memo"]
---

# Design — Memo Draft

## When to use

- Sub-skill of `/custom:design` after Second Interview locks the design.
- The locked design needs to be written up as a memo for DA review + future-self continuity.
- Operator says "draft the memo" / "write it up" / "memo v1" after the reframe wave settled.

## When NOT to use

- Quick decision note → just write a paragraph in the operator's notes; the memo overhead is unjustified.
- ABANDON verdict from Second Interview → use `/custom:design-handoff` to write the "why abandoned" memo instead. A full architecture memo for an abandoned design wastes future-reader attention.
- Inventory not yet run, or research dispatches not yet returned. The memo is downstream of those phases; drafting early bakes in placeholders that survive into DA review.

## Memo structure (10-15 sections)

The memo lives at `.planning/<topic>_design_<YYYY-MM-DD>.md` in the project repo. Use the operator's topic slug (snake_case), not a generic name.

Required sections in order:

### §0 Frontmatter

- Title (matches the locked design statement, not a marketing line)
- Date (ISO YYYY-MM-DD)
- Status: `DRAFT v1 (pending DA + peer-review)`
- Provenance: name the upstream phases by count — "First Interview (N turns), Inventory (M items triaged), Research dispatches (K sub-questions via /deep-research), Second Interview (5-wave reframe)"

### §1 Executive Summary

- 2-3 paragraphs.
- Match the locked design verbatim — do not editorially expand or soften.
- Cite all evidence sources used (research returns by sub-question name; codebase files by path).
- A reader who only reads §1 should know: what is being built, what it replaces or extends, what was rejected, and why.

### §2 Goal + Necessity

- The locked design statement, in the operator's own words from the Second Interview close.
- Necessity verdict from Second Interview NECESSITY wave: `BUILD-AS-DESIGNED` | `NARROW-SCOPE` | `BUILD-LATER` | (ABANDON would have been routed to `/custom:design-handoff` upstream).
- For NARROW-SCOPE: list what got cut and the reason cited (customer value, opportunity cost, simplification line count, pre-existing solution, emotion-driven framing).
- For BUILD-AS-DESIGNED: explicitly state which NECESSITY questions were asked and how each was answered.

### §3 Inventory (with V/M/A/D triage)

Render the inventory phase output as a table:

| ID | Component | File:line evidence | Triage | Coverage of design need |
|----|-----------|-------------------|--------|-------------------------|
| I1 | `<name>` | `path/to/file.py:LL-LL` | V/M/A/D | what this covers / does not |

Triage legend:
- **V** = Viable as-is (extend, don't replace)
- **M** = Modify (extend with documented changes)
- **A** = Adjacent (related but not extension point)
- **D** = Deprecated / not SOTA (don't extend; replace or skip)

Every row carries file:line evidence. No row may say "TBD" or "see codebase".

### §4 Decisions LOCKED

For each decision D1, D2, ..., Dn:

- **D<N>**: the decision in one sentence.
- **Reasoning**: why this and not the alternatives.
- **Alternatives rejected**: list each alternative considered and the specific reason it was rejected (research finding, codebase constraint, operator preference, cost asymmetry).
- **Evidence**: research source (Appendix A sub-question) or codebase finding (file:line) that supports the decision.

LOCKED means LOCKED. Do not write "we are leaning toward X" or "tentatively X". If a decision isn't locked yet, it belongs in §7 Open Questions, not §4.

### §5 Architecture

- Layers / modules / data flow at the system level.
- Per-component spec (one paragraph each).
- Interfaces between components: name the function signatures or message contracts at the boundary.
- A diagram-as-ASCII or mermaid block is welcome but not required; clarity over format.

### §6 Per-component implementation spec

For each NEW component:
- File path it will live at
- Class / function signature
- Responsibilities (3-5 bullets)
- Dependencies (other components it calls; external libraries)

For each MODIFIED component:
- `file:line` of the modification site
- What changes (additive / replacing / removing)
- Why (link back to the D<N> that drives the change)

Include code snippets only where the exact shape is load-bearing (a new schema, a new tool signature, a new prompt template skeleton). Do not paste large existing blocks.

### §7 Open Questions

Questions that survived all upstream phases and remain unresolved at memo time.

For each:
- The question itself.
- What would resolve it (additional research, a spike, an operator decision, a measurement).
- Estimated effort to resolve (hours, honest).
- Blocking? — does implementation halt without resolution, or can Phase 1 start while this is being answered?

### §8 Deferrals

What is NOT in this design, with REASON.

For each deferral:
- What's deferred.
- Why it's deferred (out of scope, blocked on upstream, intentional staging).
- **Revisit trigger** (event-based, not calendar-based): "when X metric drops below Y" / "when Z is shipped" / "when the K substrate decision is locked" — not "in Q3" or "next sprint".

Per the operator's rule: deferrals have a revisit trigger, not a vague "later". A deferral without a trigger is a silent abandonment.

### §9 Implementation phases

Phase 1, Phase 2, ..., Phase N with HONEST hour estimates.

Operator's rule (load-bearing): **"honest is longer than aspirational"** — do not preserve aspirational numbers from earlier phases. If the inventory + decisions surfaced complexity, revise UP. Post-DA the estimate typically grows again (in the verdict-score-v1 arc the estimate went 28-32hr → 64-67hr post-DA). Plan for that.

Per phase:
- Goal of the phase (a concrete deliverable, not a vibe)
- Tasks (each task should be 1-4 hours; tasks longer than 4 hours should be split)
- Dependencies on prior phases or open questions
- Definition of done for the phase (what gate passes mark it complete)

### §10 Eval / verification plan

How to know it works.

Pre-deployment gates per the CLAUDE.md rule: **done-when criteria assert at the LLM-call boundary or user-facing output, never an intermediate serializer** (R-03 from the global PLAN template). State the assertion sites explicitly.

For each gate:
- What is being measured.
- Where the assertion fires (the LLM-call boundary, the user-facing surface, the eval harness).
- Pass threshold (numeric, not "looks reasonable").
- What blocks deployment if the gate fails.

### §11 Appendix A — Research returns

The cited `/deep-research` returns from the Research Fan-out phase.

For each sub-question:
- Sub-question as posed.
- One-paragraph synthesis of what /deep-research returned.
- Key citations (URLs, paper IDs, library docs).
- How this return shaped which decision in §4.

Operator's tweak: the design arc uses `/deep-research` PER SUB-QUESTION. Each sub-question gets its own subsection here; do not collapse them into one summary.

### §12 Appendix B — Glossary (if non-trivial vocabulary involved)

For designs that introduce new terms or use terms-of-art from a research field, define them once with a citation. The prompt-system arc and verdict-score-v1 arc both shipped 30+ entry glossaries. Skip this appendix if the design uses only existing project vocabulary.

## Quality rules

- **EVERY claim grounded in file:line OR research citation.** A claim without a citation is a guess; guesses get flagged by DA.
- **NO aspirational implementation estimates.** Revise honestly. If §9 hours feel uncomfortable, they're probably honest.
- **LOCKED decisions are LOCKED.** Do not soft-pedal as "tentative" or "leaning toward". If it's not locked, it's an Open Question (§7), not a Decision (§4).
- **DEFERRALS have a revisit TRIGGER**, not a calendar date or vague "later".
- **Multi-pass discipline**: write the memo end-to-end, then run through it ONCE before handing off. Catch:
  - placeholders (`TODO`, `TBD`, `PLACEHOLDER`, `???`, `XXX`)
  - contradictions between sections (D4 says X but §6 implements not-X)
  - vague language ("appropriate", "robust", "scalable" without specifics)
  - missing citations (any claim of fact without a source)
- **Honor the operator's reframe.** If Second Interview produced a load-bearing reframe (e.g., "skill loadouts ARE the identity" from the prompt-system arc), the memo's framing must reflect it. Do not revert to the pre-reframe framing in §2 / §5.
- **Provenance honesty.** §0 provenance counts must be accurate — dispatches that were planned but not executed don't count; questions asked but unanswered don't count.

## Output

Write the memo file at `.planning/<topic>_design_<YYYY-MM-DD>.md` using the Write tool.

Report:
- Absolute path written
- Section count (should be 11-13: §0 through §10 minimum, plus §11 always, §12 conditional)
- Line count

Nothing else in the close — the memo speaks for itself.

## What NOT to do

- **DON'T author the memo before Second Interview locks.** A memo drafted from First Interview state will be re-written; the operator's reframe is the most expensive input and must land first.
- **DON'T omit Necessity verdict.** §2 without the NECESSITY-wave verdict hides the load-bearing strategic check. DA will flag this.
- **DON'T preserve aspirational estimates** from First Interview or planning notes. Revise §9 honestly even if the new number is uncomfortable.
- **DON'T leave TODO / PLACEHOLDER / TBD tokens** in the memo. They reach DA, DA flags them, you re-draft. Catch them in the multi-pass before handoff.
- **DON'T render the inventory without V/M/A/D triage.** A bare list is information; a triaged list is a decision surface.
- **DON'T paste large existing code blocks** into §6. Cite by file:line. Snippets only where the exact shape is the spec (a new schema, a new prompt skeleton).
- **DON'T write decisions as menus** ("we could do A, B, or C"). The whole point of LOCKED is the decision was made; the alternatives go under "rejected" with reasons.

## Sources (lifted patterns)

- Multi-pass memo revision and DA-driven estimate revision: verdict-score-v1 v2 memo arc (2026-05-30), prompt-system-architecture arc (2026-05-28), TS-011 architecture arc (2026-05-28). Five-pass discipline through 12 sections is the verdict-score-v1 precedent; 28-32hr → 64-67hr estimate revision is the honest-is-longer-than-aspirational precedent.
- Done-when at LLM-call boundary or user-facing output (§10 rule): global CLAUDE.md PLAN template R-03, codified from the Burry Phase 3 FU-05 incident.
- V/M/A/D inventory triage and codebase-first override: Matt Pocock grill-me marketplace pattern (https://github.com/mattpocock/skills) — "if a question can be answered by reading code, READ THE CODE instead."
- Revisit-trigger-not-calendar for deferrals: codified from `~/.claude/rules/inventory-before-building.md` corollary that "Future Ambition vs Competitive Deficit" requires explicit trigger conditions (also `~/.claude/rules/agent-framing-and-competitive-scope.md` Check 6).
