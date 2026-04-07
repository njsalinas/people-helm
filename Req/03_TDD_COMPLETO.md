# 🔧 TECHNICAL DESIGN DOCUMENT (TDD)
## Sistema de Dirección Operativa para Área de Personas

**Versión:** 1.0 TDD  
**Estado:** Final  
**Fecha:** Abril 2026  
**Basado en:** PRD v2.0

---

## 1. RESUMEN EJECUTIVO TÉCNICO

### 1.1 Visión Técnica

Construir una **SaaS escalable, segura y performante** utilizando stack moderno (Next.js + TypeScript + Supabase) que permita a la gerente de Personas centralizar la gestión de proyectos, generar reportería automática y tomar decisiones en segundos.

### 1.2 Stack Tecnológico Propuesto

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| **Frontend** | Next.js 14 + TypeScript | App Router, Server Components, perfecto para SaaS |
| **Base de Datos** | Supabase PostgreSQL | Realtime, Storage, escalable |
| **Autenticación** | Supabase Auth (Email/Demo) | Autenticación simple para MVP |
| **Backend (Functions)** | Supabase Functions (Deno) | Serverless, integrado con BD, rápido despliegue |
| **Storage** | Supabase Storage | Integrado, control de acceso, exportaciones PDF |
| **Deploy** | Vercel (Frontend) + Supabase (Backend) | Frontend en Vercel, funciones en Supabase |
| **Testing** | Vitest + Playwright | Rápido, moderno, compatible con Next.js |
| **State Management** | Zustand + React Query | Ligero, alternativa a Redux, real-time updates |
| **Styling** | Tailwind CSS | Utility-first, rápido prototipado, responsive |
| **Email** | Resend + Supabase SMTP | Plantillas modernas, tracking, integración sencilla |
| **PDF Export** | React-PDF / PDFKit | Generación de reportes exportables |

### 1.3 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js 14)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React Components + TypeScript                        │  │
│  │ - Vista Gerencial (Dashboard)                        │  │
│  │ - Detalle Proyecto                                   │  │
│  │ - Formularios (Crear, Actualizar)                    │  │
│  │ - Reportería (Semáforo)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ State Management (Zustand + React Query)            │  │
│  │ - Cache de proyectos                                 │  │
│  │ - Real-time updates (Supabase Realtime)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ UI Components (Tailwind CSS)                         │  │
│  │ - Alertas visuales                                   │  │
│  │ - Tablas dinámicas                                   │  │
│  │ - Modales                                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│         SUPABASE BACKEND (PostgreSQL + Functions)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Base de Datos PostgreSQL                             │  │
│  │ - proyectos / líneas                                 │  │
│  │ - bloqueos                                           │  │
│  │ - riesgos                                            │  │
│  │ - comentarios / decisiones                           │  │
│  │ - historial_cambios                                  │  │
│  │ - usuarios / permisos                                │  │
│  │ - semaforos (versiones mensuales)                    │  │
│  │ - notificaciones_config                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Supabase Functions (Deno - Serverless)               │  │
│  │ - /functions/crear-proyecto                          │  │
│  │ - /functions/actualizar-estado                       │  │
│  │ - /functions/registrar-bloqueo                       │  │
│  │ - /functions/generar-semaforo                        │  │
│  │ - /functions/enviar-notificacion                     │  │
│  │ - /functions/exportar-pdf                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Supabase Realtime (WebSocket)                        │  │
│  │ - Cambios de estado en tiempo real                   │  │
│  │ - Nuevos bloqueos / comentarios                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Supabase Auth (Email)                                │  │
│  │ - Login con email/contraseña (MVP)                   │  │
│  │ - Gestión de sesiones                                │  │
│  │ - (Azure AD en release posterior)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Supabase Storage                                     │  │
│  │ - Exportaciones PDF                                  │  │
│  │ - Documentos adjuntos                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│         SERVICIOS EXTERNOS & INFRAESTRUCTURA                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Resend (Email)                                       │  │
│  │ - Notificaciones por email                           │  │
│  │ - Plantillas HTML                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Vercel (Deploy Frontend)                             │  │
│  │ - Hosting de Next.js                                 │  │
│  │ - GitHub Actions para deploy automático              │  │
│  │ - CDN Global                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Azure AD / Office 365 (Release Posterior)            │  │
│  │ - SSO corporativo (futuro)                           │  │
│  │ - Integración con Supabase Auth                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. MODELO DE DATOS

### 2.1 Entidades Principales

#### 2.1.1 Tabla: `proyectos`

```sql
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Proyecto', 'Línea')),
  subtipo VARCHAR(50) CHECK (subtipo IN ('Operativo', 'Campaña', 'Estratégico')),
  foco_estrategico VARCHAR(100) NOT NULL,
  -- Focos: Desarrollo Organizacional, Gestión de Personas, Cultura de Seguridad, Comunicaciones
  
  area_responsable VARCHAR(100) NOT NULL,
  -- Áreas: DO, Gestión de Personas, SSO, Comunicaciones
  
  categoria VARCHAR(100) NOT NULL,
  -- Categorías dinámicas según área
  
  responsable_primario UUID NOT NULL REFERENCES usuarios(id),
  descripcion_ejecutiva TEXT,
  objetivo TEXT,
  resultado_esperado TEXT,
  
  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,
  
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' 
    CHECK (estado IN ('Pendiente', 'En Curso', 'En Riesgo', 'Bloqueado', 'Finalizado')),
  porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
  
  prioridad INTEGER DEFAULT 3 CHECK (prioridad >= 1 AND prioridad <= 5),
  requiere_escalamiento BOOLEAN DEFAULT FALSE,
  
  proyecto_padre UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  updated_by UUID NOT NULL REFERENCES usuarios(id),
  
  -- Index para búsquedas frecuentes
  UNIQUE(nombre, area_responsable)
);

CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_area ON proyectos(area_responsable);
CREATE INDEX idx_proyectos_foco ON proyectos(foco_estrategico);
CREATE INDEX idx_proyectos_responsable ON proyectos(responsable_primario);
CREATE INDEX idx_proyectos_categoria ON proyectos(categoria);
```

#### 2.1.2 Tabla: `tareas`

```sql
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' 
    CHECK (estado IN ('Pendiente', 'En Curso', 'Finalizado', 'Bloqueado')),
  porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
  
  responsable_id UUID NOT NULL REFERENCES usuarios(id),
  
  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,
  
  prioridad INTEGER DEFAULT 3 CHECK (prioridad >= 1 AND prioridad <= 5),
  
  -- Para dependencias (futuro)
  tarea_padre UUID REFERENCES tareas(id) ON DELETE CASCADE,
  
  -- Control
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  updated_by UUID NOT NULL REFERENCES usuarios(id),
  
  UNIQUE(proyecto_id, nombre)
);

CREATE INDEX idx_tareas_proyecto ON tareas(proyecto_id);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_responsable ON tareas(responsable_id);
CREATE INDEX idx_tareas_fecha_fin ON tareas(fecha_fin_planificada);
```

---

```sql
CREATE TABLE bloqueos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  descripcion TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL 
    CHECK (tipo IN ('Pendiente definición', 'Espera recursos', 'Espera decisión', 'Capacity')),
  
  accion_requerida VARCHAR(50) NOT NULL 
    CHECK (accion_requerida IN ('Informar', 'Seguimiento', 'Decisión', 'Intervención')),
  
  requiere_escalamiento BOOLEAN DEFAULT FALSE,
  
  estado VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Resuelto', 'Escalado')),
  fecha_registro TIMESTAMP DEFAULT now(),
  fecha_resolucion TIMESTAMP,
  comentario_resolucion TEXT,
  
  created_by UUID NOT NULL REFERENCES usuarios(id),
  resolved_by UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_bloqueos_proyecto ON bloqueos(proyecto_id);
CREATE INDEX idx_bloqueos_estado ON bloqueos(estado);
CREATE INDEX idx_bloqueos_accion ON bloqueos(accion_requerida);
CREATE INDEX idx_bloqueos_fecha_registro ON bloqueos(fecha_registro);
```

