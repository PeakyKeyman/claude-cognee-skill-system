# Code Style Reference

## Python Conventions
- Type hints on ALL function signatures — no `Any` without justification
- PEP 8, enforced by ruff
- Explicit imports only — no wildcards
- Delete unused code — never comment it out
- Context managers for resource management
- List comprehensions over manual loops where readable

## Naming
- Functions: `snake_case`, verb-first (`get_user`, `validate_schema`)
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Descriptive always — no `data`, `result`, `temp`

## Error Handling
- Catch specific exceptions (no bare `except:`)
- Always have a fallback when parsing LLM output
- No sensitive data in error messages

## Anti-Patterns
- Three similar lines > one unclear helper (no premature abstraction)
- No string interpolation in SQL/BigQuery queries
- No hardcoded secrets, paths, or connection strings
