/**
 * validate-audit.mjs
 * Audit-readiness check. Works for both skill directories and agent workspace directories.
 *
 * Usage:
 *   node validate-audit.mjs skills/<skill-name>
 *   node validate-audit.mjs agents/<agent-name>
 */
import path from 'node:path';
import { exists, readText, parseFrontmatter, fail, ok, warn } from './common.mjs';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node validate-audit.mjs <skills/name | agents/name>');
  process.exit(2);
}

// Detect type: agent workspace has SOUL.md; skill has SKILL.md
const isAgent = exists(path.join(dir, 'SOUL.md'));
const isSkill = exists(path.join(dir, 'SKILL.md'));

if (!isAgent && !isSkill) {
  fail(`${dir} does not appear to be a skill or agent workspace (no SOUL.md or SKILL.md)`);
  process.exit(1);
}

// ── Skill audit ──────────────────────────────────────────────────────────────
if (isSkill) {
  const md = readText(path.join(dir, 'SKILL.md'));
  const { fm, body } = parseFrontmatter(md);

  if (!fm) { fail('SKILL.md missing YAML frontmatter'); }
  else {
    for (const k of ['name', 'description', 'version', 'tags']) {
      if (!(k in fm) || String(fm[k]).trim() === '') fail(`frontmatter missing field: ${k}`);
    }
    if (!Array.isArray(fm.tags) || fm.tags.length === 0) fail('frontmatter.tags must be a non-empty list');
  }

  const checks = [
    { label: 'Purpose/Propósito section',    pattern: /##.*(purpose|propósito)/i },
    { label: 'Limits/Límites section',        pattern: /##.*(limit|límit|non-goal|no-hará)/i },
    { label: 'Workflow/Flujo section',        pattern: /##.*(workflow|flujo)/i },
    { label: 'Quality criteria',             pattern: /##.*(qualit|criteria|criterio)/i },
    { label: 'Examples section',             pattern: /##.*(example|ejemplo)/i },
  ];

  for (const { label, pattern } of checks) {
    if (!pattern.test(body)) warn(`SKILL.md audit: missing "${label}"`);
  }
}

// ── Agent audit ──────────────────────────────────────────────────────────────
if (isAgent) {
  for (const f of ['SOUL.md', 'AGENTS.md', 'USER.md']) {
    const p = path.join(dir, f);
    if (!exists(p)) { fail(`${f} missing`); continue; }

    const content = readText(p);
    if (content.trim().length < 20) fail(`${f} appears empty or too short`);
  }

  // SOUL.md must describe at least one limit
  const soulPath = path.join(dir, 'SOUL.md');
  if (exists(soulPath)) {
    const soul = readText(soulPath);
    if (!/(limit|límit)/i.test(soul)) warn('SOUL.md audit: no Limits section found — add explicit behavioral limits');
  }

  // AGENTS.md must include operational rules
  const agentsPath = path.join(dir, 'AGENTS.md');
  if (exists(agentsPath)) {
    const agents = readText(agentsPath);
    if (!/(rule|regla|operat)/i.test(agents)) warn('AGENTS.md audit: no operational rules found');
  }

  const memPath = path.join(dir, 'MEMORY.md');
  if (!exists(memPath)) warn('MEMORY.md missing (recommended for audit trail)');
}

if (process.exitCode !== 1) ok(`audit check passed: ${dir}`);
