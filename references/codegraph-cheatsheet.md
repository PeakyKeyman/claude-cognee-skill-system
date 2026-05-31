# CodeGraph Cheatsheet

Fast lookup: which CodeGraph tool answers which question shape.

## By question shape

### "What is X?"

| If you want | Tool | Example call |
|---|---|---|
| Find a symbol by name | `codegraph_search` | `codegraph_search("ExperienceManifest")` |
| Survey an area or feature | `codegraph_context` | `codegraph_context("env_block render path")` |
| See the source of one symbol | `codegraph_node` | `codegraph_node("orchestrator.env_builder.render_skill_catalog")` |
| Browse a directory | `codegraph_files` | `codegraph_files("functions/app/helpers/agent_engine/")` |

### "How does X relate to Y?"

| If you want | Tool | Example call |
|---|---|---|
| Trace flow from A to B | `codegraph_trace` | `codegraph_trace(from="submitLabAgentTurn", to="bigquery.client.query")` |
| Find what calls this | `codegraph_callers` | `codegraph_callers("real_wrappers.query_warehouse")` |
| Find what this calls | `codegraph_callees` | `codegraph_callees("orchestrator.run_turn")` |
| Pre-edit impact assessment | `codegraph_impact` | `codegraph_impact("env_builder.py")` |
| Survey N related symbols | `codegraph_explore` | `codegraph_explore("retrieve_documents tool wrapper")` |

### "Is the system ready?"

| If you want | Tool |
|---|---|
| Index status | `codegraph_status` |

## By agent flow

### Debugger (`/custom:debug`)

1. **Phase 1 Step 1 (MANDATORY):** `codegraph_trace` from error → entry point
2. Phase 2: `codegraph_explore` to find working examples doing similar things
3. Phase 4 verify: `codegraph_callers` to confirm fix doesn't break other paths

### Executor (`/custom:execute`)

1. **Pre-flight (MANDATORY for signature changes):** `codegraph_callers` on the target function
2. Post-edit: `codegraph_impact` on the modified file to confirm blast radius matches expectation

### Planner (`/custom:plan`)

1. **Step 1 (MANDATORY):** `codegraph_context` with the plan's central noun — replaces blind file reads
2. Per-task design: `codegraph_files` for each affected directory

### Architect (`/custom:architect`)

1. **Mode 1 entry (MANDATORY):** `codegraph_context` + `codegraph_explore` (in that order)
2. Mode 2 design: `codegraph_impact` for proposed structural changes
3. Mode 3 review: `codegraph_callers` + `codegraph_callees` for coupling analysis

### Design inventory (`/custom:design` Phase 3)

1. **First action (MANDATORY):** `codegraph_context` on each item from the pre-research problem statement

## When CodeGraph is the wrong tool

| Question | Right tool |
|---|---|
| "Find this error message string" | `grep -r` |
| "Show me lines 100-150 of file X" | `Read` with offset+limit |
| "What's in the YAML config" | `Read` (not code) |
| "Find anywhere this string appears in markdown" | `grep -r` |
| "Pattern match: find all `.map(fn)` where fn is async" | `ast-grep` (if installed) — neither CodeGraph nor grep handles AST patterns |

## Anti-patterns

- Reaching for `grep` when looking for a function or class name (use `codegraph_search`)
- Reading a 500-line file to find one symbol (use `codegraph_node`)
- Editing a function signature without checking callers (use `codegraph_callers`)
- Debugging an error path by reading code from the error backward (use `codegraph_trace` from error → caller)
- Using CodeGraph AFTER the work to verify (use it BEFORE to plan)

## Related

- Rule: `~/.claude/rules/codegraph-reflex.md`
- Hook: `~/.claude/hooks/read-guard.js` nudges toward CodeGraph for large file reads
- Session-init: `~/.claude/hooks/session-init.js` detects index + staleness
