#!/usr/bin/env node
/**
 * dbsync.js
 * Sincroniza el schema de Supabase aplicando migraciones pendientes.
 *
 * Uso: node .claude/commands/dbsync.js [--reset]
 */

const { execSync } = require('child_process');

const reset = process.argv.includes('--reset');

function run(cmd) {
  console.log(`[dbsync] $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

if (reset) {
  console.log('[dbsync] ⚠️  Resetting database...');
  run('supabase db reset');
} else {
  console.log('[dbsync] Applying pending migrations...');
  run('supabase db push');
}

console.log('[dbsync] ✅ Database synchronized');
