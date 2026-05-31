# Inventory Existing Infrastructure Before Proposing to Build (MANDATORY)

**Trigger:** About to propose a "new layer," "new module," "new abstraction," "design," "rebuild," "overhaul," or any framing that implies building rather than extending. Fires on phrases like *"we need a new..."*, *"let's design a..."*, *"the right pattern would be to build..."*, *"this should be its own..."*. Also fires when challenged with "haven't we already worked on X?" or "what's already there?"

## Rule

Before any proposal that creates new code surface area (new file, new layer, new abstraction, new pattern), you **must** complete an inventory pass against the existing codebase first, and present the inventory findings BEFORE the proposal.

The inventory minimum:
1. **`grep -rn` for domain terms in the relevant directory tree.** Use the noun the proposal centers on (e.g., "env_block", "table_fqn", "scope_context") and its synonyms.
2. **`git log --oneline -- <relevant-paths>` over the last 60 commits.** Recent commits are the strongest signal of in-flight work in the area.
3. **Read the docstring of every module whose name is adjacent to the proposal.** Module docstrings declare scope; reading them is faster than reading bodies and usually decides whether the module already covers the proposal.
4. **Use CodeGraph `codegraph_context` with the proposal's key noun as the task description** when more than 2-3 files are in play. It composes search + node + callers/callees in one call.
5. **Only after the inventory** do you state the proposal — framed as *"extend X at file:line"* if existing infrastructure covers most of it, OR *"build new because: <specific list of what existing code does NOT cover>"* if a real gap exists.

## Corollary — Evaluate whether existing infrastructure is still SOTA before extending it (added 2026-05-26 after second-mode failure same day)

The inventory step proves *existence*. It does NOT prove *currency*. Before treating an inventoried module as the canonical extension point, check whether the existing choice is still aligned with current SDK / library / product / standards state.

Specifically:
1. **Check the age + activity profile of the existing code.** A module last touched 4+ months ago that points at an external SDK / API is a *risk signal*, not a green light. The SDK may have refactored under it.
2. **Sanity-check the API surface the existing code uses against the currently-installed SDK.** A 3-line live test — `import X; assert hasattr(X, 'expected_attribute')` — catches deprecated-API failures in seconds.
3. **Survey current best practice for the same capability.** If the existing module is one of three reasonable architectural choices, the OTHER two need to be named in your inventory finding before you propose extending the existing one. *Not all infrastructure that exists is the right infrastructure to extend.*
4. **Surface deprecation findings BEFORE the implementation step**, not 30+ minutes into trying to make the deprecated path work. Sunk-cost reasoning kicks in fast inside an active fix attempt.

When the existing infrastructure IS still SOTA, extend it (the rule's primary guidance). When it's not, the inventory finding pivots: *"X exists but is built against deprecated API surface Y; current best practice is Z; the choice between (extend X by porting to Z) vs (replace X with Z directly) vs (different architectural choice entirely) needs to be made before implementation."* That pivot is part of the inventory output, not a separate step.

The failure mode this corollary prevents: silently extending a deprecated path because the inventory only asked *"does X exist?"* and not *"is X still the right thing?"* — both questions need an answer.

## Why mandatory

The failure mode this rule prevents is real and recent (2026-05-26 Nua session), in two distinct modes within the same session:

**Mode 1 — Build-without-inventory.** An architectural proposal for a "Layer A capabilities surface" was nearly authored as a *new build* when ~2.4K lines of env-block infrastructure (HOT tier, WARM tier, cache, 6 invalidation triggers, prompt-injection callback, BQ dialect ESSENTIALS) already existed and had been augmented as recently as the previous day. The actual gap was a single missing render-site for one field (FQN per table) — a ~10-line change. The proposal was caught by the operator pushing back with *"haven't we already worked on this?"*. If unchallenged, the build would have wasted significant effort, fragmented the env-block surface across two layers, and obscured the real one-line bug.

**Mode 2 — Extend-deprecated-without-questioning** (the corollary above codifies the fix). Later in the same session, debugging an `AttributeError` from `vertex_code_execution.py`, the diagnosis fell into the same trap inverted: the module existed (RC-1 through RC-4 commits, 4 months old) so the default was *"extend this"*. After ~30 min of fixing, the SDK's `_get_client` refactor was solved, but the underlying API model had shifted so much (sandboxes now child resources of deployed Reasoning Engines, `display_name` moved into a config object, `execute_code` moved off sandbox objects onto the Sandboxes client class) that the right move was an architectural reset — *"should we still be on this path, or use Gemini's built-in `code_execution` tool instead?"* — not a series of one-line patches. Time was lost inside the deprecated frame because the inventory step never asked *"is the existing infrastructure still SOTA?"*

The operator's exact framing across both modes was: *"bypassing investigation is an abject failure of all engineering principles."* It is. Build-without-inventory AND extend-deprecated-as-if-current are two faces of the same category error — both are forms of skipping the architectural question.

## Red flags during a session

- Proposing "Layer X / Pattern Y" without naming a single existing file that does or doesn't fit.
- Citing a design pattern by name (hydrate / orchestrator / router) without checking whether the local codebase already implements it.
- "We could build..." sentences before "we have..." sentences.
- Reaching for codegraph **only after** drafting the proposal, to confirm rather than to discover.
- The user has to ask "what's already there?" — the inventory should have been your opening, not their interruption.
- Recent git commits in the area that you haven't looked at.
- Module names containing your proposal's central noun that you haven't read.

## How to phrase the inventory result

After the inventory, write the finding as a small table or paragraph naming each piece of relevant existing infrastructure, what it covers, and the *specific* gap (if any) the proposal addresses. Example:

> Existing: `env_builder.py` (composer), `env_hot_builder.py` (HOT tier, cached), `env_warm_builder.py` (WARM Flash planning), `prompt.py` (persona).
> Covered: per-turn injection, lab manifest, join graph, column buckets, BQ dialect ESSENTIALS.
> Gap: FQN per table is never rendered in the HOT manifest — `env_hot_builder.py:174-180` renders bare display name only.
> Fix shape: extend manifest render site (~10 lines), not new layer.

If after the inventory the proposal still needs to build new, the table makes the case for it. If the inventory shows the gap is small, the table makes that case too. Either way, the work is grounded.

## Scope

This rule applies to any session that involves proposing code or architectural work — feature design, refactoring, debugging that suggests structural changes, plan authoring, architecture reviews. It does NOT apply to one-shot bug fixes, narrow read-only investigations, or pure conversational questions.

## Relationship to existing rules

This rule sharpens the "Search before building" line in CLAUDE.md ("repo code → library → Context7 → build custom") from a *preference* into a *gate*. It overlaps with `rules/agent-framing-and-competitive-scope.md` Check 9 ("steal aggressively from open source and adjacent codebases") but applies more broadly — to ALL building proposals, not only agent-system ones, and to the LOCAL codebase first before external sources.
