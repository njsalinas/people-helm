# 9. ESTRUCTURA DE DIRECTORIOS COMPLETA - CLAUDE PROJECT + NEXT.JS

## 9.0 VISIÓN GENERAL: ESTRUCTURA RAÍZ

```
proyecto-personas/                          # Raíz del proyecto
│
├── 📄 CLAUDE PROJECT CONTEXT (Nivel superior)
│   ├── claude.md                          # Contexto de Claude (AUTO-GENERADO)
│   └── PROMPT_CLAUDE_CODE.md              # Instrucciones de implementación
│
├── 📚 DOCUMENTATION (Nivel superior)
│   ├── docs/                              # Carpeta de documentación (AUTO-GENERADA)
│   ├── req/                               # Carpeta de requisitos (PRD + TDD)
│   └── README.md                          # Overview del proyecto
│
├── ⚙️ CLAUDE PROJECT CONFIGURATION (.claude/)
│   ├── agents/                            # Agentes especializados
│   ├── skills/                            # Áreas de expertise
│   ├── hooks/                             # Automatización de tareas
│   ├── commands/                          # Comandos personalizados
│   ├── rules.yaml                         # Reglas de codificación
│   └── mcp-configs/                       # Configuración MCP servers
│
├── 💻 NEXT.JS SOURCE CODE (src/)
│   ├── app/                               # App Router (Next.js 14)
│   ├── components/                        # Componentes React
│   ├── lib/                               # Lógica compartida
│   ├── hooks/                             # Custom hooks
│   ├── stores/                            # State management (Zustand)
│   ├── types/                             # TypeScript types
│   └── tests/                             # Tests (unit, integration, E2E)
│
├── 🔧 SUPABASE BACKEND (supabase/)
│   ├── functions/                         # Deno serverless functions
│   ├── migrations/                        # SQL migraciones versionadas
│   └── seed/                              # Seed data
│
├── 🔄 CI/CD & AUTOMATION
│   ├── .github/
│   │   ├── workflows/                    # GitHub Actions
│   │   └── scripts/                      # Scripts de automatización
│   ├── .husky/                            # Git hooks
│   ├── scripts/                           # Scripts locales
│   └── .gitlab/ (opcional)
│
├── ⚡ CONFIGURATION & ROOT
│   ├── .claude/                          # (mencionado arriba)
│   ├── .env.local                        # Variables locales (NO COMMITEAR)
│   ├── .env.example                      # Template de .env
│   ├── .gitignore
│   ├── .prettierrc
│   ├── .eslintrc.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── package.json
│   ├── package-lock.json
│   └── public/
│
└── 📦 OUTPUT & ARTIFACTS
    └── dist/, build/
```

---

## 9.1 CLAUDE PROJECT CONTEXT - ARCHIVOS EN RAÍZ

### `claude.md` - Contexto Principal (AUTO-GENERADO en cada commit)

**Ubicación:** `proyecto-personas/claude.md`

**Descripción:**
Archivo único que Claude lee al iniciar. Contiene contexto completo del proyecto, actualizado automáticamente en cada commit.

**Contenido Auto-generado:**
- Descripción del proyecto
- Stack tecnológico
- Enlaces a documentación importante
- 4 Agentes disponibles
- Últimos 5 commits
- TODOs/PRs abiertos
- Métricas (archivos, componentes, tests, cobertura)

**Ejemplo (ver sección 9.9 en TDD_SECCIONES_FALTANTES.md)**

**Generado por:** `.claude/hooks/beforeCommit.js`

---

### `PROMPT_CLAUDE_CODE.md` - Instrucciones de Implementación

**Ubicación:** `proyecto-personas/PROMPT_CLAUDE_CODE.md`

**Descripción:**
Guía completa para Claude Code. Contiene:
- Contexto del proyecto
- Stack tecnológico
- MVP scope
- Orden de implementación (8 fases)
- Convenciones
- Checklist de inicio

**Uso:**
```bash
# Claude Code debe leer este archivo
"Lee PROMPT_CLAUDE_CODE.md y comienza implementación"
```

---

### `README.md` - Overview General

**Ubicación:** `proyecto-personas/README.md`

