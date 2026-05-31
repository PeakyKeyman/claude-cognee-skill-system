# claude-config

An opinionated, battle-tested Claude Code configuration for senior-engineer workflows.

This is one engineer's personal `~/.claude/` published as a worked example. It is **not** a generic starter kit — you'll need to adapt it to your stack, projects, and tools. The patterns are transferable; the specifics often are not.

## What's in it

| Layer | Count | What it provides |
|---|---|---|
| **Rules** | 14 (12 flat + 2 directories) | Triggered guidance loaded on demand. Covers agent framing, Cognee usage, workflow discipline, CodeGraph reflex, MEMORY.md size, etc. |
| **Agents** | 12 | Architect, debugger, executor, planner, devils-advocate, peer-reviewer, code-reviewer, verifier, researcher, data-analyst, orchestrator, common-ground. |
| **Skills** | 27 | Including a 9-skill `design` family for multi-phase research-augmented design memos, plus TDD, eval-design, prompt-engineering, security-scan, and more. |
| **Slash commands** | 23 (under `/custom:`) | Thin shims pointing at agents and skills with explicit invocation patterns. |
| **Hooks** | 13 wired | Session init, safety guards (dangerous Bash, secrets, prod deploys, metronome), context monitor, pre-compact saver, auto-format, test reminder, statusline, etc. |
| **Cognee bundle** | Standalone | Docker compose for Neo4j + Postgres, healthcheck script, ontology example, troubleshooting catalog. See `cognee/README.md`. |

## Design philosophy

Three big bets shape the configuration:

1. **CodeGraph first.** When asking about code, the default tool is CodeGraph (10 distinct tools — search, callers, callees, trace, context, etc.). Grep and Read are explicit fallbacks. See `rules/codegraph-reflex.md`.

2. **Heterogeneous model routing.** Orchestrator-worker pattern (Opus orchestrator + Sonnet workers) per Anthropic's research-system precedent. See `skills/model-routing/SKILL.md`.

3. **Adversarial verification.** Every memo runs through `/custom:devils-advocate` + `/custom:peer-review` before lock. Every commit runs through `/custom:review` with a reviewer-commits dispatch model. See `rules/sub-agents.md` and `agents/code-reviewer.md`.

## The design-skill family (most distinctive)

For real design-memo work, this config ships an 11-phase orchestrated workflow:

```
Entry → First Interview → Inventory → Follow-ups → Research Fan-out
       → Second Interview (5 waves) → Memo Draft → DA Review
       → Peer-Review → Multi-pass Revision → Handoff
```

Invoke with `/custom:design`. The Second Interview includes a `NECESSITY` wave (taste-and-strategic-necessity check: should this even be built?) that catches over-engineering before it happens. See `skills/design/SKILL.md`.

## Quick start

```bash
# 1. Clone this repo
git clone https://github.com/<your-fork>/claude-config.git
cd claude-config

# 2. Read CUSTOMIZATION.md FIRST — you'll need to adapt some content
$EDITOR CUSTOMIZATION.md

# 3. Install (symlink approach recommended — see INSTALL.md for alternatives)
ln -s "$(pwd)/rules"           ~/.claude/rules
ln -s "$(pwd)/agents"          ~/.claude/agents
ln -s "$(pwd)/skills"          ~/.claude/skills
ln -s "$(pwd)/commands"        ~/.claude/commands
ln -s "$(pwd)/hooks"           ~/.claude/hooks
ln -s "$(pwd)/references"      ~/.claude/references
cp CLAUDE.md                   ~/.claude/CLAUDE.md          # copy + customize, don't symlink
cp settings.json.template      ~/.claude/settings.json      # copy + customize

# 4. Set up Cognee (optional but recommended)
cd cognee && cat INSTALL.md
```

Full instructions in `INSTALL.md`.

## What this isn't

- **A generic starter kit** — the rules and skills reference specific patterns (BigQuery, Firebase, multi-agent ADK, Postgres-backed Cognee) that fit one stack. The architecture transfers; the specifics will not.
- **A drop-in install** — most users will want to delete some skills, customize the rules, and rewrite the project anchors in `CLAUDE.md`.
- **Anthropic-official** — this is an independent personal configuration. It uses Anthropic-published patterns (e.g., the multi-agent research-system orchestrator-worker model) but is not endorsed.

## License

MIT — see `LICENSE`.

## Acknowledgements

Patterns lifted from these public sources (each cited in the relevant skill or rule):

- [Matt Pocock's grill-me skill](https://github.com/mattpocock/skills) — Socratic interview discipline, codebase-first override, depth-tree walking
- [Obra's superpowers framework](https://github.com/obra/superpowers) — brainstorming hard gate, three-round Socratic structure
- [Jekudy's grillme-skill](https://github.com/Jekudy/grillme-skill) — wave structure, analytical lenses
- [Anthropic's research-system](https://anthropic.com/engineering/multi-agent-research-system) — orchestrator-worker model routing

Methodological references for the design-skill family include Walley imprecise probability, GRADE evidence framework, Toulmin argumentation, conformal prediction, and ICD-203 analytic standards. See `skills/design-memo-draft/SKILL.md` for the full citation list when authoring memos.

## Contributing

This is a personal config — issues and pull requests are welcome but I won't merge changes that don't fit my workflow. If you want to fork and diverge, that's the encouraged path.
