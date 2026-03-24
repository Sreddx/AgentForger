/**
 * validate-repo.mjs
 * Full repo sweep: validates all skills and agent workspaces.
 * Intended for dedicated repos. For the main OpenClaw workspace,
 * prefer per-artifact validation.
 *
 * Usage:
 *   node validate-repo.mjs /path/to/repo
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { listDirs, exists, fail, ok } from './common.mjs';

const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!repoRoot) {
  console.error('Usage: node validate-repo.mjs /path/to/repo');
  process.exit(2);
}

const skillsDir = path.join(repoRoot, 'skills');
const agentsDir = path.join(repoRoot, 'agents');

if (!exists(skillsDir)) fail(`repo missing skills/: ${skillsDir}`);
if (!exists(agentsDir)) fail(`repo missing agents/: ${agentsDir}`);

const validatorsRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname));

function runValidator(script, target) {
  const r = spawnSync(process.execPath, [path.join(validatorsRoot, script), target], { stdio: 'inherit' });
  if (r.status !== 0) process.exitCode = 1;
}

// Validate each skill directory that has SKILL.md
if (exists(skillsDir)) {
  for (const d of listDirs(skillsDir)) {
    if (exists(path.join(d, 'SKILL.md'))) {
      runValidator('validate-skill.mjs', d);
      runValidator('validate-audit.mjs', d);
    }
  }
}

// Validate each agent workspace that has SOUL/USER/AGENTS
if (exists(agentsDir)) {
  for (const d of listDirs(agentsDir)) {
    const hasCore = ['SOUL.md', 'USER.md', 'AGENTS.md'].every(f => exists(path.join(d, f)));
    if (hasCore) {
      runValidator('validate-agent.mjs', d);
      runValidator('validate-audit.mjs', d);
    }
  }
}

if (process.exitCode !== 1) ok(`repo smoke checks passed: ${repoRoot}`);
