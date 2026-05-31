---
name: design-research-fanout
description: "Research fan-out phase of /custom:design. Decomposes the design question into N sub-questions, dispatches /deep-research per sub-question in parallel. No agent-count cap; depth over breadth. Output: cited research returns as Appendix A."
triggers:
  - "design research fanout"
  - "decompose research"
  - "/custom:design-research-fanout"
---

# Design — Research Fan-out

## When to use
- Sub-skill of /custom:design after Inventory + Follow-ups
- Open questions in the revised problem statement need external evidence (literature, production precedents, adjacent disciplines)

## When NOT to use
- Single research lookup → /custom:research or /deep-research directly
- Problem fully resolvable by reading the codebase → stay in Inventory

## Process

### Step 1: Decompose into sub-questions
Take the open questions from the post-inventory problem statement. Break each into 2-5 narrower sub-questions, each focused on ONE discipline / source-class / production precedent.

Operator's preferred shape (codified): "decompose the research into smaller research areas to properly do deeper research." Depth over breadth — fewer broad questions, more narrow ones.

### Step 2: Approve the decomposition with operator
Present the full sub-question list. Get operator confirmation BEFORE dispatching. This is a checkpoint.

### Step 3: Dispatch /deep-research × N in parallel
For each sub-question, dispatch /deep-research as a separate Agent call. The /deep-research skill already does:
- Fan-out web searches
- Source fetching
- Adversarial claim verification
- Cited synthesis

So this skill's job is just decomposition + dispatch coordination + collection.

```
For sub-question S_i:
  Agent(subagent_type="general-purpose",
        model="opus",
        prompt="Use /deep-research with args: { question: S_i, depth: 'deep', ... }")
```

NO CAP on dispatch count. Operator explicitly: "let's not constrain the number of agents."

### Step 4: Collect returns into Appendix A
As /deep-research returns land, format them into a single Appendix A block:

```markdown
# Appendix A: Research Returns
## Sub-question 1: <question>
### Sources consulted
- <source>: <key finding>

### Synthesis
<paragraph>

### Confidence: <high|medium|low>

## Sub-question 2: <question>
...
```

### Step 5: Hand off to Second Interview
The Second Interview opens with Claude summarizing Appendix A. So this skill's output IS the input to the Second Interview's SURFACE wave.

## Why /deep-research per sub-question (not a single mega-research)
- Each sub-question gets its own adversarial verification (already in /deep-research)
- Failures isolate — one sub-question failing doesn't poison the whole fan-out
- Reports are inspectable per discipline
- Parallel wall-clock < sequential

## What NOT to do
- DON'T cap the number of agents based on cost — operator has approved unbounded fanout for design arcs
- DON'T merge sub-questions for "efficiency" — depth is the point
- DON'T proceed to Second Interview without operator confirmation that the decomposition is right
- DON'T skip the decomposition checkpoint with operator

## Sources
- /deep-research skill (already in the user's skill registry)
- Anthropic multi-agent research-system: parallel research outperforms single-agent by 90.2% on internal eval