```markdown
# People Helm - Sistema de Dirección Operativa para Área de Personas

## Descripción Rápida
SaaS para gestionar proyectos, tareas, bloqueos y generar reportería en tiempo real.

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentación
- [Claude Context](./claude.md)
- [PRD Completo](./req/02_PRD_COMPLETO.md)
- [TDD Completo](./req/03_TDD_COMPLETO.md)
- [Documentación](./docs/)

## Stack
- Next.js 14 + TypeScript
- Supabase + Deno Functions
- Zustand + React Query
- Tailwind CSS

## Testing
\`\`\`bash
npm run test          # Unit + Integration
npm run e2e          # E2E tests
npm run test:coverage
\`\`\`
```

---

## 9.2 DOCUMENTACIÓN - CARPETAS EN RAÍZ

### `docs/` - Documentación Viva (AUTO-GENERADA)

**Ubicación:** `proyecto-personas/docs/`

**Estructura completa:**

```
docs/
│
├── 📄 arquitectura.md
│   Descripción: Diagrama de arquitectura + componentes principales
│   Actualizado: En cada commit que modifique componentes
│   Contiene:
│   - Diagrama ASCII de la arquitectura
│   - Flujos de datos principales
│   - Dependencias entre módulos
│   - Decisiones arquitectónicas
│   Auto-generado por: generate-api-docs.js
│
├── 📄 modulos.md
│   Descripción: Referencia de módulos (componentes, hooks, utilidades)
│   Actualizado: En cada commit que agregue/modifique exports
│   Contiene:
│   - Componentes React (props, returns, ejemplos)
│   - Hooks personalizados
│   - Utilidades y funciones
│   Auto-generado por: generate-module-docs.js (extrae TSDoc)
│
├── 📄 api-reference.md
│   Descripción: Referencia de APIs y Supabase Functions
│   Actualizado: En cada commit que modifique APIs
│   Contiene:
│   - Next.js API routes
│   - Supabase Functions
│   - Parámetros y tipos
│   - Ejemplos de uso
│   Auto-generado por: generate-api-docs.js (extrae JSDoc)
│
├── 📄 onboarding.md
│   Descripción: Guía para nuevos developers
│   Actualizado: Manualmente (template + secciones auto-generadas)
│   Contiene:
│   - Setup inicial
│   - Primeras features
│   - Troubleshooting
│   - Convenciones del proyecto
│   Estructura híbrida: manual + auto
│
├── 📄 changelog.md
│   Descripción: Historial de cambios
│   Actualizado: En cada commit
│   Contiene:
│   - Últimos 20 commits (git log --oneline)
│   Auto-generado por: update-claude-context.js
│
├── 📄 decisions.md
│   Descripción: Architecture Decision Records (ADRs)
│   Actualizado: Cuando se toman decisiones técnicas
│   Contiene:
│   - Problema
│   - Solución
│   - Trade-offs
│   - Razones
│
├── 📁 database/
│   │
│   └── 📄 schema.md
│       Descripción: Schema PostgreSQL documentado
│       Actualizado: En cada migración nueva
│       Contiene:
│       - Todas las tablas
│       - Columnas y tipos
│       - Índices y triggers
│       - Relaciones (FKs)
│       Auto-generado por: generate-schema-docs.js
│
└── 📁 guides/
    └── Futuros guías específicas por tema
```

**Generación automática:**
```bash
# Ejecutado en pre-commit hook
npm run docs:generate
```

---

### `req/` - Requisitos y Diseño

**Ubicación:** `proyecto-personas/req/`

**Contenido:**
```
req/
│
├── 📄 02_PRD_COMPLETO.md
│   - Product Requirements Document
│   - Requisitos funcionales completos
│   - Features MVP
│   - Casos de uso
│   - Métricas de éxito
│
└── 📄 03_TDD_COMPLETO.md
    - Technical Design Document
    - Arquitectura técnica
    - Stack tecnológico
    - Modelo de datos (SQL)
    - APIs y Supabase Functions
    - Estructura de directorios completa
    - Testing strategy
    - Security
    - Performance targets
```

