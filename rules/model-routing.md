# Model Routing (MANDATORY)

**Trigger:** Spawning a subagent via the `Agent` tool, OR invoking a `/custom:*` slash command, OR deciding which model to use for the next phase of work.

## Rule

Use the per-skill matrix in `~/.claude/skills/model-routing/SKILL.md` to pick the model for each subagent dispatch. The matrix's default is the answer for the common case — no reasoning required.

When deviating from the default (escalating Sonnet → Opus, or downgrading Opus → Sonnet), write a one-line reason in the dispatch message itself (e.g. `Agent(model="opus", prompt="executor for plan X — escalated to Opus because task touches core SQL planner")`).

## Why mandatory

- **Without enforcement, every subagent inherits the parent's model.** This silently sets the executor and reviewer to the same model the user is currently running, which loses the cost asymmetry that makes the orchestrator-worker pattern valuable.
- **Anthropic's own research-system precedent**: Opus orchestrator + Sonnet workers outperformed single-agent Opus by 90.2% on internal eval ([anthropic.com/engineering/multi-agent-research-system](https://anthropic.com/engineering/multi-agent-research-system)). The pattern works; it just has to be enforced.
- **The cost asymmetry is real and large.** Sonnet is ~5× cheaper per token than Opus. The executor phase is the dominant token volume in plan→execute flows. Routing the executor to Sonnet alone saves ~50-70% on a typical 4-task plan.

## How to apply

1. **Before dispatching a subagent**: open the matrix in `~/.claude/skills/model-routing/SKILL.md`. Find the row for the skill or task type. Use that model.
2. **Pinned skills (always Opus)**: `/custom:plan`, `/custom:architect`, `/custom:devils-advocate`, `/custom:orchestrate`, `/custom:prompt-craft`, `/custom:security-scan`, `/custom:eval`. Do not downgrade these without a written reason.
3. **Pinned skills (default Sonnet)**: `/custom:execute`, `/custom:review`, `/custom:debug`, `/custom:research`, `/custom:verify`, `/custom:common-ground`, `/custom:data-audit`, `/custom:checkpoint`, `/custom:learn`, `/custom:spec-mine`. Escalate to Opus per the matrix's escalation column when triggers fire.
4. **Dispatch mechanism matters**: `Skill(skill="custom:X")` inherits the parent's model — no routing happens. To get true heterogeneous routing, dispatch via `Agent(subagent_type="general-purpose", model="sonnet|opus", prompt="Read ~/.claude/agents/X.md and follow it for ...")`.
5. **When in doubt, start with Sonnet and escalate**. Sonnet → Opus retry is one extra dispatch; the reverse is wasted spend.

## Red flags

- A subagent dispatch with no `model:` parameter when the work is non-trivial → loses routing.
- Blanket-Opus dispatches "to be safe" → 5× cost for a quality lift only meaningful on judgment-heavy tasks.
- Blanket-Sonnet dispatches for plan / DA / architect / eval / prompt-craft / security work → silent quality degradation in the orchestration roles.
- Deviation from a pinned default with no written reason → unauditable and likely wrong.

## Reasoning-cost note

Routing decisions cost ~200-500 tokens of reasoning per spawn. A typical worker phase is 10K-50K tokens. The reasoning overhead is well under 5% of the call's token volume — the savings dwarf it. Pinned defaults eliminate the overhead on the common case entirely; only edge cases require matrix consultation.

## Scope

This rule is about **per-subagent / per-skill model selection**, not about which model the user runs interactively as the parent. The parent model is set by the user; this rule governs what the parent dispatches to its workers.
