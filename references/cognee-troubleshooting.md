# Cognee Troubleshooting

Reference material for diagnosing Cognee failures. The rules live in `~/.claude/rules/cognee-usage/`; this file is failure-mode catalog.

## Symptom: `search` returns `Error executing tool search: No module named '<X>'`

**Root cause:** `GRAPH_DATABASE_PROVIDER` in `.env` was changed to `<X>` but the corresponding Python driver was never installed in the MCP venv. The MCP server starts, the pipeline initiates (cognify_status returns real UUIDs), but every graph write/read silently errors.

**Fix:**

```bash
~/.claude/cognee-mcp/cognee-mcp/.venv/bin/uv pip install "<X>>=<version>"
# Then restart Claude Code so the MCP server picks up the new package
```

Specific recovery commands:
- `neo4j`: `... uv pip install "neo4j>=5.28,<6"`
- `kuzu`: `... uv pip install kuzu`

## Symptom: cognify "completes" but `search` returns "context does not contain information"

Most likely: same root cause as above — graph writes failed silently. Verify via `MATCH (n) RETURN count(n)` in `cypher-shell` (against the configured graph DB). If zero nodes, no writes ever landed.

## Symptom: MCP server crashes at startup with `ModuleNotFoundError: No module named 'asyncpg'`

**Root cause:** `DB_PROVIDER=postgres` in `.env` was set but the `asyncpg` driver was not installed in the MCP venv. The healthcheck might also pass falsely if it tests a DIFFERENT Postgres driver (psycopg/psycopg3) — wrong-driver test gives false confidence.

**Fix:**

```bash
VPY=~/.claude/cognee-mcp/cognee-mcp/.venv/bin/python
~/.claude/cognee-mcp/cognee-mcp/.venv/bin/uv pip install --python "$VPY" asyncpg "psycopg2-binary>=2.9"
# Then restart Claude Code so the MCP server picks up the new packages.
```

**Critical:** the `--python` flag is mandatory. `uv pip install` without `--python` discovers `.venv` from CWD, which routes to whatever local project venv you happen to be in — NOT the MCP server's venv. Two restart cycles were lost to this in the 2026-05-31 swap session.

## Symptom: Pydantic validation errors with "21 validation errors for DocumentChunk"

Root cause: custom graph_model class inherits `BaseModel` or `DataPoint` instead of `Entity`. See `~/.claude/rules/cognee-usage/custom-graph-model.md` for the Entity inheritance contract.

## The 2026-05-26 silent-failure incident — why the healthcheck exists

`.env` had been switched to Neo4j (correctly), but the `neo4j` Python driver was missing from the MCP venv. Every `save_interaction` and `cognify` call between the .env change and 2026-05-26 silently failed at the graph-write step. The relational layer (SQLite at the time) still recorded pipeline initiations, masking the failure. Discovered only when search was tested end-to-end. Estimated unknown-duration silent loss of cross-session memory.

The healthcheck script (`~/.claude/cognee-mcp/healthcheck.sh`) and the session-init.js hook that runs it exist so the next occurrence is caught in seconds, not weeks.

## Related rules

- `~/.claude/rules/cognee-usage/README.md` (when to use Cognee + memory write policy)
- `~/.claude/rules/cognee-usage/stack.md` (current stack config)
- `~/.claude/rules/cognee-usage/concurrency.md` (parallel-safety rules)
- `~/.claude/rules/cognee-usage/custom-graph-model.md` (Entity inheritance contract)
