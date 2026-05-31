---
name: checkpoint
description: "Save named state snapshots. Use before compaction, risky changes, or at natural breakpoints."
triggers:
  - "save state"
  - "checkpoint"
  - "before compact"
  - "snapshot"
---

# Checkpoint Skill

## When to Use
- Before compaction (mandatory)
- Before risky changes
- At natural breakpoints in long sessions
- Before switching to a different task

## Process
1. Name the checkpoint descriptively (e.g., "auth-refactor-tests-passing")
2. Record current state:
   - TodoWrite items and their status
   - Files modified since last checkpoint
   - Test status (passing/failing, which tests)
   - Current branch and commit
3. Save findings to KNOWN_ISSUES.md if applicable
4. Use Cognee `save_interaction` for cross-session persistence
5. Commit any uncommitted work

## Format
```markdown
# Checkpoint: [Name]
## Time: [timestamp]
## Branch: [branch name] @ [commit hash]
## Todos: [current state summary]
## Files Changed: [list]
## Test Status: [passing/failing + details]
## Notes: [anything important for resumption]
## Next Steps: [what to do when resuming]
```
