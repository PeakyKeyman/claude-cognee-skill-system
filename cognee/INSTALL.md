# Cognee Installation Walkthrough

End-to-end setup for a local Cognee stack. ~30-45 minutes if everything goes smoothly.

## Prerequisites

- Docker Desktop or OrbStack running
- Homebrew (macOS) or apt (Linux)
- `uv` for Python package management: `pip install uv` or `brew install uv`
- ~10GB free disk + ~6GB free RAM for the Qwen 32B model when active

## Step 1: Install Ollama

```bash
brew install ollama          # macOS
# or: curl https://ollama.ai/install.sh | sh  # Linux

brew services start ollama   # macOS
# or: ollama serve &           # Linux
```

Pull the models:

```bash
ollama pull qwen2.5:32b              # ~20GB — main LLM
ollama pull nomic-embed-text         # ~270MB — embeddings
```

**Optional but recommended:** create a custom 16K-context variant of Qwen to save ~2.2GB KV cache vs default 32K:

```bash
cat > /tmp/Modelfile-qwen-16k <<EOF
FROM qwen2.5:32b
PARAMETER num_ctx 16384
EOF

ollama create qwen2.5:32b-16k -f /tmp/Modelfile-qwen-16k
```

If you skip this step, change `LLM_MODEL` in `.env` from `qwen2.5:32b-16k` to `qwen2.5:32b`.

**Ollama tuning (recommended):**

```bash
# Drop model from VRAM 30s after last call (vs default 5 min)
launchctl setenv OLLAMA_KEEP_ALIVE 30s
launchctl setenv OLLAMA_FLASH_ATTENTION 1
launchctl setenv OLLAMA_KV_CACHE_TYPE q8_0
brew services restart ollama
```

These survive normal restarts but reset on full reboot — re-apply via the same commands.

## Step 2: Start Neo4j + Postgres

From this directory (`cognee/`):

```bash
docker compose up -d
```

This starts:

- `cognee-neo4j` on `bolt://localhost:7687` (graph database)
- `cognee-postgres` on `127.0.0.1:5433` (pipeline state — port 5433 to avoid conflict with default 5432)

Verify they're up:

```bash
docker ps                                            # should show both containers
docker exec cognee-neo4j cypher-shell -u neo4j -p pleaseletmein "RETURN 1"
docker exec cognee-postgres psql -U cognee -d cognee_db -c "SELECT 1"
```

Default credentials in `docker-compose.yml`:
- Neo4j: `neo4j` / `pleaseletmein`
- Postgres: `cognee` / `cognee_local_dev`

**Change these before exposing to anything beyond localhost.**

## Step 3: Clone the Cognee MCP server

```bash
cd ~/.claude
git clone https://github.com/topoteretes/cognee.git cognee-mcp
cd cognee-mcp/cognee-mcp

# Create venv with uv
uv venv
uv pip install -e .
```

## Step 4: Configure the MCP server

Copy the env template:

```bash
cp ~/claude-config/cognee/.env.template ~/.claude/cognee-mcp/cognee-mcp/.env
```

Edit `~/.claude/cognee-mcp/cognee-mcp/.env` and fill in:
- `LLM_MODEL` — `qwen2.5:32b-16k` (or `qwen2.5:32b` if you skipped Step 1's custom build)
- `GRAPH_DATABASE_PASSWORD` — whatever you set in docker-compose.yml
- `DB_PASSWORD` — same

Install database drivers in the MCP server's venv:

```bash
VPY=~/.claude/cognee-mcp/cognee-mcp/.venv/bin/python
~/.claude/cognee-mcp/cognee-mcp/.venv/bin/uv pip install --python "$VPY" \
  asyncpg "psycopg2-binary>=2.9" "neo4j>=5.28,<6"
```

**Critical:** the `--python` flag is mandatory. Without it, `uv pip install` discovers `.venv` from the current directory, which routes to whatever project venv you're in — NOT the MCP server's. Two cycles of restart-and-debug were lost to this in the 2026-05-31 swap session.

## Step 5: Wire the MCP server into Claude Code

Edit `~/.claude/settings.json` and add to `mcpServers`:

```json
{
  "mcpServers": {
    "cognee": {
      "command": "uv",
      "args": ["--directory", "$HOME/.claude/cognee-mcp/cognee-mcp", "run", "cognee-mcp"],
      "env": {
        "LLM_PROVIDER": "ollama",
        "LLM_MODEL": "qwen2.5:32b-16k",
        "LLM_ENDPOINT": "http://localhost:11434/v1",
        "EMBEDDING_PROVIDER": "ollama",
        "EMBEDDING_MODEL": "nomic-embed-text:latest",
        "EMBEDDING_ENDPOINT": "http://localhost:11434/api/embed",
        "GRAPH_DATABASE_PROVIDER": "neo4j",
        "GRAPH_DATABASE_URL": "bolt://localhost:7687",
        "GRAPH_DATABASE_USERNAME": "neo4j",
        "GRAPH_DATABASE_PASSWORD": "pleaseletmein",
        "DB_PROVIDER": "postgres",
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "5433",
        "DB_NAME": "cognee_db",
        "DB_USERNAME": "cognee",
        "DB_PASSWORD": "cognee_local_dev"
      }
    }
  }
}
```

**Important:** the env block in `settings.json` overrides the `.env` file. Keep them in sync, or pick one as the source of truth. If using the env block, you can leave `.env` for documentation only.

## Step 6: Restart Claude Code and validate

```bash
# Restart Claude Code (quit + reopen)

# Inside Claude Code:
bash ~/.claude/cognee-mcp/healthcheck.sh
# Expected output: "Cognee healthcheck: 9/9 OK"
```

The session-init hook also runs this on every session start. If it fails, you'll see a warning in the session-start context.

## Step 7: Cognify your first content

In a Claude Code session:

```
mcp__cognee__cognify [text or file path]
```

Watch for the pipeline to complete:

```
mcp__cognee__cognify_status
```

Then test retrieval:

```
mcp__cognee__search "your query"
```

If you see results, you're set.

## Custom graph-model setup (advanced)

For typed entity extraction (e.g., Cognee should treat "Lesson" as a typed class, not generic text), see `ontology.py.example` and `troubleshooting.md` ("Pydantic validation errors").

The contract: your custom classes MUST inherit `cognee.modules.engine.models.Entity` (not just `BaseModel` or `DataPoint`). The `name: str` and `description: str` fields are required.

## Cloud-alternative configurations

If local Ollama is too heavy:

### Anthropic LLM + local graph

```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5
LLM_API_KEY=sk-ant-...
EMBEDDING_PROVIDER=cohere
EMBEDDING_MODEL=embed-english-v3.0
EMBEDDING_API_KEY=...
GRAPH_DATABASE_PROVIDER=neo4j       # keep local Neo4j
```

### Embedded mode (single-session, no Docker)

```env
LLM_PROVIDER=ollama
GRAPH_DATABASE_PROVIDER=kuzu        # embedded, file-locked
DB_PROVIDER=sqlite                   # embedded, file-locked
```

Note: embedded mode is single-session — you can't run multiple Claude Code sessions concurrently without `database is locked` errors. The whole point of the Postgres swap was eliminating this.

## Troubleshooting

See `troubleshooting.md` in this directory.

Common issues:
- `ModuleNotFoundError: asyncpg` — missed Step 4's driver install (with `--python` flag)
- `Failed to connect to Neo4j` — Docker container not running OR wrong port
- `Healthcheck fails after MCP install` — `settings.json` env block doesn't match `.env`
