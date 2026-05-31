---
name: code-review
description: "Use when reviewing PRs, self-reviewing before commits, or auditing code quality. Two-stage: spec compliance then code quality with severity ranking."
triggers:
  - "review"
  - "code review"
  - "check this code"
  - "audit"
  - "PR review"
---

# Code Review Skill

## Stage 0: Understand the Change Surface
Before reviewing code, use CodeGraph to check the impact of changed files — get_callers to see who depends on modified functions, impact_analysis for broader ripple effects. Search Cognee for established patterns in this area.

## Two-Stage Process

### Stage 1: Spec Compliance (blocking)
- [ ] All requirements implemented (not stubbed)
- [ ] No extra features that weren't requested
- [ ] New code is wired into the system (not orphaned)
- [ ] Tests exist and test meaningful behavior

### Stage 2: Code Quality
**Security (CRITICAL)**: Secrets, input validation, parameterized queries, auth
**Correctness**: Edge cases, error handling, async timeouts, data integrity
**Python-specific**: Type hints (no `Any`), ruff/mypy, Pythonic patterns
**Maintainability**: Single responsibility, descriptive names, no dead code
**Performance (flag, don't block)**: N+1 queries, pagination, unbounded loops

## Severity: CRITICAL > HIGH > MEDIUM > LOW
Block only on CRITICAL/HIGH. Always note something positive.
