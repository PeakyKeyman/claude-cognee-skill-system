# CodeGraph First (MANDATORY)

**Trigger:** Any code work — finding, understanding, modifying, deleting, debugging, planning, or reviewing code symbols.

## Rule

**CodeGraph is the default tool for code questions. Grep and Read are explicit fallbacks with named triggers, not the starting point.**

The wrong order: grep first → Read big files → realize you missed callers → check CodeGraph after the fact.

The right order: CodeGraph first → it surfaces the specific symbol/file:line → Read the targeted section → grep only for strings, never for symbols.

## Search order (canonical)

| Question shape | Tool | Why |
|---|---|---|
| "What is the symbol named X?" | `codegraph_search` | Symbol resolution is structural; grep returns string matches that aren't always the symbol |
| "What's the deal with this task/feature/area?" | `codegraph_context` (PRIMARY) | Composes search + node + callers + callees in one call — replaces 5-10 manual lookups |
| "How does X reach Y? / trace the flow" | `codegraph_trace` | Follows dynamic-dispatch hops (callbacks, JSX children, React re-render) that grep can't follow |
| "What calls this?" | `codegraph_callers` | Direct relationship lookup |
| "What does this call?" | `codegraph_callees` | Direct relationship lookup |
| "What would changing this break?" | `codegraph_impact` | Pre-edit blast-radius check |
| "Show me this symbol's source/signature/docstring" | `codegraph_node` | Targeted source view |
| "Show me several related symbols / survey an area" | `codegraph_explore` | One capped call instead of many Read calls |
| "What's in directory X?" | `codegraph_files` | Targeted directory listing |
| "Is the index ready / what's its size?" | `codegraph_status` | Index liveness |

## When to fall back to grep

Grep is the right tool when:
- Searching for a literal string across files (error message, log line, config value)
- Searching non-code files (markdown, YAML, JSON, logs)
- Finding the FIRST occurrence of a string as a fast smoke check

Grep is the wrong tool when:
- Looking for a function/class/symbol name — use `codegraph_search` instead
- Tracing how data flows through the code — use `codegraph_trace` instead
- Finding all callers of a function — use `codegraph_callers` instead

## When to fall back to Read

Read is the right tool when:
- CodeGraph has surfaced a specific symbol at a specific file:line and you want the source
- You need to read documentation, README, or non-code prose
- You're reviewing a specific small file end-to-end (config, manifest)

Read is the wrong tool when:
- You're reading a 500+-line code file blind — use `codegraph_context` first to narrow
- You're trying to understand the relationship between two symbols — use `codegraph_trace` instead

## 5 moments where CodeGraph MUST fire (non-negotiable)

These moments are codified into the agent definitions for `/custom:debug`, `/custom:execute`, `/custom:plan`, `/custom:architect`. The agents enforce CodeGraph use; the rule documents why.

| Moment | Mandatory CodeGraph call |
|---|---|
| Phase 1 step 1 of any debug session | `codegraph_trace` from error location to caller |
| Pre-flight before any signature-changing edit | `codegraph_callers` on the target function |
| Planner Step 1 (Understand) before any draft | `codegraph_context` with the planner's central noun |
| Architect Mode 1 (Codebase Mapping) entry | `codegraph_context` + `codegraph_explore` (in that order) |
| Design-inventory phase opening | `codegraph_context` on each item the operator referenced |

## Anti-patterns

- **Grep-first reflex** — reaching for grep when the question is "where is function X" — use `codegraph_search`
- **Blind Read of large files** — Reading a 500-line file to find one function — use `codegraph_node` or `codegraph_context` first
- **Editing without callers check** — changing a function signature without `codegraph_callers` — the blast radius is unknown
- **Manual debugging without trace** — reading the error and guessing — use `codegraph_trace` instead, the path is mechanical
- **Codegraph after the work, not before** — using CodeGraph to confirm what you guessed — use it BEFORE you guess

## Cost asymmetry

A single `codegraph_context` call is sub-millisecond and returns structured symbol + relationships. Reading 5 files to manually reconstruct the same picture burns ~5K-15K tokens. The reflex is cheap; the alternative is expensive. Pick the cheap one.

## Cheatsheet

For a faster lookup of which tool answers which question, see `~/.claude/references/codegraph-cheatsheet.md`.

## Codified 2026-05-31

Original draft (5 moments) replaced with this stronger doctrine. The lift comes from making CodeGraph the default, not from listing more moments.
