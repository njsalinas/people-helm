# 🚀 PROMPT PARA CLAUDE CODE - PEOPLE HELM

## Instrucción Completa para Claude Code

### CONTEXTO DEL PROYECTO

Necesito que comiences la implementación del **People Helm**, un SaaS de dirección operativa para el área de Personas. Este es un **Claude Project** gestionado completamente por Claude.

### 📚 DOCUMENTACIÓN DE REFERENCIA

Toda la documentación del proyecto está en la carpeta `req/`:
- `req/02_PRD_COMPLETO.md` - Product Requirements Document (Requisitos funcionales)
- `req/03_TDD_COMPLETO.md` - Technical Design Document (Arquitectura técnica)

**INSTRUCCIÓN CRÍTICA:** 
Lee ambos documentos COMPLETAMENTE antes de escribir una sola línea de código. Estos documentos son la fuente única de verdad para este proyecto.

---

## 🏗️ STACK TECNOLÓGICO (Del TDD)

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand + React Query
- **Backend:** Supabase PostgreSQL + Deno Functions (Serverless)
- **Auth:** Supabase Auth (Email/Contraseña para MVP)
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel (Frontend) + Supabase (Backend)
- **CI/CD:** GitHub Actions

---

## 🎯 MVP SCOPE (Fase 1 - Lo que implementamos PRIMERO)

Del TDD, estas son las features CORE del MVP:

### MODELOS DE DATOS (Supabase PostgreSQL)
- [ ] Tabla: usuarios
- [ ] Tabla: proyectos
- [ ] Tabla: tareas
- [ ] Tabla: bloqueos
- [ ] Tabla: riesgos
- [ ] Tabla: comentarios
- [ ] Tabla: historial_cambios
- [ ] Tabla: semaforos
- [ ] Tabla: notificaciones_config
- [ ] Índices y triggers

### SUPABASE FUNCTIONS (Backend Serverless - Deno)
- [ ] crear-proyecto
- [ ] actualizar-estado
- [ ] crear-tarea
- [ ] actualizar-tarea-estado
- [ ] registrar-bloqueo
- [ ] generar-semaforo
- [ ] enviar-notificacion
- [ ] exportar-pdf
- [ ] recalcular-avance-proyecto

### VISTAS FRONTEND (Next.js 14 App Router)
- [ ] Login (Email/Contraseña)
- [ ] Vista Gerencial (Dashboard principal - tabla dinámmica)
- [ ] Detalle de Proyecto (con 3 pestañas: Kanban + Timeline + Lista)
- [ ] Vista de Bloqueos (transversal)
- [ ] Vista por Foco (agregado por foco estratégico)
- [ ] Reportería (Semáforo completo + abreviado)
- [ ] Settings (Notificaciones)

### COMPONENTES REACT (Del TDD sección 9)
**Dashboard:**
- [ ] VistaGerencial.tsx
- [ ] KPIDashboard.tsx
- [ ] Filtros.tsx

**Proyectos:**
- [ ] ProyectoDetail.tsx (con pestañas)
- [ ] ProyectoForm.tsx

**Kanban:**
- [ ] KanbanBoard.tsx
- [ ] KanbanColumn.tsx
- [ ] TaskCard.tsx
- [ ] TaskDetailModal.tsx

**Timeline:**
- [ ] TimelineChart.tsx
- [ ] TaskProgressBar.tsx
- [ ] TimelineScaleSelector.tsx

**Lista:**
- [ ] TaskTable.tsx
- [ ] TaskRow.tsx

**Bloqueos:**
- [ ] BloqueosTable.tsx
- [ ] BloqueosForm.tsx

**Reportería:**
- [ ] SemaforoCompleto.tsx
- [ ] SemaforoAbreviado.tsx
- [ ] TablaEditable.tsx

---

## 📂 ESTRUCTURA DE DIRECTORIOS (Del TDD sección 9)

El proyecto tiene estructura de **Claude Project**. Respeta esta jerarquía:

