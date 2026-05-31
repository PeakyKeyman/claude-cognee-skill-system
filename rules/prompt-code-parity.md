# Prompt/Code Token Parity (MANDATORY)

**Trigger:** Writing or editing any LLM prompt whose output is parsed back into a typed schema (Pydantic `Literal`, `StrEnum`, field names, tool `name=` args, few-shot tokens).

When an LLM prompt emits a literal string, enum value, or field name that code parses back into a typed schema, the **prompt token IS the contract** and the code must match it verbatim.

- When drafting prompts, grep first for any existing code literals the prompt will be parsed against. If the prompt and the code disagree, update the code — never silently add a translation layer, a rename map, or a "normalizer" function to bridge them. Translation layers become bug surfaces and drift from the prompt over time.
- When updating prompts, `grep` the codebase for the old literal first to find every consumer, then update prompt + schema + tests in a single commit.
- Applies to: Pydantic `Literal[...]` enums, `StrEnum` members, field names in structured output schemas, few-shot example tokens, `name=` arguments in tool calls, and any other string the LLM is asked to emit that gets parsed into a typed field.
- The failure mode this prevents: prompt says `"partial"`, code expects `"partially_confirmed"`, every run silently falls into the default branch, and the bug only surfaces when someone reads the eval transcripts.
