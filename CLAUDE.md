# Cian's Claude Code Configuration

Global CLAUDE.md — table of contents. Rules live in `~/.claude/rules/` and load on-demand when their trigger applies.

## Slash commands (all under `/custom:`)

`plan` `execute` `debug` `review` `research` `architect` `verify` `devils-advocate` `common-ground` `orchestrate` `data-audit` `prompt-craft` `checkpoint` `learn` `security-scan` `spec-mine` `eval`

## MCP tools (use proactively)

- **CodeGraph** — code navigation, callers/callees, impact analysis. Use BEFORE manual file reads.
- **Cognee** — cross-session memory. `search` at session start, `save_interaction` at session end. **See `rules/cognee-usage.md` before using — multi-session write conflicts are real.**
- **Context7** — up-to-date library docs. Use before guessing API syntax.

## Rules index (read the file when its trigger fires)

| When | Read |
|---|---|
| Building/reviewing data-analysis agents, profilers, primitives, rules | `rules/industry-agnosticism.md` |
| Writing LLM prompts parsed into typed schemas | `rules/prompt-code-parity.md` |
| Writing Python code, tests, or data transforms | `rules/code-and-testing.md` |
| Starting work, resuming, debugging, compacting, committing | `rules/workflow.md` |
| Dispatching sub-agents via the Agent tool | `rules/sub-agents.md` |
| Calling any `mcp__cognee__*` tool | `rules/cognee-usage.md` |
| Writing/editing any runtime config (model, tokens, temp, routing, timeouts) | `rules/config-single-source-of-truth.md` |
| Spawning a subagent or invoking a `/custom:*` slash command | `rules/model-routing.md` |
| Building, auditing, planning any agent / agentic framework / multi-agent system | `rules/agent-framing-and-competitive-scope.md` |
| About to propose a new layer / module / abstraction / overhaul (gate before any build proposal) | `rules/inventory-before-building.md` |

## Always-on basics

- **Agent-system mandate:** When building agents, the default target is to dominate every GTM agent on every dimension that matters for human-employee replacement. Challenge user framing for blindspots; reject menu-of-options without the maximalist option; pull SOTA references and run a competitive sweep at session start. See `rules/agent-framing-and-competitive-scope.md`. Codified 2026-05-10 after a session-level scoping failure.
- **Model routing:** Per-skill matrix in `skills/model-routing/SKILL.md`; enforcement in `rules/model-routing.md`. Pinned-Opus skills: `plan`, `architect`, `devils-advocate`, `orchestrate`, `prompt-craft`, `security-scan`, `eval`. Default-Sonnet skills (escalate per matrix): `execute`, `review`, `debug`, `research`, `verify`, `common-ground`, `data-audit`, `checkpoint`, `learn`, `spec-mine`. Never Haiku.
- **Escalation:** When undeterminable, don't guess — ask with options + recommendation.
- **Search order:** repo code → library → Context7 → build custom. **HARD GATE before any build proposal:** see `rules/inventory-before-building.md`. Codified 2026-05-26 after a session-level near-miss where a "new layer" was nearly proposed against ~2.4K lines of existing env-block infrastructure.
- **Every project has `KNOWN_ISSUES.md` at root.** Read at session start, append after resolved bugs.
- **Done-when criteria assert at the LLM-call boundary or user-facing output**, never an intermediate serializer. See `~/.claude/templates/PLAN.md` "Done-when assertion rules" (R-03, codified from Burry Phase 3 FU-05 incident).

## Directory layout

```
~/.claude/
├── CLAUDE.md           ← this TOC
├── rules/              ← on-demand rule files (loaded by trigger)
├── references/         ← deep reference docs (code-style, testing, data-eng, etc.)
├── agents/             ← 12 agent definitions (invoked by /custom:* commands)
├── skills/             ← skill library (loaded by Skill tool when invoked)
├── commands/custom/    ← /custom:* slash commands
├── hooks/              ← session/tool lifecycle hooks
├── cognee-mcp/         ← Cognee MCP server + knowledge graph
├── archive/            ← retired configs (gsd-commands, etc.)
└── settings.json       ← permissions, hooks, plugins, MCP servers
```
