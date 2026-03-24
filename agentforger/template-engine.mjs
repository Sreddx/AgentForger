import fs from 'node:fs';
import path from 'node:path';

// Tiny token-saving template replacer.
// Usage: node template-engine.mjs <templatePath> <outPath> <jsonVarsPath>
// Vars JSON: {"KEY":"value", ...}

const [tplPath, outPath, varsPath] = process.argv.slice(2);
if (!tplPath || !outPath || !varsPath) {
  console.error('Usage: node template-engine.mjs <templatePath> <outPath> <jsonVarsPath>');
  process.exit(2);
}

const tpl = fs.readFileSync(tplPath, 'utf8');
const vars = JSON.parse(fs.readFileSync(varsPath, 'utf8'));

let out = tpl;
for (const [k, v] of Object.entries(vars)) {
  const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
  out = out.replace(re, String(v));
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
