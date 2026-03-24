# AgentForger — Architecture

## Overview

AgentForger is a meta-agent that manages the lifecycle of OpenClaw skills and agent workspaces. It is itself a skill (`skills/agentforger/SKILL.md`) and has its own agent workspace (`agents/agentforger/`).

## Component map

```
agentforger/                  ← tooling root (validators, templates, docs, policies)
  validators/                 ← Node.js ESM scripts; zero external dependencies
  templates/                  ← {{VAR}} fill-in templates for agents and skills
  docs/                       ← spec, architecture, audit-framework, migration, evaluation
  policies/                   ← best practices guide
  template-engine.mjs         ← optional CLI tool for template rendering
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
  └─ validate-audit.mjs → common.mjs

validate-audit.mjs (standalone)
  └─ common.mjs
```

All validators are standalone Node.js scripts. No build step. No external dependencies.

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

## File layout conventions

| Path | Purpose |
|------|---------|
| `skills/<name>/SKILL.md` | Single required file for a skill. Frontmatter + sections. |
| `skills/<name>/NOTES.md` | Optional: research pack, decisions, session notes |
| `agents/<name>/SOUL.md` | Voice, identity, hard limits |
| `agents/<name>/AGENTS.md` | Role, operational rules, permitted operations, outputs |
| `agents/<name>/USER.md` | Human context (name, level, goal, constraints) |
| `agents/<name>/MEMORY.md` | Persistent facts, preferences, design decisions, audit log |

## Security considerations

- No external network calls from validators (pure file system)
- Templates are rendered locally; no remote template fetching
- Push to remote requires explicit user confirmation with repo+branch+message
- Validators never write files; they are read-only analysis tools
- `validate-audit.mjs` is the only validator that emits WARNs (non-fatal)
