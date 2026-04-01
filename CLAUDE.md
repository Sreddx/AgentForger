# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

AgentForger is a meta-agent toolkit for the OpenClaw ecosystem. It scaffolds, validates, and audits **skills** (`skills/<name>/SKILL.md`) and **agent workspaces** (`agents/<name>/`). It is not a conventional application — it produces and verifies structured Markdown artifacts.

## Commands

```bash
# Self-check (validates skills/agentforger)
npm --prefix agentforger test

# Validate a skill
node agentforger/validators/validate-skill.mjs skills/<name>

# Validate an agent workspace
node agentforger/validators/validate-agent.mjs agents/<name>

# Deep audit (checks sections, limits, rules, audit trail)
node agentforger/validators/validate-audit.mjs skills/<name>
node agentforger/validators/validate-audit.mjs agents/<name>

# Batch sweep of all skills/ and agents/ in a repo
node agentforger/validators/validate-repo.mjs /path/to/repo

# Render a template with variables from a JSON file
node agentforger/template-engine.mjs <template.tpl> <outPath> <vars.json>

# Validate a team spec
node agentforger/validators/validate-team.mjs <team-spec.json>

# Generate a team (dual output: openclaw + claude code agents)
node agentforger/team-generator.mjs <spec.json> <target> [output-dir]
# target: openclaw | claude | both

# Generate from a preset
node agentforger/team-generator.mjs agentforger/presets/dev-team-supervisor.json both ./output
```

No `npm install` required — zero external dependencies, Node.js 18+ only.

## Architecture

```
agentforger/
  validators/       # Pure read-only Node.js ESM validators (.mjs)
    common.mjs      # Shared utilities: exists, readText, listDirs, parseFrontmatter, fail/ok/warn
    validate-skill.mjs
    validate-agent.mjs
    validate-audit.mjs
    validate-team.mjs  # Team spec validation (pattern constraints, graph checks)
    validate-repo.mjs
    validate-self.mjs
  templates/
    skill/           # {{VAR}} fill-in templates for skills (.tpl)
    agent/           # {{VAR}} fill-in templates for individual agents (.tpl)
    team/            # {{VAR}} fill-in templates for orchestrated teams (dual-output)
  patterns/          # Orchestration pattern definitions (supervisor, hierarchical, react, plan-and-execute)
  presets/           # Pre-configured team spec JSON files
  policies/          # best-practices.md — 10 core principles
  docs/              # spec.md, architecture.md, patterns.md, audit-framework.md, migration.md, evaluation.md
  template-engine.mjs  # Single-template rendering CLI
  team-generator.mjs   # Team generation CLI (reads spec, renders dual output)
skills/agentforger/  # AgentForger's own skill definition (SKILL.md)
agents/agentforger/  # AgentForger's own agent workspace (SOUL.md, AGENTS.md, USER.md, MEMORY.md)
```

### Validators

All validators are **pure and read-only** — they never write files. Exit codes: `0` = pass, `1` = at least one FAIL, `2` = bad usage. Output prefixes: `FAIL:` (fatal, blocks delivery), `WARN:` (non-fatal, recorded in audit), `OK:` (passed).

### Artifact Formats

**Skill** (`skills/<name>/SKILL.md`): YAML frontmatter (`name`, `description`, `version`, `tags` required) followed by sections: Purpose, Limits, Inputs/Outputs, Workflow, Quality criteria, Examples.

**Agent workspace** (`agents/<name>/`): Required files — `SOUL.md` (voice, identity, limits), `AGENTS.md` (role, operational rules, permitted operations), `USER.md` (human context, preferences). Recommended — `MEMORY.md` (persistent facts, design decisions, audit log).

**Team spec** (JSON): Defines an orchestrated team with `team_name`, `pattern`, `agents[]` (each with name, role, tier, model_hint, domain, reports_to, tools_needed). Validated by `validate-team.mjs`. Generated into dual output (OpenClaw + Claude Code) by `team-generator.mjs`.

### Workflow and Modes

AgentForger operates in **4 modes** through an **8-phase workflow**:

- **create** — all 8 phases: Intake, Clarification, Research, Architecture, Plan, Approval Gate, Build, Audit
- **update** — phases 1,2,3(light),5,6,7,8
- **refactor** — phases 1,2,4,5,6,7,8 (audit before AND after)
- **audit** — phases 1,2,8 only (read-only)

## Critical Policies

**Approval gate (phase 6)**: Never write files without explicit user approval. This is non-negotiable and applies to all modes except audit.

**Reuse-first**: Before generating anything new, check: (1) existing local skill in `skills/`? (2) official/community pattern? (3) adapt existing artifact? Generate new only if none apply.

**Architecture selection**: Default to smallest viable architecture — skill-only > light agent > full agent workspace > orchestrated team. Full workspace requires at least one strong criterion. Orchestrated teams use one of 4 patterns: supervisor, hierarchical, react, plan-and-execute.

**Portability**: No hardcoded personal names, no absolute paths (use `<workspace-root>`), no credentials/secrets/tokens in artifacts.

## Audit-Ready Definition

An artifact is audit-ready when: (1) validators exit 0, (2) scorecard total >= 12/18 across 6 dimensions (completeness, clarity, limits, workflow, examples, audit trail), (3) MEMORY.md exists for agents.

## Code Conventions

- Validators use Node.js ESM (`.mjs`), no external dependencies
- Templates use `{{KEY}}` placeholder syntax (`.tpl` extension)
- YAML frontmatter is parsed by a bespoke parser in `common.mjs` (supports `key: value` and `key: [a, b, c]`)
- `fail()`, `warn()`, `ok()` from `common.mjs` for consistent validator output
