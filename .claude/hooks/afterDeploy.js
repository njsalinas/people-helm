#!/usr/bin/env node
/**
 * afterDeploy.js
 * Ejecutado después de deploy a producción.
 * - Health check del endpoint
 * - Verifica que las migraciones estén aplicadas
 * - Reporta métricas del deploy
 */

const { execSync } = require('child_process');

const DEPLOY_URL = process.env.DEPLOY_URL || 'http://localhost:3000';

function log(msg) { console.log(`[afterDeploy] ${msg}`); }
function warn(msg) { console.warn(`[afterDeploy] ⚠  ${msg}`); }

async function healthCheck() {
  log(`🔍 Health check: ${DEPLOY_URL}/api/health`);
  try {
    const res = await fetch(`${DEPLOY_URL}/api/health`);
    if (res.ok) {
      log('✅ Application is healthy');
    } else {
      warn(`Health check returned HTTP ${res.status}`);
    }
  } catch (e) {
    warn(`Health check failed: ${e.message}`);
  }
}

async function checkMigrations() {
  log('🗄️  Checking migrations...');
  const supabaseRef = process.env.SUPABASE_PROJECT_REF;
  if (!supabaseRef) {
    warn('SUPABASE_PROJECT_REF not set — skipping migration check');
    return;
  }
  try {
    execSync(`supabase db status --project-ref ${supabaseRef}`, { stdio: 'inherit' });
    log('✅ Migrations applied correctly');
  } catch {
    warn('Could not verify migrations — check Supabase dashboard');
  }
}

function reportMetrics() {
  log('📊 Deploy metrics:');
  log(`  Deploy URL: ${DEPLOY_URL}`);
  log(`  Timestamp: ${new Date().toISOString()}`);
  log(`  Branch: ${process.env.GITHUB_REF_NAME || 'unknown'}`);
  log(`  Commit: ${process.env.GITHUB_SHA?.slice(0, 8) || 'unknown'}`);
}

(async () => {
  await healthCheck();
  await checkMigrations();
  reportMetrics();
  log('\n✅ Post-deploy checks complete!');
})();