**Acceso desde código:**
- Referencia en `claude.md`
- Referencia en `PROMPT_CLAUDE_CODE.md`
- Documento de lectura OBLIGATORIA

---

## 9.3 CLAUDE PROJECT CONFIGURATION - CARPETA `.claude/`

### Estructura Completa de `.claude/`

```
.claude/
│
├── 📁 agents/                             # Definición de agentes
│   ├── code-agent.yaml
│   │   └── Responsable: Features UI + Frontend logic
│   │       - Componentes React
│   │       - Hooks personalizados
│   │       - Validaciones Zod
│   │       - Testing unitario
│   │
│   ├── api-agent.yaml
│   │   └── Responsable: APIs + Supabase Functions
│   │       - Rutas API (Next.js)
│   │       - Funciones serverless (Deno)
│   │       - Validación entrada
│   │       - Manejo de errores
│   │
│   ├── data-agent.yaml
│   │   └── Responsable: BD + Migraciones SQL
│   │       - Schema PostgreSQL
│   │       - Migraciones versionadas
│   │       - Índices y triggers
│   │       - Row-Level Security (RLS)
│   │
│   └── deploy-agent.yaml
│       └── Responsable: Deployments + CI/CD
│           - GitHub Actions
│           - Vercel deployment
│           - Supabase migrations
│           - Documentación auto-generada
│
├── 📁 skills/                             # Áreas de expertise
│   ├── code-quality.yaml
│   │   └── Linting, testing, cobertura, best practices
│   │       Herramientas: ESLint, Prettier, Vitest
│   │       Target: >80% cobertura
│   │
│   ├── database.yaml
│   │   └── PostgreSQL, Supabase, migraciones
│   │       Herramientas: postgresql, supabase-cli, sql-formatter
│   │       Expertise: DDL/DML, índices, triggers, RLS
│   │
│   ├── auth.yaml
│   │   └── Supabase Auth, RBAC, seguridad
│   │       Herramientas: supabase-auth, JWT, middleware
│   │       Expertise: OAuth, RBAC, sesiones
│   │
│   └── deployment.yaml
│       └── Vercel, GitHub Actions, CI/CD
│           Herramientas: vercel-cli, github-actions, husky
│           Expertise: Ambientes, versionado, testing automático
│
├── 📁 hooks/                              # Automatización de tareas
│   ├── onProjectStart.js
│   │   └── Ejecutado: Al iniciar proyecto
│   │       - Validar archivos requeridos
│   │       - Instalar dependencias
│   │       - Setup Husky
│   │       - Crear .env.local
│   │       - Generar documentación inicial
│   │
│   ├── beforeBuild.js
│   │   └── Ejecutado: Antes de build
│   │       - Lint (ESLint)
│   │       - Type check (TypeScript)
│   │       - Tests
│   │
│   ├── beforeCommit.js
│   │   └── Ejecutado: Antes de cada commit (via Husky)
│   │       - Generar API reference
│   │       - Generar module docs
│   │       - Generar schema docs
│   │       - Actualizar claude.md
│   │       - Actualizar changelog
│   │       - Auto-agregar docs/ al commit
│   │
│   └── afterDeploy.js
│       └── Ejecutado: Después de deploy
│           - Health check
│           - Verificar migraciones BD
│           - Reportar métricas
│
├── 📁 commands/                           # Comandos personalizados
│   ├── scaffold.js
│   │   └── Generar componentes/hooks/funciones
│   │       Uso: npm run scaffold:component MyComponent
│   │       Crea: Componente con template base + JSDoc
│   │
│   ├── dbsync.js
│   │   └── Sincronizar schema Supabase
│   │       Uso: npm run supabase:migrate
│   │
│   ├── testenv.js
│   │   └── Preparar ambiente de testing
│   │       Limpia directorios, resetea BD, etc
│   │
│   └── docs-sync.js
│       └── Sincronizar documentación manualmente
│           Uso: npm run docs:generate
│
├── 📄 rules.yaml                          # Reglas de codificación globales
│   ├── naming:
│   │   - PascalCase para componentes
│   │   - camelCase para funciones/hooks
│   │   - UPPER_SNAKE_CASE para constantes
│   │
│   ├── typescript:
│   │   - strict mode
│   │   - noImplicitAny: true
│   │   - strictNullChecks: true
│   │
│   ├── documentation:
│   │   - JSDoc para funciones públicas
│   │   - TSDoc para tipos
│   │   - Comments explican WHY, no WHAT
│   │
│   ├── testing:
│   │   - Cobertura >80%
│   │   - Ubicaciones: unit/, integration/, e2e/
│   │
│   ├── validation:
│   │   - Zod schemas obligatorios
│   │   - Validar cliente y servidor
│   │
│   └── security:
│       - RBAC en rutas autenticadas
│       - HTTPS en producción
│       - XSS protection
│       - Rate limiting
│
└── 📁 mcp-configs/                        # Configuración MCP Servers
    ├── supabase.config.json
    │   └── Credenciales y endpoints de Supabase
    │       - URL
    │       - Anon key
    │       - Service role key
    │
    ├── github.config.json
    │   └── Token de GitHub para automatizaciones
    │
    ├── vercel.config.json
    │   └── Token de Vercel para deployments
    │
    └── npm.config.json
        └── Configuración de npm registry
```

