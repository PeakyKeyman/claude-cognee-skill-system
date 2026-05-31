---
name: design-inventory
description: "Inventory + audit phase of /custom:design. Maps what already exists in the code, what's claimed vs what actually exists, V/M/A/D triage. Runs BEFORE research so research questions are sharpened by reality."
triggers:
  - "design inventory"
  - "audit existing code"
  - "what's already there"
  - "/custom:design-inventory"
---

# Design — Inventory + Audit

## When to use

- Sub-skill of `/custom:design`; runs after First Interview, before Follow-ups + Research
- The Pre-research Problem Statement (output of First Interview) references existing code, specs, memos, or rules that need verification
- Standalone via `/custom:design-inventory` when you want a clean audit of a subsystem before any design work

## When NOT to use

- Truly greenfield work where no relevant code, spec, or memo exists yet
- A single-file question (use `Read` or `grep` directly — inventory is overkill)

## Process

### Step 1: Build the inventory target list

From the Pre-research Problem Statement, enumerate every file, module, rule, memo, spec, function, or class the operator or Claude referenced. Don't trust prose — extract concrete paths.

- Pull every `path/to/file.py:line` reference, module name, symbol name, memo filename, rule filename
- Pull every claim the prior context makes about *behavior* ("X does Y", "Z is wired through W")
- Group items by subsystem so the verification pass can stay focused

The target list is the contract for Step 2. If an item isn't on the list, it won't get verified.

### Step 2: Verify existence

**For each item — CodeGraph FIRST (MANDATORY):** Open with `codegraph_context` on the item's symbol or path. Per `~/.claude/rules/codegraph-reflex.md`, CodeGraph is the primary verification tool. One call returns symbol + file:line + callers + callees in milliseconds — work that takes 5+ manual Read calls.

```
codegraph_context("<item symbol or path>")
```

If `codegraph_context` returns the item cleanly, you have your verification. If it returns nothing or partial, fall back through:

1. Does the file exist at the claimed path? (`Bash ls` or `Read`)
2. Does the named function / class / symbol exist in the file? (`codegraph_search` or `codegraph_node`; grep is a last resort for non-symbol strings)
3. Does the behavior claimed match the behavior in the code? (`codegraph_trace` for flow, `codegraph_callers`/`codegraph_callees` for wiring, `Read` for the specific lines CodeGraph surfaced)
4. `Bash git log --oneline -- <path>` for recent commits on the area

Record the verification evidence inline with concrete citations. "Verified: does X" is not enough — cite the file:line OR the CodeGraph node the verification rests on.

### Step 3: V/M/A/D triage

Classify every item with one of four verdicts:

- **V (Valid)** — exists, works as claimed, no action needed by the design
- **M (Modify)** — exists but doesn't match the claim, or the design needs it to change
- **A (Add)** — doesn't exist; the design will need to create it
- **D (Delete)** — exists but the design retires it

Be honest: the verdict is what the code says, not what the prior memo asserted. Prior memos drift fast — in a 2026-05-30 design-arc session, 5 of 6 items marked "validated" in an earlier inventory turned out to be MODIFY when actually re-verified against current `HEAD`. Assume drift; verify against the live tree.

