# Migration: AgentForger → AgentForger

## Summary

AgentForger is the renamed and upgraded successor to AgentForger. The migration was performed on 2026-03-23.

## What changed

| Aspect | AgentForger (before) | AgentForger (after) |
|--------|--------------------|--------------------|
| Tooling directory | `agentforger/` | `agentforger/` |
| Skill | `skills/agentforger/` | `skills/agentforger/` |
| Agent workspace | (none) | `agents/agentforger/` |
| Modes | implicit (create only) | explicit: create / update / refactor / audit |
| Workflow | 5 phases (understand → research → spec → generate → smoke check) | 8 phases (intake → clarification → research → architecture → plan → approval gate → build → audit) |
| Approval gate | not enforced | mandatory; file generation blocked until user approval |
| Reuse policy | mentioned in docs | formally enforced in 4-step priority chain |
| Validators | validate-skill, validate-agent, validate-repo, validate-self | + `validate-audit.mjs`; `warn()` helper added to common |
| Docs | spec.md only | spec + architecture + audit-framework + migration + evaluation |
| Evaluation | none | scenario docs + scorecard |
| Language | mixed Spanish/English | English primary (Spanish preserved where it existed) |

## Preserved (intentional stale references)

The following files are kept as legacy references. They are not deleted; they document the migration history:

- `agentforger/` — original tooling directory (frozen at migration date)
- `skills/agentforger/SKILL.md` — original skill definition; contains a migration header pointing to `skills/agentforger/`

## Path updates

Any references to `agentforger/validators/` in scripts or docs should be updated to `agentforger/validators/`. The validator API is backward-compatible; argument format is unchanged.

## What was fixed

- `template-engine.mjs`: replaced `require('node:path')` with ES module `import path from 'node:path'` (the original had a CommonJS/ESM mismatch)
- `validate-repo.mjs`: now calls `validate-audit.mjs` in addition to per-type validators; removed dynamic `import()` of `spawnSync` (was already a top-level import in original but repeated inline)
- `validate-skill.mjs`: split structural check into `hasStructure` and `hasWorkflow` for clearer failure messages
- `validate-agent.mjs`: added `warn()` for missing MEMORY.md instead of silently passing

## Rollback

To roll back, use `agentforger/` and `skills/agentforger/` — they are untouched. The old self-check still works:
```bash
npm --prefix agentforger test
```