#### 2.1.3 Tabla: `riesgos`

```sql
CREATE TABLE riesgos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  descripcion TEXT NOT NULL,
  probabilidad VARCHAR(50) NOT NULL CHECK (probabilidad IN ('Alta', 'Media', 'Baja')),
  impacto VARCHAR(50) NOT NULL CHECK (impacto IN ('Alto', 'Medio', 'Bajo')),
  prioridad INTEGER NOT NULL,
  -- Calculado: (Alta/Alto)=1, (Alta/Medio)=2, ..., (Baja/Bajo)=5
  
  plan_mitigacion TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'Identificado' 
    CHECK (estado IN ('Identificado', 'Monitoreado', 'Mitigado', 'Cerrado')),
  
  fecha_identificacion TIMESTAMP DEFAULT now(),
  fecha_cierre TIMESTAMP,
  
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_riesgos_proyecto ON riesgos(proyecto_id);
CREATE INDEX idx_riesgos_estado ON riesgos(estado);
CREATE INDEX idx_riesgos_prioridad ON riesgos(prioridad);
```

#### 2.1.4 Tabla: `comentarios`

```sql
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  contenido TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'Comentario'
    CHECK (tipo IN ('Comentario', 'Decisión', 'Bloqueo', 'Avance', 'Riesgo')),
  
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Para threading (comentarios anidados)
  comentario_padre UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  
  -- For soft deletes
  deleted_at TIMESTAMP
);

CREATE INDEX idx_comentarios_proyecto ON comentarios(proyecto_id);
CREATE INDEX idx_comentarios_tipo ON comentarios(tipo);
CREATE INDEX idx_comentarios_created_by ON comentarios(created_by);
```

#### 2.1.5 Tabla: `historial_cambios`

```sql
CREATE TABLE historial_cambios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  entidad_tipo VARCHAR(50) NOT NULL,
  -- 'Proyecto', 'Bloqueo', 'Riesgo', 'Estado', 'Avance'
  
  campo_afectado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,
  
  comentario TEXT,
  
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_historial_proyecto ON historial_cambios(proyecto_id);
CREATE INDEX idx_historial_created_at ON historial_cambios(created_at);
CREATE INDEX idx_historial_entidad ON historial_cambios(entidad_tipo);
```

#### 2.1.6 Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,  -- UUID de Supabase Auth
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre_completo VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'Líder Area'
    CHECK (rol IN ('Gerente', 'Líder Area', 'Espectador')),
  
  area_responsable VARCHAR(100),
  -- NULL si es Gerente, específica si es Líder de Área
  
  activo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_area ON usuarios(area_responsable);
```

#### 2.1.7 Tabla: `semaforos`

```sql
CREATE TABLE semaforos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  
  -- Semáforo completo (auto-generado)
  contenido_automatico JSONB,
  
  -- Semáforo abreviado (selección manual)
  contenido_manual JSONB,
  -- Estructura: { verde: [{area, categoría, proyecto, detalle, indicadores}], amarillo: [...], rojo: [...] }
  
  comentario_ejecutivo_verde TEXT,
  comentario_ejecutivo_amarillo TEXT,
  comentario_ejecutivo_rojo TEXT,
  
  estado VARCHAR(50) NOT NULL DEFAULT 'Borrador'
    CHECK (estado IN ('Borrador', 'Publicado', 'Archivado')),
  
  created_by UUID NOT NULL REFERENCES usuarios(id),
  publicado_by UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT now(),
  publicado_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(mes, anio)
);

