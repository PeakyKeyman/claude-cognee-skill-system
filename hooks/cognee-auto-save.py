#!/usr/bin/env python3
"""Auto-save session summary to Cognee at session end.

Called by stop-session.js. Reads tracked edits from temp file,
builds a structured summary, and saves to Cognee's knowledge graph
via direct API call (no MCP needed).

Fails silently — session end should never be blocked by Cognee issues.
"""

import json
import os
import sys
import asyncio
from pathlib import Path


async def save_to_cognee(summary: str) -> None:
    """Save session summary to Cognee via direct Python API."""
    try:
        # Set up Cognee env (mirrors settings.json mcpServers.cognee.env)
        os.environ.setdefault("LLM_API_KEY", os.environ.get("ANTHROPIC_API_KEY", ""))
        os.environ.setdefault("LLM_MODEL", "claude-sonnet-4-20250514")
        os.environ.setdefault("LLM_PROVIDER", "anthropic")
        os.environ.setdefault("EMBEDDING_PROVIDER", "ollama")
        os.environ.setdefault("EMBEDDING_MODEL", "nomic-embed-text")
        os.environ.setdefault("EMBEDDING_ENDPOINT", "http://localhost:11434")
        os.environ.setdefault("VECTOR_DB_PROVIDER", "lancedb")
        os.environ.setdefault("GRAPH_DB_PROVIDER", "kuzu")
        os.environ.setdefault("DB_PROVIDER", "sqlite")

        # Add cognee to path
        cognee_path = Path.home() / ".claude" / "cognee-mcp"
        sys.path.insert(0, str(cognee_path))
        sys.path.insert(0, str(cognee_path / "cognee-mcp" / "src"))

        import cognee

        await cognee.add(summary, node_set=["session_summaries"])
        await cognee.cognify()

    except Exception as e:
        # Fail silently — never block session end
        print(f"Cognee auto-save failed (non-blocking): {e}", file=sys.stderr)


def build_summary(session_data: dict) -> str | None:
    """Build a structured session summary from tracked edits and context."""
    edit_count = session_data.get("editCount", 0)
    files = session_data.get("files", [])
    project_dir = session_data.get("projectDir", "unknown")

    if edit_count < 2 and not files:
        return None  # Not enough activity to save

    # Build structured summary
    lines = [
        f"## Session Summary — {project_dir}",
        f"Date: {session_data.get('timestamp', 'unknown')}",
        f"Edits: {edit_count} across {len(files)} files",
        "",
        "### Files Modified:",
    ]
    for f in files[:20]:  # Cap at 20 files
        lines.append(f"- {f}")

    # Add any context that was tracked
    if session_data.get("topics"):
        lines.append("")
        lines.append("### Topics Covered:")
        for topic in session_data["topics"][:10]:
            lines.append(f"- {topic}")

    if session_data.get("decisions"):
        lines.append("")
        lines.append("### Key Decisions:")
        for decision in session_data["decisions"][:10]:
            lines.append(f"- {decision}")

    return "\n".join(lines)


def main():
    """Entry point — called by stop-session.js with session data as argv[1]."""
    if len(sys.argv) < 2:
        sys.exit(0)

    try:
        session_data = json.loads(sys.argv[1])
    except (json.JSONDecodeError, IndexError):
        sys.exit(0)

    summary = build_summary(session_data)
    if not summary:
        sys.exit(0)

    # Run with a timeout — don't hang session end
    try:
        asyncio.run(asyncio.wait_for(save_to_cognee(summary), timeout=15.0))
    except (asyncio.TimeoutError, Exception) as e:
        print(f"Cognee auto-save timeout/error (non-blocking): {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
