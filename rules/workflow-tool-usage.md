# Workflow Tool Usage (MANDATORY)

**Trigger:** Considering whether to dispatch parallel agents via the Workflow tool vs the Agent tool vs direct work.

## Rule

Use the Workflow tool when ALL of these apply:

1. **The user has opted in.** Either: included the keyword "workflow" / "workflows" in their message (system reminder confirms), OR explicitly asked for multi-agent orchestration, OR is running an opted-in slash command that calls Workflow.
2. **The work is genuinely parallelizable.** Multiple independent sub-tasks that don't share state and don't have ordering dependencies (or only have phase-level ordering).
3. **Each sub-task is substantive.** Each sub-agent should do meaningful judgment work — not just a Write call you could do directly.
4. **The fan-out scale justifies overhead.** Workflows have ~200-500ms per-agent startup + token cost. For 1-3 trivial tasks, direct work or `Agent(...)` is faster.

## When NOT to use Workflow

- User didn't ask for it; the system reminder wasn't triggered. Use `Agent(...)` for individual judgments; direct tool calls for direct work.
- Tasks have inter-dependencies that need to be reasoned about between steps (use a pipeline of direct work instead).
- The "judgment" in each sub-task is just "write this exact content to disk." That's a parallel `Write × N`, not a workflow.
- Sequential discovery work where each step's output shapes the next step's scope.

## Direct work vs Agent vs Workflow — picking the right tool

| Task shape | Right tool |
|---|---|
| Single file edit, content fully specified | Edit / Write directly |
| Parallel writes of N independent files, content fully specified | Parallel `Write × N` in one message |
| Single subjective judgment task (research, review, audit) | `Agent(subagent_type=..., model=..., prompt=...)` |
| 4-15 independent subjective judgment tasks with shared context | Workflow with `parallel()` or `pipeline()` |
| Multi-phase orchestration with explicit handoffs and budget tracking | Workflow with `phase()` + `parallel()` + `pipeline()` |

## Workflow-specific anti-patterns

- **Workflows that just write files.** If each sub-agent is doing `Write` with content the parent already authored, the parent should just call `Write × N` in parallel. Workflows add value when each agent makes judgment calls within a spec.
- **Workflows with barriers everywhere.** `parallel()` is a barrier — it awaits all results. Use `pipeline()` when items can move through stages independently. Default to `pipeline()`.
- **Workflows that don't verify their own writes.** A sub-agent reporting "success" without verifying the Write completed can land in a state where the workflow reports completion but files are missing. Build a verification pass at the end of any workflow that does file creation.

## Codified 2026-05-31

After the design-skill buildout workflow ran with 18 parallel agents and 2 of 6 shim writes silently failed despite the workflow reporting success. The lesson: workflows are a good fit for parallel judgment, but the verification gap is real.

## Sources

- Tool description: see Workflow tool schema for full mechanics (script structure, phase/parallel/pipeline, resume semantics)
- Related: `~/.claude/rules/sub-agents.md` (per-subagent dispatch model: reviewer-commits, parallel-write pattern)
