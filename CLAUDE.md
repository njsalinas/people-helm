# People Helm — CLAUDE.md

Contexto del proyecto para Claude Code.

## Stack
- Next.js 14 App Router + TypeScript strict
- Tailwind CSS — no styled-components, no CSS modules
- @tanstack/react-query para estado servidor; Zustand para estado cliente
- Supabase (PostgreSQL + Auth + Realtime + Storage + Deno Functions)
- Zod para validación en cliente y servidor
- react-hook-form + @hookform/resolvers/zod para formularios
- Vitest para unit/integration tests; Playwright para E2E

## Convenciones

### Componentes
- Siempre `'use client'` en componentes con hooks; sin directiva en Server Components
- Props tipadas con interface, no type
- Nombres de archivos: PascalCase para componentes, camelCase para hooks y utils

### API Routes
- Siempre verificar autenticación con `getServerUser()` primero
- Verificar rol antes de mutaciones (Espectador no puede escribir)
- Validar body con Zod antes de usar datos
- Retornar `{ data }` en éxito, `{ error }` en fallo

### Hooks
- Un hook por entidad (`useProyectos`, `useTareas`, `useBloqueos`, etc.)
- Mutations invalidan queries relacionadas con `queryClient.invalidateQueries`
- Errores de mutación se muestran con `useUIStore().addToast`

### Base de datos
- Nunca consultar tablas directamente desde el frontend — siempre vía API routes o hooks
- Usar `vista_semaforo_proyectos` y `vista_bloqueos_activos` para lecturas frecuentes
- RLS activo en todas las tablas — no usar service role en el cliente

### Semáforo
- La lógica de color está duplicada intencionalmente:
  - SQL: `calcular_color_semaforo()` en `010_crear_indices_y_triggers.sql`
  - TypeScript: `calcularColorSemaforo()` en `src/lib/utils.ts`
- Ambas deben mantenerse sincronizadas

## Estructura rápida
```
src/app/(dashboard)/     — páginas autenticadas
src/app/api/             — route handlers
src/components/          — UI components por dominio
src/hooks/               — React Query hooks
src/lib/                 — utils, validations, auth, supabase clients
src/stores/              — Zustand stores
src/tests/               — unit/, integration/, e2e/
src/types/               — database.ts, domain.ts, api.ts
supabase/
  migrations/            — SQL migrations numeradas 001-010
  functions/             — Deno serverless functions
  seed/                  — seed.sql con datos de prueba
docs/                    — arquitectura, api-reference, onboarding
```

## Roles de usuario
- `Gerente` — acceso completo incluyendo /admin y generar semáforo
- `Líder Area` — puede crear/editar proyectos y tareas de su área
- `Espectador` — solo lectura

## Comandos útiles
```bash
npm run dev          # desarrollo
npm test             # tests unitarios + integración
npm run test:e2e     # tests Playwright
npm run test:coverage # cobertura (umbral 80%)
npx tsc --noEmit     # type check
npm run lint         # ESLint
```