```
proyecto-personas/
├── .claude/                    # Configuración Claude (agentes, skills, hooks)
│   ├── agents/
│   ├── skills/
│   ├── hooks/
│   └── commands/
│
├── src/                        # TODO tu código Next.js va aquí
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── middleware.ts
│   │
│   ├── components/             # Componentes React
│   │   ├── Dashboard/
│   │   ├── Proyectos/
│   │   ├── Bloqueos/
│   │   ├── Reporteria/
│   │   └── Common/
│   │
│   ├── lib/                    # Lógica compartida
│   │   ├── supabase.ts
│   │   ├── validations.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   │
│   ├── hooks/                  # Custom hooks (React Query, Zustand)
│   │   ├── useProjects.ts
│   │   ├── useTareas.ts
│   │   ├── useBloqueos.ts
│   │   └── useAuth.ts
│   │
│   ├── stores/                 # Zustand state management
│   │   ├── projectStore.ts
│   │   ├── uiStore.ts
│   │   └── authStore.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── database.ts
│   │   ├── api.ts
│   │   └── domain.ts
│   │
│   └── tests/                  # Tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── supabase/                   # Backend Deno Functions
│   ├── functions/              # Cada función es una carpeta
│   │   ├── crear-proyecto/
│   │   ├── crear-tarea/
│   │   ├── actualizar-estado/
│   │   ├── registrar-bloqueo/
│   │   ├── generar-semaforo/
│   │   ├── enviar-notificacion/
│   │   └── exportar-pdf/
│   │
│   ├── migrations/             # SQL migraciones versionadas
│   │   ├── 001_crear_tabla_usuarios.sql
│   │   ├── 002_crear_tabla_proyectos.sql
│   │   ├── 003_crear_tabla_tareas.sql
│   │   └── ... (hasta 010)
│   │
│   └── seed/
│       └── seed.sql
│
├── docs/                       # Documentación (AUTO-GENERADA)
│   ├── arquitectura.md
│   ├── modulos.md
│   ├── api-reference.md
│   ├── onboarding.md
│   ├── changelog.md
│   ├── decisions.md
│   └── database/schema.md
│
├── .github/workflows/          # CI/CD
│   ├── test.yml
│   ├── deploy.yml
│   └── docs.yml
│
├── .husky/                     # Git hooks
│   └── pre-commit
│
├── claude.md                   # Contexto de Claude (AUTO-GENERADO)
├── PROMPT.md                   # Este archivo
│
└── req/                        # DOCUMENTACIÓN DEL PROYECTO (ENTRADA)
    ├── 02_PRD_COMPLETO.md      ← Lee esto
    └── 03_TDD_COMPLETO.md      ← Lee esto
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN (PASO A PASO)

### FASE 0: LECTURA (CRÍTICO - COMIENZA AQUÍ)

```bash
# Tu PRIMER paso:
1. Lee completamente: req/03_TDD_COMPLETO.md
   - Enfócate en: Sección 2 (Modelo de Datos), Sección 3 (Supabase Functions), Sección 9 (Estructura)

2. Lee completamente: req/02_PRD_COMPLETO.md
   - Enfócate en: Sección 3.1 (En alcance), Sección 4 (Requisitos Funcionales)

# NO AVANCES HASTA COMPLETAR AMBAS LECTURAS
```

### FASE 1: BASE DE DATOS & TIPOS (Semana 1)

```bash
1. Crear migraciones Supabase SQL
   - supabase/migrations/001_crear_tabla_usuarios.sql
   - supabase/migrations/002_crear_tabla_proyectos.sql
   - supabase/migrations/003_crear_tabla_tareas.sql
   - supabase/migrations/004_crear_tabla_bloqueos.sql
   - supabase/migrations/005_crear_tabla_riesgos.sql
   - supabase/migrations/006_crear_tabla_comentarios.sql
   - supabase/migrations/007_crear_tabla_historial_cambios.sql
   - supabase/migrations/008_crear_tabla_semaforos.sql
   - supabase/migrations/009_crear_tabla_notificaciones_config.sql
   - supabase/migrations/010_crear_indices_y_triggers.sql

