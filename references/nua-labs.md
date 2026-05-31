# Nua Labs — Domain Context

## What Is Nua Labs
AI platform for consultants and data analysts. Automates data health assessment, cleaning, and insight generation. Uses "labs" as isolated collaboration environments.

## Platform Architecture
- **AI-Assist**: Core platform infrastructure (auth, lab management, agent orchestration)
- **Agent repos**: Individual AI agents built in isolation, then ported into the platform
  - Burry: Financial data analysis agent
  - Ecomm: E-commerce analytics agent
  - Steward: Data stewardship/quality agent

## Tech Stack
Python (primary), TypeScript (frontend), Polars (data), BigQuery (warehouse), Firebase (auth/real-time), Streamlit (UI prototyping), Claude API (Sonnet/Opus)

## Data Flow — 5 Critical Handoff Points
1. **User upload → ingestion**: File parsing, encoding detection, schema inference
2. **Ingestion → storage**: BigQuery load, partitioning, type mapping
3. **Storage → agent context**: Query results → prompt context (CRITICAL silent-loss risk)
4. **Agent processing → output**: LLM transforms data, extracts insights
5. **Output → user delivery**: Formatting, visualization, export

Each handoff is a silent-loss risk. Use data-pipeline-integrity skill at each boundary.

## Team Context
- Two developers using Claude Code as primary environment
- Need consistent assumptions across both devs (use common-ground agent)
- Agent porting is a regular workflow (isolated repo → platform integration)

## Common Patterns

### Adding a Client Data Source
Schema discovery → data contract design → ingestion pipeline with lineage assertions → agent context preparation

### Porting an Agent
Codebase mapping → spec mining (EARS) → implementation plan → TDD execution → verification

### Building a New Agent
EARS requirements → prompt engineering → eval design → agent harness → TDD implementation
