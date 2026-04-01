# Orchestration Pattern: Plan-and-Execute

## Structure

```
┌───────────────────────────────┐
│           PLANNER             │
│   (large model — e.g. Opus)   │
│   Input: complex task         │
│   Output: [Step1...StepN]     │
└──────────────┬────────────────┘
               │ immutable plan
               ▼
┌───────────────────────────────┐
│          EXECUTORS            │
│  (small models — e.g. Sonnet) │
│  Step1 ──► Result1            │
│  Step2 ──► Result2            │
│  Step3 ──► Result3            │
└───────────────────────────────┘
```

## Definition

Complete separation of planning from execution. A Planner (large, capable model) generates a full plan with all steps. Then Executors (smaller, cheaper models) execute each step without needing to reason about the overall plan. The plan is immutable once created — executor outputs cannot modify it.

## When to use

- Complex tasks with well-defined steps once analyzed
- When cost optimization matters (expensive model plans, cheap models execute)
- When prompt-injection protection is needed (tool data cannot alter the plan)
- Tasks where planning and execution are naturally distinct phases

## When NOT to use

- Highly exploratory tasks where the plan cannot be known upfront — use ReAct
- Tasks requiring real-time plan adaptation — the immutable plan is a strength and a constraint
- Very simple tasks where a single agent suffices

## Constraints

- Exactly 1 planner agent with `tier: lead`
- 1+ executor agents with `tier: specialist`
- Plan is generated before any execution begins
- Executors receive only their assigned step — not the full plan
- Plan modifications require re-planning through the planner, never by executors

## Roles

| Role | Tier | Model hint | Count | Responsibility |
|------|------|------------|-------|----------------|
| Planner | lead | opus | 1 | Analyze task, produce complete step-by-step plan |
| Executor | specialist | sonnet / haiku | 1+ | Execute assigned step, return result |

## Coordination rules

1. Planner receives the full task and produces a numbered plan with clear steps
2. Each step includes: description, expected input, expected output, success criteria
3. Steps are dispatched to executors sequentially or in parallel (if independent)
4. Executors execute their step and return results — they do not modify the plan
5. If an executor fails, the planner is consulted for re-planning (not the executor itself)
6. Final results are aggregated by the planner or a dedicated aggregator

## Security benefit

Once the plan is created, tool data and executor outputs flow in a separate channel from the plan itself. This architectural separation protects against prompt injection: even if a tool returns malicious content, that content cannot inject new steps into the plan.

## Limitations

- Plan rigidity: if requirements change mid-execution, the entire plan must be regenerated
- Upfront cost: the planning phase requires the expensive model for the full task analysis
- Sequential bottleneck: if steps have dependencies, parallelization is limited
- Plan quality ceiling: the final output is only as good as the initial plan