2. Crear tipos TypeScript
   - src/types/database.ts (generados del schema)
   - src/types/api.ts (respuestas de API)
   - src/types/domain.ts (tipos de negocio)
   - src/types/index.ts (exports)

3. Crear lib compartida
   - src/lib/supabase.ts (cliente Supabase)
   - src/lib/validations.ts (Zod schemas)
   - src/lib/auth.ts (lógica de autenticación)
   - src/lib/utils.ts (utilidades)
   - src/lib/constants.ts (constantes)
```

### FASE 2: AUTENTICACIÓN (Semana 1-2)

```bash
1. Crear rutas de auth (Next.js)
   - src/app/(auth)/login/page.tsx
   - src/app/(auth)/logout/page.tsx (si aplica)
   - src/app/api/auth/login/route.ts
   - src/app/api/auth/me/route.ts

2. Crear hook de autenticación
   - src/hooks/useAuth.ts

3. Crear Zustand store
   - src/stores/authStore.ts

4. Crear middleware
   - src/app/middleware.ts (RBAC validation)
```

### FASE 3: DASHBOARD & VISTA GERENCIAL (Semana 2-3)

```bash
1. Crear layout base
   - src/app/(dashboard)/layout.tsx
   - src/components/Common/Navbar.tsx

2. Crear Vista Gerencial
   - src/app/(dashboard)/page.tsx
   - src/components/Dashboard/VistaGerencial.tsx
   - src/components/Dashboard/KPIDashboard.tsx
   - src/components/Dashboard/Filtros.tsx

3. Crear hooks React Query
   - src/hooks/useProjects.ts

4. Crear API route proxy
   - src/app/api/proyectos/route.ts
```

### FASE 4: PROYECTO DETALLE (KANBAN + TIMELINE + LISTA) (Semana 3-4)

```bash
1. Crear Detalle de Proyecto
   - src/app/(dashboard)/proyectos/[id]/page.tsx
   - src/components/Proyectos/ProyectoDetail.tsx

2. Crear Kanban
   - src/components/Proyectos/Kanban/KanbanBoard.tsx
   - src/components/Proyectos/Kanban/KanbanColumn.tsx
   - src/components/Proyectos/Kanban/TaskCard.tsx
   - src/components/Proyectos/Kanban/TaskDetailModal.tsx

3. Crear Timeline
   - src/components/Proyectos/Timeline/TimelineChart.tsx
   - src/components/Proyectos/Timeline/TaskProgressBar.tsx

4. Crear Lista
   - src/components/Proyectos/Lista/TaskTable.tsx
   - src/components/Proyectos/Lista/TaskRow.tsx

5. Crear hooks para tareas
   - src/hooks/useTareas.ts
```

### FASE 5: SUPABASE FUNCTIONS (Semana 2-4 - PARALELO)

```bash
1. crear-proyecto
   supabase/functions/crear-proyecto/index.ts

2. actualizar-estado
   supabase/functions/actualizar-estado/index.ts

3. crear-tarea
   supabase/functions/crear-tarea/index.ts

4. actualizar-tarea-estado
   supabase/functions/actualizar-tarea-estado/index.ts

5. registrar-bloqueo
   supabase/functions/registrar-bloqueo/index.ts

6. generar-semaforo
   supabase/functions/generar-semaforo/index.ts

7. enviar-notificacion
   supabase/functions/enviar-notificacion/index.ts

8. exportar-pdf
   supabase/functions/exportar-pdf/index.ts

9. recalcular-avance-proyecto
   supabase/functions/recalcular-avance-proyecto/index.ts
```

### FASE 6: BLOQUEOS & RIESGOS (Semana 4)

```bash
1. Vista transversal de bloqueos
   - src/app/(dashboard)/bloqueos/page.tsx
   - src/components/Bloqueos/BloqueosTable.tsx

