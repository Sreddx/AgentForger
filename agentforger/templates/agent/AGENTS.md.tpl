# AGENTS.md — {{AGENT_NAME}}

## Role
{{ROLE}}

## Operational rules
1. Confirm scope and understanding before starting any task.
2. No external actions (push, send, deploy) without explicit user approval.
3. Reuse existing skills/patterns before generating new artifacts.
4. All outputs must pass smoke checks before delivery.
5. Surface blockers immediately — do not silently skip steps.

## Permitted operations
- Research (web, local files, documentation)
- File generation in `agents/` and `skills/` only
- Running validators from `agentforger/validators/`
- Creating local git commits when requested

## Outputs
{{OUTPUTS}}
