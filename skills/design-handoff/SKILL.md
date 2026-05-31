---
name: design-handoff
description: "Handoff phase. Locks the memo, writes a next-session kickoff phrase, persists to file-based memory AND Cognee per CLAUDE.md dual-write policy. Closes the design arc with everything a future session needs to resume."
triggers: ["design handoff", "lock the memo", "/custom:design-handoff"]
---

# Design — Handoff

## When to use
- Sub-skill of /custom:design after Revision Loop converges
- Also used for ABANDON verdict from Second Interview (write a brief "why abandoned" memo, persist it, halt)

## When NOT to use
- Mid-arc (use intermediate /custom:checkpoint instead)
- The memo isn't actually locked yet

## Process

### Step 1: Lock the memo
- Update §0 Frontmatter status from "DRAFT vN" to "LOCKED <date>"
- Verify all sections have content (no leftover placeholders)
- Verify §4 Decisions are explicitly LOCKED (D1-Dn) with reasons
- Verify §8 Deferrals each have a revisit trigger

### Step 2: Write the next-session kickoff phrase
A short paragraph (3-5 sentences) that a fresh session can read cold and continue. Format:

```
Continue <topic> work. Read <memo path> for the LOCKED design.
Branch <name>; worktree <path if applicable>.
Next concrete action: <what to do first in the next session>.
Predecessor session: [[<this-session-slug>]].
```

This kickoff phrase becomes the recommended opener for the next session.

### Step 3: Persist to file-based memory
Write a session_close memory file at:
`~/.claude/projects/<project>/memory/session_close_<YYYY-MM-DD>_<short-slug>.md`

YAML frontmatter:
```yaml
---
name: session-close-<YYYY-MM-DD>-<slug>
description: "<one-line summary, <250 chars>"
metadata:
  node_type: memory
  type: project
  originSessionId: <if known>
---
```

Body sections (in order):
- Status (LOCKED / ABANDONED)
- Memo path
- Branch + worktree (if applicable)
- Decisions LOCKED (D1-Dn one-line each)
- Deferrals (one-line each with revisit trigger)
- Open questions (one-line each)
- Next-session kickoff phrase (full)
- Cross-references: predecessor + successor (if known)

### Step 4: Add MEMORY.md index pointer
Append a one-line entry to `~/.claude/projects/<project>/memory/MEMORY.md` under the "Active RESUME pointers" section:

```markdown
- <topic> <verdict> — [session_close_<YYYY-MM-DD>_<slug>.md](session_close_<YYYY-MM-DD>_<slug>.md) — <≤80 char summary>
```

Keep under 140 chars total per the file's stated convention.

### Step 5: Cognee save (per CLAUDE.md dual-write policy)
Call `mcp__cognee__save_interaction` with a compact summary of:
- The locked design
- What's transferable to other projects (the pattern, not the specifics)
- What got reframed and why (the load-bearing operator moves)

NOT what to save: per-project state, file paths, branch names — those live in file memory.

If Cognee is unavailable (per cognee-usage rule), note "Cognee save deferred — <reason>" in the memory file. Don't block.

### Step 6: Suggest next phase
- Implementation work → recommend /custom:plan
- Need ADR → /custom:architect
- Mechanical work → /custom:execute
- More design work in same area → next /custom:design session referencing this memo

## ABANDON variant
If Second Interview returned ABANDON, this skill writes a brief "why abandoned" memo at `.planning/<topic>_ABANDONED_<YYYY-MM-DD>.md`:

```markdown
# <topic> — ABANDONED <date>
## Necessity verdict: ABANDON
## Reason
<which NECESSITY questions surfaced concerns; operator's confirmation>
## What was learned
<even abandoned arcs produce learning — capture it>
## Revisit conditions
<what would change to make this worth building later>
```

Then run Steps 3-5 (file memory + index pointer + Cognee save) for the ABANDONED memo.

## What NOT to do
- DON'T persist to only one of {file memory, Cognee} — the dual-write policy is mandatory
- DON'T leave placeholder text in the kickoff phrase
- DON'T omit cross-references to predecessor sessions
- DON'T skip ABANDONED memos — abandonment is information

## Sources
- CLAUDE.md "Memory write policy — ALWAYS DO BOTH" (file + Cognee)
- cognee-usage rule for failure modes
