---
name: {{AGENT_NAME}}
description: {{AGENT_DESCRIPTION}}
model: {{MODEL}}
tools: [{{TOOLS}}]
disallowedTools: [{{DISALLOWED_TOOLS}}]
{{MCP_BLOCK}}
---

# {{AGENT_ROLE}}

{{AGENT_INSTRUCTIONS}}

## Reports to

{{REPORTS_TO}}

## Domain

{{DOMAIN_FILES}}

## Coordination protocol

- Escalation: report blockers or ambiguity to {{REPORTS_TO}}
- Task tracking: mark tasks completed as you finish them
- Parallelization: work independently within your domain; do not modify files outside it
{{EXTRA_COORDINATION}}
