---
name: model-routing
description: "Per-skill matrix for Sonnet vs Opus. Source of truth for which model to dispatch each /custom:* skill with. Never Haiku."
triggers:
  - "which model"
  - "save tokens"
  - "model routing"
  - "sonnet or opus"
  - "spawning a subagent"
---

# Model Routing Skill

> **Source of truth for which model each `/custom:*` skill or agent should run on.** Updated 2026-04-28 with explicit per-skill assignments, after the multi-agent research-system precedent ([anthropic.com/engineering/multi-agent-research-system](https://anthropic.com/engineering/multi-agent-research-system) — Opus orchestrator + Sonnet workers outperformed all-Opus by 90.2% on internal eval).

## How dispatch actually works

When the main agent invokes a custom skill, model selection depends on the dispatch mechanism:

| Dispatch | Model behavior |
|---|---|
| `Skill(skill="custom:X")` | Runs in the parent's context — inherits parent's model. NO routing happens here. |
| `Agent(subagent_type="general-purpose", model="sonnet", prompt="Read ~/.claude/agents/X.md and follow it for ...")` | Runs in fresh subagent context with the specified model. Routing is enforced here. |

**Practical rule:** for routing to matter, dispatch via `Agent` tool with explicit `model:` param. The Skill tool is the right call when you want the work to stay in the parent's context (cheaper context-wise, but no model heterogeneity).

## Per-skill default matrix

| Slash command | Agent file | Default | Escalate to Opus when | Why |
|---|---|---|---|---|
| `/custom:plan` | planner.md | **Opus** | (always) | Architecture decomposition; expensive to reverse |
| `/custom:execute` | executor.md | **Sonnet** | Task is architectural / cross-cutting / >5 files | TDD + mechanical edits; Anthropic's worker role |
| `/custom:review` | code-reviewer.md | **Sonnet** | Reviewing planner output; security review; per-task review on cross-cutting changes | Pattern matching is structured; Opus only when judgment-heavy |
| `/custom:debug` | debugger.md | **Sonnet** | Multi-service / cross-system / >3 hypotheses ruled out without progress | Routine bugs are pattern-matched; deep ones need full-system context |
| `/custom:research` | researcher.md | **Sonnet** | Deep architecture research; trade-off analysis across 5+ sources | Information gathering is structured |
| `/custom:architect` | architect.md | **Opus** | (always) | Already pinned — design + ADR work |
| `/custom:verify` | verifier.md | **Sonnet** | Multi-system verification; subtle correctness issues | Checklist-driven |
| `/custom:devils-advocate` | devils-advocate.md | **Opus** | (always) | Already pinned — adversarial reasoning |
| `/custom:common-ground` | common-ground.md | **Sonnet** | Cross-cutting infrastructure changes | Schema-style enumeration |
| `/custom:orchestrate` | orchestrator.md | **Opus** | (always) | Workflow selection requires judgment |
| `/custom:data-audit` | data-analyst.md | **Sonnet** | Cross-system data tracing; complex pipeline analysis | Profiling is structured |
| `/custom:prompt-craft` | (prompt-engineering skill) | **Opus** | (always) | Prompt eng requires deep model knowledge |
| `/custom:checkpoint` | (checkpoint skill) | **Sonnet** | (never) | Mechanical state save |
| `/custom:learn` | (continuous-learning skill) | **Sonnet** | (rarely) | Pattern extraction is structured |
| `/custom:security-scan` | (security-scan skill) | **Opus** | (always) | Security judgment + attack-surface reasoning |
| `/custom:spec-mine` | (spec-miner skill) | **Sonnet** | (rarely) | Structured EARS extraction |
| `/custom:eval` | (eval-driven-dev + eval-design skills) | **Opus** | (always) | Eval criteria selection is judgment-heavy |

**Never Haiku** — insufficient for production engineering work.

## Generic task-type matrix (for tasks NOT covered by a specific skill)

| Task Type | Model | Reasoning |
|-----------|-------|-----------|
| Implementation, standard features | Sonnet | High throughput, good quality |
| Mechanical changes, formatting | Sonnet | Efficient for structured tasks |
| Standard verification | Sonnet | Checklist-driven |
| Standard research | Sonnet | Information gathering |
| Architecture decisions | Opus | Deep trade-off analysis |
| Complex debugging (multi-service) | Opus | Needs to hold full system in context |
| Ambiguous requirements | Opus | Nuanced interpretation |
| Prompt engineering | Opus | Understands model behavior deeply |
| Adversarial reasoning | Opus | Critical thinking requires depth |

## Cost / token reasoning

- **Pricing**: Opus 4.7 is ~5× the per-token cost of Sonnet 4.6 (input $5 vs $3, output $25 vs $15 per MTok approximately).
- **Token volume**: agentic flows use ~4× chat-equivalent tokens; multi-agent flows use ~15× ([Anthropic engineering blog, 2025-06-13](https://anthropic.com/engineering/multi-agent-research-system)). The dominant cost is in the worker phase, not the orchestrator.
- **Routing-decision overhead**: deciding which model to use costs ~200-500 tokens of reasoning per spawn. A typical executor phase is 10K-50K tokens. So routing-decision cost is well under 5% of the call's token volume — the asymmetry favors routing.
- **The trick that eliminates the overhead**: pinned defaults handle the 90% case with zero reasoning. The main agent only burns tokens reasoning about routing when the task is *unusual* (e.g. "this looks like an executor task but it's touching the core SQL planner — escalate to Opus").

## Rules

1. **Default to the matrix.** No reasoning required — the matrix's default IS the answer for the common case.
2. **Escalate with a one-line reason.** When deviating from the default, write the reason in the dispatch (e.g. "executor with model=opus because task touches the SQL planner core").
3. **Opus for decisions that are expensive to reverse** (architecture, design, prompt eng).
4. **Sonnet for decisions that are cheap to reverse** (implementation details, mechanical edits).
5. **If unsure, start with Sonnet and escalate** if quality is insufficient. Sonnet → Opus is a one-token retry; Opus → Sonnet is wasted spend.
6. **Never use Haiku** for production engineering work.

## When the routing question is "should I bother routing at all?"

- For a single-shot task (~2K tokens), routing overhead approaches the savings — just inherit the parent's model.
- For a multi-agent flow (plan → execute with 4 tasks → review per task), routing is high-leverage: ~50-70% savings on the executor's dominant token volume.
- For an interactive conversation where the user iterates with you, the parent model dominates. Routing only kicks in when work is dispatched to a fresh subagent context.

## What NOT To Do

- Don't blanket-use Opus "to be safe" — a 4-task plan with all-Opus subagents costs ~5× the routed equivalent for a quality lift that's only meaningful on judgment-heavy tasks.
- Don't blanket-use Sonnet to save tokens — the Opus-required skills (plan, devils-advocate, architect, eval, prompt-craft, security-scan) genuinely need it; downgrading them silently degrades the workflow.
- Don't override a pinned default without writing a one-line reason — silent overrides are unauditable.
- Don't route on every spawn when the work is small — sometimes inheriting the parent is the right call.
