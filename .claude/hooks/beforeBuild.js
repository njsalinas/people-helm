#!/usr/bin/env node
/**
 * beforeBuild.js
 * Ejecutado antes del build de producción.
 * - ESLint
 * - TypeScript type-check
 * - Tests unitarios
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function run(cmd, label) {
  console.log(`\n[beforeBuild] Running: ${label}...`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`[beforeBuild] ✅ ${label} passed`);
  } catch {
    console.error(`[beforeBuild] ❌ ${label} FAILED`);
    process.exit(1);
  }
}

run('npm run lint', 'ESLint');
run('npx tsc --noEmit', 'TypeScript check');
run('npm run test', 'Unit tests');

console.log('\n[beforeBuild] ✅ All pre-build checks passed. Building...');
