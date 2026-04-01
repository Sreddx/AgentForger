---
name: sdd-dev-suite
description: Reusable SDD development agent suite — project-agnostic, customizable post-install. Orchestrated via inbest skills cycle with segmented MCP access, parallelized execution, and centralized context sync.
version: 1.0.0
pattern: hierarchical
tags: [team, sdd, development, fullstack, reusable, inbest]
---

# sdd-dev-suite

## Pattern

hierarchical — Multi-level hierarchy: orchestrator coordinates team leads, team leads coordinate workers. Max 3 levels.

## Agents

### orchestrator
- **Role**: Project orchestrator — strategic decomposition, cross-team coordination, final synthesis via inbest:orchestrate
- **Tier**: lead
- **Model hint**: opus
- **Domain**: *
- **Reports to**: user
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch, Agent, TaskCreate, TaskUpdate, TaskList
- **MCP servers**: airis-mcp-gateway, serena
### researcher
- **Role**: Deep research specialist — multi-hop search, library docs, knowledge persistence via inbest:research
- **Tier**: specialist
- **Model hint**: opus
- **Domain**: openspec/**, docs/**
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch
- **MCP servers**: airis-mcp-gateway, context7
### planner
- **Role**: Technical planner — decomposes backlog into openspec specs with inbest skill phases via inbest:propose
- **Tier**: specialist
- **Model hint**: opus
- **Domain**: openspec/**, docs/**
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch
- **MCP servers**: airis-mcp-gateway, context7, serena
### team-leader
- **Role**: Implementation team leader — coordinates frontend/backend/db workers, manages wave execution
- **Tier**: lead
- **Model hint**: opus
- **Domain**: src/**, tests/**
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch, Agent, TaskCreate, TaskUpdate, TaskList
- **MCP servers**: serena
### frontend
- **Role**: Frontend implementation specialist — UI components, pages, client-side logic with TDD
- **Tier**: specialist
- **Model hint**: opus
- **Domain**: src/components/**, src/pages/**, src/styles/**, src/hooks/**, src/lib/client/**, src/app/**
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: playwright, context7
### backend
- **Role**: Backend implementation specialist — APIs, services, business logic with TDD
- **Tier**: specialist
- **Model hint**: sonnet
- **Domain**: src/api/**, src/services/**, src/lib/server/**, src/middleware/**, src/routes/**
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: context7
### database
- **Role**: Database specialist — schemas, migrations, queries, data modeling
- **Tier**: specialist
- **Model hint**: sonnet
- **Domain**: src/db/**, migrations/**, prisma/**, drizzle/**, supabase/**
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: supabase, context7
### validator
- **Role**: Quality gate — read-only code review, standards compliance, performance scoring, token consumption tracking
- **Tier**: support
- **Model hint**: sonnet
- **Domain**: *
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, Bash
- **MCP servers**: airis-mcp-gateway
### github-ops
- **Role**: GitHub operations — branch management, PR creation, CI monitoring, commit hygiene
- **Tier**: support
- **Model hint**: sonnet
- **Domain**: .github/**, *.yml, *.yaml
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
### devstart
- **Role**: Project bootstrapper — environment setup, dependency installation, configuration validation
- **Tier**: support
- **Model hint**: sonnet
- **Domain**: package.json, tsconfig.json, .env.example, docker-compose.*, Dockerfile, *.config.*
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: context7
### tester-back
- **Role**: Backend testing specialist — unit tests, integration tests, API contract tests
- **Tier**: specialist
- **Model hint**: sonnet
- **Domain**: tests/api/**, tests/services/**, tests/integration/**, tests/unit/**
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: context7
### tester-front
- **Role**: Frontend testing specialist — component tests, e2e tests, visual regression
- **Tier**: specialist
- **Model hint**: sonnet
- **Domain**: tests/components/**, tests/e2e/**, cypress/**, playwright/**
- **Reports to**: team-leader
- **Tools**: Read, Glob, Grep, Write, Edit, Bash
- **MCP servers**: playwright, context7
### agent-sync
- **Role**: Context synchronization agent — maintains AGENTS.md, CLAUDE.md, and cross-agent state consistency
- **Tier**: support
- **Model hint**: sonnet
- **Domain**: AGENTS.md, CLAUDE.md, .claude/**, openspec/**
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, Write, Edit
- **MCP servers**: serena
### agent-prep
- **Role**: Pre-implementation preparation — brownfield analysis, project memory, dependency audit via inbest:explore
- **Tier**: support
- **Model hint**: sonnet
- **Domain**: *
- **Reports to**: orchestrator
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch
- **MCP servers**: airis-mcp-gateway, context7, serena

## Coordination

- Task tracking: File-based via openspec/changes/<current>/tasks.md — implementers mark tasks done as they complete them for token-resilient resumption
- Escalation policy: Worker → Team Lead → Orchestrator → User. Any ambiguity or unresolved blocker escalates immediately — never guess.
- Parallelization: Independent domain agents work in parallel (frontend + backend + db). Sequential when cross-domain dependencies exist. Waves managed by orchestrator via inbest:orchestrate.
