# people-helm - Sistema de Dirección Operativa para Área de Personas

**Last Updated:** 2026-04-11T04:44:53.420Z
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
41161ee style: mejoras visuales y UX en componentes principales
bbed0c2 docs: auto-generated documentation [skip ci]
2dabdd8 fix: falta propiedad y propiedad desconocida
918b840 docs: auto-generated documentation [skip ci]
84dfee0 fix: para deploy en vercel
```

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos fuente** | 118 |
| **Componentes React** | 39 |
| **Hooks personalizados** | 9 |
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
*Última sincronización:* 2026-04-11T04:44:53.420Z
