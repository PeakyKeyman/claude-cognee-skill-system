# Cognee Usage Rules

**Trigger:** Calling any `mcp__cognee__*` tool OR considering whether to save findings at session end.

## When to cognify

- **Session-end findings** — `save_interaction` for cross-session findings (architectural decisions, surprising eval results, resolved bugs with non-obvious root causes).
- **Durable registries** — cognify `KNOWN_ISSUES.md`, `TODO_SESSIONS.md`, `CLAUDE.md`, and the contents of `~/.claude/rules/` once at adoption, then re-cognify on substantive change. This populates the graph with KI/TS/rule entities that semantic search can resolve.
- **At arc-close** — when a Track/Wave/sprint ships, cognify the entire `.planning/<arc>/` directory once, then delete it. The arc's design notes survive as graph entities + searchable text without occupying disk or `MEMORY.md`.

## When to search

- **Session start** when resuming work on a known project.
- **Before any design choice with possible prior art** — `search("prior decisions about <topic>")` before authoring a `/custom:plan` brief, before opening a `TS-N` entry, before writing a new HARD RULE. Avoids redundant entries and silent rule conflicts.
- **Cross-project** — when starting work on a different project, query Cognee for transferable lessons. File memory is per-project; Cognee is global.

## When to prune

- **Quarterly inventory** via `list_data`. Identify datasets tied to retired systems (e.g., LangGraph orchestration, pre-ADK harness) and `delete` them.
- Without quarterly pruning, stale findings about retired code paths silently outvote current findings in semantic search.

## Memory write policy — ALWAYS DO BOTH (MANDATORY)

At session end, persist cross-session findings to **BOTH** systems — they are complementary, not alternatives:

1. **File-based auto-memory** (`~/.claude/projects/<project>/memory/`) — structured per-project state. New `.md` file with frontmatter + pointer line added to that project's `MEMORY.md`. Editable, version-controllable, loaded directly into context at session start for that project.
2. **Cognee `save_interaction`** — cross-project semantic knowledge graph. Queryable via `mcp__cognee__search` from ANY project. Makes findings discoverable from unrelated future work.

**Why both**: file memory captures *where this project is* (structured state for next session on THIS project); Cognee captures *what was learned* (searchable findings across ALL projects). Findings saved only to the project file are invisible to unrelated future work; findings saved only to Cognee lose the structured per-project continuity that file memory provides.

**Failure mode to avoid**: defaulting to whichever system is lower-friction in the moment. File memory is front-of-context (so I reach for it first) but Cognee is the one that compounds value across projects. Must deliberately do both.

**Exception**: if `save_interaction` would duplicate a file-memory entry verbatim, write Cognee's version *more abstractly* — capture the transferable finding (the pattern, the root cause, the technique), not the project-specific state. File memory holds specifics; Cognee holds the lessons.

## Sub-rules (read these on specific triggers)

- [stack.md](stack.md) — current Cognee stack config (read when stack changes)
- [concurrency.md](concurrency.md) — parallel-safety rules per Cognee tool
- [custom-graph-model.md](custom-graph-model.md) — typed-extraction Entity inheritance contract

## Troubleshooting

For failure modes and recovery commands, see `~/.claude/references/cognee-troubleshooting.md`.
