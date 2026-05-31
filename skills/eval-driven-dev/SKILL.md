---
name: eval-driven-dev
description: "TDD for AI systems. Define success criteria BEFORE building."
triggers:
  - "eval"
  - "success criteria"
  - "benchmark"
  - "how do we measure"
---

# Eval-Driven Development Skill

## Iron Law
**DEFINE WHAT GOOD LOOKS LIKE BEFORE BUILDING.**

## Metrics
- **pass@1**: Correct on single attempt
- **pass@3**: Correct on at least 1 of 3 attempts
- **pass^3**: Correct on 3 consecutive attempts (consistency)

## Process
1. **Define "good"** — What does a correct output look like? Write 5-10 examples.
2. **Build eval harness** — Automated comparison of output to expected
3. **Run baseline** — How does the current system perform?
4. **Implement** — Make changes
5. **Measure improvement** — Compare to baseline
6. **Ship or iterate** — Only ship if metrics improve

## Golden Dataset Design
- Representative examples (common cases)
- Edge cases (unusual inputs)
- Known failure cases (things that broke before)
- Adversarial cases (tricky inputs)
- Minimum 20 cases for statistical significance

## Anti-Patterns
- Evaluating on training examples
- Single metric without variance analysis
- Shipping without eval results
- Optimizing for eval at expense of real-world performance