---

### 9.3.1 Detalle: agents/*.yaml

**Archivo: `.claude/agents/code-agent.yaml`**

```yaml
name: Code Agent
description: Responsable de implementar features UI y lógica de frontend
version: 1.0

responsibilities:
  - Crear componentes React con TypeScript strict
  - Implementar hooks personalizados (useProjects, useTareas, useBloqueos, etc)
  - Validaciones con Zod
  - Testing unitario (>80% cobertura)
  - Integración con React Query para data fetching
  - Zustand stores para estado global
  - Tailwind CSS styling (utility-first)
  - Componentes accesibles (a11y)

tools:
  - file-editor
  - code-review
  - run-tests
  - git

constraints:
  - Must use PascalCase for components
  - Must use camelCase for functions/hooks
  - Must follow JSDoc comments (/** ... */)
  - Must use TypeScript strict mode
  - Must include tests with >80% coverage
  - No console.log in production code
  - Validate all inputs with Zod schemas
  - Validate on client AND server
  - No magic numbers (usar constantes)
  - Comments explain WHY, not WHAT

dependencies:
  - none (pero colabora con: api-agent, data-agent)

success_criteria:
  - Tests pasan (>80% coverage)
  - TypeScript strict sin errores
  - ESLint sin warnings
  - Prettier formateado
  - Componentes documentados
  - Accesibilidad validada
```

**Archivo: `.claude/agents/api-agent.yaml`**

```yaml
name: API Agent
description: Responsable de APIs y Supabase Functions
version: 1.0

responsibilities:
  - Crear Supabase Functions (Deno serverless)
  - Implementar Next.js API routes (proxy a functions)
  - Validar entrada con Zod
  - Manejo de errores (try-catch, logging)
  - Invocación de funciones Supabase
  - Integración con cliente Supabase
  - Testing de APIs (integration tests)
  - Monitoreo y alertas

tools:
  - file-editor
  - deno-cli
  - supabase-cli
  - code-review
  - bash

constraints:
  - All inputs must validate with Zod
  - All functions must have JSDoc with @param @returns @throws
  - All errors must be handled and logged
  - All responses must be typed
  - Database transactions where needed
  - Connection pooling for performance
  - Timeout handling (functions max 60s)
  - No blocking operations
  - Use async/await pattern

dependencies:
  - data-agent (para cambios BD)
  - code-agent (para componentes que consumen las APIs)

success_criteria:
  - API routes responden correctamente
  - Funciones Supabase testeadas
  - Validaciones funcionales
  - Errors propios y descriptivos
  - Documentación JSDoc completa
  - Tests de integración pasan
```

**Archivo: `.claude/agents/data-agent.yaml`**

