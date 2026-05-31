---
name: eval-design
description: "Design evaluation suites with golden datasets, metrics, and automated harnesses."
triggers:
  - "eval suite"
  - "golden dataset"
  - "measure quality"
  - "evaluation design"
---

# Eval Design Skill

## Eval Types
- **Capability**: Does it do the thing? (functional correctness)
- **Regression**: Did we break anything? (before/after comparison)
- **Adversarial**: Can it be tricked? (edge cases, injection, malformed input)
- **Data integrity**: Is data preserved through the pipeline? (row counts, schemas, nulls)

## Golden Dataset Design
- **Representative examples**: Common cases (60% of dataset)
- **Edge cases**: Unusual inputs (20%)
- **Known failure cases**: Things that broke before (10%)
- **Adversarial cases**: Tricky inputs designed to cause failure (10%)
- **Minimum**: 20 cases for statistical significance

## Metrics
- **Accuracy**: Correct outputs / total outputs
- **Latency**: Time to produce result (p50, p95, p99)
- **Cost**: Token usage per evaluation
- **Consistency**: Same input → same output? (pass^3 metric)

## Process
1. Define what you're measuring
2. Build golden dataset
3. Create automated harness (no manual evaluation for repeatability)
4. Set pass thresholds BEFORE running
5. Run on every change (CI integration)

## Anti-Patterns
- Evaluating on training examples (overfitting)
- Single metric without variance analysis
- Manual evaluation for things that can be automated
- Shipping without eval results