2. Hook para bloqueos
   - src/hooks/useBloqueos.ts
```

### FASE 7: REPORTERÍA (SEMÁFORO) (Semana 5)

```bash
1. Semáforo completo
   - src/app/(dashboard)/reporteria/semaforo/page.tsx
   - src/components/Reporteria/SemaforoCompleto.tsx

2. Semáforo abreviado
   - src/app/(dashboard)/reporteria/semaforo-abreviado/page.tsx
   - src/components/Reporteria/SemaforoAbreviado.tsx
   - src/components/Reporteria/TablaEditable.tsx
```

### FASE 8: TESTING & DOCUMENTACIÓN (Semana 5-6)

```bash
1. Unit tests
   src/tests/unit/
   - calculos.test.ts
   - validations.test.ts
   - utils.test.ts

2. Integration tests
   src/tests/integration/
   - api.test.ts
   - supabase.test.ts

3. E2E tests
   src/tests/e2e/
   - crear-proyecto.spec.ts
   - flujos-principales.spec.ts

4. Documentación
   - docs/arquitectura.md
   - docs/modulos.md
   - docs/api-reference.md
```

---

## 🤖 CONVENCIONES DEL PROYECTO

### Naming
```
- Componentes React: PascalCase (VistaGerencial.tsx)
- Funciones/hooks: camelCase (useProjects.ts)
- Tipos: PascalCase (ProjectType)
- Constantes: UPPER_SNAKE_CASE (DEFAULT_PAGE_SIZE)
- Variables: camelCase
```

### Estructura de Componentes
```typescript
/**
 * @component Descripción breve del componente
 * @param {Props} props - Descripción de props
 * @returns {JSX.Element}
 * 
 * @example
 * <VistaGerencial proyectos={[...]} onSelectProject={...} />
 */
export const VistaGerencial: React.FC<Props> = ({ prop1, prop2 }) => {
  return <></>;
};
```

### Zod Schemas (Validación)
Todos los inputs deben validarse con Zod:
```typescript
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  nombre: z.string().min(5).max(200),
  tipo: z.enum(['Proyecto', 'Línea']),
  area: z.enum(['DO', 'Gestión de Personas', 'SSO', 'Comunicaciones']),
  categoria: z.string(),
  // ... más campos
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

### Testing
```typescript
import { describe, it, expect } from 'vitest';

describe('calcularColorSemaforo', () => {
  it('debe retornar VERDE si proyecto finalizado', () => {
    const proyecto = { estado: 'Finalizado', bloqueos: [] };
    expect(calcularColorSemaforo(proyecto)).toBe('VERDE');
  });
});
```

### Git Commits
Convención Conventional Commits:
```
feat: agregar vista gerencial con tabla dinámmica
fix: corregir validación de fecha en formulario
refactor: reorganizar estructura de componentes Kanban
test: agregar tests para calcularColor
docs: auto-generated documentation
chore: actualizar dependencias
```

---

## 🔐 SEGURIDAD & RBAC (Del TDD)

### Roles
```typescript
type UserRole = 'Gerente' | 'Líder Area' | 'Espectador';

// Gerente: acceso total
// Líder Area: acceso a sus proyectos + líneas compartidas (read-only general)
// Espectador: lectura solamente
```

### Middleware (src/app/middleware.ts)
```typescript
export async function middleware(request: NextRequest) {
  // 1. Verificar sesión
  const session = request.cookies.get('session');
  if (!session) return NextResponse.redirect('/login');

  // 2. Verificar rol
  const user = decode(session.value);
  if (request.nextUrl.pathname.startsWith('/admin') && user.rol !== 'Gerente') {
    return NextResponse.redirect('/unauthorized');
  }

  // 3. Verificar acceso a proyecto específico
  // TODO: implementar RLS en Supabase
}
```

---

## 📋 CHECKLIST DE INICIO