```yaml
name: Data Agent
description: Expertise en PostgreSQL, Supabase, migraciones
version: 1.0

responsibilities:
  - Diseñar schema PostgreSQL (normalization, relationships)
  - Crear migraciones SQL versionadas
  - Crear índices para queries frecuentes
  - Crear triggers para auditoría
  - Row-Level Security (RLS) policies
  - Query optimization
  - Seed data para testing
  - Documentación de schema

tools:
  - sql-formatter
  - supabase-cli
  - migration-generator
  - code-review
  - bash

constraints:
  - One change per migration file (001, 002, 003...)
  - Migration order: usuarios → proyectos → tareas → bloqueos → riesgos → comentarios → historial → semaforos → notificaciones_config
  - All tables MUST have: id, created_at, updated_at, created_by, updated_by
  - All FKs MUST have ON DELETE CASCADE where appropriate
  - All FKs MUST be indexed
  - Frequently queried columns MUST be indexed
  - Use descriptive names (snake_case)
  - Migrations must be idempotent (IF NOT EXISTS)
  - Seed data MUST include realistic test data
  - RLS policies MUST follow least privilege

dependencies:
  - none (pero impacta: api-agent, code-agent)

success_criteria:
  - Migraciones aplican sin errores
  - Schema está normalizado
  - Índices optimizan queries
  - RLS policies están correctas
  - Seed data funciona
  - Schema está documentado
```

**Archivo: `.claude/agents/deploy-agent.yaml`**

```yaml
name: Deploy Agent
description: Responsable de deployments y CI/CD
version: 1.0

responsibilities:
  - Crear y mantener GitHub Actions workflows
  - Vercel deployments (Frontend)
  - Supabase migrations (Backend)
  - Database backups
  - Environment variables en cada ambiente
  - Pre-commit hooks (Husky)
  - Documentación auto-generada
  - Monitoring y alertas
  - Rollback procedures

tools:
  - github-actions
  - vercel-cli
  - supabase-cli
  - bash
  - code-review

constraints:
  - CI/CD MUST run tests before deploy
  - MUST validate all migrations before apply
  - MUST auto-generate documentation on every commit
  - MUST use semantic versioning for tags (v0.1.0, etc)
  - MUST have separate environments (dev, staging, prod)
  - MUST backup BD before migrations
  - Deployments MUST be automatic on main branch
  - Preview deployments for PRs

dependencies:
  - code-agent (tests deben pasar)
  - data-agent (migraciones deben validarse)
  - api-agent (APIs deben deployarse)

success_criteria:
  - GitHub Actions workflows corren
  - Tests pasan antes de deploy
  - Migraciones aplican correctamente
  - Documentación auto-actualiza
  - Deployments son automáticos
  - Ambientes están aislados
  - Rollback procedures funcionan
```

---

### 9.3.2 Detalle: skills/*.yaml

**Archivo: `.claude/skills/code-quality.yaml`**

```yaml
name: Code Quality Skill
description: Linting, testing, coverage, best practices
version: 1.0

expertise:
  - ESLint configuration y rules
  - Prettier formatting
  - Vitest unit testing
  - Testing best practices
  - Type safety (TypeScript strict)
  - Code coverage analysis (>80% target)
  - No console.log in production
  - Zod schema validation
  - Accessibility (a11y) standards
  - Performance optimization

tools:
  - eslint
  - prettier
  - vitest
  - @vitest/coverage-v8
  - typescript
  - @testing-library/react
  - axe-accessibility

knowledge_base:
  - ESLint best practices
  - Testing patterns
  - Coverage targets
  - Performance metrics
  - a11y WCAG 2.1 AA

dependencies:
  - code-agent
```

**Archivo: `.claude/skills/database.yaml`**

```yaml
name: Database Skill
description: PostgreSQL, Supabase, schema design, migrations
version: 1.0

expertise:
  - PostgreSQL DDL (CREATE TABLE, ALTER, etc)
  - PostgreSQL DML (INSERT, UPDATE, DELETE, SELECT)
  - Schema design (normalization, 3NF)
  - Foreign keys, constraints, checks
  - Indexes (B-tree, unique, partial)
  - Triggers (BEFORE/AFTER, FOR EACH ROW)
  - Functions (PL/pgSQL)
  - Row-Level Security (RLS)
  - Query optimization
  - EXPLAIN ANALYZE
  - Seed data creation
  - Migration strategies

tools:
  - postgresql
  - supabase-cli
  - sql-formatter
  - pgAdmin (opcional)

knowledge_base:
  - PostgreSQL documentation
  - Query optimization techniques
  - Migration best practices
  - RLS security patterns
  - Normalization rules

dependencies:
  - data-agent
```

