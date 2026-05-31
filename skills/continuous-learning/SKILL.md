---
name: continuous-learning
description: "Extract reusable patterns from sessions and build institutional knowledge."
triggers:
  - "learn"
  - "extract pattern"
  - "promote"
  - "what did we learn"
---

# Continuous Learning Skill

## Process
1. After resolving bugs or completing features, extract "instincts":
   - Pattern name
   - When it applies
   - What to do
   - What NOT to do
2. Store in session-local notes (TodoWrite or checkpoint)
3. Periodically promote to:
   - KNOWN_ISSUES.md (bug patterns)
   - Reference docs (architectural patterns)
   - Skills (reusable processes)
4. Use Cognee MCP `save_interaction` to persist important findings for cross-session retrieval

## Promotion Criteria
- Pattern seen 2+ times → candidate for KNOWN_ISSUES.md
- Pattern applicable across projects → candidate for reference doc
- Pattern with clear process → candidate for new skill

## Format
```markdown
### [Pattern Name]
**When**: [Conditions where this applies]
**Do**: [What to do]
**Don't**: [What to avoid]
**Example**: [Concrete case]
```
