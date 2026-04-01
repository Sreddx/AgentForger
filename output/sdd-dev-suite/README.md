# SDD Dev Suite — Claude Code Agent Team

A reusable, project-agnostic suite of 14 Claude Code agents designed for Spec-Driven Development with the [InBest SDD Cycle](https://github.com/iNBest-cloud/inbest-sdd-cycle). Install once, customize per project.

## Architecture

```
                        ┌─────────┐
                        │  USER   │
                        └────┬────┘
                             │
                    ┌────────┴────────┐
                    │  ORCHESTRATOR   │  opus — inbest:orchestrate
                    │  (top-level)    │  MCP: airis, serena
                    └───┬───┬───┬────┘
           ┌────────────┤   │   ├────────────────┐
           │            │   │   │                │
    ┌──────┴──────┐  ┌──┴───┴──┐  ┌──────┐  ┌────┴─────┐
    │  PLANNER    │  │ TEAM    │  │VALID-│  │ Support  │
    │  opus       │  │ LEADER  │  │ ATOR │  │ Agents   │
    │  propose    │  │ opus    │  │sonnet│  │          │
    └──────┬──────┘  └────┬────┘  └──────┘  │researcher│
           │         ┌────┼────┐             │devstart  │
    ┌──────┴──────┐  │    │    │             │agent-sync│
    │ RESEARCHER  │  │    │    │             │agent-prep│
    │ opus        │  │    │    │             └──────────┘
    │ research    │  │    │    │
    └─────────────┘  │    │    │
                     │    │    │
              ┌──────┘    │    └──────┐
              │           │           │
        ┌─────┴────┐ ┌───┴────┐ ┌────┴─────┐
        │ FRONTEND │ │BACKEND │ │ DATABASE │
        │ opus     │ │sonnet  │ │ sonnet   │
        │playwright│ │context7│ │ supabase │
        └─────┬────┘ └───┬────┘ └────┬─────┘
              │           │           │
        ┌─────┴────┐ ┌───┴────┐      │
        │TESTER-   │ │TESTER- │ ┌────┴─────┐
        │FRONT     │ │BACK    │ │GITHUB-OPS│
        │playwright│ │context7│ │ sonnet   │
        └──────────┘ └────────┘ └──────────┘
```

## Agent Roster

| Agent | Model | Tier | Reports to | MCP Servers | Primary Skill |
|-------|-------|------|------------|-------------|---------------|
| **orchestrator** | opus | lead | user | airis, serena | `inbest:orchestrate` |
| **researcher** | opus | specialist | orchestrator | airis, context7 | `inbest:research` |
| **planner** | opus | specialist | orchestrator | airis, context7, serena | `inbest:propose` |
| **team-leader** | opus | lead | orchestrator | serena | wave coordination |
| **frontend** | opus | specialist | team-leader | playwright, context7 | `inbest:implement` |
| **backend** | sonnet | specialist | team-leader | context7 | `inbest:implement` |
| **database** | sonnet | specialist | team-leader | supabase, context7 | `inbest:implement` |
| **validator** | sonnet | support | orchestrator | airis | `inbest:verify` |
| **github-ops** | sonnet | support | team-leader | — | git/PR/CI |
| **devstart** | sonnet | support | orchestrator | context7 | env bootstrap |
| **tester-back** | sonnet | specialist | team-leader | context7 | backend tests |
| **tester-front** | sonnet | specialist | team-leader | playwright, context7 | e2e/component tests |
| **agent-sync** | sonnet | support | orchestrator | serena | context consistency |
| **agent-prep** | sonnet | support | orchestrator | airis, context7, serena | `inbest:explore` |

## How to Use

### 1. Installation

**Via GitHub Action (recommended):**

The action installs agents non-destructively — it never overwrites files you've customized.

```yaml
# .github/workflows/sdd-sync.yml
name: SDD Sync
on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: iNBest-cloud/inbest-sdd-cycle@main
        with:
          agent_suite: 'true'
          agent_suite_version: '1.0.0'
          profile: 'frontend'  # or backend-api, brownfield, high-risk
          pr_enabled: 'true'
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**Manual installation:**

```bash
# Copy the Claude Code agents into your project
cp -r .claude/agents/ <your-project>/.claude/agents/

# Also copy the installer for future updates
cp installer/merge-claude-agents.js <your-project>/installer/
```

### 2. First Run — Project Onboarding (Bootstrap Gate)

Every agent (except `agent-prep` and `devstart`) checks AGENTS.md for the `<!-- inbest:section:project-stack -->` section on startup. If it's missing, the agent **blocks and requests onboarding**. This ensures no agent operates without knowing the project's stack and conventions.

```
User → Orchestrator: "Set up this project for SDD development"
```

The orchestrator will:

1. **Invoke `agent-prep`** — scans the codebase, detects tech stack, writes `<!-- inbest:section:project-stack -->` to AGENTS.md, audits dependencies. Works with or without MCP.
2. **Invoke `devstart`** — validates environment, installs dependencies, probes MCP availability, runs build checks
3. **Invoke `agent-sync`** — persists MCP availability status into the project-stack section
4. **Report readiness** — lists what was found, any issues, recommended profile, MCP status

After onboarding, AGENTS.md contains the project-stack section:

```markdown
<!-- inbest:section:project-stack:1.0.0 -->
## Project Stack
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Next.js 14, Express 4
- **UI Library**: React 18, Tailwind CSS 3
- **ORM/Database**: Prisma 5 + PostgreSQL 15
- **Test Framework**: Vitest, Playwright
- **Package Manager**: pnpm 8

## Conventions
- Components use PascalCase, services use camelCase
- API routes follow RESTful naming

## Architecture
- Monorepo with apps/ and packages/ structure

## Constraints
- Node 20+ required, no CommonJS

## MCP Availability (last checked: 2026-04-01)
- airis-mcp-gateway: OK
- serena: OK
- context7: OK
- playwright: UNAVAILABLE
- supabase: UNAVAILABLE
<!-- /inbest:section:project-stack -->
```

All agents read this section to know the stack, conventions, and which MCPs are available.

### 3. MCP Graceful Degradation

Every agent has fallback behavior when its MCP servers are unavailable. **No MCP is required — they all enhance but never block.**

| MCP Server | Used by | Fallback when unavailable | Warning emitted |
|------------|---------|---------------------------|-----------------|
| **airis-mcp-gateway** | orchestrator, researcher, planner, validator, agent-prep | Use native Grep/Glob/WebSearch | `[MCP] WARNING: airis-mcp-gateway not reachable` |
| **context7** | researcher, planner, frontend, backend, database, devstart, testers, agent-prep | WebSearch + package.json versions; mark API claims as `needs-verification` | `[MCP] WARNING: context7 not reachable` |
| **serena** | orchestrator, planner, team-leader, agent-sync, agent-prep | File-based state in `.claude/state/`; all memory goes to AGENTS.md | `[MCP] WARNING: serena not reachable` |
| **playwright** | frontend, tester-front | CLI (`npx playwright test`) if installed; otherwise component tests only; flag e2e as `INCOMPLETE` | `[MCP] WARNING: playwright not reachable` |
| **supabase** | database | ORM CLI via Bash (`npx prisma`, `supabase` CLI) | `[MCP] WARNING: supabase MCP not reachable` |

The `devstart` agent probes all MCPs during bootstrap and reports status. The `agent-sync` agent writes this status into the project-stack section so all agents know upfront which fallbacks to expect.

### 4. Feature Development Flow

```
User: "Implement user authentication with OAuth2"
         │
         ▼
   ┌─────────────┐
   │ ORCHESTRATOR │ receives request, starts SDD cycle
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ RESEARCHER   │ inbest:research — fetches OAuth2 docs via context7,
   │              │ searches best practices via tavily, persists findings
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │   PLANNER    │ inbest:propose — creates proposal.md, design.md,
   │              │ tasks.md with domain tags and wave structure
   └──────┬──────┘
          │
          ▼
   ┌──────────────┐
   │ USER APPROVAL │ ← approval gate (never skipped)
   └──────┬───────┘
          │
          ▼
   ┌─────────────┐
   │ TEAM LEADER  │ reads tasks.md, assigns to domain specialists
   └──────┬──────┘
          │
    ┌─────┼──────┐  ← Wave 1: parallel execution
    │     │      │
    ▼     ▼      ▼
  [DB]  [BACK]  [FRONT]  implement assigned tasks with TDD
    │     │      │
    ▼     ▼      ▼
  [TESTER-BACK] [TESTER-FRONT]  ← Wave 2: test after impl
          │
          ▼
   ┌─────────────┐
   │  GITHUB-OPS  │ commits, creates PR with spec references
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  AGENT-SYNC  │ updates AGENTS.md, persists state via serena
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  VALIDATOR   │ inbest:verify — isolated review, quality scorecard
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ ORCHESTRATOR │ synthesizes results, reports to user
   └─────────────┘
```

### 5. Parallelization Model

Agents work in **waves** managed by the orchestrator:

| Wave | Agents | Condition |
|------|--------|-----------|
| 0 | agent-prep, devstart | Project onboarding (first run only) |
| 1 | researcher | When unknowns exist |
| 2 | planner | After research complete |
| — | **USER APPROVAL GATE** | Never skip |
| 3 | frontend + backend + database | Independent domain tasks in parallel |
| 4 | tester-front + tester-back | After their domain's implementation |
| 5 | github-ops, agent-sync | Post-implementation |
| 6 | validator | Isolated verification |

**Within a wave**, agents with non-overlapping domains run in parallel. **Between waves**, dependencies are respected.

### 6. Escalation Protocol

```
Something unclear or blocked?
    │
    ├── Implementer (frontend/backend/db) → Team Leader
    ├── Team Leader → Orchestrator
    ├── Planner/Researcher → Orchestrator
    └── Orchestrator → User

Rules:
  - Never guess on ambiguity — escalate immediately
  - Task fails once → retry with adjusted context
  - Task fails twice → escalate to next level
  - Never retry a third time automatically
```

### 7. Context Management

Each agent receives a **minimal context envelope**:

```
agent receives:
  ✓ Its assigned task from tasks.md
  ✓ Relevant spec sections only
  ✓ Only source files it needs to modify
  ✓ Library docs via context7
  ✓ AGENTS.md for project conventions

agent does NOT receive:
  ✗ Other agents' tasks
  ✗ Full project history
  ✗ Unrelated specs or design docs
  ✗ Files outside its domain
```

**agent-sync** monitors context usage and flags agents loading files outside their domain.

### 8. Token Resilience

Sessions can end mid-work due to token limits. The suite handles this:

1. **Implementers mark tasks done** in `tasks.md` as they complete each one
2. **agent-sync persists state** to serena after each wave
3. **On resume**, orchestrator loads serena checkpoint and continues from last wave
4. **Planner output is immutable** — approved specs don't need re-generation

To resume after a session ends:

```
User → Orchestrator: "Resume work on <change-name>"
```

### 9. MCP Access Segmentation

Agents only access the MCP servers relevant to their domain:

| Domain | MCP Servers | Agents |
|--------|-------------|--------|
| Orchestration | airis-mcp-gateway, serena | orchestrator, agent-prep |
| Research | airis-mcp-gateway, context7 | researcher |
| Planning | airis-mcp-gateway, context7, serena | planner |
| Frontend | playwright, context7 | frontend, tester-front |
| Backend | context7 | backend, tester-back |
| Database | supabase, context7 | database |
| Quality | airis-mcp-gateway | validator |
| Sync | serena | team-leader, agent-sync |

### 10. Quality Scorecard

The **validator** produces a scorecard after each verification:

```
Scorecard: feature/oauth2-auth
─────────────────────────────
Completeness:          3/3
Correctness:           2/3  ⚠ edge case: token refresh not tested
Code quality:          3/3
Test coverage:         2/3  ⚠ missing integration test for /callback
Standards compliance:  3/3
Documentation:         2/3  ⚠ API docs not updated
─────────────────────────────
Total:                15/18  PASS (threshold: 12/18)

Issues:
  WARNING: Token refresh flow lacks test coverage
  SUGGESTION: Add OpenAPI spec for /auth/callback endpoint
```

### 11. Customization

After installation, agents are **fully customizable** per project:

**Modify an agent's domain** (e.g., your backend uses `server/` instead of `src/api/`):
```yaml
# .claude/agents/backend.md — edit the Domain section
## Domain
server/**, src/services/**, src/middleware/**
```

**Add project-specific instructions**:
```yaml
# Append to any agent's instructions
## Project-specific rules
- Use Drizzle ORM (not Prisma) for all database operations
- All API responses follow the { data, error, meta } envelope
- Authentication uses Clerk — see docs at clerk.com/docs
```

**Add a new agent** (e.g., a docs agent):
Create `.claude/agents/docs-writer.md` — since it has no SDD marker comment, the sync action will never touch it.

**Disable an agent**: Delete its `.md` file. The next sync will re-install it only if you haven't removed the marker — to permanently exclude it, create an empty file with just the marker comment.

## Non-Destructive Guarantees

The installer (`merge-claude-agents.js`) follows strict rules:

| Scenario | Action |
|----------|--------|
| Agent file doesn't exist | Install with version marker |
| Agent file has older version marker | Update to new version |
| Agent file has same/newer version marker | Skip |
| Agent file has **no marker** (user-created) | **Never touch** |

The version marker is the first line of each managed agent file:
```html
<!-- sdd-dev-suite:agent:orchestrator:1.0.0 -->
```

## File Structure After Installation

```
your-project/
├── .claude/
│   ├── agents/                    ← Claude Code agent definitions
│   │   ├── orchestrator.md
│   │   ├── researcher.md
│   │   ├── planner.md
│   │   ├── team-leader.md
│   │   ├── frontend.md
│   │   ├── backend.md
│   │   ├── database.md
│   │   ├── validator.md
│   │   ├── github-ops.md
│   │   ├── devstart.md
│   │   ├── tester-back.md
│   │   ├── tester-front.md
│   │   ├── agent-sync.md
│   │   └── agent-prep.md
│   ├── skills/                    ← InBest SDD skills
│   │   ├── inbest-explore/
│   │   ├── inbest-research/
│   │   ├── inbest-propose/
│   │   ├── inbest-implement/
│   │   ├── inbest-verify/
│   │   └── inbest-orchestrate/
│   └── commands/
├── AGENTS.md                      ← Project conventions (synced sections)
├── CLAUDE.md                      ← Points to AGENTS.md
└── openspec/                      ← Specs and change tracking
    ├── specs/
    ├── changes/
    └── config.yaml
```

## Quick Reference

| What you want to do | Command |
|---------------------|---------|
| Start a new feature | `"Plan and implement <feature>"` → orchestrator |
| Research a topic | `"Research <topic>"` → researcher via orchestrator |
| Just plan (no impl) | `"Create a spec for <feature>"` → planner |
| Run tests only | `"Run tests for <domain>"` → tester-back/tester-front |
| Verify quality | `"Verify the current implementation"` → validator |
| Resume after break | `"Resume work on <change-name>"` → orchestrator |
| Bootstrap new project | `"Set up this project for SDD"` → orchestrator |
| Check environment | `"Validate dev environment"` → devstart |
