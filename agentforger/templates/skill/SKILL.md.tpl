---
name: {{SKILL_NAME}}
description: {{SKILL_DESCRIPTION}}
version: {{SKILL_VERSION}}
author: {{SKILL_AUTHOR}}
tags: {{SKILL_TAGS}}
---

# {{SKILL_TITLE}}

## Purpose
{{PURPOSE}}

## Limits (Won't Do)
{{NON_GOALS}}

## Inputs / Outputs
- Inputs: {{INPUTS}}
- Outputs: {{OUTPUTS}}

## Workflow
1) {{STEP_1}}
2) {{STEP_2}}
3) {{STEP_3}}

## Architecture selection policy
- Prefer the smallest viable architecture.
- Create a **skill only** artifact when the capability is reusable and does not require autonomous identity.
- Create a **light agent** (`agentDir` + shared workspace) when identity is needed but strong isolation is not.
- Create a **full agent workspace** only when there is clear operational autonomy: persistent outputs, separate memory/state, dedicated tooling/templates/tests, or a strong portability/isolation requirement.
- Dedicated workspace is never the default; it must be justified.
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

## Quality criteria
{{QUALITY_BAR}}
- Architecture choice is explicit and justified
- Reusable artifacts are portable across machines and free of local-machine secrets/references

## Examples
{{EXAMPLES}}
