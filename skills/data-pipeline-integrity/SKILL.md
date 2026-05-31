---
name: data-pipeline-integrity
description: "Prevent silent data loss in AI agent pipelines. Lineage assertions, silent loss patterns, audit process."
triggers:
  - "pipeline"
  - "data loss"
  - "silent drop"
  - "data integrity"
  - "lineage"
---

# Data Pipeline Integrity Skill

## Silent Loss Patterns by Stage

### Ingestion
- **Encoding mismatches**: UTF-8 vs Latin-1 silently replacing characters with ?
- **Schema evolution**: New columns ignored, renamed columns dropped
- **Null coercion**: "" replacing None, 0 replacing null — changes semantic meaning
- **Datetime parsing**: Timezone-naive treated as UTC, losing local time info

### Transformation
- **Join type errors**: Inner join silently dropping unmatched rows (should be left join?)
- **Filter logic**: Off-by-one, inclusive vs exclusive boundaries
- **Aggregation hiding nulls**: COUNT vs COUNT(*), SUM ignoring nulls entirely
- **Type coercion**: float→int truncation, string→number dropping non-numeric rows

### Delivery
- **Serialization truncation**: JSON field length limits, VARCHAR overflow
- **Batching**: Remainder rows dropped in final batch
- **Encoding**: Emoji/unicode stripped in transit

## Lineage Assertions

At EVERY transformation boundary, assert:
```python
# Row count check
assert df_out.shape[0] >= expected_min_rows, \
    f"Row count drop: {df_out.shape[0]} < {expected_min_rows}"

# Column presence check
assert set(required_columns).issubset(df_out.columns), \
    f"Missing columns: {set(required_columns) - set(df_out.columns)}"

# Null ratio check
null_ratio = df_out[col].null_count() / len(df_out)
assert null_ratio <= max_null_ratio, \
    f"Null ratio exceeded for {col}: {null_ratio:.2%} > {max_null_ratio:.2%}"
```

## Platform-Specific Gotchas

### Polars
- LazyFrame operations succeed on nonexistent columns until `.collect()`
- `.unique()` keeps first occurrence; `.distinct()` is non-deterministic
- Null propagation in `group_by` — nulls form their own group
- Implicit type casting in joins can silently change values

### BigQuery
- STRUCT flattening loses nested data if you SELECT * from a STRUCT
- REPEATED fields require explicit UNNEST — JOINs on REPEATED produce cross-products
- TIMESTAMP defaults to UTC — timezone info silently stripped
- Partition pruning fails with functions on partition column in WHERE

## Audit Process
1. Map every stage of the pipeline (source → transformations → destination)
2. At each boundary: assert row counts, column presence, null ratios
3. Compare source-of-truth count with final output count
4. Sample 10 rows end-to-end: does the data look right?

## Pipeline Change Checklist
1. What transformations change?
2. Run before/after row counts
3. Sample 10 rows through full pipeline
4. Check null ratios before and after
5. Verify downstream consumers still receive expected schema