CREATE INDEX idx_semaforos_mes_anio ON semaforos(mes, anio);
```

#### 2.1.8 Tabla: `notificaciones_config`

```sql
CREATE TABLE notificaciones_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  evento VARCHAR(100) NOT NULL,
  -- 'bloqueo_registrado', 'estado_cambio', 'accion_asignada', etc.
  
  canal_alerta_visual BOOLEAN DEFAULT TRUE,
  canal_email BOOLEAN DEFAULT FALSE,
  canal_popup BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(usuario_id, evento)
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones_config(usuario_id);
```

---

## 3. SUPABASE FUNCTIONS (Backend Serverless)

### 3.1 Overview

Las funciones backend se implementan como **Supabase Functions** (Deno runtime, serverless). Cada función maneja un flujo de negocio específico y se triggerea desde:
- Direct HTTP calls desde Next.js client
- Database triggers (cambios en DB)
- Cron jobs (ejecución programada)

### 3.2 Funciones Core

#### 3.2.1 Crear Proyecto

**Function:** `/functions/crear-proyecto`

```typescript
// supabase/functions/crear-proyecto/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // Validar método
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })

  // Obtener datos del request
  const { nombre, tipo, foco, area, categoria, responsable_primario, fecha_inicio, fecha_fin_planificada } = await req.json()

  // Crear cliente Supabase con service role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  // Validar entrada
  if (!nombre || nombre.length < 5) {
    return new Response(JSON.stringify({ error: 'Nombre inválido' }), { status: 400 })
  }

  // Insert proyecto
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{
      nombre,
      tipo,
      foco,
      area,
      categoria,
      responsable_primario,
      fecha_inicio,
      fecha_fin_planificada,
      created_by: req.headers.get('x-user-id'),
      updated_by: req.headers.get('x-user-id')
    }])
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // Registrar en historial
  await supabase
    .from('historial_cambios')
    .insert([{
      proyecto_id: data[0].id,
      entidad_tipo: 'Proyecto',
      campo_afectado: 'creación',
      valor_nuevo: nombre,
      created_by: req.headers.get('x-user-id')
    }])

  // Enviar notificación (trigger async)
  await supabase.functions.invoke('enviar-notificacion', {
    body: {
      tipo: 'proyecto_creado',
      usuario_id: responsable_primario,
      proyecto_id: data[0].id
    }
  })

  return new Response(JSON.stringify({ id: data[0].id, mensaje: 'Proyecto creado' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Invocación desde Next.js:**

```typescript
// app/api/proyectos/route.ts
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase.functions.invoke('crear-proyecto', {
    body,
    headers: {
      'x-user-id': userId // obtenido de sesión
    }
  })

  if (error) throw error
  return Response.json(data, { status: 201 })
}
```

---

#### 3.2.2 Actualizar Estado de Proyecto

**Function:** `/functions/actualizar-estado`

```typescript
serve(async (req) => {
  const { proyecto_id, estado_nuevo, comentario } = await req.json()
  const usuario_id = req.headers.get('x-user-id')

  const supabase = createClient(...)

  // Get proyecto actual
  const { data: proyecto, error: getError } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', proyecto_id)
    .single()

  if (getError) throw getError

  // Validar cambio de estado
  if (estado_nuevo === 'Finalizado' && proyecto.bloqueos_activos > 0) {
    return new Response(
      JSON.stringify({ error: 'No se puede finalizar con bloqueos activos' }),
      { status: 400 }
    )
  }

  // Update proyecto
  const { error: updateError } = await supabase
    .from('proyectos')
    .update({ 
      estado: estado_nuevo,
      updated_by: usuario_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', proyecto_id)

  if (updateError) throw updateError

  // Registrar en historial
  await supabase
    .from('historial_cambios')
    .insert([{
      proyecto_id,
      entidad_tipo: 'Proyecto',
      campo_afectado: 'estado',
      valor_anterior: proyecto.estado,
      valor_nuevo: estado_nuevo,
      comentario,
      created_by: usuario_id
    }])

  // Notificar a responsable y participantes
  await supabase.functions.invoke('enviar-notificacion', {
    body: {
      tipo: 'estado_cambio',
      proyecto_id,
      estado_nuevo,
      usuarios_a_notificar: [proyecto.responsable_primario, ...proyecto.participantes]
    }
  })

  // Recalcular color de semáforo
  await supabase.functions.invoke('recalcular-semaforo', {
    body: { proyecto_id }
  })

  return new Response(JSON.stringify({ mensaje: 'Estado actualizado' }), {
    status: 200
  })
})
```

---

#### 3.2.3 Registrar Bloqueo

**Function:** `/functions/registrar-bloqueo`

```typescript
serve(async (req) => {
  const { proyecto_id, descripcion, tipo, accion_requerida, requiere_escalamiento } = await req.json()
  const usuario_id = req.headers.get('x-user-id')

  const supabase = createClient(...)

  // Insert bloqueo
  const { data, error } = await supabase
    .from('bloqueos')
    .insert([{
      proyecto_id,
      descripcion,
      tipo,
      accion_requerida,
      requiere_escalamiento,
      created_by: usuario_id,
      estado: 'Activo'
    }])
    .select()

  if (error) throw error

  // Update proyecto a 'Bloqueado'
  await supabase
    .from('proyectos')
    .update({ 
      estado: 'Bloqueado',
      updated_by: usuario_id
    })
    .eq('id', proyecto_id)

  // Notificar a gerente
  const { data: gerente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('rol', 'Gerente')
    .single()

  await supabase.functions.invoke('enviar-notificacion', {
    body: {
      tipo: 'bloqueo_registrado',
      usuario_id: gerente.id,
      proyecto_id,
      bloqueo_id: data[0].id,
      accion_requerida
    }
  })

  return new Response(JSON.stringify({ id: data[0].id, mensaje: 'Bloqueo registrado' }), {
    status: 201
  })
})
```

---

#### 3.2.4 Generar Semáforo Automático

**Function:** `/functions/generar-semaforo`

Ejecutada vía cron (1º de mes a las 22:00 UTC)

```typescript
serve(async (req) => {
  const supabase = createClient(...)

  // Obtener mes/año actual
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  // Query: todos los proyectos del mes
  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('*')
    .gte('fecha_fin', `${anio}-${mes}-01`)
    .lte('fecha_fin', `${anio}-${mes}-31`)

  // Calcular color para cada proyecto
  const verde = []
  const amarillo = []
  const rojo = []

  for (const p of proyectos) {
    const color = calcularColor(p)
    const comentario = generarComentario(p)

    if (color === 'VERDE') verde.push({ ...p, comentario })
    else if (color === 'AMARILLO') amarillo.push({ ...p, comentario })
    else rojo.push({ ...p, comentario })
  }

  // Generar contenido JSON
  const contenido = {
    verde: verde.map(p => ({
      id: p.id,
      nombre: p.nombre,
      area: p.area,
      comentario: p.comentario
    })),
    amarillo: amarillo.map(p => ({
      id: p.id,
      nombre: p.nombre,
      area: p.area,
      comentario: p.comentario
    })),
    rojo: rojo.map(p => ({
      id: p.id,
      nombre: p.nombre,
      area: p.area,
      comentario: p.comentario
    }))
  }

  // Insert semáforo
  const { data } = await supabase
    .from('semaforos')
    .insert([{
      mes,
      anio,
      contenido_automatico: contenido,
      estado: 'Borrador'
    }])
    .select()

  // Notificar a gerente
  await supabase.functions.invoke('enviar-notificacion', {
    body: {
      tipo: 'semaforo_generado',
      usuario_id: gerente_id,
      semaforo_id: data[0].id
    }
  })

  return new Response(JSON.stringify({ id: data[0].id }), { status: 201 })
})
```

---

#### 3.2.5 Enviar Notificación

**Function:** `/functions/enviar-notificacion`

```typescript
serve(async (req) => {
  const { tipo, usuario_id, proyecto_id, ...datos } = await req.json()

  const supabase = createClient(...)

  // Leer preferencias de usuario
  const { data: prefs } = await supabase
    .from('notificaciones_config')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('evento', tipo)
    .single()

  // Generar alerta visual (siempre si está enabled)
  if (prefs?.alerta_visual) {
    // Publicar evento en Realtime
    await supabase
      .channel(`notificaciones:${usuario_id}`)
      .send({
        type: 'broadcast',
        event: 'nueva_alerta',
        payload: {
          tipo,
          mensaje: generarMensaje(tipo, datos),
          timestamp: new Date().toISOString()
        }
      })
  }

  // Enviar email si está enabled
  if (prefs?.email) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('email, nombre_completo')
      .eq('id', usuario_id)
      .single()

    const html = generarTemplateEmail(tipo, datos, usuario.nombre_completo)

    // Usar Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@sistema-personas.com',
        to: usuario.email,
        subject: generarAsunto(tipo),
        html
      })
    })
  }

  return new Response(JSON.stringify({ enviado: true }), { status: 200 })
})
```

---

#### 3.2.6 Actualizar Estado de Tarea

**Function:** `/functions/actualizar-tarea-estado`

```typescript
serve(async (req) => {
  const { tarea_id, estado_nuevo, porcentaje_avance, comentario } = await req.json()
  const usuario_id = req.headers.get('x-user-id')

  const supabase = createClient(...)

  // Get tarea actual
  const { data: tarea, error: getError } = await supabase
    .from('tareas')
    .select('*, proyectos(id, estado)')
    .eq('id', tarea_id)
    .single()

  if (getError) throw getError

  // Update tarea
  const { error: updateError } = await supabase
    .from('tareas')
    .update({ 
      estado: estado_nuevo,
      porcentaje_avance: porcentaje_avance || tarea.porcentaje_avance,
      updated_by: usuario_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', tarea_id)

  if (updateError) throw updateError

  // Registrar en historial
  await supabase
    .from('historial_cambios')
    .insert([{
      proyecto_id: tarea.proyecto_id,
      entidad_tipo: 'Tarea',
      campo_afectado: 'estado',
      valor_anterior: tarea.estado,
      valor_nuevo: estado_nuevo,
      comentario,
      created_by: usuario_id
    }])

  // Recalcular % avance del proyecto
  await supabase.functions.invoke('recalcular-avance-proyecto', {
    body: { proyecto_id: tarea.proyecto_id }
  })

  // Notificar si cambió a Finalizado
  if (estado_nuevo === 'Finalizado' && tarea.estado !== 'Finalizado') {
    await supabase.functions.invoke('enviar-notificacion', {
      body: {
        tipo: 'tarea_finalizada',
        usuario_id: tarea.responsable_id,
        tarea_id,
        proyecto_id: tarea.proyecto_id
      }
    })
  }

  return new Response(JSON.stringify({ mensaje: 'Tarea actualizada' }), {
    status: 200
  })
})
```

---

#### 3.2.7 Crear Tarea

**Function:** `/functions/crear-tarea`

```typescript
serve(async (req) => {
  const { proyecto_id, nombre, descripcion, responsable_id, fecha_inicio, fecha_fin_planificada } = await req.json()
  const usuario_id = req.headers.get('x-user-id')

  const supabase = createClient(...)

  // Validar que el proyecto existe
  const { data: proyecto, error: projError } = await supabase
    .from('proyectos')
    .select('id')
    .eq('id', proyecto_id)
    .single()

  if (projError) throw projError

  // Insert tarea
  const { data, error } = await supabase
    .from('tareas')
    .insert([{
      proyecto_id,
      nombre,
      descripcion,
      responsable_id,
      fecha_inicio,
      fecha_fin_planificada,
      created_by: usuario_id,
      updated_by: usuario_id
    }])
    .select()

  if (error) throw error

  // Notificar a responsable
  await supabase.functions.invoke('enviar-notificacion', {
    body: {
      tipo: 'tarea_asignada',
      usuario_id: responsable_id,
      tarea_id: data[0].id,
      proyecto_id
    }
  })

  return new Response(JSON.stringify({ id: data[0].id }), { status: 201 })
})
```

---

#### 3.2.8 Recalcular Avance del Proyecto

**Function:** `/functions/recalcular-avance-proyecto`

Auto-actualiza el % avance del proyecto basado en tareas completadas.

```typescript
serve(async (req) => {
  const { proyecto_id } = await req.json()

  const supabase = createClient(...)

  // Obtener todas las tareas del proyecto
  const { data: tareas } = await supabase
    .from('tareas')
    .select('id, porcentaje_avance')
    .eq('proyecto_id', proyecto_id)

  if (!tareas || tareas.length === 0) return

  // Calcular promedio ponderado
  const promedioAvance = tareas.reduce((sum, t) => sum + t.porcentaje_avance, 0) / tareas.length

  // Actualizar proyecto
  await supabase
    .from('proyectos')
    .update({ 
      porcentaje_avance: Math.round(promedioAvance),
      updated_at: new Date().toISOString()
    })
    .eq('id', proyecto_id)

  return new Response(JSON.stringify({ avanceProyecto: Math.round(promedioAvance) }), {
    status: 200
  })
})
```

---

#### 3.2.9 Exportar PDF (Actualizado)

**Function:** `/functions/exportar-pdf` - Ahora incluye tareas

```typescript
serve(async (req) => {
  const { tipo, proyecto_id } = await req.json()
  // tipo: 'semaforo' | 'proyecto-detalle'

  const supabase = createClient(...)

  if (tipo === 'proyecto-detalle') {
    // Obtener proyecto + tareas
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('*, tareas(*)')
      .eq('id', proyecto_id)
      .single()

    // Generar HTML con Kanban visual, timeline, y tabla
    const html = generarHTMLProyecto(proyecto)
    
    // Convertir a PDF
    const pdfBuffer = await generarPDF(html)
    
    // Guardar en storage
    const filename = `proyecto-${proyecto.nombre}-${new Date().toISOString().split('T')[0]}.pdf`
    const { data: file } = await supabase
      .storage
      .from('reportes')
      .upload(filename, pdfBuffer, { contentType: 'application/pdf' })

    const { data: { publicUrl } } = supabase
      .storage
      .from('reportes')
      .getPublicUrl(filename)

    return new Response(JSON.stringify({ url: publicUrl }), { status: 200 })
  }
})
```

---

**Function:** `/functions/exportar-pdf`

```typescript
serve(async (req) => {
  const { semaforo_id } = await req.json()

  const supabase = createClient(...)

  // Obtener semáforo
  const { data: semaforo } = await supabase
    .from('semaforos')
    .select('*')
    .eq('id', semaforo_id)
    .single()

  // Generar HTML
  const html = generarHTMLSemaforo(semaforo)

  // Convertir a PDF usando deno-pdf o similar
  const pdfBuffer = await generarPDF(html)

  // Guardar en Supabase Storage
  const filename = `semaforo-${semaforo.anio}-${semaforo.mes}.pdf`
  const { data: file, error } = await supabase
    .storage
    .from('reportes')
    .upload(filename, pdfBuffer, {
      contentType: 'application/pdf'
    })

  if (error) throw error

  // Generar URL pública
  const { data: { publicUrl } } = supabase
    .storage
    .from('reportes')
    .getPublicUrl(filename)

  return new Response(JSON.stringify({ url: publicUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 3.3 Database Triggers

Algunos eventos se manejan con triggers en PostgreSQL:

```sql
-- Trigger: Cuando se resuelve un bloqueo, actualizar updated_at del proyecto
CREATE TRIGGER actualizar_proyecto_bloqueo_resuelto
AFTER UPDATE OF estado ON bloqueos
FOR EACH ROW
WHEN (NEW.estado = 'Resuelto')
BEGIN
  UPDATE proyectos SET updated_at = now() WHERE id = NEW.proyecto_id;
END;

-- Trigger: Auditoría automática
CREATE TRIGGER log_cambios_proyecto
AFTER UPDATE ON proyectos
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
BEGIN
  INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by, created_at)
  SELECT 
    NEW.id, 
    'Proyecto',
    column_name,
    OLD -> column_name,
    NEW -> column_name,
    NEW.updated_by,
    now()
  FROM (
    SELECT 'estado' AS column_name WHERE OLD.estado IS DISTINCT FROM NEW.estado
    UNION ALL SELECT 'porcentaje_avance' WHERE OLD.porcentaje_avance IS DISTINCT FROM NEW.porcentaje_avance
  ) AS changes;
END;
```

---

## 4. FLUJOS TÉCNICOS DETALLADOS

### 4.1 Flujo: Crear Proyecto

```
CLIENTE (Next.js)
    ↓
1. Usuario completa formulario modal
   - Valida campos (cliente, Zod schema)
   - Muestra errores si aplica
    ↓
2. Click "Guardar"
   - POST /api/proyectos { nombre, tipo, foco, ... }
    ↓
SERVIDOR (Next.js API Route)
    ↓
3. Middleware: Verificar sesión (Supabase Auth)
   - ¿Usuario autenticado?
   - ¿Tiene permisos para crear?
    ↓
4. Invocar Supabase Function
   - supabase.functions.invoke('crear-proyecto', { body })
    ↓
SUPABASE FUNCTION (Serverless Deno)
    ↓
5. Validar entrada (Zod)
   - nombre: string, min 5, max 200
   - tipo: 'Proyecto' | 'Línea'
   - foco: uno de los 4
   - area: uno de los 4
   - categoria: válida para esa area
   - responsable_id: existe en BD
   - fecha_inicio < fecha_fin
    ↓
6. Insert en DB (Supabase PostgreSQL)
   - INSERT INTO proyectos (...)
   - SET created_by = user_id
   - RETURNING *
    ↓
7. Registrar en historial
   - INSERT INTO historial_cambios
     evento: 'Proyecto creado'
    ↓
8. Enviar notificación (invocar función async)
   - supabase.functions.invoke('enviar-notificacion', {
       tipo: 'proyecto_creado',
       usuario_id: responsable_primario
     })
    ↓
9. Response 201 Created
   - { id, mensaje }
    ↓
CLIENTE
    ↓
10. Recibir respuesta
   - Mostrar toast "Proyecto creado"
   - Agregar proyecto a tabla (Zustand cache)
   - Cerrar modal
    ↓
11. Actualizar Vista Gerencial
    - React Query refetch automático
    - O Supabase Realtime subscription dispara update
```

---

### 4.2 Flujo: Generar Semáforo Automático

```
CRON JOB (Scheduled - Supabase Scheduler o externa)
    ↓
1. Trigger: 1º de cada mes a las 22:00 UTC
   (O manual: usuario click "Generar Semáforo")
    ↓
2. POST a endpoint: /api/reporteria/semaforo/generar
    ↓
SERVIDOR (Next.js)
    ↓
3. Invocar Supabase Function
   - supabase.functions.invoke('generar-semaforo', { mes, anio })
    ↓
SUPABASE FUNCTION
    ↓
4. Query: SELECT * FROM proyectos 
   WHERE fecha_fin >= mes_anterior AND fecha_fin <= mes_actual
    ↓
5. Para cada proyecto, calcular color:
   ```
   if (estado == 'Finalizado') → VERDE
   else if (estado == 'En Curso' && 
            porcentaje_avance >= porcentaje_tiempo_transcurrido &&
            bloqueos_activos == 0) → VERDE
   else if ((estado == 'En Curso' && 
             porcentaje_avance < porcentaje_tiempo_transcurrido) ||
            bloqueos_activos < 5) → AMARILLO
   else if (estado == 'En Riesgo') → AMARILLO
   else if (estado == 'Bloqueado' || bloqueos_activos >= 5) → ROJO
   ```
    ↓
6. Agrupar por color y generar comentarios auto:
   - Verde: "Proyectos cerrados: X, en tiempo: Y"
   - Amarillo: "Proyectos en riesgo: N, bloqueos resueltos: M"
   - Rojo: "Bloqueados: P, retrasos críticos: R"
    ↓
7. INSERT INTO semaforos (contenido_automatico, ...)
    ↓
8. Notificar a gerente:
   - supabase.functions.invoke('enviar-notificacion', {
       tipo: 'semaforo_generado'
     })
    ↓
CLIENTE
    ↓
9. Gerente abre Menu → Reportería → Semáforo Mensual
   - Sistema carga semáforo (auto-generado)
   - Gerente puede:
     a) Editar comentarios
     b) Click "Generar Abreviado" para versión reducida
     c) Exportar a PDF
