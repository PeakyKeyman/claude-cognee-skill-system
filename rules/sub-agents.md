# Sub-Agent Execution

**Trigger:** Dispatching work to sub-agents via the Agent tool.

1. Build a dependency graph → identify parallel opportunities
2. Launch independent tasks as sub-agents (max 3 concurrent)
3. Each self-verifies (tests must pass)
4. Max 3 fix attempts → escalate
5. Full patterns: `~/.claude/references/agent-patterns.md`

## Reviewer-commits dispatch model (NEW 2026-05-13 — supersedes pre-existing PATTERN A discipline)

**The model:** for executor-flow dispatches, commit responsibility lives with the per-task REVIEWER, not the executor.

- Executor: writes code + tests, runs Step 4 verification, runs Step 5 review-dispatch, runs Step 6 `git add` (stage only). Executor's closing artifact: `git diff --cached --name-only` (the staged files list).
- Reviewer (Opus per `~/.claude/agents/code-reviewer.md` Escalate rules): reviews the staged diff via `git diff --cached`, applies any inline Critical fixes, and runs `git commit` atomically with the APPROVE verdict. Reviewer's closing artifact: `git log --oneline -2`.

**Why this changed:** PATTERN A — executors writing correct code, running `/custom:review`, emitting APPROVE verdicts, and stopping short of `git commit` — proved structural with strong model correlation. Cumulative as of 2026-05-13: 11 of 14 dispatches across three independent worktrees fired PATTERN A. Model split: **6/6 Sonnet impl-task** → PATTERN A; **2/2 Opus impl-task** → committed cleanly. The Step 1 prose-level intervention (BLOCKING report-acceptance contract in the executor brief, committed 2026-05-13 morning) was empirically tested against 3 Sonnet workers and failed to close the gap (3/3 still PATTERN A). The reviewer-commits model is the architectural fix: it exploits the model-correlation we have evidence for (Opus reviewers commit cleanly) rather than fighting the executor's structural default.

### Post-step verification (mandatory — under reviewer-commits model)

After **every** `Agent(...)` dispatch returns, the parent runs `git log --oneline -3` BEFORE marking the task complete. Two failure modes to distinguish:

- **Executor-side PATTERN A (legacy, pre-reviewer-commits):** the dispatched executor stopped short of `git commit`. Under the reviewer-commits model, this should NO LONGER occur in executor flows — the executor doesn't run `git commit`. If it does occur, the dispatch was likely using the legacy executor-commits brief; update the brief and re-dispatch.
- **Reviewer-side stop-short (new failure mode under reviewer-commits):** the dispatched reviewer did not run `git commit` on APPROVE. Empirically rare (Opus 2/2 clean historically), but the contract makes it explicit. Reviewer's report must satisfy Gate A (`git log --oneline -2` as last line) or Gate B (`DID NOT COMMIT — parent must inline-recover. Reason: <cause>.` as penultimate line + `git status --short` as final line). If reviewer's report is malformed, parent inline-recovers.

**Parent-side recovery (when the reviewer stops short):**
1. Verify the executor's staged files survived: `git diff --cached --name-only`.
2. Read the reviewer's verdict from the report.
3. Apply any reviewer-flagged `Critical` items inline; defer `Important` / `Suggestions` per usual policy.
4. Commit inline using the executor's suggested message (from executor's report) or the reviewer's compose if present.
5. Run `git log --oneline -2` to confirm `HEAD` advanced.

The executor-side contract is in `~/.claude/agents/executor.md` Step 6 + "Closing the loop" section. The reviewer-side contract is in `~/.claude/agents/code-reviewer.md` "Commit on APPROVE" + "Report-acceptance contract" sections. Both files were amended 2026-05-13 to reflect the new model.

## Missing review signal → auto post-hoc review (NEW 2026-05-13)

If a dispatched executor's final report lacks a `/custom:review` verdict — whether because PATTERN A wiped the report's prose ending, because the executor skipped review and got lucky, or because the review verdict was buried in an artifact body rather than the report — the parent **automatically spawns `/custom:review` post-hoc** against that dispatch's diff before marking the task complete.

**Rationale:** every commit is reviewed. The reviewer-commits model enforces this on the dispatch boundary, but pre-existing commits and partial-failure recoveries can land code without a review signal. Auto-filling closes the gap rather than debating session-by-session whether to back-fill.

