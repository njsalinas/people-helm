# Manual de Configuración — People Helm

Guía completa para configurar el proyecto desde cero: Supabase, GitHub, Vercel, Resend, y la infraestructura de Claude Project.

---

## Índice

1. [Prerequisitos](#1-prerequisitos)
2. [Configuración Supabase](#2-configuración-supabase)
3. [Configuración GitHub](#3-configuración-github)
4. [Configuración Vercel](#4
-configuración-vercel)
5. [Configuración Resend (Email)](#5-configuración-resend-email)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Primer Deploy](#7-primer-deploy)
8. [Claude Project — Cómo funciona](#8-claude-project--cómo-funciona)
   - [agents/](#81-agents)
   - [skills/](#82-skills)
   - [hooks/](#83-hooks)
   - [commands/](#84-commands)
   - [mcp-configs/](#85-mcp-configs)
   - [rules.yaml](#86-rulesyaml)
9. [Flujo de trabajo diario](#9-flujo-de-trabajo-diario)

---

## 1. Prerequisitos

| Herramienta | Versión mínima | Instalación |
|-------------|---------------|-------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | incluido con Node |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Supabase CLI | latest | `npm i -g supabase` |
| Vercel CLI | latest | `npm i -g vercel` |

---

## 2. Configuración Supabase

### 2.1 Crear proyecto

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir organización y rellenar:
   - **Name:** `people-helm`
   - **Database Password:** guardar en lugar seguro
   - **Region:** South America (sa-east-1) — más cercano a Chile
3. Esperar ~2 minutos a que el proyecto esté listo

### 2.2 Obtener credenciales

En **Settings → API**:

| Variable | Dónde encontrarla |
|----------|------------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (¡nunca al cliente!) |

### 2.3 Aplicar migraciones SQL

```bash
# Vincular CLI con el proyecto
supabase login
supabase link --project-ref <TU_PROJECT_REF>

# Aplicar todas las migraciones en orden
supabase db push
```

Las migraciones crean en este orden:
1. `001` → tabla `usuarios` + trigger auth
2. `002` → tabla `proyectos`
3. `003` → tabla `tareas`
4. `004` → tabla `bloqueos`
5. `005` → tabla `riesgos` + trigger prioridad
6. `006` → tabla `comentarios`
7. `007` → tabla `historial_cambios`
8. `008` → tabla `semaforos`
9. `009` → tabla `notificaciones_config`
10. `010` → índices, triggers, vistas, función `calcular_color_semaforo`

**Verificar en el SQL Editor de Supabase:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2.4 Cargar seed data

```bash
# Con supabase CLI local
supabase db reset   # aplica migraciones + seed

# O directamente en SQL Editor de Supabase:
-- Pega el contenido de supabase/seed/seed.sql
```

Usuarios creados por el seed:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `gerente@people-helm.test` | `Test1234!` | Gerente |
| `lider1@people-helm.test` | `Test1234!` | Líder Area |
| `lider2@people-helm.test` | `Test1234!` | Líder Area |
| `espectador@people-helm.test` | `Test1234!` | Espectador |

### 2.5 Configurar Supabase Auth

En **Authentication → Settings**:

- **Site URL:** `http://localhost:3000` (dev) / `https://tu-app.vercel.app` (prod)
- **Redirect URLs:** añadir `http://localhost:3000/**` y `https://tu-app.vercel.app/**`
- **Email confirmations:** desactivar para desarrollo (opcional)

### 2.6 Crear bucket de Storage

En **Storage**:
1. Crear bucket: `reportes-pdf`
2. **Public bucket:** No (privado)
3. Políticas RLS del bucket:
   ```sql
   -- Leer: usuarios autenticados
   CREATE POLICY "Auth users can read reports"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'reportes-pdf');

   -- Subir: solo Gerente y Líder Area
   CREATE POLICY "Editors can upload reports"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'reportes-pdf' AND
     (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('Gerente', 'Líder Area')
   );
   ```

### 2.7 Desplegar Supabase Functions

```bash
# Desplegar todas las funciones
supabase functions deploy --project-ref <PROJECT_REF>

# O una a la vez:
supabase functions deploy crear-proyecto --project-ref <PROJECT_REF>
supabase functions deploy actualizar-estado --project-ref <PROJECT_REF>
supabase functions deploy registrar-bloqueo --project-ref <PROJECT_REF>
supabase functions deploy generar-semaforo --project-ref <PROJECT_REF>
supabase functions deploy enviar-notificacion --project-ref <PROJECT_REF>
supabase functions deploy exportar-pdf --project-ref <PROJECT_REF>
supabase functions deploy crear-tarea --project-ref <PROJECT_REF>
supabase functions deploy actualizar-tarea-estado --project-ref <PROJECT_REF>
supabase functions deploy recalcular-avance-proyecto --project-ref <PROJECT_REF>
```

### 2.8 Configurar secrets en las Functions

```bash
# Secrets que usan las Deno Functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<tu_key> --project-ref <REF>
supabase secrets set RESEND_API_KEY=re_<tu_key> --project-ref <REF>
supabase secrets set APP_URL=https://tu-app.vercel.app --project-ref <REF>
```

### 2.9 Configurar Realtime

En **Database → Replication**:
- Activar replication para las tablas: `proyectos`, `bloqueos`, `notificaciones_config`
- Esto permite que las notificaciones lleguen en tiempo real vía WebSocket

---

## 3. Configuración GitHub

### 3.1 Crear repositorio

```bash
# Inicializar git y subir
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/TU_ORG/people-helm.git
git push -u origin main
```

### 3.2 Configurar Secrets en GitHub

En **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor | Descripción |
|--------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | URL pública del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Solo para CI/CD server-side |
| `SUPABASE_ACCESS_TOKEN` | Token Supabase CLI | Obtener con `supabase login --token` |
| `SUPABASE_PROJECT_REF` | ID del proyecto | Ej: `abcdefghijklmnop` |
| `VERCEL_TOKEN` | Token de Vercel | Obtener en vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Org ID de Vercel | En `vercel.json` o dashboard |
| `VERCEL_PROJECT_ID` | Project ID de Vercel | En `vercel.json` o dashboard |

### 3.3 Cómo obtener SUPABASE_ACCESS_TOKEN

```bash
supabase login
# Sigue el flujo, luego copia el token generado
```

### 3.4 Cómo obtener VERCEL_TOKEN, ORG_ID y PROJECT_ID

```bash
vercel login
vercel link   # vincula el proyecto, genera .vercel/project.json

# El archivo .vercel/project.json contiene:
# { "orgId": "...", "projectId": "..." }
```

El token se genera en: vercel.com → Settings → Tokens → Create

### 3.5 Workflows activos

| Archivo | Trigger | Descripción |
|---------|---------|-------------|
| `test.yml` | Push a main/develop, PRs | TypeScript check + lint + unit tests + E2E |
| `deploy.yml` | Push a main | Deploy automático a Vercel + Supabase Functions |
| `db-migrate.yml` | Push a main (migrations cambiadas) | Aplica migraciones SQL en producción |
| `docs.yml` | Push a main/develop (src/ cambiado) | Regenera docs y CLAUDE.md automáticamente |

### 3.6 Configurar protección de rama main

En **Settings → Branches → Add rule**:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Agregar: `unit-integration` (de test.yml)
- ✅ Require branches to be up to date before merging

---

## 4. Configuración Vercel

### 4.1 Crear proyecto en Vercel

```bash
# Desde la raíz del proyecto
vercel
# Seguir el asistente:
# - Link to existing project? No
# - Project name: people-helm
# - Framework: Next.js (auto-detectado)
```

O desde [vercel.com](https://vercel.com) → New Project → Import Git Repository.

### 4.2 Variables de entorno en Vercel

En **Settings → Environment Variables**, añadir para **Production** y **Preview**:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server-side) |
| `NEXT_PUBLIC_APP_URL` | URL de la app (ej: `https://people-helm.vercel.app`) |

> **Importante:** Las variables `NEXT_PUBLIC_*` son visibles en el cliente. Las demás son solo server-side.

### 4.3 Configurar dominio (opcional)

En **Settings → Domains**:
1. Añadir dominio personalizado
2. Configurar DNS según las instrucciones de Vercel
3. SSL automático incluido

---

## 5. Configuración Resend (Email)

### 5.1 Crear cuenta y API Key

1. Ir a [resend.com](https://resend.com) → Sign up
2. **API Keys → Create API Key**
   - Name: `people-helm-prod`
   - Permission: Full access
3. Copiar la key (`re_...`)

### 5.2 Verificar dominio de envío

En **Domains → Add Domain**:
1. Añadir tu dominio (ej: `people-helm.com`)
2. Configurar registros DNS según instrucciones (TXT, MX)
3. Esperar verificación (~5 minutos)

Para desarrollo puedes usar el dominio por defecto de Resend `onboarding@resend.dev` (solo envía al email del dueño de la cuenta).

### 5.3 Configurar en las Supabase Functions

```bash
supabase secrets set RESEND_API_KEY=re_<tu_key> --project-ref <REF>
supabase secrets set EMAIL_FROM=noreply@tu-dominio.com --project-ref <REF>
```

---

## 6. Variables de Entorno

### Resumen completo

Copia `.env.example` → `.env.local` y rellena:

```bash
cp .env.example .env.local
```

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Aplicación ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Email (Resend) ────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@people-helm.com
```

> `.env.local` está en `.gitignore`. Nunca commitear este archivo.

---

## 7. Primer Deploy

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Husky (pre-commit hooks)
npm run prepare

# 3. Verificar configuración
npx tsc --noEmit    # type check
npm run lint        # ESLint

# 4. Correr tests
npm test

# 5. Build local (verifica antes de deploy)
npm run build

# 6. Levantar en desarrollo
npm run dev
# → http://localhost:3000

# 7. Deploy a Vercel (producción)
vercel --prod
```

### Checklist primer deploy

- [ ] Migraciones SQL aplicadas en Supabase
- [ ] Seed data cargado (usuarios de prueba)
- [ ] Supabase Functions desplegadas
- [ ] Secrets configurados en Supabase Functions
- [ ] Variables de entorno en Vercel
- [ ] Secrets en GitHub Actions
- [ ] Realtime activado para tablas relevantes
- [ ] Bucket `reportes-pdf` creado en Storage
- [ ] Branch `main` protegida en GitHub

---

## 8. Claude Project — Cómo funciona

La carpeta `.claude/` contiene la configuración del proyecto para Claude Code. No es código de la aplicación — es infraestructura para que Claude trabaje de forma más eficiente y consistente.

```
.claude/
├── agents/          ← Qué puede hacer cada agente especializado
├── skills/          ← Áreas de conocimiento
├── hooks/           ← Scripts automáticos (pre-commit, etc.)
├── commands/        ← Comandos de scaffolding y utilidades
├── rules.yaml       ← Convenciones globales del proyecto
└── mcp-configs/     ← Conexiones a servicios externos
```

---

### 8.1 `agents/`

Los agentes son perfiles especializados para Claude. Cada uno tiene responsabilidades, restricciones y criterios de éxito bien definidos.

```
agents/
├── code-agent.yaml     ← Frontend: componentes, hooks, tests
├── api-agent.yaml      ← Backend: API routes, Supabase Functions
├── data-agent.yaml     ← Base de datos: migraciones SQL, RLS
└── deploy-agent.yaml   ← CI/CD: GitHub Actions, Vercel
```

**¿Cómo se usan?**

Cuando le pides a Claude que implemente una feature, el contexto del agente adecuado le indica:
- Qué convenciones debe seguir (`PascalCase`, `camelCase`, etc.)
- Qué herramientas usar (`eslint`, `zod`, `vitest`)
- Cuáles son los criterios de éxito (tests pasan, TypeScript sin errores)
- Con qué otros agentes colabora

**Ejemplo — `code-agent.yaml`:**
```yaml
name: Code Agent
responsibilities:
  - Crear componentes React con TypeScript strict
  - Implementar hooks con React Query
constraints:
  - Must use PascalCase for components
  - Must include tests with >80% coverage
  - No console.log in production code
```

> Cuando Claude trabaja en componentes UI, automáticamente aplica estas restricciones sin que tengas que recordárselas en cada mensaje.

---

### 8.2 `skills/`

Las skills son áreas de conocimiento que complementan a los agentes. Definen herramientas específicas y base de conocimiento.

```
skills/
├── code-quality.yaml   ← ESLint, Prettier, cobertura, a11y
├── database.yaml       ← PostgreSQL, Supabase, RLS, triggers
├── auth.yaml           ← JWT, RBAC, sesiones, OAuth
└── deployment.yaml     ← Vercel, GitHub Actions, CI/CD
```

**¿Para qué sirven?**

- Un agente puede tener múltiples skills
- Las skills indican qué herramientas y patrones son válidos para ese dominio
- Evitan que Claude use soluciones incorrectas (ej: usar Firebase cuando el proyecto usa Supabase)

**Ejemplo — `database.yaml`:**
```yaml
name: Database Skill
expertise:
  - Row-Level Security (RLS)
  - Triggers (BEFORE/AFTER, FOR EACH ROW)
tools:
  - supabase-cli
  - sql-formatter
```

---

### 8.3 `hooks/`

Los hooks son scripts Node.js que se ejecutan automáticamente en eventos del ciclo de vida del proyecto.

```
hooks/
├── onProjectStart.js   ← Al clonar/inicializar el proyecto
├── beforeBuild.js      ← Antes del build (lint + typecheck + tests)
├── beforeCommit.js     ← Antes de cada commit git (⭐ clave)
└── afterDeploy.js      ← Después de deploy (health check)
```

#### `beforeCommit.js` — El más importante

Este hook se ejecuta automáticamente antes de cada `git commit` (vía Husky). Hace 5 cosas:

```
git commit -m "feat: nueva feature"
      ↓
.husky/pre-commit ejecuta beforeCommit.js
      ↓
1. Lee src/app/api/ → genera docs/api-reference.md
2. Lee src/components/ + hooks/ → genera docs/modulos.md
3. Lee supabase/migrations/ → genera docs/database/schema.md
4. Lee git log + package.json → actualiza CLAUDE.md
5. Lee git log → actualiza docs/changelog.md
      ↓
git add docs/ CLAUDE.md  (auto-staged)
      ↓
Commit completado con docs actualizadas
```

**¿Por qué importa?** Claude Code lee `CLAUDE.md` al inicio de cada sesión. Si `CLAUDE.md` está actualizado con los últimos cambios, Claude tiene contexto perfecto sin que tengas que explicar nada.

#### Configurar Husky (una vez)

```bash
npm run prepare
# → instala husky y activa el hook .husky/pre-commit
```

#### Ejecutar manualmente

```bash
npm run docs:generate
# → ejecuta beforeCommit.js sin hacer commit
```

---

### 8.4 `commands/`

Los comandos son herramientas de CLI del proyecto para acelerar el desarrollo.

```
commands/
├── scaffold.js    ← Genera componentes/hooks/migraciones
├── dbsync.js      ← Sincroniza BD con migraciones
├── testenv.js     ← Prepara ambiente de testing
└── docs-sync.js   ← Regenera documentación manualmente
```

#### `scaffold.js` — Generador de código

```bash
# Crear un componente con template base + JSDoc
npm run scaffold:component MiComponente
# → crea src/components/MiComponente.tsx

# Crear un hook con React Query
npm run scaffold:hook useMiHook
# → crea src/hooks/useMiHook.ts

# Crear una migración SQL numerada
npm run scaffold:migration crear_tabla_nueva
# → crea supabase/migrations/011_crear_tabla_nueva.sql
```

Los templates generados incluyen:
- JSDoc/TSDoc para auto-documentación
- Estructura estándar del proyecto
- Ejemplos de uso en comentarios

#### `dbsync.js` — Sincronización de BD

```bash
# Aplicar migraciones pendientes
npm run supabase:migrate

# Resetear BD y re-aplicar todo (⚠️ destructivo)
node .claude/commands/dbsync.js --reset
```

#### `testenv.js` — Preparar tests

```bash
node .claude/commands/testenv.js
# → limpia coverage/, playwright-report/
# → resetea la BD local con seed data
```

---

### 8.5 `mcp-configs/`

MCP (Model Context Protocol) permite a Claude conectarse a servicios externos como herramientas nativas. Estos archivos configuran las conexiones.

```
mcp-configs/
├── supabase.config.json   ← Conexión a Supabase (DB + Auth + Functions)
├── github.config.json     ← Conexión a GitHub (issues, PRs, actions)
├── vercel.config.json     ← Conexión a Vercel (deployments)
└── npm.config.json        ← npm scripts disponibles
```

**¿Qué permite MCP?**

Con MCP configurado, Claude puede:
- Consultar el estado de la BD directamente
- Ver issues y PRs de GitHub
- Triggear deploys en Vercel
- Ejecutar npm scripts

**Configuración de credenciales:**

Las configs usan variables de entorno (`${SUPABASE_URL}`, `${GITHUB_TOKEN}`). Estas se leen desde `.env.local` — nunca se hardcodean en los archivos JSON.

**Ejemplo — `supabase.config.json`:**
```json
{
  "name": "supabase",
  "baseUrl": "${SUPABASE_URL}",
  "credentials": {
    "anonKey": "${SUPABASE_ANON_KEY}",
    "serviceRoleKey": "${SUPABASE_SERVICE_ROLE_KEY}"
  }
}
```

> **Importante:** Los archivos `mcp-configs/*.json` están en `.gitignore` para no exponer credenciales en el repositorio.

---

### 8.6 `rules.yaml`

Define las convenciones globales del proyecto que Claude debe seguir siempre, independientemente del agente activo.

```yaml
# Fragmento de rules.yaml
naming:
  components: PascalCase      # VistaGerencial.tsx ✅ vista-gerencial.tsx ❌
  functions: camelCase        # useProjects ✅ UseProjects ❌
  constants: UPPER_SNAKE_CASE # DIAS_BLOQUEO_ROJO ✅ diasBloqueaRojo ❌
  database: snake_case        # created_at ✅ createdAt ❌

typescript:
  mode: strict
  noImplicitAny: true

documentation:
  jsdoc: required for all public functions/exports
  comments: explain WHY not WHAT

security:
  rbac: required for authenticated routes
  secrets: never in code, use .env
```

**¿Por qué centralizar las reglas?**

Sin este archivo, tendrías que recordar las convenciones en cada prompt. Con `rules.yaml`, Claude las aplica automáticamente en cada respuesta — desde la primera sesión hasta la última.

---

## 9. Flujo de trabajo diario

### Desarrollar una feature

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-feature

# 2. Scaffolding (si aplica)
npm run scaffold:component MiComponente
npm run scaffold:hook useMiHook

# 3. Desarrollar
npm run dev

# 4. Tests
npm test
npm run test:e2e

# 5. Commit (docs se actualizan automáticamente)
git add .
git commit -m "feat: nueva feature"
# → beforeCommit.js regenera docs/ y CLAUDE.md

# 6. Push y PR
git push origin feature/nueva-feature
# → GitHub Actions ejecuta tests automáticamente
```

### Agregar una migración SQL

```bash
# 1. Crear archivo de migración numerado
npm run scaffold:migration crear_tabla_nueva

# 2. Editar el SQL generado
# supabase/migrations/011_crear_tabla_nueva.sql

# 3. Probar localmente
supabase db reset   # aplica todo desde cero

# 4. Al hacer push a main, db-migrate.yml aplica en producción
```

### Actualizar documentación manualmente

```bash
npm run docs:generate
# → regenera todos los docs sin hacer commit
```

### Verificar el estado del proyecto

```bash
# TypeScript
npx tsc --noEmit

# Linting
npm run lint

# Tests + cobertura
npm run test:coverage

# Build
npm run build
```

---

## Troubleshooting

### Error: `supabase: command not found`
```bash
npm install -g supabase
# o con brew:
brew install supabase/tap/supabase
```

### Error: `Cannot find module '@/lib/supabase'`
Verificar `tsconfig.json` tiene el path alias:
```json
{ "paths": { "@/*": ["./src/*"] } }
```

### Supabase Functions no responden
```bash
# Ver logs en tiempo real
supabase functions logs crear-proyecto --project-ref <REF>
```

### Pre-commit hook no ejecuta
```bash
# Reinstalar Husky
npm run prepare
chmod +x .husky/pre-commit
```

### Error de CORS en producción
Verificar en Supabase → Settings → API → Allowed Origins que incluye tu dominio Vercel.

### Tests E2E fallan en CI
Verificar que `playwright.config.ts` tiene `baseURL` configurado y que el servidor levanta antes de los tests:
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```
