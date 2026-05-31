---
name: prompt-engineering
description: "Craft strong AI agent prompts with advanced techniques. Understand the implications of every section."
triggers:
  - "prompt"
  - "system prompt"
  - "agent prompt"
  - "prompt engineering"
  - "craft prompt"
---

# Prompt Engineering Skill

## 6-Section Prompt Anatomy — with IMPLICATIONS

### 1. Role/Identity
Sets behavioral baseline for the model.
**IMPLICATION**: Vague roles ("You are a helpful assistant") produce generic output. Specific roles ("You are a senior data engineer specializing in Polars pipelines who catches silent data loss") activate domain-specific knowledge and vocabulary.

### 2. Context
Background information the model needs.
**IMPLICATION**: Missing context forces hallucination — the model fills gaps with plausible but wrong information. Too much context drowns signal in noise. Include ONLY what's necessary for the task.

### 3. Task
What the model should do.
**IMPLICATION**: Ambiguous tasks ("analyze this data") get average-quality interpretations. Precise tasks ("identify columns with >5% null rate, flag type mismatches, and report schema drift from the contract") get precise output.

### 4. Constraints
Boundaries and limitations.
**IMPLICATION**: Unconstrained output wanders — the model optimizes for what it thinks is helpful, which may not align with your needs. Over-constrained output becomes mechanical and loses nuance. Find the balance.

### 5. Output Format
Expected structure of the response.
**IMPLICATION**: Unspecified format = unpredictable parsing downstream. Rigid format (JSON schema) = reliable automation. Always specify format when output feeds into code.

### 6. Examples (Few-Shot)
Demonstrations of desired input→output.
**IMPLICATION**: Examples anchor quality MORE than instructions. One good example is worth 100 words of instruction. Bad examples poison output — the model mimics quality level, not just format.

## Advanced Techniques (mandatory knowledge)

### Chain-of-Thought (CoT)
Force reasoning steps before answers. Add "Think step by step" or explicitly structure reasoning sections.
**When**: Complex analysis, multi-step logic, math.
**Why**: Prevents premature conclusions. Model quality improves when it "shows its work."

### Self-Consistency
Generate multiple reasoning paths, take majority answer.
**When**: High-stakes decisions where one wrong reasoning chain is costly.

### Structured Decomposition
Break complex tasks into explicit subtasks with handoffs.
**When**: Tasks that are too complex for a single prompt.
**Example**: Instead of "analyze this codebase", use: Step 1: List all entry points. Step 2: Trace primary data flow. Step 3: Identify integration points.

### Constitutional / Self-Critique
Have the model evaluate its own output against explicit criteria.
**When**: Quality matters more than speed. High-stakes outputs.
**Example**: "After generating your response, evaluate it against these criteria: [list]. Revise if any criterion scores below 7/10."

### Negative Examples
Show what NOT to do — often more powerful than positive examples.
**When**: Common failure modes are known.
**Why**: Models are good at learning "don't do this" from negative examples. Especially effective for edge cases.

## 10-Item Audit Checklist

1. Is the role specific enough to activate domain expertise?
2. Does context include all necessary background without noise?
3. Is the task unambiguous — could it be interpreted differently?
4. Are constraints explicit (length, format, tone, exclusions)?
5. Is output format parseable by downstream code?
6. Do examples cover edge cases, not just happy paths?
7. Does the prompt handle failure gracefully (what should the model do when it can't)?
8. Is there a self-critique step for high-stakes outputs?
9. Are negative examples included for common failure modes?
10. Has the prompt been tested with adversarial inputs?

## Prompt Versioning
- Always version prompts (v1, v2...)
- Track what changed and why
- Measure impact with evals (eval-driven-dev skill)
- Never modify a production prompt without eval results