**Archivo: `.claude/skills/auth.yaml`**

```yaml
name: Auth Skill
description: Supabase Auth, RBAC, sessions, security
version: 1.0

expertise:
  - Supabase Auth setup (Email/Contraseña MVP, Azure AD futuro)
  - JWT tokens generation y validation
  - RBAC (Role-Based Access Control)
  - 3 roles: Gerente, Líder Area, Espectador
  - Middleware RBAC validation
  - Session management (expiration, refresh)
  - Secure password handling
  - OAuth flows (futuro)
  - Security headers

tools:
  - supabase-auth
  - jsonwebtoken (JWT)
  - next/middleware
  - bcryptjs (hashing)

knowledge_base:
  - Authentication best practices
  - RBAC patterns
  - JWT security
  - OAuth 2.0 flows
  - Session management

dependencies:
  - api-agent
  - code-agent
```

**Archivo: `.claude/skills/deployment.yaml`**

```yaml
name: Deployment Skill
description: Vercel, GitHub Actions, CI/CD, environments
version: 1.0

expertise:
  - Vercel deployment (Next.js)
  - GitHub Actions workflows
  - Environment configuration (.env)
  - Pre-commit hooks (Husky)
  - Semantic versioning (SemVer)
  - Automated testing
  - Automated documentation
  - Monitoring y logging
  - Performance monitoring
  - Error tracking

tools:
  - vercel-cli
  - github-actions
  - husky
  - lint-staged
  - sentry (error tracking)
  - datadog (monitoring, opcional)

knowledge_base:
  - GitHub Actions syntax
  - Vercel deployment process
  - CI/CD best practices
  - Environment management
  - SemVer conventions

dependencies:
  - deploy-agent
```

---

### 9.3.3 Detalle: hooks/*.js

Ver archivo **TDD_SECCIONES_FALTANTES.md - sección 9.6** para contenido completo de:
- `onProjectStart.js`
- `beforeBuild.js`
- `beforeCommit.js`
- `afterDeploy.js`

---

### 9.3.4 Detalle: commands/*.js

Ver archivo **TDD_SECCIONES_FALTANTES.md - sección 9.6** para contenido completo de:
- `scaffold.js` - Generar componentes/hooks
- `dbsync.js` - Sincronizar BD
- `testenv.js` - Preparar testing
- `docs-sync.js` - Sincronizar documentación

---

### 9.3.5 Archivo: rules.yaml - Reglas Globales

```yaml
# PEOPLE HELM - REGLAS DE CODIFICACIÓN GLOBALES

naming:
  components: PascalCase
    ejemplo: VistaGerencial.tsx, KanbanBoard.tsx, TaskCard.tsx
  
  functions: camelCase
    ejemplo: useProjects, calculateColor, fetchData
  
  constants: UPPER_SNAKE_CASE
    ejemplo: DEFAULT_PAGE_SIZE, MAX_RETRIES, API_TIMEOUT
  
  types: PascalCase
    ejemplo: ProjectType, TaskState, UserRole
  
  variables: camelCase
    ejemplo: projectName, isLoading, userData
  
  database: snake_case
    ejemplo: created_at, user_id, proyecto_nombre

typescript:
  mode: strict
  noImplicitAny: true
  strictNullChecks: true
  strictFunctionTypes: true
  strictBindCallApply: true
  noImplicitThis: true
  noUnusedLocals: true
  noUnusedParameters: true
  noImplicitReturns: true
  noFallthroughCasesInSwitch: true

documentation:
  jsdoc: required for all public functions/exports
  tsdoc: required for types and interfaces
  comments: explain WHY, not WHAT (code explains WHAT)
  examples: required for complex functions
  param_types: always specify (even with TypeScript)
  return_types: always specify (even with TypeScript)
  
  jsdoc_template: |
    /**
     * Brief description of function
     * @param {Type} paramName - Description
     * @returns {Type} Description
     * @throws {ErrorType} Description
     * @example
     * const result = myFunction(param);
     */

testing:
  coverage: >80% (target)
  unit: src/tests/unit/
  integration: src/tests/integration/
  e2e: src/tests/e2e/
  naming_pattern: "*.test.ts" o "*.spec.ts"

validation:
  zod: required for all inputs
  client_validation: before sending data
  server_validation: validate again on receive
  error_handling: descriptive error messages
  no_magic_strings: use constants

security:
  rbac: required for authenticated routes
    roles: [Gerente, Líder Area, Espectador]
  https: required in production
  sanitize: XSS protection on outputs
  rateLimit: 100 requests/minute per user
  headers: CSP, HSTS, X-Frame-Options
  secrets: never in code, use .env

formatting:
  max_line_length: 100 characters
  indent: 2 spaces
  quotes: single quotes (') para strings
  semicolons: siempre
  trailing_commas: es5 (arrays, objects)

imports:
  absolute_imports: true (configurado en tsconfig)
  path_aliases: use @/ para src/
  tree_shaking: named imports preferibles

git:
  commit_convention: Conventional Commits
    formato: type(scope): subject
    tipos: feat, fix, refactor, test, docs, chore, perf, ci
  branch_naming: feature/, bugfix/, docs/, etc
  pr_required: yes, al menos 1 approval
  tests_required: must pass before merge
```