```

---

### 4.3 Flujo: Notificación de Bloqueo (Realtime)

```
CLIENTE (Líder de Área)
    ↓
1. Abre Detalle Proyecto
   - Click "Agregar Bloqueo"
   - Completa formulario modal
   - Click "Guardar"
    ↓
2. POST /api/proyectos/:id/bloqueos
    ↓
SERVIDOR (Next.js)
    ↓
3. Invocar Supabase Function
   - supabase.functions.invoke('registrar-bloqueo', { body })
    ↓
SUPABASE FUNCTION
    ↓
4. Validar entrada
   - INSERT INTO bloqueos (...)
   - UPDATE proyectos SET estado='Bloqueado'
   - INSERT INTO historial_cambios
    ↓
5. Invocar función: enviar-notificacion (async)
   - Leer tabla notificaciones_config (gerente)
   - Generar alerta visual Y/O email según prefs
    ↓
SUPABASE FUNCTION: enviar-notificacion
    ↓
6. ALERTA VISUAL (Supabase Realtime - WebSocket):
   - Publicar evento en canal "notificaciones:{usuario_id}"
   - CLIENTE subscrito recibe en tiempo real
   - Renderiza banner superior:
     ```
     ┌────────────────────────────────────────┐
     │ 🔴 BLOQUEO CRÍTICO                      │
     │ Proyecto "Planes Dev" tiene un bloqueo  │
     │ sin resolver. Acción requerida.         │
     │ [Ver detalle]  [Descartar]              │
     └────────────────────────────────────────┘
     ```
   - Desaparece en 5s o click en X
    ↓
