# AgentForger spec

## Modes

AgentForger operates in four distinct modes. Declare the mode at the start of each session.

| Mode | Trigger | Description |
|------|---------|-------------|
| `create` | "Create a skill/agent for X" | Full intake-to-audit cycle; generates new artifact from scratch |
| `update` | "Add Y to skill Z" | Evolves an existing artifact; preserves existing contract; runs audit diff |
| `refactor` | "Restructure agent W" | Restructures without changing observable behavior; audit before and after |
| `audit` | "Audit skill V" | Read-only evaluation; produces audit report + scorecard; no files written |

## Inputs

- `mode`: create | update | refactor | audit
- `type`: skill | agent | both
- `target`: name/path of the artifact (for update/refactor/audit)
- `domain`: what it does
- `surface`: CLI / files / web / messaging / API
- `constraints`: allowed tools, security requirements, performance limits, language
- `export_format`: local workspace (default) | git-ready

## Outputs

- Artifacts written to `skills/` and/or `agents/`
- Understanding Summary (produced during clarification phase)
- Research Pack (3–8 sources with bullets)
- Spec document (contract + workflow + file list)
- Smoke check results (exit 0 required before delivery)
- Audit report (for audit mode or after update/refactor)
- `manifests/<timestamp>-<name>.json` (optional)

## Reuse-first policy

Before generating any new artifact, check this chain in order:

1. **Existing local skill** — does `skills/` already contain something that covers the need?
2. **Official / safe pattern** — is there a widely-adopted open-source pattern or established convention?
3. **Adapt existing** — can an existing artifact be extended with minimal changes?
4. **Generate new** — only if none of the above applies; document the reason in the Understanding Summary.

## Workflow (8 phases)

### Phase 1 — Intake
Receive the request. Identify mode, type, domain, surface, constraints.

### Phase 2 — Clarification
Conduct a mini-interview (3–5 targeted questions max). Produce an **Understanding Summary**:
- What will be created/changed
- Objective and use cases
- Explicit limits / won't-do
- Tools required and why
- External side-effects and risk level

Get acknowledgement before proceeding. If ambiguous, ask again.

### Phase 3 — Research
Web research (3–8 sources). Produce **Research Pack**:
- Source links with key takeaways (bullets)
- Recommended patterns and anti-patterns
- Technical alternatives (libraries, CLIs, APIs)
- OpenClaw-specific design notes (reuse, security, tool minimization)

### Phase 4 — Architecture
Propose a design:
- Component diagram or file tree
- Data/control flow
- Key decisions and trade-offs
- Reuse-first justification

### Phase 5 — Plan
Produce a concrete **Spec**:
- Input/output contract
- Step-by-step workflow
- Complete file list with one-line purpose per file
- Smoke checks that must pass

### Phase 6 — Approval gate
**STOP.** Present plan to user. Do not write any files until the user explicitly approves. Record approval in session notes.

### Phase 7 — Build
Write artifacts. Follow the plan exactly. No scope creep.
- Minimal but complete files
- No invented OpenClaw commands
- No push without explicit confirmation (state: remote, branch, message)

### Phase 8 — Audit
Run all applicable validators:
```bash
node agentforger/validators/validate-skill.mjs   skills/<name>
node agentforger/validators/validate-agent.mjs   agents/<name>
node agentforger/validators/validate-audit.mjs   skills/<name>  # or agents/<name>
```
Fix all FAILs. Address WARNs where feasible. Deliver audit report with scorecard.

## Smoke check definitions

- **Skill**: frontmatter complete (name, description, version, tags) + structural sections (Purpose, Limits, Workflow, Quality criteria, Examples)
- **Agent**: SOUL.md + USER.md + AGENTS.md present and non-trivial; MEMORY.md recommended
- **Audit**: deep section completeness + limits declared in SOUL.md + operational rules in AGENTS.md
