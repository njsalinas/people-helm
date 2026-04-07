# people-helm - Sistema de Dirección Operativa para Área de Personas

**Last Updated:** 2026-04-07T16:49:58.432Z
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
1770361 fix: resolver errores TypeScript que bloqueaban build en Vercel
6e956b8 docs: auto-generated documentation [skip ci]
3aaffcc fix: actualizar campo activo→canal_alerta_visual en API route notificaciones
dff17c6 docs: auto-generated documentation [skip ci]
f83e031 fix: corregir tipos en settings page (nombre_completo, evento, canal_alerta_visual)
```

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos fuente** | 86 |
| **Componentes React** | 22 |
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
*Última sincronización:* 2026-04-07T16:49:58.432Z
