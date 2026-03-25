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

## Architecture policy
- Prefer the smallest viable architecture.
- Use **skill only** when capability does not require autonomous agent identity.
- Use **light agent** (`agentDir` + shared workspace) when identity is needed but strong isolation is not.
- Use **full agent workspace** only when there is clear operational autonomy: persistent outputs, separate state/memory, dedicated tooling/templates/tests, or a strong portability/isolation need.
- Do not default to a dedicated workspace without clear justification.
- All reusable artifacts must remain portable across machines.

## Portability rules
- No hardcoded personal names unless explicitly provided as install-time user data
- No absolute local paths
- No credentials, secrets, tokens, or private machine references
- Use placeholders like `<workspace-root>` where needed
- Defer user-specific information to install/config steps

## Required declaration
Every create/update plan must explicitly declare one of:
- **Skill only**
- **Light agent**
- **Full agent workspace**

And justify the choice based on autonomy, isolation, and expected persistent artifacts.

## Outputs
{{OUTPUTS}}
