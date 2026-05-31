---
name: context-engineering
description: "Design context windows deliberately. Understand attention patterns and information ordering."
triggers:
  - "context window"
  - "attention"
  - "prompt structure"
  - "context engineering"
---

# Context Engineering Skill

## Key Concepts

### Attention Patterns
- **Primacy bias**: Information at the START of context gets disproportionate attention
- **Recency bias**: Information at the END of context also gets high attention
- **Middle neglect**: Information buried in the middle gets LESS attention

**Practical**: Put critical instructions at the beginning. Put the specific task at the end. Background context goes in the middle.

### Context Architecture for Agent Systems
- **System prompt**: Role, constraints, output format (always attended to)
- **User prompt**: Specific task, relevant context for THIS request
- **Tool results**: Structured data — keep focused, don't dump raw output

### Information Ordering
1. Most important context FIRST (primacy)
2. Least critical background in MIDDLE (where attention is lowest)
3. Specific task/question LAST (recency)

## Anti-Patterns
- **Context stuffing**: Loading everything hoping the model finds what it needs → dilutes attention on what matters
- **Stale context**: Old information contradicting newer information → confuses the model
- **Context fragmentation**: Related info scattered across turns → model struggles to synthesize

## Practical Guidelines
- **Always load**: CLAUDE.md, KNOWN_ISSUES.md, current plan (small, high-value)
- **On-demand**: Source files during implementation (load when needed, not before)
- **Never pre-load**: Full test outputs, raw data, complete git logs

## Model-Specific
- **Opus**: Handles longer contexts more reliably; better at finding needles in haystacks
- **Sonnet**: Benefits more from focused, shorter context; more sensitive to ordering
