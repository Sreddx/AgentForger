# AgentForger

Scaffolding, validation, and lifecycle tooling for OpenClaw **skills** and **agent workspaces**.

Migrated and upgraded from AgentForger. See `docs/migration.md` for full history.

## Capabilities

- **Create** — generate new skills and/or agents from scratch
- **Update** — evolve existing skills/agents without breaking compatibility
- **Refactor** — restructure artifacts while preserving behavior
- **Audit** — validate correctness, completeness, and safety of any artifact

## Layout expectations (target repo)

```
agents/<agent-name>/
  SOUL.md
  AGENTS.md
  USER.md
  MEMORY.md
skills/<skill-name>/SKILL.md
```

## Smoke checks

From the workspace root:

```bash
# Validate a single skill
node agentforger/validators/validate-skill.mjs skills/<skill-name>

# Validate a single agent workspace
node agentforger/validators/validate-agent.mjs agents/<agent-name>

# Audit readiness check
node agentforger/validators/validate-audit.mjs skills/<skill-name>
node agentforger/validators/validate-audit.mjs agents/<agent-name>

# Full repo sweep (dedicated repos only)
node agentforger/validators/validate-repo.mjs /path/to/repo

# Self-check (validates skills/agentforger)
npm --prefix agentforger test
```

## Workflow

intake → clarification → research → architecture → plan → approval gate → build → audit

See `docs/spec.md` for full workflow details.
