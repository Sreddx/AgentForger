/**
 * validate-team.mjs
 * Validates a team spec JSON file for structural correctness and pattern constraints.
 *
 * Usage:
 *   node validate-team.mjs <team-spec.json>
 *
 * Exit codes: 0 = pass, 1 = at least one FAIL, 2 = bad usage
 */
import path from 'node:path';
import { exists, fail, ok, warn } from './common.mjs';
import fs from 'node:fs';

const specPath = process.argv[2];
if (!specPath) {
  console.error('Usage: node validate-team.mjs <team-spec.json>');
  process.exit(2);
}

const resolved = path.resolve(specPath);
if (!exists(resolved)) {
  fail(`Spec file not found: ${resolved}`);
  process.exit(1);
}

let spec;
try {
  spec = JSON.parse(fs.readFileSync(resolved, 'utf8'));
} catch (e) {
  fail(`Invalid JSON: ${e.message}`);
  process.exit(1);
}

// ── Required top-level fields ────────────────────────────────────────────────

const teamName = spec.team_name || spec.TEAM_NAME;
const pattern = spec.pattern || spec.PATTERN;

if (!teamName) fail('Missing required field: team_name');
if (!pattern) fail('Missing required field: pattern');

const VALID_PATTERNS = ['supervisor', 'hierarchical', 'react', 'plan-and-execute'];
if (pattern && !VALID_PATTERNS.includes(pattern)) {
  fail(`Invalid pattern: "${pattern}". Must be one of: ${VALID_PATTERNS.join(', ')}`);
}

if (!spec.agents || !Array.isArray(spec.agents) || spec.agents.length === 0) {
  fail('Missing or empty agents array');
  process.exit(1);
}

// ── Per-agent validation ─────────────────────────────────────────────────────

const VALID_TIERS = ['lead', 'specialist', 'support'];
const agentNames = new Set();
const agentsByName = new Map();

for (const agent of spec.agents) {
  if (!agent.name) { fail('Agent missing required field: name'); continue; }
  if (!agent.role) { fail(`Agent "${agent.name}" missing required field: role`); }
  if (!agent.tier) { fail(`Agent "${agent.name}" missing required field: tier`); }
  if (agent.tier && !VALID_TIERS.includes(agent.tier)) {
    fail(`Agent "${agent.name}" invalid tier: "${agent.tier}". Must be: ${VALID_TIERS.join(', ')}`);
  }

  if (agentNames.has(agent.name)) {
    fail(`Duplicate agent name: "${agent.name}"`);
  }
  agentNames.add(agent.name);
  agentsByName.set(agent.name, agent);
}

// ── reports_to resolution ────────────────────────────────────────────────────

for (const agent of spec.agents) {
  if (!agent.name) continue;
  const reportsTo = agent.reports_to;
  if (reportsTo && reportsTo !== 'user' && !agentNames.has(reportsTo)) {
    fail(`Agent "${agent.name}" reports_to "${reportsTo}" which does not exist in the team`);
  }
}

// ── Cycle detection in reports_to graph ──────────────────────────────────────

for (const agent of spec.agents) {
  if (!agent.name) continue;
  const visited = new Set();
  let current = agent;
  while (current && current.reports_to && current.reports_to !== 'user') {
    if (visited.has(current.name)) {
      fail(`Cycle detected in reports_to chain involving agent "${current.name}"`);
      break;
    }
    visited.add(current.name);
    current = agentsByName.get(current.reports_to);
  }
}

// ── Domain overlap detection ─────────────────────────────────────────────────

const NON_IMPL_TIERS = new Set(['lead', 'support']);
const domainIndex = new Map();
for (const agent of spec.agents) {
  if (!agent.domain) continue;
  const domainKey = JSON.stringify([...agent.domain].sort());
  if (domainIndex.has(domainKey)) {
    const existing = agentsByName.get(domainIndex.get(domainKey));
    const bothNonImpl = NON_IMPL_TIERS.has(existing.tier) && NON_IMPL_TIERS.has(agent.tier);
    if (!bothNonImpl) {
      warn(`Agents "${existing.name}" and "${agent.name}" have identical domain — may cause conflicts`);
    }
  } else {
    domainIndex.set(domainKey, agent.name);
  }
}

// ── Pattern-specific constraints ─────────────────────────────────────────────

const leads = spec.agents.filter(a => a.tier === 'lead');

if (pattern === 'supervisor') {
  if (leads.length !== 1) {
    fail(`Supervisor pattern requires exactly 1 lead agent, found ${leads.length}`);
  }
  // All non-lead agents must report to the lead
  if (leads.length === 1) {
    const supervisorName = leads[0].name;
    for (const agent of spec.agents) {
      if (agent.tier !== 'lead' && agent.reports_to !== supervisorName) {
        warn(`Agent "${agent.name}" does not report to supervisor "${supervisorName}" — expected in supervisor pattern`);
      }
    }
  }
}

if (pattern === 'hierarchical') {
  if (leads.length < 2) {
    warn(`Hierarchical pattern typically needs 2+ lead agents (orchestrator + team leads), found ${leads.length}`);
  }

  // Check max depth (3 levels)
  for (const agent of spec.agents) {
    if (!agent.name) continue;
    let depth = 0;
    let current = agent;
    while (current && current.reports_to && current.reports_to !== 'user') {
      depth++;
      current = agentsByName.get(current.reports_to);
      if (depth > 3) {
        fail(`Agent "${agent.name}" exceeds maximum hierarchy depth of 3 levels`);
        break;
      }
    }
  }
}

if (pattern === 'react') {
  if (spec.agents.length !== 1) {
    warn(`ReAct pattern is single-agent but spec defines ${spec.agents.length} agents`);
  }
}

if (pattern === 'plan-and-execute') {
  const planners = spec.agents.filter(a => a.tier === 'lead');
  if (planners.length !== 1) {
    fail(`Plan-and-Execute pattern requires exactly 1 lead (planner) agent, found ${planners.length}`);
  }
  const executors = spec.agents.filter(a => a.tier === 'specialist' || a.tier === 'support');
  if (executors.length === 0) {
    fail('Plan-and-Execute pattern requires at least 1 executor (specialist/support) agent');
  }
}

// ── General checks ───────────────────────────────────────────────────────────

if (pattern !== 'react' && leads.length === 0) {
  fail('Team must have at least 1 agent with tier: lead');
}

// ── Result ───────────────────────────────────────────────────────────────────

if (process.exitCode !== 1) ok(`team spec valid: ${resolved} (pattern: ${pattern}, agents: ${spec.agents.length})`);
