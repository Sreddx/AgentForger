# AgentForger — Architecture

## Overview

AgentForger is a meta-agent that manages the lifecycle of OpenClaw skills and agent workspaces. It is itself a skill (`skills/agentforger/SKILL.md`) and has its own agent workspace (`agents/agentforger/`).

## Component map

```
agentforger/                  ← tooling root (validators, templates, docs, policies)
  validators/                 ← Node.js ESM scripts; zero external dependencies
    validate-team.mjs         ← team spec validation (pattern constraints, graph checks)
  templates/
    skill/                    ← {{VAR}} templates for skills
    agent/                    ← {{VAR}} templates for individual agents
    team/                     ← {{VAR}} templates for orchestrated teams (dual-output)
      team-spec.md.tpl        ← team spec artifact template
      claude-agent.md.tpl     ← Claude Code subagent output (.claude/agents/*.md)
      openclaw-soul.md.tpl    ← OpenClaw SOUL.md output (agents/*/SOUL.md)
      openclaw-agents.md.tpl  ← OpenClaw AGENTS.md output (agents/*/AGENTS.md)
  patterns/                   ← orchestration pattern definitions
    supervisor.md             ← Hub-and-Spoke (1 lead + N workers)
    hierarchical.md           ← Multi-level (orchestrator → team leads → workers)
    react.md                  ← Iterative single-agent (Thought→Action→Observation)
    plan-and-execute.md       ← Planner (large model) + Executors (small models)
  presets/                    ← pre-configured team spec JSON files
  docs/                       ← spec, architecture, audit-framework, patterns, migration, evaluation
  policies/                   ← best practices guide
  template-engine.mjs         ← CLI for single-template rendering
  team-generator.mjs          ← CLI for team generation (reads spec, renders dual output)
  package.json                ← npm test = validate-self

skills/agentforger/           ← the SKILL.md that activates AgentForger as a skill
  SKILL.md

agents/agentforger/           ← AgentForger's own agent workspace
  SOUL.md
  AGENTS.md
  USER.md
  MEMORY.md
```

## Validator dependency graph

```
validate-self.mjs
  └─ validate-skill.mjs
       └─ common.mjs

validate-repo.mjs
  ├─ validate-skill.mjs → common.mjs
  ├─ validate-agent.mjs → common.mjs
  ├─ validate-audit.mjs → common.mjs
  └─ validate-team.mjs  → common.mjs

validate-team.mjs (standalone)
  └─ common.mjs

validate-audit.mjs (standalone)
  └─ common.mjs
```

All validators are standalone Node.js scripts. No build step. No external dependencies.

## Team generation flow

```
team-spec.json (or preset)
  │
  ├─ team-generator.mjs reads spec
  │    ├─ renders team-spec.md.tpl → teams/<name>.md
  │    │
  │    ├─ target=openclaw or both:
  │    │    for each agent:
  │    │      ├─ renders openclaw-soul.md.tpl   → agents/<name>/SOUL.md
  │    │      ├─ renders openclaw-agents.md.tpl → agents/<name>/AGENTS.md
  │    │      ├─ renders USER.md.tpl            → agents/<name>/USER.md
  │    │      └─ renders MEMORY.md.tpl          → agents/<name>/MEMORY.md
  │    │
  │    └─ target=claude or both:
  │         for each agent:
  │           └─ renders claude-agent.md.tpl → .claude/agents/<name>.md
  │
  └─ validate-team.mjs validates the spec (pattern constraints, graph, tiers)
```

## Mode dispatch

```
User request
  │
  ├─ mode=create   → full 8-phase pipeline
  ├─ mode=update   → phases 1,2,3(light),5,6,7,8  (skip architecture if artifact is small)
  ├─ mode=refactor → phases 1,2,4,5,6,7,8         (audit before AND after)
  └─ mode=audit    → phases 1,2,8 only             (read-only; no file writes)
```

## Reuse-first decision tree

```
Need a new artifact?
  │
  ├─ Check skills/ and agents/ locally
  │    └─ match found? → use it; done
  │
  ├─ Check official/community patterns
  │    └─ match found? → adopt pattern, document source in Research Pack
  │
  ├─ Can existing artifact be adapted?
  │    └─ yes → update mode; minimal diff
  │
  └─ Generate new → document reason in Understanding Summary
```

## Architecture selection (extended)

```
Need a new artifact?
  │
  ├─ Single capability, reusable → Skill only
  ├─ Needs identity, shared workspace → Light agent
  ├─ Needs autonomy, isolation, state → Full agent workspace
  └─ Needs multiple coordinated agents → Orchestrated team
       │
       ├─ 2–7 agents, clear decomposition → Supervisor
       ├─ 7+ agents, domain separation → Hierarchical
       ├─ Single iterative agent → ReAct
       └─ Plan/execute split, cost optimization → Plan-and-Execute
```

## File layout conventions

| Path | Purpose |
|------|---------|
| `skills/<name>/SKILL.md` | Single required file for a skill. Frontmatter + sections. |
| `skills/<name>/NOTES.md` | Optional: research pack, decisions, session notes |
| `agents/<name>/SOUL.md` | Voice, identity, hard limits |
| `agents/<name>/AGENTS.md` | Role, operational rules, permitted operations, outputs |
| `agents/<name>/USER.md` | Human context (name, level, goal, constraints) |
| `agents/<name>/MEMORY.md` | Persistent facts, preferences, design decisions, audit log |
| `teams/<name>.md` | Team spec artifact (generated by team-generator) |
| `.claude/agents/<name>.md` | Claude Code native subagent (generated by team-generator) |
| `agentforger/presets/<name>.json` | Pre-configured team spec for common patterns |
| `agentforger/patterns/<name>.md` | Orchestration pattern definition |

## Security considerations

- No external network calls from validators (pure file system)
- Templates are rendered locally; no remote template fetching
- Push to remote requires explicit user confirmation with repo+branch+message
- Validators never write files; they are read-only analysis tools
- `validate-audit.mjs` is the only validator that emits WARNs (non-fatal)
