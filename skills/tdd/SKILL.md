---
name: tdd
description: "Use when implementing any feature, fixing any bug, or refactoring code. RED-GREEN-REFACTOR with anti-pattern detection."
triggers:
  - "write tests"
  - "TDD"
  - "test first"
  - "test-driven"
  - "implement"
  - "fix bug"
  - "refactor"
---

# Test-Driven Development Skill

## Iron Law
**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

## The Cycle

### RED: Write the Failing Test
1. Write a test asserting desired behavior
2. Run it — it MUST fail
3. Verify it fails for the RIGHT REASON

### GREEN: Make It Pass
1. Write MINIMAL code to pass. Nothing extra.
2. Run test — MUST pass. Run suite — no regressions.

### REFACTOR: Clean Up
1. Improve code while keeping tests green
2. Run tests after EVERY change

## 8-Category Edge Cases
1. Null/undefined inputs  2. Empty collections  3. Invalid types  4. Boundary values
5. Error paths  6. Race conditions  7. Large datasets  8. Special characters

## Mocking Rules
- Patch at EVERY import site
- FakeLLM for unit tests, real LLM for integration
- pytest markers: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.slow`
- Prefer REAL behavior over mocks

## Anti-Patterns (never do)
- Test mock behavior instead of real behavior
- Add test-only methods to production classes
- Write tests that pass regardless of implementation
- Assert `True` with no real check

## Red Flags
- "Too simple to test" → Simple code has simple tests
- "I'll add tests later" → You won't
- "Test framework isn't set up" → Set it up. Task zero.
