---
name: writing-skills
description: "How to write good Claude Code skills. TDD approach with CSO."
triggers:
  - "create skill"
  - "new skill"
  - "write a skill"
---

# Writing Skills Skill

## Structure
Every skill needs:
1. **YAML frontmatter**: name, description, triggers
2. **Purpose**: One-line summary
3. **Process**: Numbered steps
4. **Output format**: What the skill produces
5. **Anti-patterns**: What NOT to do

## TDD for Skills
1. Define what the skill should trigger on (write test phrases)
2. Define expected behavior for each trigger
3. Write the skill
4. Test with the trigger phrases
5. Iterate

## CSO (Claude Search Optimization)
Triggers should match how users naturally describe the task:
- Use both formal terms ("architecture decision record") AND casual ("why did we choose")
- Include action verbs ("debug", "fix", "investigate")
- Include problem descriptions ("error", "broken", "not working")

## Quality Checklist
- [ ] Frontmatter has name, description, 3+ triggers
- [ ] Process steps are specific and actionable
- [ ] Anti-patterns section exists
- [ ] Output format is defined
- [ ] Tested with natural language triggers
- [ ] Causal-effect test passes (see below) — REQUIRED before shipping any non-trivial skill

## Causal-effect falsifiability (REQUIRED for non-trivial skills)

**The risk.** A skill can activate (load into context, increment its trigger counter, appear in telemetry) and still **fail to constrain the LLM**. The LLM produces a methodology-shaped answer from base-rate reasoning — section headings, numbered lists, the words from the skill — without the skill's actual rules biting. The skill is *decorative*: it ships, looks right in eval, and provides zero quality lift.

This failure mode is invisible to:
- Activation-counter telemetry (the skill DID activate)
- Output-shape heuristics (section count, marker count, length)
- "Looks like the methodology was applied" eyeball review
- Any test gate that asserts on intermediate Pydantic shapes rather than user-facing output (R-03 violation by another name)

**The control test.** Before shipping any non-trivial skill, run a **lorem-ipsum control** on its highest-leverage activation query:

1. Run query Q with the skill's full body in context. Capture the answer.
2. Replace the skill body with equal-token-count gibberish (lorem ipsum, randomized prose at the same token length, structurally similar headings replaced with placeholder text). Same `description` and `when_to_use` so activation still fires.
3. Run the same query Q. Capture the answer.
4. Compare. Require **≥30% structural-element divergence** between the two answers — measured as different section headings, different evidence selection, different framework applied, different verdict structure.

If divergence is <30%, the skill is decorative — its content is not biting. Re-author or delete; do not ship.

**Cost.** Two real-LLM calls per skill at smoke-test time (~$25 at frontier-model rates per skill). Cheap relative to the multi-week cost of shipping skills nobody actually uses.

**When to apply.**
- REQUIRED for any skill ≥150 tokens of body (real methodology content)
- OPTIONAL for trivial process skills (e.g. `common-ground`, `checkpoint`) where the output shape IS the value and divergence is structurally guaranteed
- REQUIRED any time a skill's body is materially edited (regression check)

**When to skip.**
- Skills that are pure scaffolding (e.g. ones that only inject a 3-step process with no LLM-judgment surface)
- Skills whose entire output is deterministic / structural and trivially diverges by construction

**Origin.** Lifted from a Phase 6 DA round in 2026-04 that surfaced the gap: 6 of 11 done-when conditions in a 20-task plan reduced to "the answer looks right" — without any test that the skill content was *causally* responsible for the look. R-03 (Done-when at LLM-call OR user-facing-output boundary) does not, by itself, prevent decorative-skill shipping; the lorem-ipsum control closes the gap.
