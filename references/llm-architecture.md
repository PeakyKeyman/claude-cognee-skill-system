# LLM-First Architecture Reference

## Division of Labor
**LLM handles**: routing, classification, schema interpretation, tool selection, semantic decisions
**Deterministic code handles**: math, structural ops, validation, security, data transformation

## Context Engineering
- Put critical info at START and END of context (primacy/recency)
- System prompt: role + constraints + output format
- Include ONLY what's necessary — don't stuff context
- Use CodeGraph MCP for code navigation before dumping files into context

## Concurrency
- Max 3 concurrent sub-agents
- Each self-verifies before reporting
- Merge strategy defined BEFORE dispatch

## Prompt Patterns
- Version all prompts (v1, v2...)
- Include negative examples for failure modes
- Structured output (JSON) for downstream parsing
- Self-critique step for high-stakes outputs
