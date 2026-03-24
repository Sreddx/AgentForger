# AgentForger Validators

## Per-artifact (recommended for main workspace)

```bash
# Validate a skill
node agentforger/validators/validate-skill.mjs skills/<skill-name>

# Validate an agent workspace
node agentforger/validators/validate-agent.mjs agents/<agent-name>

# Audit readiness (skill or agent)
node agentforger/validators/validate-audit.mjs skills/<skill-name>
node agentforger/validators/validate-audit.mjs agents/<agent-name>
```

## Full repo sweep (dedicated repos only)

```bash
node agentforger/validators/validate-repo.mjs /path/to/repo
```

## Self-check

```bash
npm --prefix agentforger test
# or
node agentforger/validators/validate-self.mjs
```

## Validator descriptions

| File | Purpose |
|------|---------|
| `common.mjs` | Shared utilities: `exists`, `readText`, `listDirs`, `parseFrontmatter`, `fail`, `ok`, `warn` |
| `validate-skill.mjs` | Checks SKILL.md frontmatter + structural sections |
| `validate-agent.mjs` | Checks SOUL/USER/AGENTS presence |
| `validate-audit.mjs` | Deep audit: section completeness, limits, rules, MEMORY trail |
| `validate-repo.mjs` | Batch sweep over all skills/ and agents/ in a repo |
| `validate-self.mjs` | Validates `skills/agentforger` (self-check, used by `npm test`) |

## Exit codes
- `0` — all checks passed
- `1` — at least one FAIL
- `2` — bad usage / missing argument

WARN messages do not set exit code 1 but should be addressed before marking an artifact audit-ready.
