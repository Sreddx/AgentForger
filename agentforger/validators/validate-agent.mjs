import path from 'node:path';
import { exists, fail, ok, warn } from './common.mjs';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node validate-agent.mjs agents/<agent-name>');
  process.exit(2);
}

for (const f of ['SOUL.md', 'USER.md', 'AGENTS.md']) {
  const p = path.join(dir, f);
  if (!exists(p)) fail(`${p} missing`);
}

// MEMORY.md optional but recommended
const memPath = path.join(dir, 'MEMORY.md');
if (!exists(memPath)) warn(`MEMORY.md missing in ${dir} (optional but recommended)`);

if (process.exitCode !== 1) ok(`agent workspace looks valid: ${dir}`);
