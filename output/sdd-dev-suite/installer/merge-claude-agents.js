#!/usr/bin/env node
/**
 * merge-claude-agents.js — Non-destructive Claude Code agent installer.
 *
 * Installs .claude/agents/*.md from the SDD Dev Suite into a target repo.
 * Uses a version marker comment to track managed agents:
 *   <!-- sdd-dev-suite:agent:<name>:<version> -->
 *
 * Rules:
 *   - Agent file doesn't exist           → install (copy + add marker)
 *   - Agent file exists WITH older marker → update content
 *   - Agent file exists WITH same/newer   → skip
 *   - Agent file exists WITHOUT marker    → skip (user-created, never touch)
 *
 * Usage:
 *   node merge-claude-agents.js --source <agents-dir> --target <target-dir> \
 *     --version <semver> [--dry-run true]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let sourceDir = '';
let targetDir = '';
let version = '1.0.0';
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--source':  sourceDir = args[++i]; break;
    case '--target':  targetDir = args[++i]; break;
    case '--version': version   = args[++i]; break;
    case '--dry-run': dryRun    = args[++i] === 'true'; break;
  }
}

if (!sourceDir || !targetDir) {
  console.error('Usage: merge-claude-agents.js --source <dir> --target <dir> --version <semver> [--dry-run true]');
  process.exit(1);
}

const MARKER_RE = /^<!-- sdd-dev-suite:agent:([\w-]+):(\d+\.\d+\.\d+) -->/;

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function addMarker(content, name, ver) {
  return `<!-- sdd-dev-suite:agent:${name}:${ver} -->\n${content}`;
}

function stripMarker(content) {
  return content.replace(/^<!-- sdd-dev-suite:agent:[\w-]+:\d+\.\d+\.\d+ -->\n/, '');
}

// --- Main ---

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

if (!dryRun) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));

const installed = [];
const updated = [];
const skipped = [];
const userOwned = [];

for (const file of sourceFiles) {
  const agentName = path.basename(file, '.md');
  const srcPath = path.join(sourceDir, file);
  const tgtPath = path.join(targetDir, file);
  const srcContent = fs.readFileSync(srcPath, 'utf8');

  if (!fs.existsSync(tgtPath)) {
    // New install
    const markedContent = addMarker(srcContent, agentName, version);
    if (!dryRun) {
      fs.writeFileSync(tgtPath, markedContent);
    }
    installed.push(agentName);
    continue;
  }

  // File exists — check for version marker
  const tgtContent = fs.readFileSync(tgtPath, 'utf8');
  const firstLine = tgtContent.split('\n')[0];
  const match = firstLine.match(MARKER_RE);

  if (!match) {
    // No marker → user-created file, never overwrite
    userOwned.push(agentName);
    continue;
  }

  const existingVersion = match[2];
  const cmp = compareVersions(version, existingVersion);

  if (cmp > 0) {
    // Source is newer → update
    const markedContent = addMarker(srcContent, agentName, version);
    if (!dryRun) {
      fs.writeFileSync(tgtPath, markedContent);
    }
    updated.push(`${agentName} (${existingVersion} → ${version})`);
  } else {
    skipped.push(`${agentName} (${existingVersion} >= ${version})`);
  }
}

// Report
const prefix = dryRun ? '[DRY RUN] ' : '';
if (installed.length)  console.log(`${prefix}Installed agents: ${installed.join(', ')}`);
if (updated.length)    console.log(`${prefix}Updated agents: ${updated.join(', ')}`);
if (skipped.length)    console.log(`Skipping (up to date): ${skipped.join(', ')}`);
if (userOwned.length)  console.log(`Skipping (user-owned, no marker): ${userOwned.join(', ')}`);

if (!installed.length && !updated.length) {
  console.log('Claude Code agents are fully up to date — no changes needed');
}
