#!/usr/bin/env node
/**
 * beforeCommit.js
 * Pre-commit hook: genera documentación automática antes de cada commit.
 * Ejecutado vía .husky/pre-commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch {
    return '';
  }
}

function log(msg) { console.log(`[beforeCommit] ${msg}`); }

// ─── 1. Generar API reference desde JSDoc ─────────────────────────────────

function generateApiDocs() {
  log('📄 Generating API reference from JSDoc...');
  const apiDir = path.join(ROOT, 'src/app/api');
  const functionsDir = path.join(ROOT, 'supabase/functions');

  let content = '# API Reference\n\n*Auto-generated — do not edit manually*\n\n';

  if (fs.existsSync(apiDir)) {
    content += '## Next.js API Routes\n\n';
    const routes = scanForFiles(apiDir, 'route.ts');
    for (const route of routes) {
      const rel = route.replace(apiDir, '').replace('/route.ts', '');
      const src = fs.readFileSync(route, 'utf8');
      const jsdoc = extractJsDoc(src);
      content += `### \`${rel || '/'}\`\n${jsdoc}\n\n`;
    }
  }

  if (fs.existsSync(functionsDir)) {
    content += '## Supabase Functions\n\n';
    const fns = fs.readdirSync(functionsDir).filter(
      (d) => fs.statSync(path.join(functionsDir, d)).isDirectory()
    );
    for (const fn of fns) {
      const indexPath = path.join(functionsDir, fn, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const src = fs.readFileSync(indexPath, 'utf8');
        const jsdoc = extractJsDoc(src);
        content += `### \`${fn}\`\n${jsdoc}\n\n`;
      }
    }
  }

  fs.writeFileSync(path.join(ROOT, 'docs/api-reference.md'), content);
  log('✅ docs/api-reference.md generated');
}

// ─── 2. Generar module docs desde TSDoc ───────────────────────────────────

function generateModuleDocs() {
  log('📚 Generating module docs from TSDoc...');

  let content = '# Módulos y Componentes\n\n*Auto-generated — do not edit manually*\n\n';

  const sections = [
    { label: 'Componentes React', dir: 'src/components', ext: '.tsx' },
    { label: 'Hooks Personalizados', dir: 'src/hooks', ext: '.ts' },
    { label: 'Utilidades', dir: 'src/lib', ext: '.ts' },
    { label: 'Stores Zustand', dir: 'src/stores', ext: '.ts' },
  ];

  for (const { label, dir, ext } of sections) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;

    content += `## ${label}\n\n`;
    const files = scanForFiles(fullDir, ext);
    for (const file of files) {
      const rel = file.replace(ROOT + '/', '');
      const src = fs.readFileSync(file, 'utf8');
      const jsdoc = extractJsDoc(src);
      const exports = extractExports(src);
      if (exports.length > 0 || jsdoc) {
        content += `### \`${rel}\`\n`;
        if (jsdoc) content += `${jsdoc}\n`;
        if (exports.length > 0) {
          content += `**Exports:** ${exports.join(', ')}\n`;
        }
        content += '\n';
      }
    }
  }

  fs.writeFileSync(path.join(ROOT, 'docs/modulos.md'), content);
  log('✅ docs/modulos.md generated');
}

// ─── 3. Generar schema docs desde migraciones ─────────────────────────────

function generateSchemaDocs() {
  log('🗄️  Generating schema from migrations...');

  const migrationsDir = path.join(ROOT, 'supabase/migrations');
  const outDir = path.join(ROOT, 'docs/database');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let content = '# Database Schema\n\n*Auto-generated — do not edit manually*\n\n';
  content += '## Tables\n\n';

  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const migration of migrations) {
      const sql = fs.readFileSync(path.join(migrationsDir, migration), 'utf8');
      const tableName = migration.replace(/^\d+_crear_tabla_/, '').replace('.sql', '');
      content += `### ${tableName}\n\n\`\`\`sql\n${sql.trim()}\n\`\`\`\n\n`;
    }
  }

  fs.writeFileSync(path.join(outDir, 'schema.md'), content);
  log('✅ docs/database/schema.md generated');
}

// ─── 4. Actualizar claude.md ───────────────────────────────────────────────

function updateClaudeContext() {
  log('🤖 Updating claude.md context...');

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
  );

  const now = new Date().toISOString();
  const commits = run('git log --oneline -5') || 'No git history available';

  // Contar archivos
  const srcFiles = run('find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l')?.trim() || '?';
  const components = run('find src/components -name "*.tsx" 2>/dev/null | wc -l')?.trim() || '?';
  const hooks = run('find src/hooks -name "*.ts" 2>/dev/null | wc -l')?.trim() || '?';
  const tests = run('find src/tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l')?.trim() || '?';

  let content = `# ${packageJson.name || 'People Helm'} - Sistema de Dirección Operativa para Área de Personas

**Last Updated:** ${now}
**Status:** ✅ Development

---

## 🎯 Descripción

SaaS para gestionar proyectos, bloqueos, tareas y generar reportería automática en el área de Personas. Sistema híbrido con vista Kanban + Timeline + Lista para máxima flexibilidad.

---

## 🏗️ Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand + React Query
- **Backend:** Supabase PostgreSQL + Deno Functions (Serverless)
- **Auth:** Supabase Auth (Email/Contraseña MVP)
- **Testing:** Vitest + Playwright
- **Deploy:** Vercel (Frontend) + Supabase (Backend)
- **CI/CD:** GitHub Actions
- **Documentation:** Auto-generated (pre-commit hooks)

---

## 📚 Documentación

- [Arquitectura](./docs/arquitectura.md) — Diagrama y componentes principales
- [Módulos](./docs/modulos.md) — Componentes, hooks, utilidades
- [API Reference](./docs/api-reference.md) — APIs y Supabase Functions
- [Onboarding](./docs/onboarding.md) — Guía para nuevos developers
- [Database Schema](./docs/database/schema.md) — Estructura PostgreSQL
- [Decisiones Técnicas](./docs/decisions.md) — Architecture Decision Records
- [PRD Completo](./Req/02_PRD_COMPLETO.md) — Requisitos funcionales
- [TDD Completo](./Req/03_TDD_COMPLETO.md) — Diseño técnico

---

## 🤖 Agentes Disponibles

| Agente | Responsabilidad | Status |
|--------|-----------------|--------|
| **code-agent** | Features UI + Frontend logic | ✅ Activo |
| **api-agent** | APIs + Supabase Functions | ✅ Activo |
| **data-agent** | BD + Migraciones SQL | ✅ Activo |
| **deploy-agent** | Deployments + CI/CD | ✅ Activo |

---
## Comandos esenciales
- Build: `npm run build`
- Dev: `npm run dev`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`

## Reglas OBLIGATORIAS antes de considerar cualquier tarea completa
1. El código DEBE compilar sin errores con `npm run build`
2. No debe haber errores de TypeScript (`npx tsc --noEmit`)
3. Después de cada cambio significativo, ejecuta `npm run build` para verificar
4. Si `npm run build` falla, corrígelo ANTES de continuar con otra tarea

## Errores comunes a evitar
- No importar módulos que no existen
- No usar `any` como escape a errores de tipos
- No dejar imports sin usar (causa errores en build)
- Verificar que las variables de entorno requeridas estén en `.env.example`

## 📋 Últimas 5 Actualizaciones

\`\`\`
${commits.trim()}
\`\`\`

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos fuente** | ${srcFiles} |
| **Componentes React** | ${components} |
| **Hooks personalizados** | ${hooks} |
| **Tests** | ${tests} |

---

## 🔐 Seguridad

- ✅ Supabase Auth (Email/Contraseña)
- ✅ RBAC: Gerente / Líder Area / Espectador
- ✅ RLS en todas las tablas
- ✅ Zod en cliente y servidor
- ✅ Middleware de protección de rutas

---

*Generado automáticamente por pre-commit hook*
*Última sincronización:* ${now}
`;

  fs.writeFileSync(path.join(ROOT, 'CLAUDE.md'), content);
  log('✅ CLAUDE.md updated');
}

// ─── 5. Actualizar changelog ───────────────────────────────────────────────

function updateChangelog() {
  log('📝 Generating changelog...');
  try {
    const commits = run('git log --oneline -20');
    if (!commits) return;
    const content = `# Changelog\n\n*Auto-generated — do not edit manually*\n\n\`\`\`\n${commits.trim()}\n\`\`\`\n`;
    fs.writeFileSync(path.join(ROOT, 'docs/changelog.md'), content);
    log('✅ docs/changelog.md updated');
  } catch {
    log('⚠️  Changelog skipped (git not available)');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function scanForFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanForFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function extractJsDoc(src) {
  const match = src.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return '';
  return match[0]
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();
}

function extractExports(src) {
  const matches = [...src.matchAll(/export\s+(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/g)];
  return matches.map((m) => m[1]);
}

// ─── Main ─────────────────────────────────────────────────────────────────

generateApiDocs();
generateModuleDocs();
generateSchemaDocs();
updateClaudeContext();
updateChangelog();

log('\n✅ Pre-commit documentation generation complete!');
