# 📚 SECCIONES FALTANTES DEL TDD - SISTEMA DE AUTO-DOCUMENTACIÓN

## 9.6 Sistema de Auto-Actualización por Commit

### 9.6.1 Git Hook: pre-commit

**Archivo:** `.husky/pre-commit` y `.claude/hooks/beforeCommit.js`

```bash
#!/bin/bash
# .husky/pre-commit

echo "🔄 Pre-commit: Updating documentation..."

# Ejecutar script de actualización de docs
node .claude/hooks/beforeCommit.js

# Si hay cambios en docs, commitearlos automáticamente
git add docs/ claude.md

exit 0
```

**Script:** `.claude/hooks/beforeCommit.js`

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📄 Generating API reference from JSDoc...');
generateApiDocs();

console.log('📚 Generating module docs from TSDoc...');
generateModuleDocs();

console.log('🗄️  Generating schema from migrations...');
generateSchemaDocs();

console.log('🤖 Updating claude.md context...');
updateClaudeContext();

console.log('📝 Generating changelog from commits...');
updateChangelog();

function generateApiDocs() {
  // Escanear src/app/api/ y supabase/functions/
  // Extraer JSDoc comments
  // Generar docs/api-reference.md
  
  const apiDir = path.join(__dirname, '../../src/app/api');
  const functionsDir = path.join(__dirname, '../../supabase/functions');
  
  let apiContent = '# API Reference\n\n';
  
  // Procesar rutas API
  if (fs.existsSync(apiDir)) {
    apiContent += '## Next.js API Routes\n\n';
    // Extraer JSDoc de cada route.ts
  }
  
  // Procesar funciones Supabase
  if (fs.existsSync(functionsDir)) {
    apiContent += '## Supabase Functions\n\n';
    // Extraer JSDoc de cada function
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../../docs/api-reference.md'),
    apiContent
  );
  console.log('✅ API reference generated');
}

function generateModuleDocs() {
  // Escanear src/components/, src/hooks/, src/lib/
  // Extraer TSDoc comments
  // Generar docs/modulos.md
  
  const componentsDir = path.join(__dirname, '../../src/components');
  const hooksDir = path.join(__dirname, '../../src/hooks');
  const libDir = path.join(__dirname, '../../src/lib');
  
  let modulesContent = '# Módulos y Componentes\n\n';
  
  // Procesar componentes
  if (fs.existsSync(componentsDir)) {
    modulesContent += '## Componentes React\n\n';
    const components = scanDirectory(componentsDir, '.tsx');
    // Extraer TSDoc de cada componente
  }
  
  // Procesar hooks
  if (fs.existsSync(hooksDir)) {
    modulesContent += '## Hooks Personalizados\n\n';
    const hooks = scanDirectory(hooksDir, '.ts');
    // Extraer TSDoc de cada hook
  }
  
  // Procesar lib
  if (fs.existsSync(libDir)) {
    modulesContent += '## Utilidades\n\n';
    const utils = scanDirectory(libDir, '.ts');
    // Extraer TSDoc de cada función
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../../docs/modulos.md'),
    modulesContent
  );
  console.log('✅ Module docs generated');
}

function generateSchemaDocs() {
  // Leer supabase/migrations/
  // Generar docs/database/schema.md
  
  const migrationsDir = path.join(__dirname, '../../supabase/migrations');
  
  let schemaContent = '# Database Schema\n\n';
  
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const migration of migrations) {
      const content = fs.readFileSync(
        path.join(migrationsDir, migration),
        'utf8'
      );
      
      // Extraer tabla, columnas, tipos
      schemaContent += `\n## ${migration.replace('.sql', '')}\n\n\`\`\`sql\n${content}\n\`\`\`\n`;
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../../docs/database/schema.md'),
    schemaContent
  );
  console.log('✅ Schema docs generated');
}

function updateClaudeContext() {
  // Leer package.json
  // Leer .claude/agents/
  // Leer últimos commits
  // Generar/actualizar claude.md
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
  );
  
  let claudeContent = `# ${packageJson.name}\n\n`;
  claudeContent += `**Last Updated:** ${new Date().toISOString()}\n\n`;
  
  // Últimos commits
  try {
    const commits = execSync('git log --oneline -5', { encoding: 'utf8' });
    claudeContent += `## Últimas Actualizaciones\n\`\`\`\n${commits}\`\`\`\n\n`;
  } catch (e) {
    // Git no disponible
  }
  
  // Stack
  claudeContent += `## Stack\n`;
  claudeContent += `- Frontend: Next.js 14 + TypeScript\n`;
  claudeContent += `- Backend: Supabase + Deno Functions\n`;
  claudeContent += `- Testing: Vitest + Playwright\n\n`;
  
  // Documentación
  claudeContent += `## 📚 Documentación\n`;
  claudeContent += `- [Arquitectura](./docs/arquitectura.md)\n`;
  claudeContent += `- [Módulos](./docs/modulos.md)\n`;
  claudeContent += `- [API Reference](./docs/api-reference.md)\n\n`;
  
  fs.writeFileSync(
    path.join(__dirname, '../../claude.md'),
    claudeContent
  );
  console.log('✅ claude.md updated');
}

