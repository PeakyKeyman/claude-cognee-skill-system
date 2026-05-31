---
name: brainstorming
description: "Use when the approach isn't obvious, requirements are fuzzy, or multiple valid paths exist. Hard gate: do NOT write code until design is approved."
triggers:
  - "brainstorm"
  - "think through"
  - "what's the best approach"
  - "how should we"
  - "design options"
  - "let's think about"
  - "discuss"
---

# Brainstorming Skill

## Hard Gate

**Do NOT write code until design is approved.** Even "simple" projects need designs. Unexamined assumptions cause wasted work.

## Process

### 1. Frame the Problem (2 min)
State the problem in ONE sentence. If you can't, it's not well-defined enough — ask to clarify.

Identify:
- **Constraints**: What's fixed? (stack, timeline, team size, existing code)
- **Goals**: What does success look like?
- **Non-goals**: What are we explicitly NOT solving?

### 2. Explore Context (2 min)
Before generating options:
- Check existing files, docs, recent commits
- Is this partially solved somewhere?
- What patterns does the codebase already use?

### 3. Generate Options (5 min)

Produce 2-3 distinct approaches:

```markdown
### Option [N]: [Name]
**Approach**: [1-2 sentence description]
**Pros**: [What's good]
**Cons**: [What's risky or hard]
**Effort**: [Low | Medium | High]
**Best when**: [Conditions where this option wins]
```

Rules:
- At least one "simple/boring" approach
- At least one "ambitious/ideal" approach
- Each must be genuinely viable — no straw men
- If there's a clear winner, say so

### 4. Recommend (2 min)
Pick one and explain. Main risk + mitigation. What would change the recommendation?

### 5. Get Approval
Wait for user confirmation before transitioning to planning.

### 6. Transition
After approval, invoke the `planning` skill — NOT implementation directly.

## Depth Levels
- **Quick** (default): 2-3 options, 1 paragraph each. ~5 min.
- **Deep** (user asks): 3-4 options, detailed trade-off matrix. ~15 min.
- **Spike** (need feasibility proof): Pick riskiest option, minimal PoC. ~30 min.

## What NOT To Do
- Don't generate 5+ options — decision paralysis
- Don't hedge equally on every option — have an opinion
- Don't brainstorm when the answer is obvious — just recommend
- Don't implement during brainstorming
