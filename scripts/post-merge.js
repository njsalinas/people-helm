#!/usr/bin/env node
/**
 * scripts/post-merge.js
 * Ejecutado después de un git merge.
 * - Reinstala dependencias si cambió package.json
 * - Regenera documentación
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.warn(`[post-merge] Command failed: ${cmd}`);
  }
}

console.log('[post-merge] Checking for package.json changes...');

const changedFiles = execSync('git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD', {
  encoding: 'utf8',
}).trim();

if (changedFiles.includes('package.json')) {
  console.log('[post-merge] package.json changed — reinstalling dependencies...');
  run('npm install');
}

console.log('[post-merge] Regenerating documentation...');
run('node scripts/docs-generator.js');

console.log('[post-merge] ✅ Post-merge complete!');
