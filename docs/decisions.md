# Architecture Decision Records (ADRs)

Decisiones técnicas clave del proyecto People Helm.

---

## ADR-001: Next.js App Router sobre Pages Router

**Fecha:** 2025-01-01  
**Estado:** Aceptado

**Contexto:**
Necesitamos un framework React SSR/SSG moderno. Next.js ofrece dos sistemas de routing: Pages Router (legacy) y App Router (nuevo, desde v13).

**Decisión:**
Usar App Router con route groups `(auth)` y `(dashboard)`.

**Razones:**
- Server Components reducen JS en cliente
- Layouts anidados sin re-renderizar
- Route handlers sustituyen API routes con mejor DX
- `loading.tsx` / `error.tsx` por ruta

**Trade-offs:**
- Curva de aprendizaje mayor
- `'use client'` debe marcarse explícitamente
- Algunas librerías aún no compatibles

---

## ADR-002: Supabase sobre Firebase / PlanetScale

**Fecha:** 2025-01-01  
**Estado:** Aceptado

**Contexto:**
Necesitamos BaaS con PostgreSQL, autenticación, funciones serverless y websockets.

**Decisión:**
Supabase con PostgreSQL, Auth, Realtime, Storage y Deno Functions.

**Razones:**
- PostgreSQL real (no NoSQL) — permite triggers, RLS, views
- Auth con email/password integrado (Azure AD en roadmap)
- Realtime vía WebSockets para notificaciones in-app
- Deno Functions para lógica de negocio serverless
- SDK TypeScript de primera clase

**Trade-offs:**
- Vendor lock-in moderado
- Deno runtime distinto a Node.js
- Límites de plan gratuito en producción alta demanda

---

## ADR-003: Zustand + React Query (no Redux / SWR)

**Fecha:** 2025-01-05  
**Estado:** Aceptado

**Contexto:**
Necesitamos estado cliente (UI, auth) y estado servidor (proyectos, tareas).

**Decisión:**
- **Zustand** para estado cliente: auth, UI (modales, toasts, filtros)
- **React Query** para estado servidor: caching, invalidación, mutations

**Razones:**
- Zustand: boilerplate mínimo, no necesita Provider, devtools incluidas
- React Query: cache inteligente, staleTime, background refresh, optimistic updates
- Separación clara de responsabilidades
- SWR descartado: React Query tiene más features (mutations, devtools)
- Redux descartado: overkill para esta escala

**Trade-offs:**
- Dos librerías de estado en vez de una
- React Query requiere entender conceptos de cache keys

---

## ADR-004: Algoritmo Semáforo duplicado (SQL + TypeScript)

**Fecha:** 2025-01-10  
**Estado:** Aceptado

**Contexto:**
El color del semáforo (VERDE/AMARILLO/ROJO) se necesita tanto en la BD (para vistas y reportes) como en el cliente (para preview).

**Decisión:**
Implementar `calcular_color_semaforo()` en SQL (migration 010) y `calcularColorSemaforo()` en TypeScript (`src/lib/utils.ts`), manteniendo la misma lógica.

**Razones:**
- La vista PostgreSQL necesita el cálculo a nivel BD para performance
- El cliente necesita el cálculo offline/preview sin round-trip
- Una sola fuente de verdad de la lógica (documentada y testeada en ambos)

**Trade-offs:**
- Riesgo de desincronización si se cambia la lógica en uno solo
- Mitigado con: tests unitarios en TS + comentario de referencia cruzada

---

## ADR-005: Email auth para MVP (Azure AD en roadmap)

**Fecha:** 2025-01-01  
**Estado:** Aceptado

**Contexto:**
El cliente usa Azure AD corporativo, pero implementar SSO complica el MVP.

**Decisión:**
MVP con email/password via Supabase Auth. Azure AD como feature post-MVP.

**Razones:**
- Reduce tiempo de entrega del MVP significativamente
- Supabase soporta Azure AD OAuth nativo (plug-in cuando esté listo)
- Usuarios de prueba con credenciales simples

**Trade-offs:**
- Usuarios deben recordar otra contraseña
- Migración a SSO requerirá actualizar seed y usuarios existentes

---

## ADR-006: @dnd-kit sobre react-beautiful-dnd / react-dnd

**Fecha:** 2025-01-15  
**Estado:** Aceptado

**Contexto:**
El Kanban requiere drag & drop entre columnas y dentro de columnas.

**Decisión:**
`@dnd-kit/core` + `@dnd-kit/sortable`.

**Razones:**
- react-beautiful-dnd: abandonado (Atlassian lo deprecó)
- react-dnd: API compleja, no native touch support
- @dnd-kit: moderno, accesible (a11y), touch-native, API limpia
- `PointerSensor` con `distance: 5` evita drags accidentales

**Trade-offs:**
- Documentación menos abundante que react-beautiful-dnd (legacy)
- Requiere configuración explícita de sensores

---

## ADR-007: Documentación auto-generada vía pre-commit hooks

**Fecha:** 2025-01-20  
**Estado:** Aceptado

**Contexto:**
La documentación manual se vuelve obsoleta rápidamente. Necesitamos docs siempre actualizadas.

**Decisión:**
Pre-commit hook + GitHub Actions que regeneran `docs/` y `CLAUDE.md` en cada commit.

**Razones:**
- Docs siempre sincronizan con el código
- Claude Code tiene contexto actualizado automáticamente
- Cero trabajo manual de documentación

**Trade-offs:**
- Commits incluyen cambios de docs automáticamente
- Tiempo de commit ligeramente mayor (~1-2s)
- Requiere `node` disponible en pre-commit
