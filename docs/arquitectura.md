# Arquitectura — People Helm

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Estilos | Tailwind CSS 3 |
| Estado servidor | @tanstack/react-query (staleTime 30s, retry 1) |
| Estado cliente | Zustand 4 (authStore, uiStore, projectStore) |
| Backend / DB | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth — email/password |
| Serverless | Supabase Functions (Deno) |
| Realtime | Supabase Realtime (broadcast channel por usuario) |
| Storage | Supabase Storage (bucket `reportes-pdf`) |
| Email | Resend API |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Formularios | react-hook-form + Zod |
| Tests unitarios | Vitest + jsdom + @testing-library/react |
| Tests E2E | Playwright (Chromium) |
| CI/CD | GitHub Actions → Vercel (frontend) + Supabase CLI (functions) |

---

## Estructura de directorios

```
src/
├── app/
│   ├── (auth)/login/         — Página de login
│   ├── (dashboard)/          — Layout autenticado
│   │   ├── page.tsx          — Dashboard KPI + Vista Gerencial
│   │   ├── proyectos/[id]/   — Detalle proyecto (Kanban / Timeline / Lista)
│   │   ├── bloqueos/         — Tabla transversal de bloqueos
│   │   ├── focos/            — Vista por Foco Estratégico
│   │   ├── reporteria/
│   │   │   ├── semaforo/     — Semáforo completo mensual
│   │   │   └── semaforo-abreviado/ — Semáforo editable ejecutivo
│   │   └── settings/         — Configuración notificaciones
│   ├── api/                  — Route Handlers Next.js
│   │   ├── proyectos/
│   │   ├── tareas/
│   │   ├── riesgos/
│   │   ├── bloqueos/
│   │   ├── reporteria/semaforo/
│   │   └── notificaciones/config/
│   ├── layout.tsx            — Root layout (fuente, Providers)
│   ├── middleware.ts          — Protección de rutas + RBAC
│   └── providers.tsx         — QueryClient + ToastProvider
├── components/
│   ├── Common/               — Navbar, ToastProvider
│   ├── Dashboard/            — KPIDashboard, Filtros, VistaGerencial
│   ├── Proyectos/
│   │   ├── Kanban/           — KanbanBoard, KanbanColumn, TaskCard, TaskDetailModal
│   │   ├── Timeline/         — TimelineChart, TaskProgressBar
│   │   ├── Lista/            — TaskTable
│   │   ├── ProyectoDetail.tsx
│   │   └── ProyectoForm.tsx
│   ├── Bloqueos/             — BloqueosTable, BloqueosForm
│   └── Reporteria/           — SemaforoCompleto, SemaforoAbreviado, TablaEditable
├── hooks/                    — useAuth, useProjects, useTareas, useBloqueos,
│                               useRiesgos, useSemaforo, useNotificaciones
├── lib/
│   ├── constants.ts          — Umbrales semáforo, límites de campos
│   ├── utils.ts              — Funciones puras (cálculos, formateo)
│   ├── validations.ts        — Schemas Zod
│   ├── auth.ts               — getServerUser, canAccess, canEditProject
│   ├── supabase.ts           — Browser client singleton
│   ├── supabase-server.ts    — Server client (cookie-based)
│   └── supabase-types.ts     — Database interface generics
├── stores/                   — authStore, uiStore, projectStore
├── tests/
│   ├── setup.ts
│   ├── unit/                 — calculos, validations, utils
│   ├── integration/          — api.test.ts (MSW)
│   └── e2e/                  — crear-proyecto, flujos-principales
└── types/
    ├── database.ts           — Tipos raw de DB
    ├── domain.ts             — Tipos enriquecidos + constantes de dominio
    ├── api.ts                — Input/output types para API routes
    └── index.ts              — Re-exports
```

---

## Modelo de datos (resumen)

```
usuarios          — perfil vinculado a auth.users (rol: Gerente | Líder Area | Espectador)
proyectos         — entidad central; FK usuario responsable
tareas            — subtareas de proyecto; autorreferencial (tarea_padre)
bloqueos          — impedimentos con estado Activo | Resuelto | Escalado
riesgos           — prioridad calculada automáticamente por trigger SQL
comentarios       — threading vía comentario_padre; soft-delete
historial_cambios — log de auditoría append-only
semaforos         — reporte mensual con JSONB para contenido auto y manual
notificaciones_config — preferencias por usuario x evento
```

### Vistas PostgreSQL
- `vista_semaforo_proyectos` — proyectos con color calculado, bloqueos activos, responsable
- `vista_bloqueos_activos` — bloqueos no resueltos con datos de proyecto

---

## Semáforo — algoritmo

Implementado en SQL (`calcular_color_semaforo` function) y en TypeScript (`src/lib/utils.ts`) para consistencia:

| Condición | Color |
|-----------|-------|
| `estado IN ('Bloqueado','En Riesgo')` | ROJO |
| `dias_bloqueo_max > 5` | ROJO |
| `dias_bloqueo_max BETWEEN 3 AND 5` | AMARILLO |
| `estado = 'Cancelado'` | ROJO |
| Resto | VERDE |

---

## RBAC

| Acción | Gerente | Líder Area | Espectador |
|--------|---------|-----------|-----------|
| Ver proyectos | ✓ | ✓ | ✓ |
| Crear proyectos | ✓ | ✓ | ✗ |
| Cambiar estado | ✓ | ✓ | ✗ |
| Registrar bloqueos | ✓ | ✓ | ✗ |
| Generar semáforo | ✓ | ✗ | ✗ |
| Acceso /admin | ✓ | ✗ | ✗ |

Impuesto en: middleware.ts (rutas), API routes (status 403), RLS Supabase (base de datos).