7. EMAIL (Resend API - async):
   - Generar plantilla HTML
   - POST a api.resend.com/emails
   - Enviar a email de gerente
    ↓
CLIENTE (Gerente)
    ↓
8. Recibe alerta visual instantáneamente (WebSocket)
   - Navega a proyecto si lo desea
   - Email llega en < 1 minuto
    ↓
9. Respuesta al cliente Líder:
   - 201 Created
   - Toast: "Bloqueo registrado, gerente notificado"
```

---

## 5. SEGURIDAD

### 5.1 Autenticación

**MVP: Email/Contraseña (Supabase Auth)**
- Usuario se registra con email + contraseña
- Supabase maneja hashing (bcrypt), sesiones, tokens
- JWT tokens con expiración (8 horas)
- Refresh tokens para renovar sesión

```typescript
// Ejemplo: Login desde Next.js
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@empresa.com',
  password: 'password123'
})

// Sesión se almacena en httpOnly cookie (seguro)
```

**Release Posterior: Azure AD / OAuth 2.0 (Office 365)**
- SSO con credenciales corporativas
- Integración con Supabase Auth providers
- Mantener compatibilidad con email/contraseña

### 5.2 Autorización (RBAC)

```
Rol: GERENTE
├─ CRUD completo: proyectos, bloqueos, riesgos
├─ Acceso a: Vista Gerencial, Reportería, Historial
├─ Generar: Semáforos (completo y abreviado)
└─ Modificar: Permisos, configuración global

Rol: LÍDER ÁREA
├─ CRUD en: sus proyectos + líneas compartidas
├─ Lectura en: proyectos de otras áreas (resumen)
├─ Registrar: bloqueos, riesgos (en sus proyectos)
├─ Comentar: en proyectos (propios + compartidas)
└─ Acceso: Vista Gerencial (filtrada), Vista de Bloqueos

Rol: ESPECTADOR (futuro)
├─ Lectura: Vista Gerencial (solo resumen)
└─ No puede: crear, editar, eliminar
```

**Implementación:**
```typescript
// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verificar permisos según ruta
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const usuario = decode(session.value);
    if (usuario.rol !== 'Gerente') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 5.3 Validación de Entrada

- **Zod schemas** para validar todos los inputs (cliente + servidor)
- **Sanitización** de strings (remover HTML/JavaScript)
- **Type-safe:** TypeScript en todo el stack
- **Prepared statements:** Supabase ORM previene SQL injection

### 5.4 Protecciones Adicionales

| Amenaza | Protección |
|---------|-----------|
| **SQL Injection** | ORM + Prepared statements |
| **XSS** | Sanitización + Content-Security-Policy header |
| **CSRF** | CSRF tokens en formularios |
| **Rate Limiting** | 100 requests/min por usuario (Vercel) |
| **Encriptación en tránsito** | HTTPS/TLS 1.3+ |
| **Encriptación en reposo** | Supabase (AES-256 para datos sensibles) |
| **Auditoría** | historial_cambios + logs |

---

## 6. PERFORMANCE

### 6.1 Optimizaciones Frontend

```typescript
// Next.js 14 features:
- Incremental Static Regeneration (ISR)
- Server-Side Rendering para datos críticos
- Client Components para interactividad
- Image optimization (next/image)
- Code splitting automático
- Route prefetching

// React Query:
- Caching automático
- Invalidación inteligente
- Refetch on window focus
- Pagination + infinite scroll

// Zustand:
- Store centralizado pero ligero
- No necesita Redux boilerplate
```

### 6.2 Optimizaciones Backend

```typescript
// Supabase:
- Índices estratégicos en columnas de búsqueda
- Connection pooling
- RLS (Row-Level Security) built-in

// Caching:
- Redis (si necesario, fase 2)
- HTTP caching headers

// Database queries:
- SELECT solo columnas necesarias
- JOINs cuando sea posible (vs N+1)
- Limits + offsets para paginación
```

### 6.3 Targets de Performance

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| **First Contentful Paint** | < 1.5s | Lighthouse |
| **Largest Contentful Paint** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift** | < 0.1 | Lighthouse |
| **Time to Interactive** | < 3.5s | Lighthouse |
| **API response time** | < 500ms | Vercel Analytics |
| **Database query** | < 200ms | Supabase monitoring |

---

## 7. TESTING

### 7.1 Estrategia de Testing

```
┌─────────────────────────────────────┐
│ UNIT TESTS (Vitest)                 │
│ - Funciones puras                   │
│ - Lógica de negocio                 │
│ - Cálculos (colores semáforo, etc)  │
│ Target: 80%+ cobertura              │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ INTEGRATION TESTS (Vitest)          │
│ - API routes (mocked Supabase)      │
│ - Flujos de negocio                 │
│ - Validaciones                      │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ E2E TESTS (Playwright)              │
│ - Flujos principales del usuario    │
│ - Creación de proyecto              │
│ - Cambio de estado                  │
│ - Generación de semáforo            │
│ Target: 5-10 tests críticos         │
└─────────────────────────────────────┘
```

### 7.2 Ejemplos de Tests

```typescript
// Unit Test (Vitest)
describe('calcularColorSemaforo', () => {
  it('debe retornar VERDE si proyecto finalizado', () => {
    const proyecto = { estado: 'Finalizado', bloqueos: [] };
    const color = calcularColor(proyecto);
    expect(color).toBe('VERDE');
  });
  
  it('debe retornar ROJO si bloqueado > 5 días', () => {
    const proyecto = {
      estado: 'Bloqueado',
      bloqueos: [{ dias_bloqueado: 7 }]
    };
    const color = calcularColor(proyecto);
    expect(color).toBe('ROJO');
  });
});

// E2E Test (Playwright)
test('Flujo completo: crear proyecto + registrar bloqueo', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="nuevo-proyecto"]');
  await page.fill('[name="nombre"]', 'Test Proyecto');
  // ... completar formulario
  await page.click('[data-testid="guardar"]');
  
  // Verificar proyecto creado
  await expect(page.locator('text=Test Proyecto')).toBeVisible();
  
  // Abrir proyecto + agregar bloqueo
  await page.click('text=Test Proyecto');
  await page.click('[data-testid="agregar-bloqueo"]');
  // ... completar bloqueo
  
  // Verificar notificación
  await expect(page.locator('[role="alert"]')).toBeVisible();
});
```

