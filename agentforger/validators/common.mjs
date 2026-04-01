import fs from 'node:fs';
import path from 'node:path';

export function exists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
}

export function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

export function listDirs(p) {
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(p, d.name));
}

// Extremely small YAML frontmatter parser: only supports `key: value` and `key: [a,b]`.
export function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { fm: null, body: md };
  const raw = m[1];
  const fm = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const kv = trimmed.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim();
      fm[key] = inner ? inner.split(',').map(s => s.trim()).filter(Boolean) : [];
    } else {
      fm[key] = val.replace(/^['\"]|['\"]$/g, '');
    }
  }
  const body = md.slice(m[0].length);
  return { fm, body };
}

export function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

export function ok(msg) {
  console.log(`OK: ${msg}`);
}

export function warn(msg) {
  console.warn(`WARN: ${msg}`);
}

// Parse a markdown body containing ### agent blocks into an array of { name, fields }
export function parseAgentsBlock(body) {
  const agents = [];
  const blocks = body.split(/^### /m).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const name = lines[0].trim();
    const fields = {};
    for (let i = 1; i < lines.length; i++) {
      const m = lines[i].match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
      if (m) fields[m[1].toLowerCase().replace(/\s+/g, '_')] = m[2].trim();
    }
    agents.push({ name, ...fields });
  }
  return agents;
}
