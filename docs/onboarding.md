# Onboarding — People Helm

Guía para levantar el proyecto localmente y desplegarlo en producción.

---

## Requisitos previos

- Node.js 20+
- npm 10+
- Cuenta en [Supabase](https://supabase.com) (plan free suficiente para desarrollo)
- Cuenta en [Resend](https://resend.com) para emails (opcional en dev)
- Cuenta en [Vercel](https://vercel.com) para deploy (opcional)

---

## 1. Clonar e instalar

```bash
git clone <repo-url> people-helm
cd people-helm
npm install
```

---

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con los valores de tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=re_<key>          # opcional en dev
```

---

## 3. Base de datos — migraciones

Con la CLI de Supabase instalada (`npm i -g supabase`):

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

O bien aplica manualmente los archivos en `supabase/migrations/` desde el SQL editor de Supabase en este orden:

1. `001_crear_tabla_usuarios.sql`
2. `002_crear_tabla_proyectos.sql`
3. `003_crear_tabla_tareas.sql`
4. `004_crear_tabla_bloqueos.sql`
5. `005_crear_tabla_riesgos.sql`
6. `006_crear_tabla_comentarios.sql`
7. `007_crear_tabla_historial_cambios.sql`
8. `008_crear_tabla_semaforos.sql`
9. `009_crear_tabla_notificaciones_config.sql`
10. `010_crear_indices_y_triggers.sql`

### Datos de prueba

```bash
supabase db reset   # aplica seed.sql automáticamente
# o manualmente:
psql $DATABASE_URL < supabase/seed/seed.sql
```

Usuarios seed disponibles:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| gerente@people-helm.test | Test1234! | Gerente |
| lider1@people-helm.test | Test1234! | Líder Area |
| lider2@people-helm.test | Test1234! | Líder Area |
| espectador@people-helm.test | Test1234! | Espectador |

---

## 4. Supabase Functions (dev local)

```bash
supabase start          # levanta Supabase localmente con Docker
supabase functions serve
```

---

## 5. Levantar Next.js

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## 6. Tests

```bash
# Unit + integration
npm test

# Con cobertura
npm run test:coverage

# E2E (requiere el servidor corriendo)
npm run dev &
npm run test:e2e
```

---

## 7. Deploy a producción

### Frontend (Vercel)

```bash
vercel --prod
```

Variables de entorno requeridas en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Functions

```bash
supabase functions deploy --project-ref <project-ref>
```

Secrets para las functions:
```bash
supabase secrets set RESEND_API_KEY=re_<key> --project-ref <ref>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key> --project-ref <ref>
```

---

## 8. CI/CD automático

Ver `.github/workflows/`:
- `test.yml` — ejecuta tests en cada PR y push a `main`/`develop`
- `deploy.yml` — despliega a Vercel + Supabase Functions en push a `main`

Secrets requeridos en GitHub:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
