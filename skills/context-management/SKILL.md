---
name: context-management
description: "Use when working on long sessions, large codebases, or multi-step tasks. Includes model routing (Sonnet/Opus) and token optimization."
triggers:
  - "context"
  - "running out of context"
  - "long session"
  - "compact"
  - "tokens"
  - "model routing"
---

# Context Management Skill

## Model Routing (Sonnet/Opus only)

| Task Type | Model | Why |
|-----------|-------|-----|
| Mechanical changes, formatting | Sonnet | Efficient |
| Implementation, standard features | Sonnet | Good balance |
| Architecture, complex logic | Opus | Deep reasoning |
| Ambiguous requirements | Opus | Nuanced understanding |
| Code review, verification | Sonnet | Pattern-matching |
| Deep research, design | Opus | Comprehensive |

**Never use Haiku.**

## Context Budget
- System prompt + conversation: ~20%
- File reads for understanding: ~30%
- Implementation + tool outputs: ~40%
- Verification: ~10%

## Tiered Loading
1. **Always loaded**: CLAUDE.md, KNOWN_ISSUES.md, plan
2. **CodeGraph first**: Use symbol_search, get_callers, get_callees BEFORE reading files — answers most code questions without burning context
3. **Cognee for memory**: Search Cognee instead of re-reading prior session notes
4. **On-demand**: Source files during implementation (prefer targeted reads with offset+limit)
5. **Never pre-load**: Test outputs, large data, full git logs

## Token Savings
- **CodeGraph over file reads**: symbol_search returns targeted info, not 500-line files
- Cap tool outputs: `head -50`, `LIMIT 100`
- Summary stats over raw data
- Grep with specific patterns, not full file reads
- Specific test files, not full suites when iterating

## Strategic Compaction
**When**: After research→planning, after debugging sessions
**Never**: Mid-implementation, mid-test-fixing
**Before compacting**: Save to Cognee (`save_interaction`), update KNOWN_ISSUES.md, update TodoWrite, commit