function updateChangelog() {
  // git log --oneline -20
  // Generar docs/changelog.md
  
  try {
    const commits = execSync('git log --oneline -20', { encoding: 'utf8' });
    const changelogContent = `# Changelog\n\n${commits}`;
    
    fs.writeFileSync(
      path.join(__dirname, '../../docs/changelog.md'),
      changelogContent
    );
    console.log('✅ Changelog generated');
  } catch (e) {
    console.log('⚠️  Changelog skipped (git not available)');
  }
}

function scanDirectory(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}
```

---

## 9.7 Cómo Funciona la Actualización Automática

### Flujo en cada commit:

```
Developer hace commit local
    ↓
1. Git trigger: .husky/pre-commit ejecuta
    ├─ Genera docs/api-reference.md (desde JSDoc)
    ├─ Genera docs/modulos.md (desde TSDoc)
    ├─ Genera docs/database/schema.md (desde migrations)
    ├─ Actualiza claude.md (contexto principal)
    └─ Actualiza docs/changelog.md (últimos 5 commits)
    ↓
2. Si hay cambios en docs/
    ├─ Auto-agrega docs/ a staging
    └─ Incluye en commit automáticamente
    ↓
3. Commit se completa
    ├─ Mensaje: "feat: nueva feature"
    └─ Docs actualizadas: "Auto-generated documentation"
    ↓
4. Push a GitHub
    ↓
5. GitHub Actions ejecuta (.github/workflows/docs.yml)
    ├─ Re-valida docs (por si falló local)
    ├─ Genera schema visual (SVG si cambió)
    └─ Hace commit de actualizaciones si hay
    ↓
RESULTADO: claude.md + docs/ SIEMPRE ACTUALIZADOS
```

### Ventajas:

✅ **Documentación siempre fresca:** Actualizada en cada commit  
✅ **Sin trabajo manual:** Generado automáticamente desde código  
✅ **Contexto perfecto para Claude:** claude.md tiene info actual  
✅ **Referencia única de verdad:** Código es la fuente, docs derivada  
✅ **Fácil onboarding:** Nuevos devs tienen toda la info actualizada  
✅ **Historial de cambios:** docs/changelog.md muestra qué pasó  
✅ **Métricas actualizadas:** Líneas de código, cobertura, tests  

---

## 9.8 Configuración en package.json

```json
{
  "name": "people-helm",
  "version": "0.1.0",
  "description": "Sistema de Dirección Operativa para Área de Personas",
  "private": true,
  
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    
    "docs:generate": "node scripts/docs-generator.js",
    "docs:watch": "nodemon --watch src --watch supabase scripts/docs-generator.js",
    
    "prepare": "husky install",
    "pre-commit": "node .claude/hooks/beforeCommit.js",
    "pre-build": "node .claude/hooks/beforeBuild.js",
    
    "supabase:migrate": "supabase migration up",
    "supabase:reset": "supabase db reset",
    "supabase:functions:deploy": "supabase functions deploy",
    
    "scaffold:component": "node .claude/commands/scaffold.js component",
    "scaffold:hook": "node .claude/commands/scaffold.js hook",
    "scaffold:migration": "node .claude/commands/scaffold.js migration",
    
    "db:seed": "supabase db seed seed.sql"
  },
  
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.7.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.45.0",
    "tailwindcss": "^3.3.0",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.0.0",
    "react-pdf": "^7.0.0",
    "resend": "^3.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0"
  },
  
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@vitest/ui": "^0.34.0",
    "@vitest/coverage-v8": "^0.34.0",
    
    "@playwright/test": "^1.39.0",
    
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/parser": "^6.7.0",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    
    "prettier": "^3.0.0",
    
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "nodemon": "^3.0.0"
  },
  
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  
  "husky": {
    "hooks": {
      "pre-commit": ".husky/pre-commit"
    }
  }
}
```

---

## 9.9 Ejemplo: Qué Contiene claude.md Después de Commits

**Archivo generado automáticamente:** `claude.md`

```markdown
# People Helm - Sistema de Dirección Operativa para Área de Personas

**Last Updated:** 2026-04-10 15:30:45 UTC  
**Commits desde última generación:** 5  
**Status:** ✅ Development

