/**
 * team-generator.mjs
 * Reads a team-spec JSON (or a preset) and generates dual-output agent artifacts.
 *
 * Usage:
 *   node team-generator.mjs <preset-or-spec.json> <target> [output-dir]
 *
 *   target: openclaw | claude | both
 *   output-dir: defaults to current directory
 *
 * The generator reads the spec, iterates over each agent definition,
 * and renders the appropriate templates per target.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderTemplate(tplContent, vars) {
  let out = tplContent;
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
    out = out.replace(re, String(v));
  }
  return out;
}

function loadTemplate(name) {
  const tplPath = path.join(__dirname, 'templates', 'team', name);
  return fs.readFileSync(tplPath, 'utf8');
}

function loadAgentTemplate(name) {
  const tplPath = path.join(__dirname, 'templates', 'agent', name);
  return fs.readFileSync(tplPath, 'utf8');
}

function writeOutput(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`  CREATED: ${filePath}`);
}

function arrayToYaml(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
}

// ── Tool mappings ────────────────────────────────────────────────────────────

const TOOL_PRESETS = {
  read:   ['Read', 'Glob', 'Grep'],
  write:  ['Write', 'Edit'],
  bash:   ['Bash'],
  search: ['Glob', 'Grep', 'WebSearch', 'WebFetch'],
  agent:  ['Agent'],
  tasks:  ['TaskCreate', 'TaskUpdate', 'TaskList'],
  all:    ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Agent'],
};

function resolveTools(toolsNeeded) {
  if (!toolsNeeded) return [];
  const resolved = new Set();
  for (const t of toolsNeeded) {
    if (TOOL_PRESETS[t]) {
      for (const tool of TOOL_PRESETS[t]) resolved.add(tool);
    } else {
      resolved.add(t);
    }
  }
  return [...resolved];
}

// ── Model mapping ────────────────────────────────────────────────────────────

const MODEL_MAP = {
  opus:   'opus',
  sonnet: 'sonnet',
  haiku:  'haiku',
};

// ── Escalation path builder ──────────────────────────────────────────────────

function buildEscalationPath(agent, agentsMap) {
  const chain = [agent.name];
  let current = agent;
  while (current.reports_to && current.reports_to !== 'user') {
    chain.push(current.reports_to);
    current = agentsMap.get(current.reports_to) || { reports_to: null };
  }
  chain.push('user');
  return chain.join(' → ');
}

// ── Voice defaults by tier ──────────────────────────────────────────────────

function defaultVoice(tier) {
  switch (tier) {
    case 'lead': return 'strategic, decisive, clear. Prioritize coordination and team alignment.';
    case 'specialist': return 'precise, focused, methodical. Prioritize correctness and domain expertise.';
    case 'support': return 'thorough, observant, reliable. Prioritize quality and coverage.';
    default: return 'clear, direct, instructive. Prioritize safety and precision.';
  }
}

// ── Pattern descriptions ─────────────────────────────────────────────────────

const PATTERN_DESCRIPTIONS = {
  supervisor: 'One central supervisor coordinates specialized workers. All communication flows through the supervisor.',
  hierarchical: 'Multi-level hierarchy: orchestrator coordinates team leads, team leads coordinate workers. Max 3 levels.',
  react: 'Single agent with iterative Thought→Action→Observation loop. No team generated.',
  'plan-and-execute': 'Planner (large model) generates immutable plan, executors (small models) implement each step.',
};

// ── Generate Claude Code agents ──────────────────────────────────────────────

function generateClaude(spec, outDir) {
  const tpl = loadTemplate('claude-agent.md.tpl');
  const agentsMap = new Map(spec.agents.map(a => [a.name, a]));

  for (const agent of spec.agents) {
    const tools = resolveTools(agent.tools_needed);
    const model = MODEL_MAP[agent.model_hint] || 'sonnet';
    const disallowed = agent.disallowed_tools || [];
    const mcpServers = agent.mcp_servers || [];

    const mcpBlock = mcpServers.length > 0
      ? `mcpServers:\n${mcpServers.map(s => `  - ${s}`).join('\n')}`
      : '';

    const vars = {
      AGENT_NAME: agent.name,
      AGENT_DESCRIPTION: agent.description || agent.role,
      MODEL: model,
      TOOLS: tools.join(', '),
      DISALLOWED_TOOLS: disallowed.join(', '),
      MCP_BLOCK: mcpBlock,
      AGENT_ROLE: agent.role,
      AGENT_INSTRUCTIONS: agent.instructions || `You are the ${agent.name} agent. ${agent.role}`,
      REPORTS_TO: agent.reports_to || 'user',
      DOMAIN_FILES: arrayToYaml(agent.domain) || '*',
      EXTRA_COORDINATION: agent.extra_coordination || '',
    };

    const content = renderTemplate(tpl, vars);
    const filePath = path.join(outDir, '.claude', 'agents', `${agent.name}.md`);
    writeOutput(filePath, content);
  }
}

// ── Generate OpenClaw agents ─────────────────────────────────────────────────

function generateOpenClaw(spec, outDir) {
  const soulTpl = loadTemplate('openclaw-soul.md.tpl');
  const agentsTpl = loadTemplate('openclaw-agents.md.tpl');
  const userTpl = loadAgentTemplate('USER.md.tpl');
  const memoryTpl = loadAgentTemplate('MEMORY.md.tpl');

  const agentsMap = new Map(spec.agents.map(a => [a.name, a]));

  for (const agent of spec.agents) {
    const agentDir = path.join(outDir, 'agents', agent.name);
    const tools = resolveTools(agent.tools_needed);
    const escalationPath = buildEscalationPath(agent, agentsMap);

    // SOUL.md
    const soulVars = {
      AGENT_NAME: agent.name,
      VOICE: agent.voice || defaultVoice(agent.tier),
      AGENT_IDENTITY: agent.identity || `${agent.role} agent specializing in ${arrayToYaml(agent.domain) || 'general tasks'}.`,
      TEAM_NAME: spec.team_name || spec.TEAM_NAME,
      PATTERN: spec.pattern || spec.PATTERN,
      REPORTS_TO: agent.reports_to || 'user',
      DOMAIN_FILES: arrayToYaml(agent.domain) || '*',
      EXTRA_LIMITS: agent.extra_limits || '',
    };
    writeOutput(path.join(agentDir, 'SOUL.md'), renderTemplate(soulTpl, soulVars));

    // AGENTS.md
    const agentsVars = {
      AGENT_NAME: agent.name,
      AGENT_ROLE: agent.role,
      TEAM_NAME: spec.team_name || spec.TEAM_NAME,
      PATTERN: spec.pattern || spec.PATTERN,
      TIER: agent.tier,
      REPORTS_TO: agent.reports_to || 'user',
      DOMAIN_FILES: arrayToYaml(agent.domain) || '*',
      PERMITTED_OPERATIONS: agent.permitted_operations || '- Research (web, local files, documentation)\n- File generation within assigned domain\n- Running validators\n- Creating local git commits when requested',
      TOOLS_DESCRIPTION: tools.length > 0 ? tools.map(t => `- ${t}`).join('\n') : '- (inherits default tools)',
      ESCALATION_PATH: escalationPath,
      PARALLEL_POLICY: agent.parallel_policy || 'Parallelize when working on independent file domains',
      TASK_TRACKING: agent.task_tracking || 'Mark tasks completed as they finish for resumability',
      OUTPUTS: agent.outputs || '- Task completion reports\n- Generated artifacts within domain',
    };
    writeOutput(path.join(agentDir, 'AGENTS.md'), renderTemplate(agentsTpl, agentsVars));

    // USER.md (reuse existing template with defaults)
    const userVars = {
      AGENT_NAME: agent.name,
      USER_NAME: '<workspace-owner>',
      USER_LEVEL: 'intermediate-to-advanced',
      USER_GOAL: `Operate as ${agent.role} within the ${spec.team_name || spec.TEAM_NAME} team`,
      USER_CONSTRAINTS: `Domain: ${arrayToYaml(agent.domain) || '*'}. Reports to: ${agent.reports_to || 'user'}.`,
      USER_NOTES: `Auto-generated by AgentForger team-generator. Pattern: ${spec.pattern || spec.PATTERN}.`,
    };
    writeOutput(path.join(agentDir, 'USER.md'), renderTemplate(userTpl, userVars));

    // MEMORY.md (reuse existing template with defaults)
    const memVars = {
      AGENT_NAME: agent.name,
      PERSISTENT_FACTS: `- Member of team: ${spec.team_name || spec.TEAM_NAME}\n- Pattern: ${spec.pattern || spec.PATTERN}\n- Tier: ${agent.tier}`,
      PREFERENCES: '- (to be filled during operation)',
      DESIGN_DECISIONS: '- (to be filled during operation)',
    };
    writeOutput(path.join(agentDir, 'MEMORY.md'), renderTemplate(memoryTpl, memVars));
  }
}

// ── Generate team spec artifact ──────────────────────────────────────────────

function generateTeamSpec(spec, outDir) {
  const teamName = spec.team_name || spec.TEAM_NAME;
  const pattern = spec.pattern || spec.PATTERN;

  // Build agents block from spec
  const agentsBlock = spec.agents.map(a => {
    const tools = resolveTools(a.tools_needed);
    return [
      `### ${a.name}`,
      `- **Role**: ${a.role}`,
      `- **Tier**: ${a.tier}`,
      `- **Model hint**: ${a.model_hint || 'sonnet'}`,
      `- **Domain**: ${arrayToYaml(a.domain) || '*'}`,
      `- **Reports to**: ${a.reports_to || 'user'}`,
      `- **Tools**: ${tools.join(', ') || '(default)'}`,
      a.mcp_servers ? `- **MCP servers**: ${a.mcp_servers.join(', ')}` : null,
      '',
    ].filter(Boolean).join('\n');
  }).join('\n');

  const tpl = loadTemplate('team-spec.md.tpl');
  const vars = {
    TEAM_NAME: teamName,
    TEAM_DESCRIPTION: spec.description || spec.TEAM_DESCRIPTION || `${pattern} team`,
    TEAM_VERSION: spec.version || spec.TEAM_VERSION || '1.0.0',
    PATTERN: pattern,
    PATTERN_DESCRIPTION: PATTERN_DESCRIPTIONS[pattern] || pattern,
    TEAM_TAGS: spec.tags ? spec.tags.join(', ') : 'team, orchestration',
    AGENTS_BLOCK: agentsBlock,
    TASK_TRACKING: spec.task_tracking || 'File-based (.claude/tasks/ or team-defined)',
    ESCALATION_POLICY: spec.escalation_policy || 'Agent → supervisor/lead → user',
    PARALLEL_POLICY: spec.parallel_policy || 'Parallelize when agents operate on independent file domains',
  };

  const content = renderTemplate(tpl, vars);
  const teamsDir = path.join(outDir, 'teams');
  writeOutput(path.join(teamsDir, `${teamName}.md`), content);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const [specPath, target, outputDir] = process.argv.slice(2);

if (!specPath || !target) {
  console.error('Usage: node team-generator.mjs <preset-or-spec.json> <target> [output-dir]');
  console.error('  target: openclaw | claude | both');
  process.exit(2);
}

if (!['openclaw', 'claude', 'both'].includes(target)) {
  console.error(`Invalid target: "${target}". Must be: openclaw | claude | both`);
  process.exit(2);
}

const resolvedSpec = path.resolve(specPath);
if (!fs.existsSync(resolvedSpec)) {
  console.error(`Spec file not found: ${resolvedSpec}`);
  process.exit(2);
}

const spec = JSON.parse(fs.readFileSync(resolvedSpec, 'utf8'));
const outDir = outputDir ? path.resolve(outputDir) : process.cwd();

const teamName = spec.team_name || spec.TEAM_NAME;
const pattern = spec.pattern || spec.PATTERN;

if (!teamName) {
  console.error('Spec missing required field: team_name (or TEAM_NAME)');
  process.exit(2);
}
if (!pattern) {
  console.error('Spec missing required field: pattern (or PATTERN)');
  process.exit(2);
}
if (!spec.agents || !Array.isArray(spec.agents) || spec.agents.length === 0) {
  console.error('Spec missing required field: agents (must be a non-empty array)');
  process.exit(2);
}

console.log(`\nGenerating team: ${teamName}`);
console.log(`Pattern: ${pattern}`);
console.log(`Target: ${target}`);
console.log(`Output: ${outDir}\n`);

// Always generate team spec artifact
generateTeamSpec(spec, outDir);

if (target === 'openclaw' || target === 'both') {
  console.log('\n── OpenClaw output ──');
  generateOpenClaw(spec, outDir);
}

if (target === 'claude' || target === 'both') {
  console.log('\n── Claude Code output ──');
  generateClaude(spec, outDir);
}

console.log('\nDone.');
