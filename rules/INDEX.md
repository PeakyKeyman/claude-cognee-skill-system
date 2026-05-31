# Rules Index

Each rule has a trigger condition. Read the rule when its trigger fires. CLAUDE.md's table of contents references back to this file.

## Always-relevant rules (cross-cutting)

| Rule | Trigger | Path |
|---|---|---|
| Agent framing & competitive scope | Building / auditing any agent system | [agent-framing/](agent-framing/) (4 sub-files) |
| Inventory before building | About to propose a new layer/abstraction/overhaul | [inventory-before-building.md](inventory-before-building.md) |
| Industry agnosticism | Building/reviewing data-analysis agents, profilers, primitives, rules | [industry-agnosticism.md](industry-agnosticism.md) |

## Specific-trigger rules

| Rule | Trigger | Path |
|---|---|---|
| Code & testing | Writing Python code, tests, data transforms | [code-and-testing.md](code-and-testing.md) |
| Workflow | Starting work, resuming, debugging, compacting, committing | [workflow.md](workflow.md) |
| Sub-agents dispatch | Spawning sub-agents via Agent or Workflow tool | [sub-agents.md](sub-agents.md) |
| Model routing | Picking the model for a subagent / slash command | [model-routing.md](model-routing.md) |
| Cognee usage | Calling any `mcp__cognee__*` tool | [cognee-usage/](cognee-usage/) (4 sub-files) |
| Config single-source-of-truth | Writing runtime config (model, tokens, temp, routing, timeouts) | [config-single-source-of-truth.md](config-single-source-of-truth.md) |
| Prompt/code parity | Writing LLM prompts parsed into typed schemas | [prompt-code-parity.md](prompt-code-parity.md) |

## Behavior rules (codified 2026-05-31)

| Rule | Trigger | Path |
|---|---|---|
| MEMORY.md size discipline | Writing to MEMORY.md | [memory-size.md](memory-size.md) |
| Workflow tool usage | Considering Workflow vs Agent vs direct work | [workflow-tool-usage.md](workflow-tool-usage.md) |
| CodeGraph reflex | Code work involving find/understand/modify/delete | [codegraph-reflex.md](codegraph-reflex.md) |

## Decomposed rules

Two rules were directories with sub-files (because the single-file form bloated past coherent size):

- **agent-framing/** — [README.md](agent-framing/README.md) + [12-axes.md](agent-framing/12-axes.md) + [checks.md](agent-framing/checks.md) + [red-flags.md](agent-framing/red-flags.md)
- **cognee-usage/** — [README.md](cognee-usage/README.md) + [stack.md](cognee-usage/stack.md) + [concurrency.md](cognee-usage/concurrency.md) + [custom-graph-model.md](cognee-usage/custom-graph-model.md)

Each directory's README.md is the entry point; sub-files contain detail.

## Reference material

Non-rule prose (historical context, troubleshooting catalogs, etc.) lives under `~/.claude/references/`. Currently:

- `agent-framing-failure-modes.md` — the 2026-05-10 incident
- `cognee-troubleshooting.md` — failure modes + recovery commands
- `mcp-stack.md`, `nua-labs.md`, `code-style.md`, etc.

## How to add a new rule

1. Pick the smallest scope that captures the trigger. If the rule fits on one page (~80 lines), make it a flat `.md` file.
2. If the rule has multiple concerns that fire on different triggers, make it a directory with README.md + sub-files.
3. Add to this INDEX with one-line description.
4. Update `~/.claude/CLAUDE.md` rules table.
5. If the rule has historical context worth preserving (the *why*), put that in `~/.claude/references/`, not in the rule itself.
