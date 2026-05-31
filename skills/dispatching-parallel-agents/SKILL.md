---
name: dispatching-parallel-agents
description: "Run multiple sub-agents concurrently with merge strategy."
triggers:
  - "parallel"
  - "concurrent"
  - "dispatch agents"
  - "sub-agents"
---

# Dispatching Parallel Agents Skill

## Rules
- **Max 3 concurrent agents**
- Each in isolated worktree
- Define merge strategy BEFORE dispatch
- Full integration test after merge

## Process
1. Identify independent tasks from dependency graph
2. Assign each to a sub-agent with FULL context (don't assume shared state)
3. Define merge order and conflict resolution strategy
4. Launch agents
5. After all complete, run full integration test
6. Resolve conflicts sequentially (not in parallel)

## Merge Strategies
- **No-conflict**: Independent files, just merge
- **Ordered**: Apply in dependency order, test after each
- **Rebase**: One branch rebases on other, resolve conflicts

## Failure Handling
If any agent fails: stop all, evaluate, fix failed agent, re-run