---

### 9.3.6 Carpeta: mcp-configs/

**Archivo: `.claude/mcp-configs/supabase.config.json`**

```json
{
  "name": "supabase",
  "type": "rest_api",
  "baseUrl": "${SUPABASE_URL}",
  "credentials": {
    "anonKey": "${SUPABASE_ANON_KEY}",
    "serviceRoleKey": "${SUPABASE_SERVICE_ROLE_KEY}"
  },
  "endpoints": {
    "auth": "/auth/v1",
    "rest": "/rest/v1",
    "functions": "/functions/v1",
    "storage": "/storage/v1"
  }
}
```

**Archivo: `.claude/mcp-configs/github.config.json`**

```json
{
  "name": "github",
  "type": "oauth",
  "token": "${GITHUB_TOKEN}",
  "repository": "org/proyecto-personas",
  "workflows": [
    {
      "name": "test.yml",
      "trigger": "on push to main"
    },
    {
      "name": "deploy.yml",
      "trigger": "on push to main"
    }
  ]
}
```

**Archivo: `.claude/mcp-configs/vercel.config.json`**

```json
{
  "name": "vercel",
  "type": "api",
  "token": "${VERCEL_TOKEN}",
  "projectId": "${VERCEL_PROJECT_ID}",
  "environments": {
    "production": {
      "url": "https://people-helm.vercel.app"
    },
    "preview": {
      "pattern": "https://*.people-helm.vercel.app"
    }
  }
}
```

**Archivo: `.claude/mcp-configs/npm.config.json`**

```json
{
  "name": "npm",
  "type": "package_manager",
  "registry": "https://registry.npmjs.org",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest run",
    "docs:generate": "node scripts/docs-generator.js"
  }
}
```

---

## 9.4 NEXT.JS SOURCE CODE - CARPETA `src/`

Ver **estructura en TDD sección 9** para detalles completos de:
- `src/app/` - App Router
- `src/components/` - Componentes React
- `src/lib/` - Lógica compartida
- `src/hooks/` - Custom hooks
- `src/stores/` - Zustand stores
- `src/types/` - TypeScript types
- `src/tests/` - Tests

---

## 9.5 SUPABASE BACKEND - CARPETA `supabase/`

