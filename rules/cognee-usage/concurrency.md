# Cognee Concurrency (post-Postgres swap)

**Trigger:** About to call any `mcp__cognee__*` tool, especially in parallel.

## Per-tool parallel-safety

The 2026-05-31 Postgres swap eliminated the SQLite file-lock contention that previously forced serial-only cognify. As of that swap:

| Tool | Parallel-safe? | Notes |
|---|---|---|
| `mcp__cognee__search` | ✅ YES | Read-mostly, no SQL writes contending. |
| `mcp__cognee__save_interaction` | ✅ YES | Append-only; Postgres handles concurrent inserts cleanly. |
| `mcp__cognee__cognify` | ✅ YES | Postgres replaces SQLite for pipeline state. Cognee's internal pipeline queues processing serially but the MCP-level call is non-blocking. Fire-and-forget multiple cognify calls is fine; they queue and process in arrival order. Track progress via `pipeline_runs` table or `mcp__cognee__cognify_status`. |
| `mcp__cognee__delete` / `prune` | ❌ NO | Single-session only — same `rm` ambiguity. Not a contention issue; it's an intent constraint. |

## Validation

8+ concurrent cognify calls fired and observed clean Postgres `pipeline_runs` transitions to `COMPLETED` for all, without race-related errors.

## Recovery if cognify wedges anyway

Check the cognify log: `~/.claude/cognee-mcp/cognee-mcp/.venv/lib/python3.12/site-packages/logs/<date>.log` for the actual error.

Most common failure mode post-swap is NOT contention but **Cognee custom-schema validation** — see [custom-graph-model.md](custom-graph-model.md) for the Entity inheritance contract.
