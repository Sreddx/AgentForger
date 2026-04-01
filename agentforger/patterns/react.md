# Orchestration Pattern: ReAct (Reasoning + Acting)

## Structure

```
┌──────────────────────────────────┐
│           ReAct Agent            │
│                                  │
│  ┌──────────┐   ┌────────────┐  │
│  │ Thought  │──▶│   Action   │  │
│  └────▲─────┘   └──────┬─────┘  │
│       │                │        │
│       │         ┌──────▼─────┐  │
│       └─────────│Observation │  │
│                 └────────────┘  │
│                                  │
│         repeat until done        │
└──────────────────────────────────┘
```

## Definition

A single agent alternates between reasoning (Thought) and acting (Action) in a continuous loop until the task is complete. After each action, the agent observes the result and incorporates it into the next reasoning step. This is not a multi-agent pattern — it generates a single agent with an iterative workflow.

## When to use

- Exploratory tasks where the full plan cannot be known upfront
- Debugging and root-cause analysis
- Research tasks requiring multi-hop information gathering
- Tasks that require adapting strategy based on intermediate results

## When NOT to use

- Tasks with a clear, predictable decomposition — use Supervisor or Plan-and-Execute
- When token cost must be minimized — ReAct accumulates context rapidly
- Long-running tasks that would exceed context limits

## Constraints

- Single agent (no team generated)
- Agent must have access to tools for the Action phase
- Context accumulation must be monitored — recommend summarization after every 10 iterations
- Agent must declare a stopping condition

## Roles

| Role | Tier | Count | Responsibility |
|------|------|-------|----------------|
| ReAct Agent | specialist | 1 | Iterative reasoning, action execution, observation synthesis |

## Workflow cycle

1. **Thought**: Agent reasons about current state and decides next action
2. **Action**: Agent executes a tool or operation
3. **Observation**: Agent receives and interprets the result
4. **Repeat**: Loop back to Thought with accumulated context
5. **Terminate**: When stopping condition is met, produce final output

## Coordination rules

1. The agent operates autonomously within its tool permissions
2. If ambiguity is encountered, escalate to user — do not guess
3. Summarize accumulated context periodically to prevent token bloat
4. Log each Thought-Action-Observation cycle for audit trail

## Limitations

- Context accumulation: each iteration adds tokens; long tasks risk losing early information
- Cost: more iterations = more tokens consumed
- No parallelization: inherently sequential
- Quality degrades as context grows — the agent may "forget" early observations
