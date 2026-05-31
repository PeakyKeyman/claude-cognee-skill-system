---
name: cognee-codegraph-bridge
description: "Hydrate Cognee Commit nodes into CodeGraph context. Use when answering 'what code resolved this KI', 'what files did this commit touch', or 'show me the code for the lessons cited in this answer'."
triggers:
  - "what code resolved"
  - "what files did this commit touch"
  - "hydrate commit to code"
  - "cognee + codegraph"
  - "lesson source code"
---

# Cognee × CodeGraph Bridge Skill

Cognee stores semantic knowledge (KIs, Lessons, Commits as Entity subclasses); CodeGraph stores structural knowledge (symbols, callers/callees, files). The bridge field is `Commit.codegraph_node_ids: List[str]` in `~/.claude/cognee-custom/nua_ontology.py` — captured at extraction time from text mentioning specific files or symbols.

## When to Use

Trigger this skill when the user asks something that requires BOTH semantic context (cross-session memory) AND structural code lookup:

- "What code resolved KI-027?"
- "What files did the commit that fixed the synth-no-fire bug touch?"
- "Show me the code for the prompt-code-parity rule I cited last week."
- "Trace the lesson 'orphan-only kill' from its file memory back to the actual hook code."

Do NOT use for purely semantic questions ("what's KI-027 about?" — just `mcp__cognee__search`) or purely structural ones ("what calls `_emit_event`?" — just `mcp__codegraph__codegraph_callers`).

## The 2-step pattern

### Step 1 — Semantic lookup via Cognee

Use `mcp__cognee__search` to find the relevant `:Commit` (or other Entity with `codegraph_node_ids`).

```
search_type=GRAPH_COMPLETION  → for natural-language Q&A backed by entity context
search_type=CYPHER            → when you want specific Commit nodes by KI/Lesson/Session reference
```

For Cypher (most efficient when you know the lookup pattern):
```cypher
MATCH (ki:KnownIssue {name: "KI-027"})-[:RESOLVED_BY]->(c:Commit)
RETURN c.name AS sha, c.description AS message, c.codegraph_node_ids AS node_ids
```

Returns a list of Commit nodes with `codegraph_node_ids` populated.

### Step 2 — Structural hydration via CodeGraph

For each `node_id` in `codegraph_node_ids`, call `mcp__codegraph__codegraph_node`:

```
mcp__codegraph__codegraph_node(node_id="<id from step 1>")
```

CodeGraph returns the node's source text, signature, docstring, and adjacent nodes (callers/callees if it's a symbol).

Compose the answer: Step 1 gives the WHY (the semantic context — the Lesson cited, the KI resolved, the Session it landed in), Step 2 gives the WHAT (the actual code that implements/resolves it).

## End-to-end example

User asks: *"What code resolved KI-027 (HITL ask_user stub)?"*

```javascript
// Step 1: Cognee semantic lookup
const cypherResult = await mcp__cognee__search({
  search_query: `MATCH (ki:KnownIssue {name: "KI-027"})-[:RESOLVED_BY]->(c:Commit)
                 RETURN c.name AS sha, c.description AS msg, c.codegraph_node_ids AS ids`,
  search_type: "CYPHER",
});
// → [{sha: "abc1234", msg: "fix: wire ask_user in tool_policy", ids: ["functions/.../tool_registry.py:184", "functions/.../tail.py:_handle_hitl"]}]

// Step 2: CodeGraph hydration for each id
const hydrated = await Promise.all(
  cypherResult[0].ids.map(id => mcp__codegraph__codegraph_node({ node_id: id }))
);

// Compose answer
return `Commit ${cypherResult[0].sha} resolved KI-027 by:
- Touching ${hydrated[0].path}: ${hydrated[0].signature} — ${hydrated[0].docstring_summary}
- Touching ${hydrated[1].path}: ${hydrated[1].signature} — ${hydrated[1].docstring_summary}`;
```

## When `codegraph_node_ids` is empty

The extractor may leave this field empty when the source text doesn't explicitly mention file paths or symbol names. In that case:

1. Fall back to `git show <sha> --stat` to get the touched-files list.
2. For each file, query CodeGraph via `mcp__codegraph__codegraph_files` to find symbols in it.
3. If you find a strong candidate symbol (matches the commit message intent), use that.

Always note in the answer that you fell back from the bridge (so the user knows the `codegraph_node_ids` field needs backfilling on that commit).

## Schema reference

The bridge field lives in [Commit](~/.claude/cognee-custom/nua_ontology.py) — search for `class Commit(Entity)`:

```python
class Commit(Entity):
    name: str = Field(...)                    # SHA
    description: str = Field(...)              # commit message subject
    branch: Optional[str] = Field(None, ...)
    landed_at: Optional[date] = Field(None, ...)
    codegraph_node_ids: List[str] = Field(
        default_factory=list,
        description="CodeGraph node IDs this commit touches (file paths, symbol IDs, etc.)",
    )
```

To make the bridge work well, when authoring commit messages OR session-close memos that reference commits, write file paths and symbol names verbatim (e.g., `functions/app/helpers/agent_engine/tools/tool_registry.py:184` or `_handle_hitl_pause`). The LLM extractor will capture these into `codegraph_node_ids` at cognify time.

## Related

- `~/.claude/cognee-custom/nua_ontology.py` — canonical schema
- `~/.claude/rules/cognee-usage.md` — when to cognify and search
- `[[feedback-cognee-entity-inheritance]]` — why all custom nodes need Entity base
