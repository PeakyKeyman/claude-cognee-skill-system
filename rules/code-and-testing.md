# Code Style, Testing, Data Engineering

**Trigger:** Writing or reviewing Python code, tests, or data transformations.

## Code style

- Type hints on ALL function signatures — no `Any` without justification
- PEP 8, explicit imports, no wildcards. Enforced by ruff.
- Delete unused code — never comment it out
- Always have a fallback when parsing LLM output
- LLM-driven approaches over keyword matching for semantic decisions
- Full details: `~/.claude/references/code-style.md`

## Testing

- TDD mandatory (skill: `tdd`)
- Patch at EVERY import site when mocking
- pytest markers: unit / integration / slow
- FakeLLM for unit tests, real LLM for integration only
- Full details: `~/.claude/references/testing-patterns.md`

## Data engineering

- Validate inputs early (lazy eval succeeds until materialization)
- Profile before building typed views
- `None` not `""` for missing numeric values
- Assert data lineage at every transformation boundary
- Full details: `~/.claude/references/data-engineering.md`, skill: `data-pipeline-integrity`

## LLM-first architecture

- LLM: routing, classification, schema interpretation, tool selection
- Deterministic code: math, structural ops, validation, security
- Full details: `~/.claude/references/llm-architecture.md`

## UI development

- Default to chat-based interfaces (`st.chat_message` + `st.chat_input`)
- No `st.form` unless explicitly requested
- Streaming responses when possible
