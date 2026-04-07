#!/usr/bin/env node
/**
 * testenv.js
 * Prepara el ambiente de testing:
 * - Limpia directorios de coverage/playwright-report
 * - Reinicia base de datos (Supabase local)
 * - Aplica seed data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');

function run(cmd) {
  console.log(`[testenv] $ ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.warn(`[testenv] Command failed (continuing): ${cmd}`);
  }
}

function cleanDir(dir) {
  const full = path.join(ROOT, dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`[testenv] 🗑  Cleaned: ${dir}`);
  }
}

console.log('[testenv] Preparing test environment...\n');

// 1. Limpiar artefactos de tests anteriores
cleanDir('coverage');
cleanDir('playwright-report');
cleanDir('test-results');

// 2. Resetear BD local y aplicar seed
run('supabase db reset');

console.log('\n[testenv] ✅ Test environment ready!');
console.log('[testenv] Run: npm test         (unit + integration)');
console.log('[testenv] Run: npm run test:e2e  (E2E)');
