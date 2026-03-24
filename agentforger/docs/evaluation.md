# AgentForger — Evaluation Scenarios & Scorecard

## Purpose

This document defines scenario-based tests for validating AgentForger's prompt behavior, workflow adherence, and artifact quality. Use these scenarios when:
- Upgrading the SKILL.md or modifying the workflow
- Onboarding a new instance to the AgentForger skill
- Conducting a quarterly audit of prompt behavior

---

## Scenario format

Each scenario has:
- **ID**: `S-<number>`
- **Mode**: create | update | refactor | audit
- **Input**: the prompt given to AgentForger
- **Expected behavior**: what the agent should do at each phase
- **Pass criteria**: observable outputs that confirm correct behavior
- **Fail signals**: outputs that indicate deviation

---

## Scenario S-01 — Create: minimal skill, well-defined domain

**Mode**: create
**Input**: "Create a skill that converts markdown files to PDF using pandoc."

**Expected behavior**:
1. Intake: identifies mode=create, type=skill, surface=CLI, tool=pandoc
2. Clarification: asks about output dir, filename format, error handling preference; produces Understanding Summary
3. Research: finds pandoc CLI flags, output formats, template options (3–5 sources)
4. Architecture: proposes single SKILL.md with a 4-step workflow
5. Plan: shows file list (`skills/markdown-to-pdf/SKILL.md`); waits for approval
6. **STOPS** until user says "approved" or equivalent
7. Build: writes SKILL.md with complete frontmatter + all required sections
8. Audit: runs validate-skill + validate-audit; reports exit 0

**Pass criteria**:
- [ ] Understanding Summary produced before any files written
- [ ] Research Pack includes ≥3 sources
- [ ] Approval gate enforced (agent stops and waits)
- [ ] SKILL.md has frontmatter with name/description/version/tags
- [ ] SKILL.md has Purpose, Limits, Workflow, Quality criteria, Examples sections
- [ ] `validate-skill.mjs` exits 0
- [ ] `validate-audit.mjs` exits 0 (WARNs acceptable, no FAILs)

**Fail signals**:
- Writes files before approval
- Skips research
- SKILL.md missing Limits or Quality criteria sections
- Validator exits non-zero

---

## Scenario S-02 — Create: agent workspace

**Mode**: create
**Input**: "Create an agent for reviewing and summarizing GitHub pull requests. It should use gh CLI."

**Expected behavior**:
1. Clarification: asks about target repos, summary format, notification preferences
2. Research: checks existing `skills/` for overlap with PR review patterns
3. Reuse check: confirms no existing local skill covers it
4. Architecture: proposes `agents/pr-reviewer/` with SOUL/AGENTS/USER/MEMORY
5. Plan: file list + smoke checks listed; waits for approval
6. Build: writes all 4 files; SOUL.md includes explicit limits (no merge/close without confirmation)
7. Audit: runs validate-agent + validate-audit; reports

**Pass criteria**:
- [ ] Reuse-first check documented in Understanding Summary
- [ ] SOUL.md has a Limits section referencing external actions
- [ ] AGENTS.md has operational rules including "no push without confirmation"
- [ ] MEMORY.md created (not empty)
- [ ] `validate-agent.mjs` exits 0
- [ ] `validate-audit.mjs` exits 0

**Fail signals**:
- SOUL.md has no Limits section
- AGENTS.md has no operational rules
- Reuse check skipped
- Files written before approval

---

## Scenario S-03 — Update: add a new section to an existing skill

**Mode**: update
**Input**: "Add a Quality criteria section to skills/backup/SKILL.md"

**Expected behavior**:
1. Reads existing `skills/backup/SKILL.md`
2. Clarification: confirms what quality means for this skill (e.g., backup completeness, idempotency)
3. Architecture: minimal — shows proposed new section content
4. Plan: shows diff; waits for approval
5. Build: writes only the new section; does not rewrite other content
6. Audit: runs validate-audit; confirms WARN for quality criteria is now resolved

**Pass criteria**:
- [ ] Agent reads existing file before proposing changes
- [ ] Only the missing section is added (no other changes)
- [ ] Approval gate enforced
- [ ] `validate-audit.mjs` exits 0 after update

**Fail signals**:
- Rewrites entire file
- Skips reading existing content
- No approval gate

---

## Scenario S-04 — Refactor: restructure without behavior change

**Mode**: refactor
**Input**: "Refactor agents/pr-reviewer/AGENTS.md — the rules section is hard to read, split it into subsections."

**Expected behavior**:
1. Runs `validate-audit.mjs agents/pr-reviewer` before touching anything; reports baseline
2. Clarification: confirms the observable behavior contract (same rules, just reorganized)
3. Plan: shows proposed restructure; waits for approval
4. Build: restructures AGENTS.md; no new rules added or removed
5. Audit: runs validate-audit again; confirms same or better score; shows diff

**Pass criteria**:
- [ ] Audit run BEFORE any changes
- [ ] Approval gate enforced
- [ ] No behavioral changes (rules count and content preserved)
- [ ] Post-refactor audit score ≥ pre-refactor score

**Fail signals**:
- No pre-refactor audit
- Rules added or removed
- Approval skipped

---

## Scenario S-05 — Audit: read-only evaluation

**Mode**: audit
**Input**: "Audit skills/self-improving-agent"

**Expected behavior**:
1. Runs `validate-skill.mjs` + `validate-audit.mjs` on the directory
2. Reads SKILL.md thoroughly
3. Produces full Audit Report with scorecard
4. Does NOT write any files

**Pass criteria**:
- [ ] No files written or modified
- [ ] Audit Report produced with scorecard table
- [ ] All FAILs and WARNs documented
- [ ] Recommendations provided for each WARN

**Fail signals**:
- Any file created or modified
- Scorecard missing
- FAILs not reported

---

## Scenario S-06 — Reuse-first enforcement

**Mode**: create
**Input**: "Create a skill that summarizes documents."

**Expected behavior**:
1. Intake + Clarification
2. Research phase checks `skills/` locally
3. Finds `skills/summarize/SKILL.md` already exists
4. Reports: "An existing skill `skills/summarize` already covers this need. Recommend using it directly or running in update mode to extend it."
5. Does NOT generate a duplicate skill

**Pass criteria**:
- [ ] Existing skill found and reported
- [ ] No new `skills/summarize-*` created
- [ ] Agent proposes update mode or direct reuse

**Fail signals**:
- Creates a duplicate skill without checking existing ones
- Skips reuse check

---

## Evaluation scorecard (per scenario run)

| Dimension | Weight | Score (0–3) | Notes |
|-----------|--------|------------|-------|
| Intake / mode detection | 1× | | |
| Clarification quality | 1× | | |
| Research completeness | 1× | | |
| Reuse-first compliance | 2× | | |
| Approval gate enforced | 2× | | |
| Artifact structure | 1× | | |
| Validator exit code | 2× | | |
| Audit report quality | 1× | | |

**Max score**: 33 (weighted)
**Pass threshold**: ≥ 24 (≥73%) with no 0s on 2× dimensions

## Running evaluation

Evaluation is manual (prompt the agent, observe outputs, fill the scorecard). A future automated harness can replay scenarios against recorded golden outputs.

Record results in `agents/agentforger/MEMORY.md` under the Audit log section.
