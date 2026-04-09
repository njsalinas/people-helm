# people-helm - Sistema de Dirección Operativa para Área de Personas

**Last Updated:** 2026-04-09T02:50:30.884Z
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

## 📋 Últimas 5 Actualizaciones

```
101ca03 fix: eliminar variables no usadas y errores de lint
ce832da docs: auto-generated documentation [skip ci]
dbf0184 feat: Mejoras V2 y fix errores
8179d7c fix: resolver 3 issues reportados
4bdf4fb fix: corregir orden de ejecución en migración 011
```

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos fuente** | 100 |
| **Componentes React** | 30 |
| **Hooks personalizados** | 7 |
| **Tests** | 6 |

---

## 🔐 Seguridad

- ✅ Supabase Auth (Email/Contraseña)
- ✅ RBAC: Gerente / Líder Area / Espectador
- ✅ RLS en todas las tablas
- ✅ Zod en cliente y servidor
- ✅ Middleware de protección de rutas

---

*Generado automáticamente por pre-commit hook*
*Última sincronización:* 2026-04-09T02:50:30.884Z
