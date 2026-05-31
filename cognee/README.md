# Cognee Bundle

Cognee is a cross-session semantic knowledge graph for Claude Code. This bundle wires it into the `claude-config` workflow.

## What you get with Cognee

- **`search`** — semantic query across everything you've ever `cognify`'d: design decisions, debug findings, architecture rationale, surfaced patterns.
- **`save_interaction`** — persist a finding at session end so it's queryable from any future session, even in unrelated projects.
- **`cognify`** — ingest a markdown file (or directory) into the graph with structured entity extraction.

In this `claude-config`, Cognee is referenced from many places:

- `rules/cognee-usage/README.md` — when to cognify, when to search, when to prune
- `agents/debugger.md`, `agents/planner.md`, `agents/executor.md` — search at session start, save at session end
- `hooks/session-init.js` — runs the healthcheck on every session start
- `hooks/stop-session.js` — fires `cognee-auto-save.py` for sessions with ≥2 edits

If Cognee isn't installed, all of these gracefully no-op or surface a warning. The rest of the config works without it.

## Why it's worth setting up

The big leverage points:

1. **Cross-session memory.** "Why did we choose X over Y last quarter?" — Cognee answers in seconds; without it you'd grep through chat transcripts.
2. **Cross-project knowledge transfer.** Findings from project A surface when you query from project B. File-based memory doesn't do this.
3. **MEMORY.md size relief.** When file-based MEMORY.md hits the 24KB silent-truncation limit, you can move bulk content to Cognee and keep MEMORY.md as a pure index.

## Stack overview

The bundle is designed to run entirely locally. No cloud LLM, no cloud graph, no SaaS dependencies. The cost is a few GB of disk + ~6GB RAM when actively cognify-ing.

| Component | Choice | Why |
|---|---|---|
| LLM (entity extraction) | Ollama serving `qwen2.5:32b` (custom 16K context) | Local, no API cost, no rate limits |
| Embedding model | Ollama serving `nomic-embed-text` (768 dim) | Local, fast, 768 dims fits well in Neo4j vector indices |
| Graph DB | Neo4j 5.26 in Docker | Mature, native vector support, proven concurrency |
| Vector DB | LanceDB (file-based) | Lightweight, file-based — no server needed |
| Relational DB (pipeline state) | Postgres 17 + pgvector in Docker | Replaces SQLite to enable parallel cognify |

## Files in this bundle

| File | Purpose |
|---|---|
| `INSTALL.md` | Full setup walkthrough |
| `docker-compose.yml` | Neo4j + Postgres containers |
| `.env.template` | Environment template (copy to MCP server's `.env`) |
| `healthcheck.sh` | 9-check validation script (runs on session start) |
| `ontology.py.example` | Custom graph-model example for typed entity extraction |
| `troubleshooting.md` | Failure modes + recovery commands |

## Cloud alternatives

If local Ollama + Neo4j is too heavy for your setup, the bundle supports cloud alternatives. Edit `.env`:

- LLM: swap to `LLM_PROVIDER=anthropic` or `LLM_PROVIDER=gemini` (lower setup cost; cloud API charges apply)
- Graph: swap to `GRAPH_DATABASE_PROVIDER=kuzu` for embedded mode (single-session only)

See `INSTALL.md` for the full provider matrix.

## Note on the upstream Cognee project

This bundle does **not** include the Cognee MCP server itself — that's a separate clone of [topoteretes/cognee](https://github.com/topoteretes/cognee). `INSTALL.md` walks you through cloning and configuring it.

What this bundle provides: the *Docker compose for backing stores + the healthcheck + the ontology pattern* that make Cognee actually useful inside Claude Code. Without those, Cognee is just an MCP server that needs a lot of glue.
