# Installation

## Prerequisites

- Claude Code installed (`brew install claude-code` or per [docs](https://docs.claude.com/en/docs/claude-code))
- Node.js 18+ (for hooks)
- macOS or Linux (hooks use shell + Node; Windows untested)

## Optional but recommended

- [CodeGraph](https://github.com/colbymchenry/codegraph) — `npx @colbymchenry/codegraph init` per project. The configuration assumes CodeGraph is the default code-navigation tool.
- [Cognee](https://github.com/topoteretes/cognee) MCP server — for cross-session semantic memory. See `cognee/INSTALL.md`.
- [ruff](https://docs.astral.sh/ruff/) (Python formatting) and [prettier](https://prettier.io) (JS/TS) — auto-format hook uses both. Hook gracefully no-ops if missing.

## Two install approaches

### Approach 1: Symlink (recommended)

Allows you to `git pull` updates and have them take effect immediately.

```bash
# Clone
git clone https://github.com/<your-fork>/claude-config.git ~/claude-config
cd ~/claude-config

# Read customization guide
$EDITOR CUSTOMIZATION.md

# Back up your existing ~/.claude if any
[ -d ~/.claude ] && mv ~/.claude ~/.claude.bak.$(date +%Y%m%d-%H%M%S)
mkdir -p ~/.claude

# Symlink the directories
ln -s ~/claude-config/rules       ~/.claude/rules
ln -s ~/claude-config/agents      ~/.claude/agents
ln -s ~/claude-config/skills      ~/.claude/skills
ln -s ~/claude-config/commands    ~/.claude/commands
ln -s ~/claude-config/hooks       ~/.claude/hooks
ln -s ~/claude-config/references  ~/.claude/references

# Copy (don't symlink) — these need per-user customization
cp ~/claude-config/CLAUDE.md               ~/.claude/CLAUDE.md
cp ~/claude-config/settings.json.template  ~/.claude/settings.json

# Customize the copies
$EDITOR ~/.claude/CLAUDE.md       # update project-specific TOC entries
$EDITOR ~/.claude/settings.json   # add your API keys, MCP server configs, etc.
```

### Approach 2: Copy (for users who want full ownership)

Same as above but use `cp -r` instead of `ln -s`. Updates from the repo no longer auto-apply.

## Verifying installation

```bash
# Hooks fire on session start
claude --version          # smoke test

# Inside a Claude Code session:
/agents                   # should list the 12 custom agents
/help                     # should show your custom commands under /custom:*

# Try a slash command
# In Claude Code: /custom:plan
# Should load planner.md and start the planning flow
```

## Hook permissions

The hooks are wired into `settings.json` under `hooks.PreToolUse`, `hooks.PostToolUse`, etc. On first use, Claude Code may prompt for permission to execute hook scripts. Approve them once.

If a hook fails to fire, check:
1. The path in `settings.json` matches your actual install path
2. `chmod +x` on `.sh` scripts (the repo preserves this; some clones don't)
3. Node.js is on `PATH` and resolvable as `node`

## Customization required before first use

Read `CUSTOMIZATION.md` for the full list. The minimum:

1. **`CLAUDE.md`** — rewrite the "Always-on basics" section to remove project-specific references (Nua Labs, BigQuery, etc.). The skill-routing table stays; the project anchors don't.
2. **`settings.json`** — add your MCP servers, allowed permissions, model preferences.
3. **`hooks/safety-guard.js`** — the prod-deploy guard blocks specific project names (`nua-labs-agentic-assist`). Change these to your prod project names or remove if not using Firebase.
4. **`hooks/commit-guard.js`** — the branch check blocks commits on `main`/`master`. If you use a different default branch (e.g., `dev` or `trunk`), update the pattern.

## Setting up Cognee (optional)

The Cognee integration provides cross-session semantic memory (the "what did we learn last quarter" knowledge graph). It requires a few moving parts (Docker, Ollama or cloud LLM, the Cognee MCP server). See `cognee/INSTALL.md` for the full walkthrough.

You can skip Cognee initially and add it later — most of the configuration works without it. The skills that reference Cognee will gracefully no-op if the MCP server is unavailable.

## Uninstalling

```bash
# Remove symlinks (Approach 1)
rm ~/.claude/rules ~/.claude/agents ~/.claude/skills ~/.claude/commands ~/.claude/hooks ~/.claude/references
rm ~/.claude/CLAUDE.md ~/.claude/settings.json

# Restore your backup
mv ~/.claude.bak.<timestamp> ~/.claude
```

## Troubleshooting

- **Hooks not firing**: check `settings.json` paths; check Node.js on `PATH`; check executable bit on `.sh` scripts
- **Slash commands not found**: ensure `~/.claude/commands/custom/` is populated; restart the Claude Code session
- **Agents not listed in `/agents`**: ensure `~/.claude/agents/` has `.md` files (not just a symlink to an empty directory)
- **Cognee MCP server crashes**: see `cognee/troubleshooting.md`