Completa en orden **ANTES** de empezar a codificar:

- [ ] Leí completamente req/03_TDD_COMPLETO.md
- [ ] Leí completamente req/02_PRD_COMPLETO.md
- [ ] Entiendo el stack: Next.js 14 + Supabase + Deno Functions
- [ ] Entiendo la estructura de directorios (arriba)
- [ ] Entiendo el MVP scope (features CORE)
- [ ] Entiendo RBAC (3 roles)
- [ ] Entiendo orden de implementación (FASE 0-8)
- [ ] Entiendo convenciones (naming, JSDoc, Zod, testing)
- [ ] Listo para empezar FASE 0 (lectura)

---

## 📊 BASE DE DATOS - ORDEN CRÍTICO

**Las migraciones DEBEN crearse en este orden** (dependencias de FK):

```
1. usuarios (tabla base)
   ↓
2. proyectos (FK → usuarios)
   ↓
3. tareas (FK → proyectos, usuarios)
   ↓
4. bloqueos (FK → tareas, usuarios)
   ↓
5. riesgos (FK → proyectos)
   ↓
6. comentarios (FK → proyectos, usuarios)
   ↓
7. historial_cambios (FK → proyectos, usuarios)
   ↓
8. semaforos (FK → usuarios)
   ↓
9. notificaciones_config (FK → usuarios)
   ↓
10. índices y triggers
```

---

## 🧪 TESTING TARGET

- **Unit tests:** >80% cobertura
- **Integration tests:** Todos los API routes
- **E2E tests:** 5-10 flujos críticos
  - Crear proyecto
  - Cambiar estado proyecto
  - Crear tarea
  - Cambiar estado tarea
  - Registrar bloqueo
  - Generar semáforo

```bash
npm run test                    # Unit + Integration
npm run e2e                     # E2E tests
npm run test:coverage           # Ver cobertura
```

---

## 🚀 COMENZAR AHORA

### Tu PRIMER paso (CRITICAL):

```
1. Lee completamente: req/03_TDD_COMPLETO.md
   ↓
2. Lee completamente: req/02_PRD_COMPLETO.md
   ↓
3. Confirma que entiendes:
   - Stack: Next.js 14 + Supabase + Deno
   - Estructura: carpetas src/, supabase/, docs/
   - MVP: Las 9 features core
   - Roles: Gerente, Líder Area, Espectador
   ↓
4. Comienza FASE 1: Crear migraciones SQL
```

**NO CODES HASTA COMPLETAR LA LECTURA.**

---

## 🎯 DEFINICIÓN DE HECHO (DoD)

Para CADA feature completada:
- [ ] Código escrito siguiendo convenciones
- [ ] Tests con >80% cobertura
- [ ] TypeScript sin errores (strict mode)
- [ ] JSDoc/TSDoc en funciones públicas
- [ ] Validaciones con Zod
- [ ] Sin console.log en código de producción
- [ ] Git commit semántico
- [ ] Documentación actualizada (auto-generada)
- [ ] RBAC validado (si aplica)
- [ ] Ready for code review

---

## 📚 REFERENCIAS RÁPIDAS

**Documentación dentro del proyecto:**
- `req/02_PRD_COMPLETO.md` - Qué hacer
- `req/03_TDD_COMPLETO.md` - Cómo hacerlo
- `claude.md` - Contexto general (auto-actualizado)
- `docs/` - Documentación viva (auto-generada)

**Dependencias principales:**
- `npm install next@14 react@18 typescript`
- `npm install zustand @tanstack/react-query`
- `npm install @supabase/supabase-js zod`
- `npm install tailwindcss postcss autoprefixer`
- `npm install -D vitest @testing-library/react playwright`

---

**Generado por Agente Senior de Producto & Tecnología**  
**Proyecto: People Helm - Sistema de Dirección Operativa para Área de Personas**  
**Fecha: Abril 2026**

---

## 🎯 COMIENZA LEYENDO. ¿LISTO? 🚀
