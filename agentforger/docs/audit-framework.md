# AgentForger — Audit Framework

## Purpose

The audit framework defines what "audit-ready" means for every artifact type, how to run audits, and how to interpret results.

## Artifact types and audit criteria

### Skill (`skills/<name>/SKILL.md`)

| Check | Tool | Failure level |
|-------|------|--------------|
| YAML frontmatter present | validate-skill | FAIL |
| `name`, `description`, `version`, `tags` in frontmatter | validate-skill | FAIL |
| `tags` is a non-empty list | validate-skill | FAIL |
| `##` section headers present | validate-skill | FAIL |
| Workflow/Flujo section present | validate-skill | FAIL |
| Purpose/Propósito section | validate-audit | WARN |
| Limits/Límites section | validate-audit | WARN |
| Quality criteria section | validate-audit | WARN |
| Examples section | validate-audit | WARN |

### Agent workspace (`agents/<name>/`)

| Check | Tool | Failure level |
|-------|------|--------------|
| `SOUL.md` present and non-trivial (>20 chars) | validate-agent + validate-audit | FAIL |
| `AGENTS.md` present and non-trivial | validate-agent + validate-audit | FAIL |
| `USER.md` present and non-trivial | validate-agent + validate-audit | FAIL |
| SOUL.md contains a Limits section | validate-audit | WARN |
| AGENTS.md contains operational rules | validate-audit | WARN |
| `MEMORY.md` present | validate-audit | WARN |

## Running an audit

```bash
# Single artifact audit
node agentforger/validators/validate-audit.mjs skills/<name>
node agentforger/validators/validate-audit.mjs agents/<name>

# Full repo (includes audit for every artifact)
node agentforger/validators/validate-repo.mjs .
```

## Audit report format

After every `audit` mode session or post-build audit, produce a report:

```
## Audit Report — <artifact-name> — <date>

Mode: create | update | refactor | audit
Validator exit code: 0 (pass) | 1 (fail)

### FAILs (blocking)
- [ ] <description>

### WARNs (recommended)
- [ ] <description>

### Scorecard
| Dimension        | Score (0–3) | Notes |
|-----------------|-------------|-------|
| Completeness     |             |       |
| Clarity          |             |       |
| Limits defined   |             |       |
| Workflow present |             |       |
| Examples present |             |       |
| Audit trail      |             |       |

Total: X / 18
Audit-ready: YES / NO (requires score ≥ 12 and zero FAILs)
```

## Scoring rubric (0–3 per dimension)

| Score | Meaning |
|-------|---------|
| 0 | Missing entirely |
| 1 | Present but incomplete or too vague |
| 2 | Present, reasonably complete |
| 3 | Complete, clear, and actionable |

## Audit-ready definition

An artifact is **audit-ready** when:
1. All validators exit 0 (zero FAILs)
2. Scorecard total ≥ 12 / 18
3. MEMORY.md exists for agents (or a NOTES.md for skills with non-trivial session context)

## Mandatory audit triggers

- After every `create` session (build phase always ends with audit)
- Before AND after every `refactor`
- After every `update` that changes the workflow or limits
- On demand (`audit` mode)
