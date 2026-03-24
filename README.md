# AgentForger

AgentForger is an OpenClaw meta-agent package for creating, updating, refactoring, and auditing OpenClaw agents and skills.

## Included
- `agentforger/` — tooling, templates, validators, docs
- `agents/agentforger/` — standalone AgentForger agent workspace
- `skills/agentforger/` — reusable AgentForger skill

## What it does
- create new agents and skills
- update existing agents and skills
- refactor existing artifacts
- audit prompt quality, structure, workflow, and readiness
- enforce reuse-first planning and approval-before-write workflows

## Repository structure
```text
agentforger/
  docs/
  policies/
  templates/
  validators/
agents/
  agentforger/
skills/
  agentforger/
```

## Installation

### Option 1 — copy into an OpenClaw workspace
Copy these folders into the root of your OpenClaw workspace:
- `agentforger/`
- `agents/agentforger/`
- `skills/agentforger/`

Expected result:
```text
<your-workspace>/
  agentforger/
  agents/agentforger/
  skills/agentforger/
```

### Option 2 — add only the reusable skill
If you only want the reusable skill, copy:
- `skills/agentforger/`

### Option 3 — add only the agent workspace
If you only want the dedicated agent, copy:
- `agents/agentforger/`

## Recommended OpenClaw config
Add `agentforger` to the skills list of the agent that should use it.

Example:
```json5
agents: {
  list: [
    {
      id: 'main',
      skills: ['agentforger']
    }
  ]
}
```

## Validation
From the workspace root:

```bash
node agentforger/validators/validate-skill.mjs skills/agentforger
node agentforger/validators/validate-agent.mjs agents/agentforger
node agentforger/validators/validate-audit.mjs skills/agentforger
node agentforger/validators/validate-audit.mjs agents/agentforger
```

## Usage model
AgentForger works in four modes:
- create
- update
- refactor
- audit

Workflow:
1. intake
2. clarification
3. research
4. architecture
5. plan
6. approval gate
7. build
8. audit

## Notes
This public repository intentionally excludes legacy Skillforge materials.
