# MCP Stack Reference — Cognee + CodeGraph

## Overview
Two MCP tools are available for enhanced code navigation and cross-session memory.

## CodeGraph
**Purpose**: Code navigation and impact analysis. Use BEFORE reading files manually.

### Key Operations
- **Symbol search**: Find functions, classes, variables across the codebase
- **Callers/callees**: Who calls this function? What does this function call?
- **Impact analysis**: What would be affected if I change this?
- **Dependency tracing**: Trace imports and module dependencies

### When to Use
- Before exploring unfamiliar code — find entry points and relationships
- Before refactoring — understand impact radius
- When debugging — trace call chains to find root cause
- When porting agents — map existing tool/function interfaces

### Priority
Use CodeGraph FIRST for code navigation, THEN read specific files. It's faster and gives structural context that file reading alone doesn't provide.

## Cognee
**Purpose**: Cross-session memory via knowledge graphs. Persistent AI memory.

### Key Operations
- **search**: Query cross-session memory for prior decisions, lessons learned, patterns
- **save_interaction**: Persist important findings at end of session
- **add + cognify**: Ingest documents and build knowledge graph

### When to Use
- **Session start**: Search Cognee for prior context on the current project
- **After resolving bugs**: Save the pattern to Cognee for future sessions
- **After architectural decisions**: Persist the reasoning (complements ADRs)
- **End of session**: Save key findings with `save_interaction`

### Integration with Skills
- **continuous-learning**: Use Cognee `save_interaction` to persist extracted patterns
- **checkpoint**: Include Cognee save as part of checkpoint process
- **common-ground**: Search Cognee for prior agreements before re-surfacing assumptions

## Architecture Context
Cognee repo is cloned at `~/.claude/cognee-mcp/` and provides:
- ECL pipeline: Extract → Cognify → Load (replaces traditional RAG)
- Knowledge graphs via Kuzu (default), Neo4j, or Neptune
- Vector search via LanceDB (default), ChromaDB, or PGVector
- Multi-tenant data isolation
- MCP server for Claude Code integration (stdio/SSE/HTTP transport)

See `~/.claude/cognee-mcp/CLAUDE.md` for full Cognee documentation.