If a verdict is uncertain (e.g., the symbol exists but you can't tell from a single pass whether the behavior matches), mark it `M?` with a note rather than guessing `V`. The follow-up phase will resolve it.

### Step 4: Surprise flags

Anything verification turned up that the operator did NOT mention and that bears on the design:

- Code paths adjacent to the claimed area that already implement part of the design
- Recent commits on the relevant paths since the operator last looked
- Contradictions between two memos, two rules, or memo-vs-code
- Existing infrastructure that makes a proposed "new layer" redundant (see `~/.claude/rules/inventory-before-building.md`)
- Deprecated SDK / API surfaces in code the operator wanted to extend (see same rule, corollary)
- Dead code (no callers per CodeGraph) the operator assumed was load-bearing

Each surprise is a candidate research question or a candidate follow-up question for the operator. Don't bury them in the inventory table — they get their own section.

### Step 5: Hand off

Produce the output document (format below), then recommend the next phase:

- **FOLLOW-UPS** if surprises raise operator-decision questions (e.g., "extend deprecated module vs. replace?")
- **RESEARCH directly** if the inventory cleanly resolves the open questions from First Interview and the operator just needs external SOTA references
- **ABANDON or NARROW-SCOPE** if the inventory reveals the work is largely already done, or the gap is far smaller than the problem statement assumed

The recommendation is a recommendation, not a decision — the operator makes the call.

## Tools to use

Use CodeGraph MCP tools as the primary surface — they compose search + symbol resolution + caller/callee tracing in one call and are dramatically faster than blind file reads:

- `mcp__codegraph__codegraph_context` — composite query for a symbol or topic; best opening move
- `mcp__codegraph__codegraph_search` — fuzzy symbol / file search
- `mcp__codegraph__codegraph_node` — pull a specific node's definition + metadata
- `mcp__codegraph__codegraph_callers` / `codegraph_callees` — verify wiring claims and find dead code
- `mcp__codegraph__codegraph_impact` — see blast radius of a proposed Modify

Fall back to:
- `Bash` with `grep -rn` for string-literal matches CodeGraph can't resolve
- `Bash` with `git log --oneline -- <path>` for recent-commit signal on relevant areas
- `Read` on memos, rules, design docs, and any non-code references

**Do NOT defer this phase to subagents.** Inventory is a single-context audit — the value comes from one mind holding the whole map. Subagent dispatch fragments the verification surface and loses the cross-item surprise detection that Step 4 depends on.

## Output format

```markdown
# Inventory: <design topic>
## Date: <YYYY-MM-DD>
## Branch / HEAD: <branch>@<sha>

## Inventory table
| Item | Claimed | Actual | Triage | Notes |
|---|---|---|---|---|
| path/to/file.py:42 — `do_thing()` | "does X with caching" | Verified: does X; caching at path:55 with 120s TTL | V | — |
| path/to/file.py:120 — `Handler` | "exists in this module" | NOT FOUND at this path; moved to other/file.py:88 in commit abc1234 (2026-05-21) | M | Update all references |
| new/module/spec.py | — | Does not exist | A | Design must create |
| old/legacy.py:200 — `LegacyShim` | "still in use" | Zero callers per `codegraph_callers`; last touched 2025-11 | D | Safe to retire |
| path/to/x.py:88 — `risky_call` | "wraps SDK v3" | SDK v3 surface refactored in installed version; `risky_call` uses deprecated attr | M? | Confirm with operator: extend vs replace |

## Surprises
- `helpers/foo/bar.py` already implements 60% of what the design proposes; operator didn't reference it
- Two memos disagree on whether `Component X` is wired through `Path A` or `Path B`; code says A as of HEAD
- `module/y.py` has 14 commits in the last 30 days from a coworker; area is in flux

## Findings to feed back to Follow-ups
- Q for operator: the existing `bar.py` covers 60% of the proposed surface — does the design extend it, replace it, or sit alongside it?
- Q for operator: SDK v3 deprecation surfaces here — is the substrate decision in scope for this design or deferred?
- Q for operator: coworker's in-flight commits on `y.py` may conflict with proposed changes — coordinate or defer?

## Recommended next phase
- FOLLOW-UPS — the three operator-decision Qs above must resolve before research is well-scoped
  OR
- RESEARCH directly — inventory cleanly resolves First-Interview open Qs; research can proceed on the sharpened questions: [Q1, Q2, Q3]
  OR
- ABANDON / NARROW-SCOPE — `bar.py` + `baz.py` already do 85% of what the problem statement asked for; recommend narrowing to the 15% gap
```

## What NOT to do

- DON'T accept the prior memo's claims without re-verification. Memos drift; code is the source of truth.
- DON'T skip CodeGraph in favor of blind file reads. CodeGraph's `codegraph_context` resolves in seconds what manual reads take 10 minutes to confirm.
- DON'T defer surprises to "later." Surface them in Step 4 — they're the highest-signal output of the entire phase.
- DON'T mark items `V` when you're unsure. Use `M?` and let follow-ups resolve it. False `V` verdicts poison every downstream phase.
- DON'T propose the design here. Inventory is verification, not design. Design questions go to Follow-ups; design proposals go to the post-research memo.
- DON'T dispatch subagents to parallelize the audit. Inventory's value is cross-item pattern detection in one context.

## Source patterns lifted

- Verification-before-claims discipline — `~/.claude/skills/verification-before-completion/SKILL.md`
- Inventory-before-building gate + deprecated-SDK corollary — `~/.claude/rules/inventory-before-building.md`
- Codebase-first override + depth-tree walking — Matt Pocock grill-me (https://github.com/mattpocock/skills)
- Periodic structured summary (V/M/A/D as the structured ledger) — Obra Superpowers brainstorming (https://github.com/obra/superpowers)
