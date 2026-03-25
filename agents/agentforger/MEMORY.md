# MEMORY.md — AgentForger

## Persistent facts

- Workspace root: `<workspace-root>`
- Tooling directory: `agentforger/` (migrated from `agentforger/` on 2026-03-23)
- Validators location: `agentforger/validators/`
- Self-check: `npm --prefix agentforger test`
- Skills root: `skills/`
- Agents root: `agents/`
- Node.js ES modules (`"type": "module"`) — use `.mjs` for validators

## Preferences

- English primary for new files
- Minimal but complete — every section must earn its place
- Always reuse before creating
- Approval gate is mandatory; never skip

## Design decisions

- `validate-audit.mjs` introduced in v1.0.0 for deep section + limits checks
- `warn()` helper added to `common.mjs` (non-fatal, does not set exitCode 1)
- `validate-repo.mjs` now calls `validate-audit.mjs` as part of full sweeps
- Template engine `require()` bug fixed: replaced with `import path from 'node:path'`
- Evaluation scenarios documented in `agentforger/docs/evaluation.md`

## Audit log

<!-- Date | Mode | Artifact | Validator Exit | Score | Notes -->
| 2026-03-23 | create | agentforger (full migration) | 0 | — | Initial AgentForger setup |
