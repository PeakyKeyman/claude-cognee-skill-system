---
name: design-revision-loop
description: "DA + peer-review + multi-pass revision loop. Dispatches /custom:devils-advocate, then /custom:peer-review, classifies findings as ACCEPT/PARTIAL/REJECT, re-authors the memo, loops until convergence (no new substantive findings)."
triggers:
  - "design revision"
  - "memo revision"
  - "DA the memo"
  - "/custom:design-revision"
---

# Design — Revision Loop

## When to use

- Sub-skill of `/custom:design` after Memo Draft completes
- Memo v1 exists; needs adversarial + rigor verification before lock

## When NOT to use

- Quick decision note (no DA needed)
- ABANDON verdict (no memo to revise)

## Loop structure (DA → peer-review → revise → repeat until convergence)

### Round structure

Each round consists of:

1. **DA dispatch** — `/custom:devils-advocate` on the current memo
2. **Peer-review dispatch** — `/custom:peer-review` on the current memo (citation verification, methodology rigor, internal consistency)
3. **Classification pass** — for each finding from DA and peer-review:
   - **ACCEPT**: finding is right; the memo will change
   - **PARTIAL**: finding has merit but cost > benefit; document the tradeoff
   - **REJECT**: finding misses context; document WHY in the memo
4. **Revision pass** — re-author affected sections (NOT re-discuss; re-author with discipline)
5. **Implementation estimate audit** — revise hours upward if new scope or complexity surfaced
6. **Convergence check** — if next DA round would surface no new substantive findings, exit loop

### Convergence criteria (exit the loop)

- Round N DA returns only nits or "PROCEED with same mitigations as round N-1"
- Round N peer-review returns "Minor revisions" or "Accept"
- No new substantive findings between round N and round N-1
- Operator says "I think we're done"

Empirically, real arcs converge in 2-3 rounds. If you're on round 4+, something structural is wrong — surface it to operator instead of looping mechanically.

### Anti-pattern: DA-loop addiction

The operator has explicitly flagged DA-loop addiction as a risk. Round 4+ is a tell that:

- The design was already correct at round 2 and you're polishing nits
- OR there's a structural issue DA can't catch (needs operator reframe — go back to Second Interview)

Cap: 3 rounds default. Round 4+ requires explicit operator approval with a stated reason.

## Dispatch patterns

### DA dispatch (per round)

```
Agent(subagent_type="general-purpose",
      model="opus",
      prompt="Read ~/.claude/agents/devils-advocate.md and apply to the current memo at <path>. Build the STRONGEST case against the design. Surface 3-5 critiques with verdict per critique. Return per-critique recommendations.")
```

### Peer-review dispatch (per round)

```
Agent(subagent_type="general-purpose",
      model="opus",
      prompt="Read ~/.claude/agents/peer-reviewer.md and apply to the current memo at <path>. Verify citations against sources, check methodology rigor, surface unstated assumptions. Return per-finding format.")
```

### Classification format (Claude does this, not the DA/peer-reviewer)

For EACH finding:

```markdown
- Finding: <DA or peer-review finding>
- Classification: ACCEPT | PARTIAL | REJECT
- Reasoning: <one sentence>
- Memo section affected: §N
- Revision: <what changes in the memo>
```

Add to memo as a "DA Reconciliation" or "Peer-Review Reconciliation" appendix. This is the audit trail.

## What NOT to do

- DON'T accept DA verdicts wholesale — classify each finding
- DON'T re-discuss findings; re-author the memo
- DON'T loop past round 3 without operator approval
- DON'T preserve aspirational implementation estimates after DA surfaces honest scope
- DON'T silently drop a DA recommendation — every one gets a classification

## Output

The memo file is now `vN` (final round number). Sections "DA Reconciliation" and "Peer-Review Reconciliation" appended. Implementation estimate revised honestly. Convergence note at top.

## Sources

- `/custom:devils-advocate` (existing agent)
- `/custom:peer-review` (existing agent at `~/.claude/agents/peer-reviewer.md`)
- Operator rule: DA-loop addiction is real; cap at 3 rounds
