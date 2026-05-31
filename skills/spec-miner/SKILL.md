---
name: spec-miner
description: "Reverse-engineer specifications from undocumented code using EARS format."
triggers:
  - "undocumented code"
  - "port"
  - "reverse engineer"
  - "spec mine"
  - "what does this code do"
---

# Spec Miner Skill

## Process
1. **Read the code completely** — All files, all paths
2. **Identify behaviors** — Extract EARS-format requirements:
   - Ubiquitous: "The system shall [behavior]"
   - Event-driven: "When [trigger], the system shall [response]"
   - State-driven: "While [condition], the system shall [behavior]"
   - Unwanted: "If [condition], the system shall [prevention]"
   - Optional: "Where [feature enabled], the system shall [behavior]"
3. **Map side effects** — Database writes, API calls, file operations, messages sent
4. **Identify implicit assumptions** — Environment variables, file paths, network availability, data formats
5. **Document gaps** — Missing error handling, unhandled edge cases, incomplete features

## Output
```markdown
# Spec: [Module/Agent Name]
## EARS Requirements
[Numbered requirements in EARS format]
## Side Effects
[All external interactions]
## Assumptions
[Implicit requirements not in code]
## Gaps
[Missing error handling, edge cases, incomplete features]
```