---

## 8. DEPLOYMENT

### 8.1 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```



---

## 9. ESTRUCTURA DE DIRECTORIOS (Claude Project + Next.js)

```
proyecto-personas/

# ==================== CLAUDE PROJECT CONTEXT ====================
├── claude.md                            # 🤖 Contexto principal de Claude
│                                        # Contiene:
│                                        # - Descripción del proyecto
│                                        # - Arquitectura de alto nivel
│                                        # - Stack tecnológico
│                                        # - Convenciones de código
│                                        # - Guía de decisiones
│                                        # AUTO-GENERADO por pre-commit hook

├── docs/                                # 📚 Documentación viva del proyecto
│   ├── arquitectura.md                  # Diagrama y componentes principales
│   │                                    # AUTO-GENERADO desde código
│   │
│   ├── modulos.md                       # Documentación de módulos/packages
│   │                                    # - Componentes disponibles
│   │                                    # - Hooks personalizados
│   │                                    # - Utilidades compartidas
│   │                                    # AUTO-GENERADO desde TSDoc
│   │
│   ├── api-reference.md                 # Referencia de APIs y Supabase Functions
│   │                                    # - Endpoints disponibles
│   │                                    # - Parámetros y tipos
│   │                                    # - Ejemplos de uso
│   │                                    # AUTO-GENERADO desde code comments
│   │
│   ├── onboarding.md                    # Guía para nuevos developers
│   │                                    # - Setup inicial
│   │                                    # - Primeras features
│   │                                    # - Troubleshooting
│   │                                    # AUTO-GENERADO y mantenido
│   │
│   ├── changelog.md                     # Historial de cambios
│   │                                    # AUTO-GENERADO desde commits
│   │
│   ├── decisions.md                     # ADRs (Architecture Decision Records)
│   │                                    # Decisiones técnicas tomadas
│   │
│   └── database/
│       └── schema.md                    # Schema de BD generado
│                                        # AUTO-GENERADO desde migrations

# ==================== CLAUDE PROJECT CONFIGURATION ====================
├── .claude/
│   ├── agents/
│   │   ├── code-agent.yaml
│   │   ├── api-agent.yaml
│   │   ├── data-agent.yaml
│   │   └── deploy-agent.yaml
│   │
│   ├── skills/
│   │   ├── code-quality.yaml
│   │   ├── database.yaml
│   │   ├── auth.yaml
│   │   └── deployment.yaml
│   │
│   ├── hooks/
│   │   ├── onProjectStart.js
│   │   ├── beforeBuild.js
│   │   ├── beforeCommit.js              # ⭐ NUEVO: Actualizar documentación
│   │   └── afterDeploy.js
│   │
│   ├── commands/
│   │   ├── scaffold.js
│   │   ├── dbsync.js
│   │   ├── testenv.js
│   │   └── docs-sync.js                 # ⭐ NUEVO: Sincronizar docs
│   │
│   ├── rules.yaml
│   └── mcp-configs/
│       ├── supabase.config.json
│       ├── github.config.json
│       ├── vercel.config.json
│       └── npm.config.json

# ==================== NEXT.JS SOURCE CODE ====================
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── logout/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── proyectos/
│   │   │   ├── bloqueos/
│   │   │   ├── focos/
│   │   │   ├── reporteria/
│   │   │   └── settings/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/route.ts
│   │   │   ├── proyectos/route.ts
│   │   │   ├── bloqueos/route.ts
│   │   │   ├── reporteria/route.ts
│   │   │   └── notificaciones/route.ts
│   │   │
│   │   └── middleware.ts
│   │
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Proyectos/
│   │   │   ├── ProyectoDetail.tsx        # Detalle con 3 pestañas
│   │   │   ├── ProyectoForm.tsx
│   │   │   ├── ProyectoCard.tsx
│   │   │   │
│   │   │   ├── Kanban/
│   │   │   │   ├── KanbanBoard.tsx       # Board principal con columnas
│   │   │   │   ├── KanbanColumn.tsx      # Columna (Pendiente, En Curso, Finalizado)
│   │   │   │   ├── TaskCard.tsx          # Tarjeta individual de tarea
│   │   │   │   ├── TaskDetailModal.tsx   # Modal detalle + comentarios
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Timeline/
│   │   │   │   ├── TimelineChart.tsx     # Gantt visual
│   │   │   │   ├── TaskProgressBar.tsx   # Barra de tarea individual
│   │   │   │   ├── TimelineScaleSelector.tsx  # Selector 1d/1w/1m
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Lista/
│   │   │   │   ├── TaskTable.tsx         # Tabla con todas las tareas
│   │   │   │   ├── TaskRow.tsx           # Fila editable
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── Bloqueos/
│   │   ├── Reporteria/
│   │   └── Common/
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── validations.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useBloqueos.ts
│   │   ├── useTareas.ts                  # NEW: React Query hooks para tareas
│   │   ├── useAuth.ts
│   │   └── useNotificaciones.ts
│   │
│   ├── stores/
│   │   ├── projectStore.ts
│   │   ├── uiStore.ts
│   │   └── authStore.ts
│   │
│   ├── types/
│   │   ├── database.ts
│   │   ├── api.ts
│   │   ├── domain.ts
│   │   └── index.ts
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/

# ==================== SUPABASE (BACKEND) ====================
├── supabase/
│   ├── functions/
│   │   ├── crear-proyecto/index.ts
│   │   ├── actualizar-estado/index.ts
│   │   ├── crear-tarea/index.ts          # NEW: Crear tarea
│   │   ├── actualizar-tarea-estado/index.ts  # NEW: Actualizar tarea
│   │   ├── recalcular-avance-proyecto/index.ts  # NEW: Recalcular % proyecto
│   │   ├── registrar-bloqueo/index.ts
│   │   ├── generar-semaforo/index.ts
│   │   ├── enviar-notificacion/index.ts
│   │   └── exportar-pdf/index.ts
│   │
│   ├── migrations/
│   │   ├── 001_crear_tabla_proyectos.sql
│   │   ├── 002_crear_tabla_tareas.sql   # NEW: Tabla de tareas
│   │   ├── 003_crear_tabla_bloqueos.sql
│   │   ├── 004_crear_tabla_riesgos.sql
│   │   └── ...
│   │
│   └── seed/
│       └── seed.sql

# ==================== CI/CD & AUTOMATION ====================
├── .github/
│   ├── workflows/
│   │   ├── test.yml
│   │   ├── deploy.yml
│   │   └── db-migrate.yml
│   │
│   └── scripts/
│       ├── generate-api-docs.js         # Generar API reference
│       ├── generate-schema-docs.js      # Generar schema.md
│       ├── generate-module-docs.js      # Generar modulos.md
│       └── update-claude-context.js     # Actualizar claude.md

├── scripts/
│   ├── pre-commit.js                    # Git hook: actualizar docs
│   ├── post-merge.js                    # Después de merge: sync docs
│   └── docs-generator.js                # Generador universal de docs

# ==================== CONFIGURATION & ROOT ====================
├── .husky/                              # Git hooks
│   └── pre-commit                       # Ejecutar before-commit.js
│
├── .env.local
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.json
│
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
│
├── package.json
├── package-lock.json
│
└── README.md
```

---

## 9.1 claude.md - Contexto Principal de Claude

**Propósito:** Archivo único que Claude lee al iniciar, contiene todo el contexto necesario.

