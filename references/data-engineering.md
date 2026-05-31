# Data Engineering Reference

## Polars Patterns
- Lazy evaluation by default — `.collect()` only when needed
- Schema validation before processing
- Null handling: `None` not `""` for missing values
- Profile data before building typed views
- Watch: LazyFrame on nonexistent columns succeeds until `.collect()`

## BigQuery Patterns
- Parameterized queries always
- Partition pruning: verify WHERE clauses actually prune
- STRUCT flattening: be explicit about nested field access
- Cost awareness: preview query bytes before running

## Pipeline Integrity
- Assert row counts at every transformation boundary
- Check null ratios before and after
- Sample rows through full pipeline
- Use data-pipeline-integrity skill for detailed patterns

## Schema Management
- Data contracts between producers and consumers
- Semantic versioning for schemas (MAJOR.MINOR.PATCH)
- Additive changes only in minor versions
