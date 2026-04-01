# AgentForger — Orchestration Patterns

## Overview

AgentForger supports four orchestration patterns for generating coordinated agent teams. Each pattern defines a communication topology, role structure, and set of constraints. The pattern is selected during the Architecture phase (phase 4) of the AgentForger workflow.

## Pattern Selection Guide

```
Need multiple agents?
  │
  ├─ No → use single agent (skill only / light agent / full workspace)
  │
  └─ Yes → how many agents?
       │
       ├─ 2–7 agents, clear task decomposition
       │    └─ Supervisor
       │
       ├─ 7+ agents, separated domains
       │    └─ Hierarchical
       │
       ├─ Single agent, exploratory/iterative task
       │    └─ ReAct (not a team — single agent with iterative workflow)
       │
       └─ Clear plan/execute split, cost optimization needed
            └─ Plan-and-Execute
```

## The Four Patterns

### 1. Supervisor (Hub-and-Spoke)

```
         ┌────────────┐
         │ SUPERVISOR  │
         └──────┬──────┘
      ┌─────────┼─────────┐
   ┌──┴──┐   ┌──┴──┐   ┌──┴──┐
   │ W-A │   │ W-B │   │ W-C │
   └─────┘   └─────┘   └─────┘
```

- **Structure**: 1 supervisor + N workers
- **Flow**: supervisor receives → decomposes → delegates → synthesizes
- **Use when**: tasks with clear decomposition, centralized audit trail needed
- **Constraint**: exactly 1 lead; all workers report to the lead
- **Limitation**: supervisor becomes bottleneck with many concurrent workers

### 2. Hierarchical (Multi-level)

```
              ┌──────────────┐
              │ ORCHESTRATOR │
              └──────┬───────┘
         ┌───────────┼───────────┐
   ┌─────┴─────┐ ┌──┴────┐ ┌────┴────┐
   │ Team Lead │ │ T.L.  │ │  T.L.   │
   └─────┬─────┘ └──┬────┘ └────┬────┘
      ┌──┴──┐     ┌──┴──┐     ┌──┴──┐
      │W│ │W│     │W│ │W│     │W│ │W│
      └─┘ └─┘     └─┘ └─┘     └─┘ └─┘
```

- **Structure**: orchestrator → team leads → workers
- **Max depth**: 3 levels (strict)
- **Use when**: large teams (7+), clearly separated domains
- **Constraint**: 2+ leads; communication only between adjacent levels
- **Limitation**: latency from multi-level delegation; cross-team deps need orchestrator

### 3. ReAct (Reasoning + Acting)

```
  ┌──────────┐   ┌────────┐   ┌─────────────┐
  │ Thought  │──▶│ Action │──▶│ Observation  │
  └────▲─────┘   └────────┘   └──────┬───────┘
       └──────────────────────────────┘
```

- **Structure**: single agent with iterative loop
- **Flow**: Thought → Action → Observation → repeat
- **Use when**: exploratory tasks, debugging, research
- **Not a team**: generates a single agent with ReAct workflow
- **Limitation**: context accumulates rapidly; quality degrades in long sessions

### 4. Plan-and-Execute

```
  ┌─────────────────┐
  │     PLANNER      │  (large model)
  │  → [Step1..StepN]│
  └────────┬─────────┘
           │ immutable plan
  ┌────────▼─────────┐
  │    EXECUTORS      │  (small models)
  │  Step1 → Result1  │
  │  Step2 → Result2  │
  └──────────────────┘
```

- **Structure**: 1 planner (expensive model) + N executors (cheap models)
- **Flow**: planner generates complete plan → executors implement each step
- **Use when**: cost optimization, prompt-injection protection needed
- **Constraint**: exactly 1 lead (planner); plan is immutable once approved
- **Security benefit**: tool data cannot modify the plan

## Dual Output

Each pattern generates artifacts for two targets from a single team spec:

| Target | Output | Format |
|--------|--------|--------|
| OpenClaw | `agents/<name>/SOUL.md, AGENTS.md, USER.md, MEMORY.md` | Multi-file agent workspace — works with any LLM |
| Claude Code | `.claude/agents/<name>.md` | Single file with YAML frontmatter — native Claude Code subagent |

## Presets

| Preset | Pattern | Agents | Use case |
|--------|---------|--------|----------|
| `minimal-supervisor` | supervisor | 3 | Small project, 1 developer |
| `dev-team-supervisor` | supervisor | 7 | Fullstack development, mid-size project |
| `dev-team-hierarchical` | hierarchical | 11 | Large project, multiple domains |
| `research-plan-execute` | plan-and-execute | 4 | Research + implementation |

## Validation

```bash
# Validate a team spec
node agentforger/validators/validate-team.mjs <spec.json>

# Generate a team (dual output)
node agentforger/team-generator.mjs <spec.json> both [output-dir]
```

See individual pattern files in `agentforger/patterns/` for detailed constraints and coordination rules.