```
supabase/
│
├── 📁 functions/                          # Deno serverless functions
│   ├── crear-proyecto/
│   │   ├── index.ts                      # Código principal (Deno)
│   │   └── deno.json                     # Dependencias de la función
│   │
│   ├── actualizar-estado/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── crear-tarea/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── actualizar-tarea-estado/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── registrar-bloqueo/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── generar-semaforo/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── enviar-notificacion/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   ├── exportar-pdf/
│   │   ├── index.ts
│   │   └── deno.json
│   │
│   └── recalcular-avance-proyecto/
│       ├── index.ts
│       └── deno.json
│
├── 📁 migrations/                         # SQL migraciones versionadas
│   ├── 001_crear_tabla_usuarios.sql
│   ├── 002_crear_tabla_proyectos.sql
│   ├── 003_crear_tabla_tareas.sql
│   ├── 004_crear_tabla_bloqueos.sql
│   ├── 005_crear_tabla_riesgos.sql
│   ├── 006_crear_tabla_comentarios.sql
│   ├── 007_crear_tabla_historial_cambios.sql
│   ├── 008_crear_tabla_semaforos.sql
│   ├── 009_crear_tabla_notificaciones_config.sql
│   └── 010_crear_indices_y_triggers.sql
│
└── 📁 seed/
    └── seed.sql                          # Datos iniciales para testing
```

---

## 9.6 CI/CD & AUTOMATION

```
.github/
│
├── 📁 workflows/                          # GitHub Actions
│   ├── test.yml                          # Tests en cada PR
│   ├── deploy.yml                        # Deploy automático a Vercel
│   └── db-migrate.yml                    # Migraciones Supabase
│
└── 📁 scripts/
    ├── generate-api-docs.js              # Generar API reference
    ├── generate-schema-docs.js           # Generar schema.md
    ├── generate-module-docs.js           # Generar modulos.md
    └── update-claude-context.js          # Actualizar claude.md

.husky/
└── pre-commit                            # Git hook: ejecutar beforeCommit.js

scripts/
├── pre-commit.js                         # Git hook local
├── post-merge.js                         # Después de merge
└── docs-generator.js                     # Generador universal de docs
```

---

## 9.7 CONFIGURATION & ROOT FILES

```
Configuración:
├── .env.local                            # Variables locales (NO COMMITEAR)
├── .env.example                          # Template
├── .gitignore                            # Archivos ignorados
├── .prettierrc                           # Prettier config
├── .eslintrc.json                        # ESLint config

Next.js & Build:
├── next.config.js                        # Next.js configuración
├── tsconfig.json                         # TypeScript config
├── tailwind.config.ts                    # Tailwind config
├── postcss.config.js                     # PostCSS config

Testing:
├── vitest.config.ts                      # Vitest config
└── playwright.config.ts                  # Playwright config

Package Management:
├── package.json                          # Dependencias + scripts
└── package-lock.json                     # Lock file

Public Assets:
└── public/
    ├── favicon.ico
    ├── icons/
    ├── images/
    └── logos/
```

---

## 📌 RESUMEN: ARCHIVOS CRÍTICOS POR CATEGORÍA

### **CLAUDE PROJECT (Lo que lee Claude)**
✅ `claude.md` - Contexto actual (auto-generado)
✅ `PROMPT_CLAUDE_CODE.md` - Instrucciones
✅ `.claude/agents/*.yaml` - Definición de agentes
✅ `.claude/skills/*.yaml` - Áreas de expertise
✅ `.claude/rules.yaml` - Convenciones
✅ `.claude/hooks/*.js` - Automatización

### **DOCUMENTACIÓN (Referencia)**
✅ `docs/` - Documentación viva (auto-generada)
✅ `req/02_PRD_COMPLETO.md` - Requisitos
✅ `req/03_TDD_COMPLETO.md` - Diseño técnico
✅ `README.md` - Overview

### **CÓDIGO (Implementación)**
✅ `src/app/` - Next.js pages
✅ `src/components/` - React components
✅ `src/lib/` - Shared logic
✅ `supabase/functions/` - Serverless backend
✅ `supabase/migrations/` - Database schema

### **CONFIGURACIÓN (Setup)**
✅ `package.json` - Scripts + dependencies
✅ `.env.local` - Local variables
✅ `.eslintrc.json` - Linting rules
✅ `tsconfig.json` - TypeScript config
✅ `.husky/pre-commit` - Git hooks

### **CI/CD (Automatización)**
✅ `.github/workflows/` - GitHub Actions
✅ `scripts/` - Build scripts
✅ `.claude/hooks/` - Pre-commit hooks

---

**Documento completo con TODAS las carpetas, archivos y configuraciones del Claude Project.**

¿Necesitas expandir alguna sección específica o está listo para la implementación? ✅
