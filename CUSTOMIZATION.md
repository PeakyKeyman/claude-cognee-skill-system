# Customization Guide

This config was built for one engineer's workflow. Before using it, you'll need to adapt several files to your stack and projects.

## The minimum customization set

These have to change for the config to fit your environment.

### 1. `CLAUDE.md` — global TOC

The top-level CLAUDE.md ships with rules-index pointers and an "Always-on basics" block. Most of the rule pointers transfer; some don't:

- **Project anchors** — the file references a specific project's thesis-of-design and identity drafts. Delete these or replace with your own project-anchor links.
- **Agent-system mandate** — references a "2026-05-10 session-level scoping failure" specific to my codebase. The rule is generic; the historical citation isn't. Remove the citation or update with your own.
- **Search order** — references a 2.4K-line near-miss specific to one project. Same — the rule transfers; the citation doesn't.

### 2. `settings.json` — yours, not mine

The shipped `settings.json.template` has placeholders for:

- MCP server configs (CodeGraph, Cognee, project-specific MCPs)
- `apiKeyHelper` script paths
- `additionalDirectories` permissions for the directories you work in
- Model preferences

Fill these in for your environment. **Do not commit your `settings.json`** — add it to `.gitignore` immediately.

### 3. `hooks/safety-guard.js` — prod deploy patterns

The prod-deploy guard blocks specific project names:

```javascript
{ pattern: /firebase\s+deploy\s+(?:.*\s+)?--project\s+(?:nua-labs-agentic-assist|production|prod)\b/i, ... }
```

Update `nua-labs-agentic-assist` to YOUR prod project name(s). Or remove the pattern if you don't use Firebase.

### 4. `hooks/commit-guard.js` — branch protection

Blocks commits on `main` and `master`. If your team uses a different protected branch (`trunk`, `dev`, `release/*`), update the check.

### 5. Rules that reference specific code paths

Several rules cite specific files in their failure-mode prose. The rule itself is generic; the citation isn't:

- `rules/agent-framing/README.md` and `references/agent-framing-failure-modes.md` cite the 2026-05-10 multi-agent harness incident.
- `rules/inventory-before-building.md` cites a specific env-block infrastructure incident.
- `rules/cognee-usage/concurrency.md` cites the 2026-05-31 Postgres swap.

These citations help future-me understand *why* the rule exists. They'll be opaque to you. Either delete them or replace with your own session histories.

## Optional customization

These are nice-to-have changes but the config works without them.

### Skill culling

The shipped `skills/` directory has 27 entries. Some are heavily used by me (the design family, eval-design, tdd, prompt-engineering, security-scan). Some are inherited from plugin defaults and may not match how you work.

Recommendation: use the config for a week, then `rm -rf` any skill directory you never invoked. Lighter skill list = less context per session.

### Agent customization

The 12 agents have opinionated structure. For example:

- `executor.md` codifies a "reviewer-commits" dispatch model with a specific Gate A/B contract. If you don't use sub-agent dispatch, this is dead weight.
- `peer-reviewer.md` is a complement to `devils-advocate.md` for design-memo work. If you don't author design memos, you don't need it.
- `data-analyst.md` is Polars+BigQuery specific. If you use pandas+Snowflake, the gotchas section won't match.

Edit any agent that doesn't fit your workflow. The structure (when-to-use, process, what-NOT-to-do) is the transferable bit.

### Project-level CLAUDE.md

I keep a project-level CLAUDE.md at each project root (separate from the global one). It has working-style rules, project-specific patterns, deployment rules. That file is NOT included in this repo because it's heavily project-specific. The global CLAUDE.md TOC tells Claude to read it when working in that project.

Write your own project-level CLAUDE.md per project. The shape:

- About this project
- About the user (you)
- Working style with you (push back? sycophancy off? etc.)
- Core principles
- Deployment rules
- Pipeline architecture
- Known issues / hardening needs

## Things you don't need to change

- The rules' structure and triggers (READMEs, sub-files)
- The slash command shims under `commands/custom/`
- The hook logic (only the patterns inside the hooks)
- The Cognee bundle structure
- The references/ documents (they're reference material; either you find them useful or you don't)

## Privacy review before publishing your fork

If you fork this repo and add your own customizations, run this before pushing:

```bash
# Look for paths and emails that should be scrubbed
grep -rE "(/Users/[^/]+|@[a-z]+\.[a-z]+|api[_-]?key|secret|token|password)" . | grep -v node_modules

# Look for project-specific names
grep -rE "(your-org-name|your-project-name)" . | head -20
```
