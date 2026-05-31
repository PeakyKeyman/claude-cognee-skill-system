# MEMORY.md Size Discipline (MANDATORY)

**Trigger:** Writing or appending to any `~/.claude/projects/<project>/memory/MEMORY.md` file.

## Rule

`MEMORY.md` must stay under 23KB. Claude Code's MEMORY.md loader silently truncates at ~24KB — writes past that drop the bottom of the index without any error signal.

The `file-size-guard.js` hook blocks writes >23KB hard. This rule exists so when the block fires you know what to do.

## When MEMORY.md approaches the limit

Three moves in order:

1. **Compress entries.** Each pointer line ≤140 chars. One line per topic, not a paragraph. The description goes in the linked file, not in the index.

2. **Move content to per-topic files.** MEMORY.md is an index, not a content store. If you find yourself writing a multi-line summary inline, extract it to a separate `.md` file in the same memory directory and link to it.

3. **Archive superseded entries.** Session pointers marked SUPERSEDED or PREDECESSOR should be removed from MEMORY.md (the underlying `.md` files survive in the directory for browsing). Index entries are a working set, not a log.

## When MEMORY.md is structurally bloated

If compression + move + archive don't get you below 23KB, the structure is wrong:

- Too many "active" sessions in the RESUME pointers section — close some
- Feedback rules section has too many entries — group by topic and link to per-group index files
- The index has become a content store, not an index — major refactor required

## Why this matters

Silent truncation means future-session continuity gets quietly broken. The bottom of the index (often the oldest entries with the most accumulated context) gets dropped first. By the time you notice, you've already lost session state.

Codified 2026-05-31 after the actual incident: MEMORY.md hit 63KB; ~60% of entries were silently dropped from every session-start load until manually compressed.

## Sources

- Hook: `~/.claude/hooks/file-size-guard.js` (MEMORY.md-specific guard block, ~23KB hard limit)
- Related: `~/.claude/rules/cognee-usage/README.md` (memory write policy — file + Cognee dual write)
