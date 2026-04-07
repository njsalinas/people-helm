#!/usr/bin/env node
/**
 * onProjectStart.js
 * Ejecutado al iniciar el proyecto por primera vez.
 * - Valida archivos requeridos
 * - Configura Husky
 * - Crea .env.local desde .env.example
 * - Genera documentación inicial
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    return null;
  }
}

function log(msg) { console.log(`[onProjectStart] ${msg}`); }
function warn(msg) { console.warn(`[onProjectStart] ⚠  ${msg}`); }

// 1. Validar archivos requeridos
const required = [
  'package.json',
  'tsconfig.json',
  'tailwind.config.ts',
  'next.config.js',
  '.env.example',
];

log('Validating required files...');
for (const f of required) {
  if (!fs.existsSync(path.join(ROOT, f))) {
    warn(`Missing file: ${f}`);
  }
}

// 2. Crear .env.local si no existe
const envLocal = path.join(ROOT, '.env.local');
const envExample = path.join(ROOT, '.env.example');
if (!fs.existsSync(envLocal) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envLocal);
  log('.env.local created from .env.example — fill in your Supabase credentials');
}

// 3. Instalar dependencias
log('Installing dependencies...');
run('npm install');

// 4. Setup Husky
log('Setting up Husky...');
run('npx husky install');

// 5. Generar documentación inicial
log('Generating initial documentation...');
if (fs.existsSync(path.join(ROOT, 'scripts/docs-generator.js'))) {
  run('node scripts/docs-generator.js');
}

log('✅ Project setup complete!');
log('Next steps:');
log('  1. Fill in .env.local with your Supabase credentials');
log('  2. Run: npm run dev');
log('  3. Open: http://localhost:3000');
