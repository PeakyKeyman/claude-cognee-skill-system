#!/usr/bin/env bash
# Cognee stack healthcheck — catches silent failure modes before they bite.
#
# Run anytime you suspect Cognee isn't working. Exits 0 if all checks pass.
# Use case: codified after 2026-05-26 incident where .env was switched to
# Neo4j but the `neo4j` Python driver wasn't installed in the MCP venv —
# every search call silently failed with ImportError for an unknown duration.

set -u

VENV_PY=~/.claude/cognee-mcp/cognee-mcp/.venv/bin/python
ENV_FILE=~/.claude/cognee-mcp/cognee-mcp/.env
OLLAMA_URL=http://localhost:11434
NEO4J_BOLT=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASS=pleaseletmein

# colors
G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m'
PASS_COUNT=0
FAIL_COUNT=0

pass() { printf "${G}[PASS]${N} %s\n" "$1"; PASS_COUNT=$((PASS_COUNT+1)); }
fail() { printf "${R}[FAIL]${N} %s\n  ${Y}fix:${N} %s\n" "$1" "$2"; FAIL_COUNT=$((FAIL_COUNT+1)); }
info() { printf "${B}[..]${N} %s\n" "$1"; }

echo
echo "Cognee stack healthcheck — $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# 1. Ollama daemon reachable
info "Checking Ollama daemon at $OLLAMA_URL ..."
if curl -fs --max-time 3 "$OLLAMA_URL/api/tags" > /tmp/cognee_hc_models.json; then
  pass "Ollama daemon responsive"
  # 1b. Required models present — derive LLM model from .env so this stays
  # in sync when LLM_MODEL is changed (e.g., to a custom 16k variant).
  # Embedding model is also derived from .env for the same reason.
  llm_model=$(grep -E '^LLM_MODEL' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
  emb_model=$(grep -E '^EMBEDDING_MODEL' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
  # Embedding model has ":latest" suffix in .env; Ollama /api/tags reports the
  # same form, so substring match works for both with/without ":tag".
  for model in "$llm_model" "$emb_model"; do
    # Strip ":latest" for cleaner matching since Ollama may list under either form
    base=$(echo "$model" | sed 's/:latest$//')
    if grep -q "\"name\":\"$model" /tmp/cognee_hc_models.json || grep -q "\"name\":\"$base" /tmp/cognee_hc_models.json; then
      pass "Ollama model present: $model"
    else
      fail "Ollama model missing: $model" "ollama pull $model (or run 'ollama list' to see tags)"
    fi
  done
else
  fail "Ollama daemon not responding" "brew services start ollama"
fi

# 2. Docker daemon (Colima) reachable
info "Checking Docker daemon ..."
if docker ps > /dev/null 2>&1; then
  pass "Docker daemon reachable"
  # 2b. Neo4j container up
  if docker ps --filter name=cognee-neo4j --filter status=running --format '{{.Names}}' | grep -q cognee-neo4j; then
    pass "Neo4j container running"
  else
    fail "Neo4j container not running" "docker start cognee-neo4j  (or recreate)"
  fi
else
  fail "Docker daemon not reachable" "colima start"
fi

# 3. Neo4j bolt + auth via the MCP venv's actual Python (the path that matters)
info "Checking Neo4j bolt + auth from MCP venv ..."
if "$VENV_PY" -c "
from neo4j import GraphDatabase
import sys
try:
    d = GraphDatabase.driver('$NEO4J_BOLT', auth=('$NEO4J_USER', '$NEO4J_PASS'))
    with d.session() as s:
        s.run('RETURN 1').single()
    d.close()
    sys.exit(0)
except ImportError:
    sys.exit(10)
except Exception as e:
    sys.stderr.write(str(e) + '\n')
    sys.exit(11)
" 2>/tmp/cognee_hc_neo4j.err; then
  pass "Neo4j bolt + auth working from MCP venv"
else
  rc=$?
  if [ "$rc" = "10" ]; then
    fail "MCP venv missing 'neo4j' Python driver" "$VENV_PY -m uv pip install 'neo4j>=5.28,<6' && restart Claude Code"
  else
    fail "Neo4j connection failed: $(cat /tmp/cognee_hc_neo4j.err)" "verify NEO4J_AUTH matches docker container env"
  fi
fi

# 4. MCP venv has graph driver matching configured provider (catches config↔driver drift)
info "Checking .env GRAPH_DATABASE_PROVIDER matches installed driver ..."
provider=$(grep -E '^GRAPH_DATABASE_PROVIDER' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
case "$provider" in
  neo4j)
    if "$VENV_PY" -c "import neo4j" 2>/dev/null; then
      pass "Graph provider=neo4j, driver installed"
    else
      fail "Provider=neo4j but driver missing" "$VENV_PY -m uv pip install --python $VENV_PY 'neo4j>=5.28,<6'"
    fi
    ;;
  kuzu)
    if "$VENV_PY" -c "import kuzu" 2>/dev/null; then
      pass "Graph provider=kuzu, driver installed"
    else
      fail "Provider=kuzu but driver missing" "$VENV_PY -m uv pip install --python $VENV_PY kuzu"
    fi
    ;;
  *)
    fail "Unknown GRAPH_DATABASE_PROVIDER='$provider' in .env" "expected 'neo4j' or 'kuzu'"
    ;;
