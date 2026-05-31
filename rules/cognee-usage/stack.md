# Cognee Stack (post-2026-05-31 Postgres swap)

**Trigger:** Stack config change OR debugging Cognee MCP startup OR onboarding a new machine.

## Current components

- **LLM**: local Ollama serving `qwen2.5:32b-16k` at `http://localhost:11434/v1`. Was Gemini cloud (`gemini-2.5-flash`) → Qwen 32B base (`qwen2.5:32b`). Custom 16K-context variant created 2026-05-31 to save ~2.2GB KV cache vs default 32K context. Modelfile: `FROM qwen2.5:32b\nPARAMETER num_ctx 16384`. Falls back to base cleanly (same weights, different metadata).
- **Embeddings**: local Ollama serving `nomic-embed-text:latest` at `http://localhost:11434/api/embed`, 768 dims. Was Gemini cloud.
- **Graph DB**: Neo4j 5.26 in a Docker container (`cognee-neo4j`), `bolt://localhost:7687`, auth `neo4j/pleaseletmein`. Was Kuzu (embedded, file-locked) → Neo4j 2026-05-26.
- **Vector DB**: LanceDB at `~/.claude/cognee-data/` (unchanged — still file-based but lower contention).
- **Relational DB**: Postgres 17 + pgvector in a Docker container (`cognee-postgres`), `127.0.0.1:5433`, db=`cognee_db`, user=`cognee`. Was SQLite (file-locked under concurrent cognify) → Postgres 2026-05-31. Drivers: `asyncpg` (async runtime path) + `psycopg2-binary` (Alembic migrations). Host port 5433, not 5432 — 5432 is occupied by the host's Nua Labs dev Postgres.
- **Ollama tuning env vars** (set via `launchctl setenv`): `OLLAMA_KEEP_ALIVE=30s` (drops model from VRAM 30s after last call vs 5-min default), `OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q8_0`. Survives restart but **resets on full reboot** — re-apply via `launchctl setenv OLLAMA_KEEP_ALIVE 30s && brew services restart ollama`.

## Config files

Active config lives in `~/.claude/cognee-mcp/cognee-mcp/.env` AND `~/.claude/settings.json mcpServers.cognee.env`. **The settings.json env block overrides .env** — keep them in sync.

## Rollback to Gemini cloud (if needed)

```bash
cp ~/.claude/cognee-mcp/cognee-mcp/.env.backup.gemini-2026-05-25 ~/.claude/cognee-mcp/cognee-mcp/.env
# AND revert settings.json `mcpServers.cognee.env`
```

## Healthcheck

`~/.claude/cognee-mcp/healthcheck.sh` validates the entire stack in ~3 seconds (Ollama models + memory state, Docker daemon, Neo4j bolt+auth, MCP venv driver match for BOTH graph and relational providers, Postgres reachable at configured port via asyncpg, MCP server process, embedding engine import). Exits 0 on green. As of 2026-05-31, this script runs automatically on session start via `~/.claude/hooks/session-init.js`.