**Mechanism:** spawn `Agent(subagent_type="general-purpose", model="sonnet", prompt="Read ~/.claude/agents/code-reviewer.md and apply two-stage review to commit <sha> against <task spec>. Post-hoc review only — do not commit anything, return verdict + severity-ranked findings.")`. Apply any Critical findings as inline parent-side fixes; defer Important/Suggestions per usual.

**Codified after:** Worker A's T10+T11 commits on 2026-05-13 landed clean (`109aafb4`, `ff256d15`) but the executor's report lacked any review verdict. Discovered during PATTERN A intervention design; auto-rule prevents recurrence.

## Parallel-write + serial-stage pattern (NEW 2026-05-22 — composes with reviewer-commits)

The reviewer-commits model from 2026-05-13 ("executor stages, reviewer commits") was designed for single-task dispatches. Under **N concurrent executors sharing one worktree**, that model breaks: each executor's `git add` mutates the same staging area, so reviewer-1's `git commit` can sweep up files staged by executors 2 and 3. The fix splits writing (parallel, file-level) from staging+commit (serial, shared-resource).

**The pattern:**

1. **Executor brief override** for every member of a parallel batch:
   > Write files + run tests. **DO NOT run `git add` or `git diff --cached`.** Parent stages and dispatches reviewer. Report ends with the literal list of file paths you wrote (one per line) and a suggested commit message.
2. **Executor returns** with a path list and tests-green confirmation. No staging.
3. **Parent stages task-N's paths individually** between reviewer dispatches:
   ```bash
   git -C <wt> add <task-N's paths>     # only task N's files staged now
   # dispatch reviewer N → reviewer runs `git commit` (captures only task N) → next
   ```
4. **Reviewer brief** is unchanged from the single-task reviewer-commits model except for one added line:
   > Verify `git diff --cached --name-only` shows EXACTLY the expected N paths and nothing else. If more, STOP and abort with REQUEST_CHANGES (parent staging error).
5. **Reviewers commit with bare `git commit`** (not `commit -- <paths>`) since only their task's paths are staged at the moment they run. Path-scoping at the commit level isn't needed — staging order does the scoping.

**When to use:** any time `max 3 concurrent` is in play AND the tasks share a worktree. Skip for single-task dispatches (overhead with no benefit).

**Risks worth naming:**

- **Shared-file additive writes** (e.g., two executors adding constants to `config.py`): the second writer's `Edit` tool reads disk state at edit time, so it sees the first writer's additions already on disk and merges additively. If they touch the same lines or use `Write` instead of `Edit`, the second write may overwrite. Mitigate via "use `Edit` (not `Write`) and check `git diff <file>` before editing" in each executor brief when a shared file is known to be in play.
- **Concurrent worktree commits from humans or other agents:** between reviewer dispatches, the user (or another session) may land their own commit directly on the worktree. Stage with explicit paths only; never `git add .` or `git add -A`. Verify `git diff --cached --name-only` shows the expected scope before dispatching the reviewer. Don't be alarmed by interleaved non-task commits in `git log` — they're benign as long as your staging is path-scoped.
- **Disk-vs-notification gap:** executor processes finish their on-disk writes well before their report message returns. Three concurrent executors typically converge on disk before all three report back. **Do NOT stage based on disk inspection alone** — wait for the explicit completion notification per task. Acting early can catch a half-written file.

**Rationale:** the parallel work-time savings are large (executors are 200-400s each in practice; firing three at once compresses ~12 min of writing into ~5 min of wall-clock), while the staging+commit phases are 5-15s each and serialize cheaply. The overall arc is bound by the longest executor + 3× the per-task reviewer time, not 3× executor + 3× reviewer.

**Codified after:** 2026-05-22 Track A Phase 1 parallel batch (RC-2 + DA-1 + PR-1.5, branch `tool-layer-buildout-discussion-2026-05-22`, worktree `/private/tmp/tool-layer-buildout-wt`). Three Sonnet executors fired concurrently; all returned green (67 + 18 + 5 tests). Three reviewers (Sonnet RC-2, Opus DA-1, Opus PR-1.5) serial-dispatched; all committed cleanly (`8cb6ea76`, `ff306a0c`, `175d7081`). No PATTERN A, no parent-recovery, no cross-task staging leak. Operator also landed a manual commit (`42a02b89` Track-B planning docs) between RC-1 and RC-2 reviewers without disturbing the scope — proving the worktree-sharing case.
