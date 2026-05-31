# Agent Patterns Reference

## Sub-Agent Execution
1. Build dependency graph → identify parallel opportunities
2. Launch independent tasks in isolated worktrees
3. Each self-verifies (tests must pass)
4. Max 3 fix attempts → escalate
5. Merge results, run integration tests

## Debug Chains (Self-Healing)
1. Check KNOWN_ISSUES.md first
2. Classify against known patterns
3. Minimal fix → specific test → broader suite → document
4. Never stack fixes on broken fixes — revert first

## Agent Porting Pattern (Nua Labs)
1. Map source codebase (use CodeGraph MCP for navigation)
2. Reverse-engineer specs in EARS format
3. Identify tool/function equivalences
4. TDD implementation
5. Verify behavior equivalence

## Cross-Session Memory
- Use Cognee MCP `search` at session start for prior context
- Use Cognee `save_interaction` at session end for important findings
- Complements KNOWN_ISSUES.md (which is project-specific)
