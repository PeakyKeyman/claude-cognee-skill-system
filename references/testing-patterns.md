# Testing Patterns Reference

## Test Hierarchy
- **Unit**: Fast, isolated, mocked externals. `@pytest.mark.unit`
- **Integration**: Real dependencies, slower. `@pytest.mark.integration`
- **E2E/Slow**: Full system. `@pytest.mark.slow`

## Mocking
- Patch at EVERY import site (`from X import Y` creates local binding)
- FakeLLM for unit tests, real LLM for integration only
- Prefer REAL behavior — only mock when unavoidable

## Eval Harness (AI systems)
- Define metrics: pass@1, pass@3, pass^3
- Golden datasets: representative + edge + known failures
- Automate evals, run on every change

## Anti-Patterns
- Testing mock behavior instead of real behavior
- Tests that pass regardless of implementation
- Asserting `True` with no real check
- Adding test-only methods to production classes