**Contenido auto-generado:**
```markdown
# Sistema de Dirección Operativa - Contexto de Claude

## 🎯 Descripción Rápida
[Auto-generado desde package.json description]

## 🏗️ Arquitectura
[Auto-generado desde diagrama en docs/arquitectura.md]

## 📦 Stack
- Frontend: Next.js 14 + TypeScript
- Backend: Supabase PostgreSQL + Deno Functions
- Testing: Vitest + Playwright
- Deployment: Vercel + GitHub Actions
[Auto-generado desde package.json dependencies]

## 📚 Documentación Importante
- [Arquitectura completa](./docs/arquitectura.md)
- [Módulos y componentes](./docs/modulos.md)
- [API Reference](./docs/api-reference.md)
- [Onboarding](./docs/onboarding.md)
- [Decisiones técnicas](./docs/decisions.md)

## 🤖 Agentes Disponibles
[Auto-generado desde .claude/agents/]

## 📋 Últimos Cambios
[Auto-generado desde últimos 5 commits]

## ⚠️ Consideraciones Actuales
[Auto-generado: TODOs + PRs abiertos]

---
Generado: [timestamp]
Last Updated: [fecha último commit]
```

---

## 9.2 docs/arquitectura.md - Diagrama de Componentes

**Auto-generación:** Extraer de comentarios en código + diagrama manual.

```markdown
# Arquitectura del Sistema

## Diagrama de Componentes
[Generado desde análisis de imports + manual diagram]

## Flujos Principales
- Crear Proyecto
- Cambiar Estado
- Registrar Bloqueo
- Generar Semáforo
- Enviar Notificación

[Auto-generado desde flowchart en código]

## Dependencias Entre Módulos
[Auto-generado desde import graph]

---
Last Updated: [auto-fecha]
```

---

## 9.3 docs/modulos.md - Referencia de Módulos

**Auto-generación:** Extraer de JSDoc/TSDoc en archivos.

```markdown
# Módulos y Componentes Disponibles

## Componentes React

### Dashboard.VistaGerencial
/**
 * @component Vista gerencial principal
 * @param {GerencialProps} props
 * @returns {JSX.Element}
 */
[Auto-extraído de src/components/Dashboard/VistaGerencial.tsx]

### Proyectos.ProyectoForm
/**
 * Formulario para crear/editar proyectos
 */
[Auto-extraído]

## Hooks Personalizados

### useProjects()
/**
 * Hook para gestionar proyectos con React Query
 * @returns {UseProjectsReturn}
 */
[Auto-extraído de src/hooks/useProjects.ts]

## Utilidades

### calcularColorSemaforo(proyecto)
/**
 * Calcula el color del semáforo basado en estado
 */
[Auto-extraído de src/lib/utils.ts]

---
Last Updated: [auto-fecha]
Generated from TSDoc comments
```

---

## 9.4 docs/api-reference.md - Referencia de APIs

**Auto-generación:** Extraer de code comments en API routes y Supabase Functions.

```markdown
# API Reference

## Next.js API Routes (Proxy)

### POST /api/proyectos
/**
 * Crear nuevo proyecto
 * @param {CreateProjectRequest} body
 * @returns {CreateProjectResponse}
 * @throws {ValidationError}
 */
[Auto-extraído de src/app/api/proyectos/route.ts]

## Supabase Functions

### crear-proyecto
/**
 * Función serverless para crear proyecto
 * Invoked: supabase.functions.invoke('crear-proyecto', { body })
 */
[Auto-extraído de supabase/functions/crear-proyecto/index.ts]

### generar-semaforo
[Auto-extraído]

---
Last Updated: [auto-fecha]
Generated from JSDoc in code
```

---

## 9.5 docs/onboarding.md - Guía para Developers

**Auto-generación:** Parcial (template) + secciones auto-actualizadas.

```markdown
# Onboarding - Primeros Pasos

## Setup Inicial
1. Clone repo
2. npm install
3. cp .env.example .env.local
4. npm run dev

## Primera Feature
[Manual pero con commands actualizados auto-generados]

## Estructura del Proyecto
[Auto-referencia a docs/modulos.md y docs/arquitectura.md]

## Primeros Tests
npm run test
npm run e2e

---
Actualizado: [auto-fecha]
```

---

## 9.6 Sistema de Auto-Actualización por Commit

### 9.6.1 Git Hook: pre-commit

**Archivo:** `.husky/pre-commit` y `.claude/hooks/beforeCommit.js`

```bash
#!/bin/bash
# .husky/pre-commit

# Ejecutar script de actualización de docs
node .claude/hooks/beforeCommit.js

# Si hay cambios en docs, commitearlos
git add docs/ claude.md
```

**Script:** `.claude/hooks/beforeCommit.js`

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Generar API reference desde comentarios
generateApiDocs();

// 2. Generar módulos desde TSDoc
generateModuleDocs();

// 3. Generar schema desde migrations
generateSchemaDocs();

// 4. Actualizar claude.md
updateClaudeContext();

// 5. Generar changelog desde commits
updateChangelog();

function generateApiDocs() {
  // Escanear src/app/api/ y supabase/functions/
  // Extraer JSDoc comments
  // Generar docs/api-reference.md
}

function generateModuleDocs() {
  // Escanear src/components/, src/hooks/, src/lib/
  // Extraer TSDoc comments
  // Generar docs/modulos.md
}

function generateSchemaDocs() {
  // Leer supabase/migrations/
  // Generar docs/database/schema.md
}

function updateClaudeContext() {
  // Leer package.json
  // Leer .claude/agents/
  // Leer últimos commits
  // Generar/actualizar claude.md
}

function updateChangelog() {
  // git log --oneline -20
  // Generar docs/changelog.md (solo últimos cambios)
}
```

### 9.6.2 GitHub Actions: Auto-Documentación

**Archivo:** `.github/workflows/docs.yml`

```yaml
name: Auto-Documentation

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate API Docs
        run: node scripts/generate-api-docs.js
      
      - name: Generate Module Docs
        run: node scripts/generate-module-docs.js
      
      - name: Generate Schema Docs
        run: node scripts/generate-schema-docs.js
      
      - name: Update Claude Context
        run: node scripts/update-claude-context.js
      
      - name: Commit changes
        run: |
          git config user.name "Claude Bot"
          git config user.email "claude@proyecto.local"
          git add docs/ claude.md
          git commit -m "docs: auto-generated documentation" || true
          git push
```

---

## 9.7 Cómo Funciona la Actualización Automática

### Flujo en cada commit:

```
Developer hace commit local
    ↓
1. Pre-commit hook ejecuta
   ├─ Genera docs/api-reference.md (desde JSDoc)
   ├─ Genera docs/modulos.md (desde TSDoc)
   ├─ Genera docs/database/schema.md (desde migrations)
   ├─ Actualiza claude.md (contexto principal)
   └─ Actualiza docs/changelog.md (últimos 5 commits)
    ↓
2. Si hay cambios en docs/
   ├─ Auto-agrega docs/ a staging
   └─ Incluye en commit
    ↓
3. Push a GitHub
    ↓
4. GitHub Actions ejecuta
   ├─ Re-valida docs (por si falló local)
   ├─ Genera schema visual (SVG)
   └─ Hace commit de actualizaciones si hay
    ↓
Resultado: claude.md + docs/ SIEMPRE actualizados
```

### Ventajas:

✅ **Documentación siempre fresca:** Actualizada en cada commit  
✅ **Sin trabajo manual:** Generado automáticamente desde código  
✅ **Contexto perfecto para Claude:** claude.md tiene info actual  
✅ **Referencia única de verdad:** Código es la fuente, docs derivada  
✅ **Fácil onboarding:** Nuevos devs tienen toda la info  
✅ **Historial de cambios:** docs/changelog.md muestra qué pasó  

---

## 9.8 Configuración en package.json

```json
{
  "scripts": {
    "docs:generate": "node scripts/docs-generator.js",
    "docs:watch": "nodemon --watch src --watch supabase scripts/docs-generator.js",
    "prepare": "husky install",
    "pre-commit": "node .claude/hooks/beforeCommit.js"
  },
  "husky": {
    "hooks": {
      "pre-commit": ".husky/pre-commit"
    }
  }
}
```

---

## 9.9 Ejemplo: Qué Contiene claude.md Después de Commits

```markdown
# Sistema de Dirección Operativa para Área de Personas