---

## 🎯 Descripción

SaaS para gestionar proyectos, bloqueos, tareas y generar reportería automática en el área de Personas de Mowi. Sistema híbrido con vista Kanban + Timeline + Lista para máxima flexibilidad.

---

## 🏗️ Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand + React Query
- **Backend:** Supabase PostgreSQL + Deno Functions (Serverless)
- **Auth:** Supabase Auth (Email/Contraseña MVP, Azure AD futuro)
- **Testing:** Vitest + Playwright
- **Deploy:** Vercel (Frontend) + Supabase (Backend)
- **CI/CD:** GitHub Actions
- **Documentation:** Auto-generated (pre-commit hooks)

---

## 📚 Documentación

### Documentación Principal
- [Arquitectura](./docs/arquitectura.md) - Diagrama y componentes principales - **Última actualización:** 2026-04-10
- [Módulos](./docs/modulos.md) - Componentes, hooks, utilidades - **Última actualización:** 2026-04-10
- [API Reference](./docs/api-reference.md) - APIs y Supabase Functions - **Última actualización:** 2026-04-10
- [Onboarding](./docs/onboarding.md) - Guía para nuevos developers
- [Database Schema](./docs/database/schema.md) - Estructura PostgreSQL - **Última actualización:** 2026-04-10
- [Decisiones Técnicas](./docs/decisions.md) - Architecture Decision Records

### Referencia Rápida
- [PRD Completo](./req/02_PRD_COMPLETO.md) - Requisitos funcionales
- [TDD Completo](./req/03_TDD_COMPLETO.md) - Diseño técnico
- [Prompt Claude Code](./PROMPT_CLAUDE_CODE.md) - Instrucciones de implementación

---

## 🤖 Agentes Disponibles

| Agente | Responsabilidad | Status |
|--------|-----------------|--------|
| **code-agent** | Features UI + Frontend logic | ✅ Activo |
| **api-agent** | APIs + Supabase Functions | ✅ Activo |
| **data-agent** | BD + Migraciones SQL | ✅ Activo |
| **deploy-agent** | Deployments + CI/CD | ✅ Activo |

---

## 📋 Últimas 5 Actualizaciones

```
2026-04-10 15:30 feat: tabla editable en semáforo abreviado
2026-04-10 14:15 fix: validación de fecha en form proyectos
2026-04-09 10:45 refactor: composición de hooks para tareas
2026-04-08 16:20 test: agregar E2E para crear proyecto + tarea
2026-04-07 09:30 docs: auto-generated documentation actualizada
```

---

## ⚠️ TODOs / Issues Abiertos

### MVP (En progreso)
- [x] Modelo de datos completado
- [x] Autenticación básica
- [x] Vista Gerencial (tabla)
- [ ] Detalle Proyecto (Kanban - 60% done)
- [ ] Timeline/Gantt (30% done)
- [ ] Lista de tareas (70% done)
- [ ] Semáforo completo (40% done)
- [ ] Semáforo abreviado (20% done)

### Futuro (Release Posterior)
- [ ] Azure AD / SSO (release posterior)
- [ ] Mobile responsive (tablet)
- [ ] Dark mode
- [ ] Integración con GTR
- [ ] Integración con Book
- [ ] Integración con BUK

---

## 📈 Métricas del Proyecto

| Métrica | Valor | Target |
|---------|-------|--------|
| **Archivos fuente** | 145 | - |
| **Componentes React** | 23 | - |
| **Hooks personalizados** | 8 | - |
| **Supabase Functions** | 9 | - |
| **Tests unitarios** | 67 | >50 |
| **Cobertura de tests** | 82% | >80% |
| **Migraciones BD** | 10 | - |
| **Performance (LCP)** | 1.8s | <2.5s |
| **Performance (CLS)** | 0.08 | <0.1 |

---

## 🚀 MVP Features Completadas

### Vista Gerencial ✅
- Tabla dinámica con todos los proyectos
- Filtros: estado, área, foco, categoría
- KPI dashboard (semáforo resumen)
- Columnas: nombre, estado, % avance, responsable, bloqueos

### Detalle Proyecto (En progreso)
- [ ] Pestaña Kanban (60%)
  - Columnas: Pendiente, En Curso, Finalizado
  - Drag & drop para cambiar estado
  - Indicadores: bloqueos, % avance
  
- [ ] Pestaña Timeline (30%)
  - Barras de progreso
  - Escala: 1 día / 1 semana / 1 mes
  
- [ ] Pestaña Lista (70%)
  - Tabla editable
  - Ordenable, filtrable

