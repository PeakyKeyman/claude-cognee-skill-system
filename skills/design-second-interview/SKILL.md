---
name: design-second-interview
description: "Post-research second interview. Five waves: SURFACE (Claude summarizes) → NECESSITY (should this even exist?) → DEEP (operator reacts) → INSIGHT (four lenses) → REFRAMING (operator restates). This is where the decisive operator reframe happens."
triggers: ["design second interview", "post-research interview", "let's reframe", "/custom:design-interview-2"]
---

# Design — Second Interview (post-research)

## When to use
- Sub-skill of /custom:design after Research Fan-out returns
- Operator needs to react to research, apply analytical lenses, and reframe the design with evidence in hand
- This phase is where the OPERATOR's reframe is decisive — empirically observed in real design sessions

## When NOT to use
- Pre-research conversation → /custom:design-interview-1
- Single research review → just discuss the report

## The five waves (run in order; never skip NECESSITY)

### Wave 1 — SURFACE

Claude summarizes Appendix A (research returns) in a structured way:
- CONSENSUS findings (multiple sources converge)
- CONTESTED findings (sources disagree)
- SURPRISE findings (contradicts pre-research framing)
- PRODUCTION PRECEDENTS (what shipping systems actually do)

End the summary with a SPECIFIC recommendation, not a menu. State confidence level (high / medium / low). The operator reacts before any deep questions.

### Wave 2 — NECESSITY (the load-bearing pushback wave)

BEFORE refining the design further, run a taste-and-strategic-necessity pass. This wave maps to Cian's CLAUDE.md rule about watching for emotion-driven over-engineering.

Ask each of these AS REAL QUESTIONS (use the operator's own words from the problem statement to make them concrete):

1. **CUSTOMER FEEL** — "Who actually feels this if we ship it? In what timeframe? If a paying user can't describe the change in plain English, why are we building it?"

2. **OPPORTUNITY COST** — "What is NOT getting built while this is in flight? Is what's-not-getting-built more valuable to a user than this?"

3. **SIMPLIFICATION** — "What's the 5-line / 50-line / 500-line version of this? Does the 5-line version 80% solve the problem? If yes, why are we shipping the 5000-line version?"

4. **PRE-EXISTING** — "Does anything in the codebase or in the literature (per the research fan-out) already solve this? Are we re-inventing because we like the idea of solving it ourselves?"

5. **MOTIVATION AUDIT** — "Where's the energy for this coming from? Is it customer-driven, or is it a reaction to a recent incident, a coworker move, a competitive sting? Your CLAUDE.md says to flag emotion-driven over-engineering — this is that gate."

If ANY question surfaces a "we shouldn't be doing this" signal, name it and lock the finding before proceeding. If 3 or more questions surface concerns, the recommended verdict is **ABANDON** or **NARROW-SCOPE**, not continue.

Verdicts available from this wave:
- **PROCEED** — necessity confirmed; move to Wave 3
- **NARROW-SCOPE** — operator confirms shrinking to a smaller version
- **ABANDON** — operator agrees this shouldn't be built; design arc ends here
- **DEFER** — strong concerns but operator wants to time-box for revisit later

### Wave 3 — DEEP

One-question-at-a-time (return to grill-me discipline for this wave since these are pointed Qs requiring focused operator response):
- Areas where research surprised the operator
- Areas where consensus is strong but operator hasn't committed
- Production precedents — adopt that shape or differentiate?

5-8 questions typical.

### Wave 4 — INSIGHT (four lenses)

Apply each lens as a structured question:

| Lens | Question shape |
|---|---|
| Strategic | "Does this design win against the competitive landscape on the dimensions that matter (per CLAUDE.md 12-axis rule)?" |
| Systemic | "What second-order effects does this design create elsewhere in the system?" |
| Adversarial | "What's the STRONGEST case AGAINST this design? Don't strawman. (DA will follow, but this is operator-side preview.)" |
| Psychological | "Are you committing to this, or hedging? Where's the hedge? Name it." |

### Wave 5 — REFRAMING CHECKPOINT (the most important wave)

EXPLICITLY invite the operator to restate the design:

> "Now that the research is in and the lenses are applied, restate the design in one paragraph in your own words. I'll listen for shifts from the pre-research framing — those shifts are the load-bearing operator moves."

If the operator reframes substantially:
- Claude rephrases the reframe to verify understanding
- The LOCKED design is the operator-reframed version, NOT the research recommendation
- Note the reframe explicitly: "Reframed from <X> to <Y> because <Z>"

This wave is empirically where the decisive operator move happens. Real example: in a 2026-05-28 session, research recommended "voice-drives-output"; operator reframed to "skill loadouts ARE the identity"; the architecture re-shaped around the reframe. The skill must structurally invite that.

## Termination

End when operator articulates a design statement Claude can rephrase without losing meaning. Lock as the working design.

## Output

```markdown
# Post-Research Locked Design: <topic>
## Date: <YYYY-MM-DD>
## Necessity verdict: PROCEED | NARROW-SCOPE | ABANDON | DEFER
[If ABANDON, design arc ends here. Write a brief memo on why and halt.]

## Locked design (operator's words)
<one paragraph>

## Reframe from pre-research version
- BEFORE: <pre-research framing>
- AFTER: <reframed>
- WHY: <load-bearing change>

## Lenses applied — findings
- Strategic: ...
- Systemic: ...
- Adversarial: ... (DA will deepen)
- Psychological: ...

## Recommended next phase
- MEMO DRAFT (if PROCEED or NARROW-SCOPE)
- HANDOFF directly (if ABANDON — write a brief "why abandoned" memo)
```

## What NOT to do
- DON'T skip Wave 2 (NECESSITY) — it's the load-bearing check on whether to build at all
- DON'T accept the research recommendation without inviting the operator reframe in Wave 5
- DON'T proceed past Wave 2 if 3+ NECESSITY concerns surface without operator override
- DON'T validate prematurely

## Sources
- Jekudy grillme-skill: https://github.com/Jekudy/grillme-skill (wave structure)
- Operator's CLAUDE.md: emotion-driven over-engineering rule