**Last Updated:** 2026-04-10 15:30:45 UTC  
**Commits desde última generación:** 5

## Descripción
SaaS para gestionar proyectos, bloqueos y generar reportería automática
en el área de Personas de [empresa].

## 🏗️ Stack
- Frontend: Next.js 14 + TypeScript + Tailwind
- Backend: Supabase PostgreSQL + Deno Functions
- Testing: Vitest + Playwright
- Deployment: Vercel + GitHub Actions

## 📚 Documentación
- [Arquitectura](./docs/arquitectura.md) - Última actualización: 2026-04-10
- [Módulos](./docs/modulos.md) - Última actualización: 2026-04-10
- [API Reference](./docs/api-reference.md) - Última actualización: 2026-04-10
- [Onboarding](./docs/onboarding.md)
- [Decisiones técnicas](./docs/decisions.md)

## 🤖 Agentes Disponibles
- code-agent: Implementar features UI
- api-agent: APIs y Supabase Functions
- data-agent: Modelo de datos
- deploy-agent: Deployments y CI/CD

## 📋 Últimas 5 Actualizaciones
1. 2026-04-10: feat: tabla editable en semáforo abreviado
2. 2026-04-09: fix: validación en form de proyectos
3. 2026-04-08: refactor: composición de hooks
4. 2026-04-07: docs: actualizar arquitectura
5. 2026-04-06: test: agregar E2E para crear proyecto

## ⚠️ TODOs Abiertos
- [ ] Integración Azure AD (release posterior)
- [ ] Mobile responsive (tablet)
- [ ] Dark mode

## 📈 Métricas
- Archivos fuente: 145
- Componentes: 23
- Hooks personalizados: 8
- Tests: 67
- Cobertura: 82%

---
Generated: Automated every commit
Last Human Edit: 2026-04-06
```

---

## 10. DEPENDENCIAS PRINCIPALES

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.7.0",
    "next-auth": "^4.24.0",
    "@next-auth/supabase-adapter": "^1.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.45.0",
    "tailwindcss": "^3.3.0",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.0.0",
    "react-pdf": "^7.0.0",
    "resend": "^3.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.2.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@playwright/test": "^1.39.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 11. DECISIONES TÉCNICAS Y TRADE-OFFS

### 11.1 Why Next.js 14 + TypeScript?

**Decisión:** Next.js 14 (App Router) + TypeScript

**Alternativas consideradas:**
- React SPA (CRA) - ❌ No tiene SSR nativo, SEO, API routes
- Vue.js - ❌ Stack menos familiar para el equipo
- Svelte - ❌ Ecosistema más pequeño, menos librerías

**Justificación:**
- ✅ App Router (mejor que Pages Router)
- ✅ Server Components para rendering eficiente
- ✅ API routes integradas (no necesita backend separado)
- ✅ TypeScript by default (type-safety)
- ✅ Vercel deployment nativo
- ✅ Grande comunidad, muchas librerías compatibles

### 11.2 Why Supabase + PostgreSQL?

**Decisión:** Supabase (PostgreSQL managed)

**Alternativas:**
- Firebase - ❌ Menos control, queries más limitadas
- MongoDB - ❌ NoSQL + ACID transactions complejas
- Planetscale (MySQL) - ❌ Menos features que Postgres

**Justificación:**
- ✅ PostgreSQL power (ACID, JSON, Full-text search)
- ✅ Supabase Auth integrada (OAuth simple)
- ✅ Realtime subscriptions (WebSocket)
- ✅ Storage integrado (PDFs, archivos)
- ✅ RLS (seguridad a nivel de row)
- ✅ Pricing transparent (paga por uso)
- ✅ Libre de vendor lock-in (es PostgreSQL)

### 11.3 Why Zustand + React Query (no Redux)?

**Decisión:** Zustand para estado global + React Query para server state

**Alternativas:**
- Redux - ❌ Boilerplate excesivo para este MVP
- Recoil - ❌ Menos maduro que Zustand
- Context API - ❌ Performance issues con re-renders

**Justificación:**
- ✅ Zustand: API simple, ligero (2.3kb)
- ✅ React Query: caching automático, refetch inteligente
- ✅ Separación clara: client state (Zustand) vs server state (React Query)
- ✅ DevTools disponibles
- ✅ Fácil de aprender para equipo

### 11.4 Why Tailwind CSS (no styled-components)?

**Decisión:** Tailwind CSS

**Alternativas:**
- styled-components - ❌ Runtime overhead
- CSS Modules - ❌ Menos flexible, más verboso
- Chakra UI - ❌ Heavier que Tailwind

**Justificación:**
- ✅ Utility-first: rápido prototipado
- ✅ Sin CSS-in-JS runtime (mejor performance)
- ✅ Design system consistente built-in
- ✅ PurgeCSS automático (bundle pequeño)
- ✅ Tailwind UI components (paid) disponibles

### 11.5 Why Vercel + GitHub Actions (no GitLab)?

**Decisión:** Vercel para deploy frontend + GitHub Actions para CI/CD

**Alternativas:**
- Railway - ❌ Menos integración con Next.js
- Heroku - ❌ Viejo, deprecated
- AWS - ❌ Demasiado complejo para MVP

**Justificación:**
- ✅ Vercel creado por Next.js team
- ✅ Deploy automático on push
- ✅ Preview deployments (PR)
- ✅ Analytics integrado
- ✅ GitHub Actions free para repos

### 11.6 Why Email Auth (MVP) vs Azure AD (Release Posterior)?

**Decisión:** Email/Contraseña para MVP, Azure AD en release posterior

**Justificación MVP:**
- ✅ Implementación más rápida
- ✅ Supabase Auth nativo (sin configuración externa)
- ✅ No depende de IT corporativo
- ✅ Permite testing inmediato

**Justificación Azure AD Posterior:**
- ✅ Mejor UX (SSO corporativo)
- ✅ Requiere coordinación con IT
- ✅ Menos urgente que funcionalidad core
- ✅ Se integra con Supabase Auth providers

---

## 12. ROADMAP TÉCNICO POST-MVP

### Fase 2

- [ ] Redis para caching
- [ ] Integración con BUK (API)
- [ ] Integración con Book (webhook)
- [ ] Notificaciones en Teams
- [ ] Mobile responsive (tablet)
- [ ] Dark mode
- [ ] Multi-idioma (ES/EN)

### Fase 3

- [ ] Integración GTR documental (API)
- [ ] KPIs dashboard (HR metrics)
- [ ] Análisis predictivo (ML basic)
- [ ] App móvil (React Native)
- [ ] Webhooks custom

### Fase 4

- [ ] Escalabilidad a otras áreas
- [ ] SaaS multi-tenant
- [ ] White-label
- [ ] API pública para terceros
- [ ] Analytics avanzado (BI)

---

## 13. RIESGOS TÉCNICOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| **Realtime updates fallan** | Media | Alto | Testing exhaustivo, fallback a polling |
| **Supabase outage** | Baja | Alto | Monitoreo, SLA de Supabase (99.9%) |
| **Performance degrada** | Media | Medio | Load testing, índices DB, caching |
| **Auth Azure AD falla** | Baja | Alto | Fallback local auth (dev), manual testing |
| **PDF export lento** | Baja | Bajo | Async generation, job queue (fase 2) |

---

## 14. APROBACIÓN TDD

**Revisado por:**
- [ ] Tech Lead
- [ ] Architect
- [ ] DevOps

**Observaciones / Cambios:**

```
[Espacio para feedback]
```

**Aprobado:** ☐ Sí ☐ No

**Fecha aprobación:** _______________

---

**Documento preparado por:** Agente Senior Producto & Tecnología - Intuivo  
**Versión:** 1.0 TDD  
**Última actualización:** Abril 2026

