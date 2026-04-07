# People Helm

**Sistema de Dirección Operativa para el Área de Personas**

SaaS para gestionar proyectos, tareas, bloqueos y generar reportería automática en tiempo real.

---

## Quick Start

```bash
# 1. Instalar dependencias y configurar
npm install
cp .env.example .env.local
# Editar .env.local con credenciales Supabase

# 2. Aplicar migraciones de BD
npx supabase db push

# 3. Levantar dev server
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Estado | Zustand (cliente) + React Query (servidor) |
| Backend | Supabase PostgreSQL + Deno Functions |
| Auth | Supabase Auth (email/password) |
| Testing | Vitest + Playwright |
| Deploy | Vercel + Supabase |

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Contexto del proyecto para Claude Code |
| [docs/arquitectura.md](./docs/arquitectura.md) | Diagrama y componentes |
| [docs/modulos.md](./docs/modulos.md) | Componentes, hooks y utilidades |
| [docs/api-reference.md](./docs/api-reference.md) | API routes y Supabase Functions |
| [docs/onboarding.md](./docs/onboarding.md) | Guía de setup para nuevos devs |
| [docs/database/schema.md](./docs/database/schema.md) | Schema PostgreSQL |
| [docs/decisions.md](./docs/decisions.md) | Architecture Decision Records |

---

## Scripts

```bash
npm run dev              # Desarrollo local
npm run build            # Build producción
npm test                 # Tests unitarios + integración
npm run test:e2e         # Tests E2E (Playwright)
npm run test:coverage    # Tests con cobertura (umbral 80%)
npm run docs:generate    # Regenerar documentación
npm run scaffold:component MyComponent  # Crear componente
npm run scaffold:hook useMyHook         # Crear hook
npm run scaffold:migration nombre       # Crear migración SQL
```

---

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Gerente** | Acceso total: crear/editar/eliminar todo, generar semáforo |
| **Líder Area** | Crear/editar proyectos y tareas, registrar bloqueos/riesgos |
| **Espectador** | Solo lectura |

---

## Testing

```bash
npm test              # Unit + Integration (Vitest)
npm run test:e2e      # E2E (Playwright, Chromium)
npm run test:coverage # Cobertura mínima: 80%
```

---

## CI/CD

| Workflow | Trigger | Descripción |
|----------|---------|-------------|
| `test.yml` | Push a main/develop, PRs | Tests + type-check + lint |
| `deploy.yml` | Push a main | Deploy a Vercel + Supabase Functions |
| `db-migrate.yml` | Push a main (migrations/) | Aplica migraciones SQL |
| `docs.yml` | Push a main/develop (src/) | Auto-genera documentación |

---

## Usuarios de prueba

```
gerente@people-helm.test    / Test1234!   → Gerente
lider1@people-helm.test     / Test1234!   → Líder Area
espectador@people-helm.test / Test1234!   → Espectador
```