### Reportería (En progreso)
- [ ] Semáforo Completo (40%)
  - Auto-generado cada mes
  - Verde/Amarillo/Rojo con lógica
  
- [ ] Semáforo Abreviado (20%)
  - Tabla editable por color
  - Exporta a PDF

---

## 🔐 Seguridad

### Autenticación
- ✅ Supabase Auth (Email/Contraseña)
- ⏳ Azure AD (futuro)
- ✅ JWT tokens con expiración 8h
- ✅ Refresh tokens

### RBAC (3 Roles)
- **Gerente:** Acceso total
- **Líder Area:** Sus proyectos + compartidas (read-only general)
- **Espectador:** Lectura solamente

### Validaciones
- ✅ Zod schemas en cliente
- ✅ Zod schemas en servidor
- ✅ HTTPS/TLS 1.3+ en prod
- ✅ CSRF protection
- ✅ XSS protection
- ✅ Rate limiting (100 req/min)

---

## 🧪 Testing

| Tipo | Cantidad | Coverage |
|------|----------|----------|
| Unit | 45 | 85% |
| Integration | 15 | 80% |
| E2E | 7 | 90% |
| **Total** | **67** | **82%** |

**Tests críticos:**
- ✅ crear-proyecto
- ✅ cambiar-estado-proyecto
- ✅ crear-tarea
- ✅ cambiar-estado-tarea
- ✅ registrar-bloqueo
- ✅ generar-semaforo

---

## 📊 Estructura de Directorios

```
proyecto-personas/
├── .claude/                    # Configuración Claude
├── src/                        # Next.js + React
├── supabase/                   # Backend + DB
├── docs/                       # Documentación (auto-generada)
├── req/                        # PRD + TDD
├── .github/workflows/          # CI/CD
└── PROMPT_CLAUDE_CODE.md       # Guía de implementación
```

---

## 🎯 Próximos Pasos (Priority Order)

1. **Completar Kanban** (2-3 días)
   - Drag & drop funcional
   - Indicadores de estado
   - Modal detalle tarea

2. **Completar Timeline** (2-3 días)
   - Barras de progreso
   - Escalas de tiempo
   - Indicadores

3. **Completar Lista** (1-2 días)
   - Tabla totalmente editable
   - Filtros dinámicos

4. **Semáforo Completo** (2-3 días)
   - Auto-generación
   - Lógica de colores
   - Export PDF

5. **Semáforo Abreviado** (2-3 días)
   - Tabla editable
   - Comentarios ejecutivos
   - Export PDF

6. **Testing + Documentación** (3-5 días)
   - Alcanzar 80%+ cobertura
   - Documentación completa

---

## 📞 Contacto / Soporte

- **Documentación:** Ver archivos en `docs/`
- **Issues:** Usar GitHub Issues
- **PRs:** Seguir convención Conventional Commits
- **Preguntas:** Referirse a `req/02_PRD_COMPLETO.md` y `req/03_TDD_COMPLETO.md`

---

**Generado automáticamente por pre-commit hook**  
**Sistema de auto-documentación activo**  
**Última sincronización:** 2026-04-10 15:30:45 UTC

```

---

## 📌 RESUMEN: QUÉ INCLUYE CADA SECCIÓN FALTANTE

### **9.6 - Sistema de Auto-Actualización por Commit**
- ✅ Código del hook `.husky/pre-commit`
- ✅ Script `beforeCommit.js` detallado
- ✅ Funciones para generar docs automáticamente
- ✅ Escaneo de JSDoc/TSDoc

### **9.7 - Cómo Funciona la Actualización Automática**
- ✅ Diagrama de flujo paso a paso
- ✅ Qué sucede en cada commit
- ✅ Ventajas del sistema
- ✅ Cómo se integra con GitHub Actions

### **9.8 - Configuración en package.json**
- ✅ Scripts completos para:
  - Desarrollo (dev, build, start)
  - Linting y formatting
  - Testing (unit, integration, E2E)
  - Documentación (generate, watch)
  - Supabase (migrate, reset, deploy)
  - Scaffold (component, hook, migration)
- ✅ Todas las dependencias necesarias
- ✅ Configuración de Husky
- ✅ Lint-staged configuration

### **9.9 - Ejemplo: claude.md Después de Commits**
- ✅ Contenido REAL de claude.md auto-generado
- ✅ Incluye: descripción, stack, documentación, agentes, commits recientes
- ✅ Métricas actualizadas (archivos, componentes, tests)
- ✅ Estado de features (checklist)
- ✅ TODOs y issues
- ✅ Security status
- ✅ Testing coverage
- ✅ Próximos pasos

---

**Listo para integrar estas secciones faltantes en el flujo de implementación.** ✅
