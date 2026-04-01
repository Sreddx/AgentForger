# Orchestration Pattern: Hierarchical (Multi-level)

## Structure

```
              ┌─────────────────┐
              │  ORCHESTRATOR   │
              └────────┬────────┘
         ┌─────────────┼─────────────┐
   ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
   │ Team Lead │ │ Team Lead │ │ Team Lead │
   │ Frontend  │ │  Backend  │ │    QA     │
   └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      ┌──┴──┐       ┌──┴──┐       ┌──┴──┐
      │W│ │W│       │W│ │W│       │W│ │W│
      └─┘ └─┘       └─┘ └─┘       └─┘ └─┘
```

## Definition

The Supervisor pattern extended to multiple levels. A top-level orchestrator coordinates team leads, each of which coordinates their own workers. Each level has a defined scope of authority and responsibility. Communication flows strictly through the hierarchy — never skipping levels.

## When to use

- Large teams (7+ agents total)
- Clearly separated domains (frontend, backend, QA, data)
- When team leads need autonomy within their domain
- Complex projects requiring both strategic coordination and tactical execution

## When NOT to use

- Small teams (under 7) — use Supervisor instead, less overhead
- Tasks where all agents share the same domain
- When latency from multi-level delegation is unacceptable

## Constraints

- Maximum 3 levels of depth (orchestrator → team lead → worker)
- Exactly 1 orchestrator at level 0
- 2–4 team leads at level 1
- 2+ workers per team lead at level 2
- Communication flows only between adjacent levels
- Team leads report to orchestrator; workers report to their team lead

## Roles

| Role | Tier | Level | Count | Responsibility |
|------|------|-------|-------|----------------|
| Orchestrator | lead | 0 | 1 | Strategic decomposition, cross-team coordination |
| Team Lead | lead | 1 | 2–4 | Domain decomposition, team coordination, results aggregation |
| Worker | specialist / support | 2 | 2+ per team | Execute assigned subtask within domain |

## Coordination rules

1. Orchestrator decomposes the project into domain-scoped work packages
2. Each work package is assigned to the appropriate team lead
3. Team leads further decompose into worker tasks within their domain
4. Workers execute and report to their team lead
5. Team leads aggregate results and report to orchestrator
6. Cross-domain dependencies are resolved by the orchestrator, not between team leads
7. Escalation path: worker → team lead → orchestrator → user

## Limitations

- Each additional level adds latency and coordination cost
- Cross-team dependencies require orchestrator intervention
- Over-hierarchy risk: if teams are too small, the structure adds overhead without benefit
- Never exceed 3 levels — if you need more, the problem decomposition is wrong
