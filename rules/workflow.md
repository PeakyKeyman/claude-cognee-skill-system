# Workflow Preferences

**Trigger:** Starting complex work, resuming a session, debugging, preparing to compact, or committing.

## Complex tasks

1. Read relevant agents/skills first
2. Plan before implementing (`/custom:plan`)
3. Break large changes into testable increments
4. Get approval on architectural changes before executing
5. If unsure, ask — don't guess

## Session continuity

1. TodoWrite for explicit checkpoints
2. Document progress in todo items
3. When resuming: search Cognee for prior context (see `rules/cognee-usage.md`), read recent todos
4. `/custom:checkpoint` for named state saves
5. At session end: persist cross-session findings to **BOTH** file-based auto-memory (`~/.claude/projects/<project>/memory/`) AND Cognee `save_interaction`. Never only one. See `rules/cognee-usage.md` "Memory write policy" for the why.

## Self-healing debug chains

1. Check `KNOWN_ISSUES.md` at project root first
2. Classify against known patterns
3. Minimal fix → specific test → broader suite → document
4. Never stack fixes on broken fixes
5. Append to `KNOWN_ISSUES.md` after every resolved bug

## Strategic compaction

- Compact AFTER research→planning, AFTER debugging
- NEVER mid-implementation, NEVER mid-test-fixing
- Before compacting: save to `KNOWN_ISSUES.md`, update TodoWrite, Cognee save, commit

## Git

- Never commit to main/master — feature branches
- Lint before commits
- Small, focused, atomic commits

### Session-start branch check (MANDATORY)

**Trigger:** First substantive turn of a session that involves code changes to the repo.

If the session does NOT clearly continue prior work — no `RESUME HERE` memory entry naming the current branch, no in-progress TodoWrite at session start, no uncommitted changes that reference the new task, AND the user's first message describes a new initiative — **ASK before making code changes:**

> "Current branch is `<X>` — start a new feature branch for this work, or stay on `<X>`?"

This prevents accidentally entangling unrelated fixes with whatever WIP the user happened to be on. The branch checked out at session start is often whatever they were last working on, not necessarily where new work belongs.

**When to SKIP the question:**
- The user's first message explicitly references the current branch ("continue the X work", "finish the Y rewrite").
- A project memory entry says "RESUME HERE on branch `<X>`" matching the current branch.
- The user is on `main` (rule above already forces a new branch).
- The task is purely informational / no code changes (e.g., "explain how X works").

**Why mandatory:** users frequently forget to switch branches when starting new work, and silently inheriting WIP from an unrelated branch creates merge-conflict cleanup later. One question at session-start is cheaper than a cherry-pick + worktree wrap at session-end (codified after the 2026-05-18 KI batch session, which had to wrap with a worktree extraction because all the fix commits had accumulated on the `V2-prompt-rewrite-2026-05-18` WIP branch).

### git stash safety (MANDATORY)

**Trigger:** Any time about to run `git stash`, `git stash -u`, `git stash --include-untracked`, or `git stash pop`.

The failure mode this prevents: `git stash -u` captures **new untracked files you just created** along with pre-existing WIP. A subsequent failed/conflicted `git stash pop` (especially with concurrent git ops) can delete those untracked files from disk WITHOUT restoring them from the stash — they live in the stash blob but never land back on disk, and a bare `git checkout-index --all` during conflict resolution wipes them. Lost work, no warning.

**Rules:**

1. **Never run `git stash -u` / `--include-untracked` when you have uncommitted new files you care about.** Commit them first (even to a throwaway scratch branch) or copy their content out of the workspace. The `-u` flag is for clean-slate operations only.
2. **Never launch two git-stash/pop operations concurrently.** No background jobs, no chained `&&` pairs that issue multiple stash commands. One at a time, foreground, wait for each to print an explicit success message. A race between `git stash pop` and `git checkout-index` is the mechanism that wipes files.
3. **Before any stash operation, check `git stash list` + `git status`.** If a pre-existing stash exists that you didn't create, DO NOT touch it — pause and ask the user. Pre-existing stashes are load-bearing state that belongs to someone else's work.
4. **Prefer `git stash push <paths>` over `git stash`.** Explicit paths make it obvious what's being captured. Blast radius is bounded.
5. **After every `git stash pop`, verify:** `git stash list` (should show one fewer entry) AND `ls` the files you expected to restore. If the pop silently kept the stash entry (classic conflict-without-error signal), STOP and investigate — don't retry the pop.
6. **Never use `git stash` as a test-isolation tool** (e.g. "stash my changes, run tests on clean base, unstash"). Use `git worktree add` or a scratch commit instead. The cost of a failed stash pop is catastrophic; the cost of a worktree is ~200ms.

If you violated any of these rules and lost untracked files, the recovery path is: check `git fsck --lost-found`, check `git stash list` for orphans, check the Bash output-file cache under `/private/tmp/claude-*` for recent Write operations. File contents you created in-conversation are still in your message history and can be re-Written.

## Search before building

1. Existing repo code → 2. Library/package → 3. Context7 → 4. Build custom

## Escalation

When undeterminable: don't guess. Ask with specific options + recommendation.

## Codebase exploration

- CodeGraph MCP first for navigation
- Skill `codebase-mapping` for full mapping
- Skill `spec-miner` for porting agents
