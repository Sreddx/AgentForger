import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Validate only the AgentForger skill in this workspace.
const workspaceRoot = path.resolve(process.cwd(), '..');
const skillDir = path.join(workspaceRoot, 'skills', 'agentforger');

const r = spawnSync(process.execPath, [path.join(process.cwd(), 'validators/validate-skill.mjs'), skillDir], { stdio: 'inherit' });
process.exitCode = r.status ?? 1;
