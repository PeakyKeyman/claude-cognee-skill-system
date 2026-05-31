---
name: codebase-mapping
description: "Use when exploring a new codebase, onboarding to a project, porting an agent, or understanding system structure."
triggers:
  - "map the codebase"
  - "understand this project"
  - "architecture"
  - "how does this work"
  - "project structure"
  - "port this agent"
---

# Codebase Mapping Skill

## Process
1. **Top-level scan**: directory structure, config files, README, CLAUDE.md
2. **CodeGraph index**: If `.codegraph/` exists, use symbol_search and get_callees to understand module structure. If not, run `npx @colbymchenry/codegraph init` first.
3. **Entry points**: Use CodeGraph to find main entry points and trace execution paths via get_callers/get_callees
4. **Module map**: each directory's responsibility and dependencies (CodeGraph makes this fast)
5. **Data flow**: trace ONE primary action end-to-end using CodeGraph call chain tracing
6. **Integration points**: external services, databases, APIs, MCP tools
7. **Prior context**: Search Cognee for any prior mapping or architecture decisions about this codebase

## Spec Mining (for undocumented code)
When porting agents, reverse-engineer specs in EARS format:
- **Ubiquitous**: "The system shall [behavior]"
- **Event-driven**: "When [trigger], the system shall [response]"
- **State-driven**: "While [condition], the system shall [behavior]"
- **Unwanted**: "If [condition], the system shall [prevention]"
- **Optional**: "Where [feature enabled], the system shall [behavior]"

## Output
```markdown
# Codebase Map: [Name]
## Stack | Structure | Entry Points | Key Modules | Data Flow | Patterns | Integration Points
```