esac

# 4b. Relational DB_PROVIDER matches installed driver + reachable
# Added 2026-05-27 after SQLite → Postgres swap. Catches the same drift class as
# check 4 but for the relational pipeline-state store. Postgres swap was driven
# by surviving SQLite file-lock contention that blocked parallel cognify.
#
# Tests asyncpg specifically — Cognee's create_relational_engine.py imports
# asyncpg, NOT psycopg/psycopg3. Testing the wrong driver hides the real
# silent-failure mode. (Lesson codified 2026-05-27 after psycopg3 was installed
# in error during the swap and the MCP server failed at startup.)
#
# Credentials passed via libpq PG* env vars to avoid inline-secret hook block.
info "Checking .env DB_PROVIDER matches installed driver ..."
db_provider=$(grep -E '^DB_PROVIDER' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
case "$db_provider" in
  postgres)
    db_host=$(grep -E '^DB_HOST' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
    db_port=$(grep -E '^DB_PORT' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
    db_name=$(grep -E '^DB_NAME' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
    db_user=$(grep -E '^DB_USERNAME' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
    db_pass=$(grep -E '^DB_PASSWORD' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
    export PGHOST="$db_host" PGPORT="$db_port" PGUSER="$db_user" PGDATABASE="$db_name" PGPASSWORD="$db_pass"
    if "$VENV_PY" -c "
import sys, asyncio
try:
    import asyncpg
except ImportError:
    sys.exit(10)
try:
    async def go():
        conn = await asyncpg.connect()  # uses PG* env vars
        await conn.fetchval('SELECT 1')
        await conn.close()
    asyncio.run(go())
    sys.exit(0)
except Exception as e:
    sys.stderr.write(str(e) + '\n'); sys.exit(11)
" 2>/tmp/cognee_hc_pg.err; then
      pass "Relational provider=postgres, asyncpg installed + reachable at ${db_host}:${db_port}"
    else
      rc=$?
      if [ "$rc" = "10" ]; then
        fail "Provider=postgres but asyncpg driver missing in MCP venv" "$VENV_PY -m uv pip install --python $VENV_PY asyncpg 'psycopg2-binary>=2.9'  # asyncpg for runtime, psycopg2 for Alembic"
      else
        fail "Postgres connection failed: $(cat /tmp/cognee_hc_pg.err)" "verify cognee-postgres container running on ${db_host}:${db_port}"
      fi
    fi
    unset PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
    ;;
  sqlite)
    pass "Relational provider=sqlite (file-based, no driver check needed)"
    ;;
  *)
    fail "Unknown DB_PROVIDER='$db_provider' in .env" "expected 'postgres' or 'sqlite'"
    ;;
esac

# 5. MCP server process running
info "Checking MCP server process ..."
if pgrep -f "cognee-mcp/.venv/bin/cognee-mcp" > /dev/null; then
  pid=$(pgrep -f "cognee-mcp/.venv/bin/cognee-mcp" | head -1)
  started=$(ps -o lstart= -p "$pid" | xargs)
  pass "MCP server running (PID $pid, started $started)"
else
  fail "MCP server not running" "restart Claude Code"
fi

# 6. End-to-end (light) — can the venv import the embedding engine without errors?
info "Checking embedding engine import path ..."
if "$VENV_PY" -c "
from cognee.infrastructure.databases.vector.embeddings.OllamaEmbeddingEngine import OllamaEmbeddingEngine
" 2>/tmp/cognee_hc_embed.err; then
  pass "Embedding engine import clean"
else
  fail "Embedding import error: $(cat /tmp/cognee_hc_embed.err | tail -1)" "check ollama package install in MCP venv"
fi

# 7. Errored pipeline runs in last 7 days — catches DATASET_PROCESSING_ERRORED that otherwise stays silent.
# Backend-aware: SQLite path post-prune may not exist; Postgres path may have no table yet on fresh DB.
# Both "no DB/table yet" cases PASS — treated as "no errored runs."
info "Checking for errored cognify pipeline runs (last 7 days) ..."
if [ "$db_provider" = "postgres" ]; then
  export PGHOST="$db_host" PGPORT="$db_port" PGUSER="$db_user" PGDATABASE="$db_name" PGPASSWORD="$db_pass"
  errored=$("$VENV_PY" -c "
import sys, asyncio, asyncpg
async def go():
    conn = await asyncpg.connect()
    try:
        exists = await conn.fetchval(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pipeline_runs')\")
        if not exists:
            print('0')
        else:
            n = await conn.fetchval(\"SELECT count(*) FROM pipeline_runs WHERE status LIKE '%ERRORED%' AND created_at > NOW() - INTERVAL '7 days'\")
            print(n)
    finally:
        await conn.close()
try:
    asyncio.run(go())
except Exception as e:
    print(f'err:{e}', file=sys.stderr); sys.exit(1)
" 2>/tmp/cognee_hc_runs.err)
  unset PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
  if [ -z "$errored" ] || [ "$errored" = "0" ]; then
    pass "No errored cognify runs in last 7 days (postgres backend)"
  else
    fail "$errored errored cognify run(s) in last 7 days" "inspect via mcp__cognee__cognify_status; logs in cognee-mcp/.venv/lib/python3.12/site-packages/logs/"
  fi
elif [ "$db_provider" = "sqlite" ]; then
  DATA_ROOT=$(grep -E '^DATA_ROOT_DIRECTORY' "$ENV_FILE" | head -1 | sed 's/.*="\(.*\)"/\1/')
  COGNEE_DB="${DATA_ROOT:-~/.claude/cognee-data}/system/databases/cognee_db"
  if [ -f "$COGNEE_DB" ]; then
    errored=$("$VENV_PY" -c "
import sqlite3, sys
try:
    c = sqlite3.connect('$COGNEE_DB')
    cur = c.execute(\"SELECT count(*) FROM pipeline_runs WHERE status LIKE '%ERRORED%' AND created_at > datetime('now','-7 days')\")
    print(cur.fetchone()[0])
    c.close()
except Exception as e:
    print(f'err:{e}', file=sys.stderr); sys.exit(1)
" 2>/tmp/cognee_hc_runs.err)
    if [ -z "$errored" ] || [ "$errored" = "0" ]; then
      pass "No errored cognify runs in last 7 days (sqlite backend)"
    else
      fail "$errored errored cognify run(s) in last 7 days" "inspect via mcp__cognee__cognify_status; logs in cognee-mcp/.venv/lib/python3.12/site-packages/logs/"
    fi
  else
    # Post-prune state: DB file doesn't exist yet; counts as no errored runs.
    pass "No errored cognify runs (sqlite DB not yet initialized — fresh state)"
  fi
fi

echo "============================================================"
if [ "$FAIL_COUNT" = "0" ]; then
  printf "${G}OK${N}  All checks passed (%d).\n\n" "$PASS_COUNT"
  exit 0
else
  printf "${R}FAIL${N}  %d check(s) failed, %d passed. See fix hints above.\n\n" "$FAIL_COUNT" "$PASS_COUNT"
  exit 1
fi
