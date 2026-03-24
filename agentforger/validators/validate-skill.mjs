import path from 'node:path';
import { exists, readText, parseFrontmatter, fail, ok } from './common.mjs';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node validate-skill.mjs skills/<skill-name>');
  process.exit(2);
}

const skillMd = path.join(dir, 'SKILL.md');
if (!exists(skillMd)) fail(`${skillMd} missing`);

if (exists(skillMd)) {
  const md = readText(skillMd);
  const { fm, body } = parseFrontmatter(md);
  if (!fm) fail('SKILL.md missing YAML frontmatter (--- ... ---)');
  if (fm) {
    for (const k of ['name', 'description', 'version', 'tags']) {
      if (!(k in fm) || String(fm[k]).trim() === '') fail(`frontmatter missing: ${k}`);
    }
    if (!Array.isArray(fm.tags) || fm.tags.length === 0) fail('frontmatter.tags must be a non-empty list');
  }
  // Require at least one section and a workflow definition
  const hasStructure = ['##', '###'].some(p => body.includes(p));
  const hasWorkflow = ['Flujo', 'Workflow', 'workflow', 'flujo'].some(p => body.includes(p));
  if (!hasStructure) fail('SKILL.md must include section headers (##)');
  if (!hasWorkflow) fail('SKILL.md must include a Workflow/Flujo section');
}

if (process.exitCode !== 1) ok(`skill looks valid: ${dir}`);
