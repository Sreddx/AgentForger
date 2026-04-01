# Orchestration Pattern: Supervisor (Hub-and-Spoke)

## Structure

```
         ┌────────────┐
         │ SUPERVISOR  │
         │ receives,   │
         │ delegates,  │
         │ synthesizes │
         └──────┬──────┘
      ┌─────────┼─────────┐
┌─────┴─────┐ ┌┴────┐ ┌───┴─────┐
│  Worker A │ │ W-B │ │ Worker C│
└───────────┘ └─────┘ └─────────┘
```

## Definition

One central agent (Supervisor) coordinates multiple specialized agents (Workers). The supervisor receives tasks, decomposes them, delegates subtasks to the appropriate worker, collects results, and synthesizes a final output. Workers never communicate with each other — all coordination flows through the supervisor.

## When to use

- Tasks with clear decomposition ("research", "implement", "test", "review")
- When a centralized audit trail is needed
- Sequential or conditionally branching workflows
- Teams of 3–7 agents (supervisor + 2–6 workers)

## When NOT to use

- Many concurrent workers that would bottleneck the supervisor
- Tasks requiring peer-to-peer negotiation between agents
- Very large teams (7+ workers) — use Hierarchical instead

## Constraints

- Exactly 1 agent with `tier: lead` (the supervisor)
- All other agents have `reports_to: <supervisor-name>`
- Workers must not spawn sub-agents
- Supervisor does not implement — only coordinates

## Roles

| Role | Tier | Count | Responsibility |
|------|------|-------|----------------|
| Supervisor | lead | 1 | Receive, decompose, delegate, synthesize |
| Worker | specialist / support | 2+ | Execute assigned subtask, report result |

## Coordination rules

1. Supervisor receives the task and produces a decomposition plan
2. Supervisor delegates each subtask to the appropriate worker
3. Workers execute independently and return results to supervisor
4. Supervisor synthesizes results into final output
5. If a worker encounters ambiguity, it escalates to supervisor — never to another worker
6. Parallelization is allowed when workers operate on independent file domains

## Limitations

- Single point of failure: if the supervisor stalls, the entire team stalls
- Bottleneck under high concurrency: supervisor must process all results sequentially
- No emergent coordination between workers
