# 📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Sistema de Dirección Operativa para Área de Personas

**Versión:** 2.0 PRD  
**Estado:** Final  
**Fecha:** Abril 2026  
**Basado en:** Documento de Entendimiento Aprobado v1.0

---

## 1. RESUMEN EJECUTIVO

### 1.1 Visión del Producto

**Transformar la gestión de proyectos y reportería del área de Personas** desde un modelo manual (Excel, OneNote, reuniones) a un modelo **centralizado, visible, automático y accionable** que permita a la gerente tomar decisiones en segundos, identificar bloqueos rápidamente e intervenir donde sea necesario.

### 1.2 Problema a Resolver

| Aspecto | Estado Actual | Impacto |
|--------|--------------|--------|
| **Seguimiento de proyectos** | Manual, reuniones semanales, notas dispersas | Alto |
| **Consolidación de reportes** | 1h/mes semáforo + 1h más PPT | Alto |
| **Visibilidad transversal** | Fragmentada por área | Alto |
| **Detección de bloqueos** | Reactiva, tardía, depende de reportes verbales | Alto |
| **Escalamientos** | Informales, sin registro, fácil de olvidar | Medio |
| **Trazabilidad de decisiones** | Ninguna, "quedó en la conversación" | Medio |

### 1.3 Solución Propuesta

Plataforma web (SaaS) que centraliza:
- **Gestión de proyectos/líneas** con estado, bloqueos, riesgos
- **Visualización gerencial** (dashboard ejecutivo en 15 segundos)
- **Reportería automática** (semáforo auto-generado, abreviado manual)
- **Notificaciones inteligentes** (escalamiento automático de bloqueos)
- **Historial completo** (cambios de estado, decisiones, comentarios)

### 1.4 Impacto Esperado

| Métrica | Baseline | Target | Impacto |
|---------|----------|--------|---------|
| Tiempo consolidación semáforo | 2 horas | 15 min automático | **87.5% menos tiempo** |
| Eficiencia reuniones coordinación | 45 min operativas | 30 min (menos operativa) | **33% menos tiempo** |
| Bloqueos sin resolver > 3 días | SIN DATA | <20% | **Resolución más rápida** |
| Visibilidad de bloqueos críticos | 0% | 100% | **Intervención oportuna** |
| Dependencia de gerente para tracking | 100% | <20% | **Autonomía de equipos** |

---

## 2. USUARIOS Y STAKEHOLDERS

### 2.1 Usuarios Primarios

#### 2.1.1 Gerente de Personas
**Perfil:**
- Edad: ~45 años
- Experiencia: 6 meses en el cargo
- Tech-savviness: Básica (Excel, Teams, OneNote, ChatGPT)
- Dedicación: 100% al área de Personas

**Necesidades:**
- Ver estado de todos los proyectos de 4 áreas en 15 segundos
- Identificar dónde intervenir (bloqueos, decisiones pendientes)
- Generar reportes ejecutivos con 2 clics
- Reducir tiempo en consolidaciones manuales
- Tomar decisiones rápidas con contexto completo

**Dolor principal:**
- Dependencia de su propia memoria + reuniones + consolidación manual
- No puede delegar tracking porque "se pierden las cosas"
- Reuniones ineficientes (hablan de descubrimientos, no de decisiones)

**Éxito para ella:**
- Sistema que "no necesita que le pregunte a alguien si está hecho"
- Reportes generados automáticamente
- Poder enfocarse en intervención + decisiones, no en tracking

---

#### 2.1.2 Líderes de Área (x4)
**Perfiles:**
- Gestión de Personas, Desarrollo Organizacional, SSO, Comunicaciones
- Edad: 35-50 años
- Tech-savviness: Básica a Media (Excel, Teams)
- Dedicación: 100% a su área

**Necesidades:**
- Reportar estado de proyectos sin ambigüedad (no verbalmente)
- Ver qué están haciendo otros líderes (proyectos compartidos)
- Registrar bloqueos de forma que la gerente "vea y actúe"
- Tener registro de decisiones tomadas
- No gastar tiempo en formateo/reportería

**Dolor principal:**
- Reuniones semanales donde "revuelven todo"
- Falta claridad sobre qué está entrampado
- Decisiones que se olvidan o cambian sin avisar
- Gerente pregunta en bilaterales lo que debería saber del sistema

**Éxito para ellos:**
- Sistema simple (no como Jira, Asana, Planner)
- Actualizar en 2 minutos y "listo"
- Ver claramente qué necesita la gerente de ellos
- Menos reuniones, más acción

---

### 2.2 Usuarios Secundarios

#### 2.2.1 Equipos Operativos
- Visualización pasiva de proyectos (no entrada de datos)
- Ver dónde están sus tareas asignadas
- Reciben notificaciones de cambios relevantes

**Nota:** Fuera de MVP, posible en fase 2

#### 2.2.2 Gerente General
- Recibe reporte ejecutivo mensual
- Ve semáforo abreviado (3 puntos por color)
- NO entra al sistema, solo consume reportes

---

### 2.3 Stakeholders

| Stakeholder | Interés | Influencia |
|------------|---------|-----------|
| Gerente de Personas | Éxito = adopción completa | Alta |
| IT/Infraestructura | Viabilidad técnica, seguridad | Media |
| Gerente General | Calidad de reportes, decisiones informadas | Alta |
| Equipos Operativos | Claridad de prioridades | Baja |

---

## 3. ALCANCE

### 3.1 EN ALCANCE (MVP)

**Funcionalidades Core:**

1. ✅ **Gestión de Proyectos/Líneas**
   - CRUD completo (crear, leer, actualizar, eliminar)
   - Campos: nombre, tipo, subtipo, foco, área, **categoría**, responsable, fechas, descripción, objetivo, resultado esperado
   - Estados: Pendiente, En Curso, En Riesgo, Bloqueado, Finalizado
   - Categorías por área (líneas temáticas):
     - **Desarrollo Organizacional:** Desempeño, Clima Laboral, Capacitación, Empleabilidad Local, Liderazgo
     - **Gestión de Personas:** Temas Legales/Normativos, Reportería, Remuneraciones, Beneficios, Administración
     - **SSO:** Sistemas de Gestión, Programas de Prevención, Investigación de Incidentes, Cumplimiento Normativo, Cultura de Seguridad
     - **Comunicaciones:** Comunicación Interna, Comunicación Externa, Marca Empleadora, Reputación, Relaciones Comunitarias

2. ✅ **Gestión de Bloqueos**
   - Registro de bloqueos (descripción, tipo, fecha, acción requerida)
   - Resolución de bloqueos (cierre con comentario)
   - Historial de bloqueos

3. ✅ **Gestión de Riesgos**
   - Registro de riesgos (descripción, probabilidad, impacto, mitigación)
   - Actualización de estado de riesgos

4. ✅ **Vistas del Sistema**
   - Vista Gerencial (tabla dinámmica, filtrable)
   - Vista de Proyecto (detalle completo)
   - Vista por Foco (estado agregado)
   - Vista de Bloqueos (todos, transversal)

5. ✅ **Reportería Automática**
   - Semáforo Completo (auto-generado)
   - Semáforo Abreviado (3 puntos/color, selección manual)
   - Exportación a PDF

6. ✅ **Notificaciones Básicas**
   - Email cuando bloqueo se registra
   - Email cuando estado de proyecto cambia
   - Email cuando gerente asigna acción

7. ✅ **Autenticación y Permisos**
   - Login con Office 365 (SSO)
   - Rol Gerente (acceso total)
   - Rol Líder de Área (acceso a sus proyectos + compartidas)
   - Historial de auditoría (quién cambió qué, cuándo)

8. ✅ **Integración**
   - Notificaciones vía Email (SMTP)
   - Posibilidad de integración con Teams (futura)

---

### 3.2 FUERA DE ALCANCE (MVP)

**Funcionalidades Fase 2+:**

- ❌ Integración con plataforma GTR documental
- ❌ Integración con Book (módulo talento)
- ❌ Integración con BUK (remuneraciones)
- ❌ Captura de datos de terceros en tiempo real (ej: API de proveedor de capacitación)
- ❌ KPIs (dotación, accidentabilidad, reclutamiento, capacitación, comunicaciones)
- ❌ Gestor de tareas (asignación de tareas individuales a operativos)
- ❌ Presupuesto vinculado a proyectos (control fino)
- ❌ Análisis predictivo de bloqueos
- ❌ App móvil nativa
- ❌ Calendario integrado con Outlook
- ❌ Integraciones con aplicaciones terceras (Slack, etc.)

---

## 4. REQUISITOS FUNCIONALES

### 4.1 Feature: Gestión de Proyectos / Líneas

#### 4.1.1 Crear Proyecto / Línea

**Flujo:**
1. Usuario hace click en "+ Nuevo Proyecto"
2. Sistema abre formulario con campos obligatorios y opcionales
3. Usuario completa formulario
4. Sistema valida
5. Usuario guarda
6. Sistema crea registro y notifica a responsables

**Campos Obligatorios:**
- Nombre
- Tipo [Proyecto | Línea]
- Área [DO | Gestión de Personas | SSO | Comunicaciones]
- Categoría (dropdown dinámico según Área seleccionada)
- Foco Estratégico [Enum: 4 opciones]
- Responsable Primario [Dropdown: líderes de área]
- Fecha Inicio
- Fecha Fin Planificada

**Campos Opcionales:**
- Descripción Ejecutiva
- Objetivo
- Resultado Esperado
- Subtipo [Operativo | Campaña | Estratégico] (solo para Proyecto)
- Participantes (array, multi-select)
- Proyecto Padre (si es subproyecto)

**Validaciones:**
- Nombre no vacío, max 200 caracteres
- Fecha fin > fecha inicio
- Responsable obligatorio
- Foco debe ser uno de los 4 definidos

**Post-creación:**
- Sistema registra fecha/hora de creación
- Envía notificación a responsable: "Se te asignó proyecto X"
- Proyecto aparece en vistas correspondientes

---

#### 4.1.2 Actualizar Estado de Proyecto

**Flujo:**
1. Usuario abre Vista Gerencial o Detalle de Proyecto
2. Hace click en Estado actual
3. Sistema abre dropdown con opciones: [Pendiente, En Curso, En Riesgo, Bloqueado, Finalizado]
4. Usuario selecciona nuevo estado
5. Sistema solicita comentario (obligatorio)
6. Usuario ingresa comentario
7. Usuario confirma
8. Sistema registra cambio + comentario + timestamp
9. Sistema notifica a responsable y gerente

**Validaciones:**
- No puede cambiar a Finalizado si hay bloqueos abiertos (warning)
- Comentario obligatorio (min 10 caracteres)

**Post-actualización:**
- Cambio registrado en historial
- Notificación email a: responsable, gerente, participantes
- Sistema recalcula colores de semáforo

---

#### 4.1.3 Actualizar % Avance

**Flujo:**
1. Usuario abre Detalle de Proyecto
2. Ingresa % avance (0-100)
3. Sistema calcula automáticamente:
   - Días transcurridos desde inicio
   - % tiempo transcurrido esperado
   - Si "% avance < % tiempo transcurrido" → alerta amarilla
4. Usuario confirma
5. Sistema registra cambio

**Alertas Automáticas:**
- Si % avance < 50% del tiempo transcurrido → "Proyecto en riesgo de retraso"
- Sistema sugiere cambiar estado a "En Riesgo"

---

#### 4.1.4 Ver Proyecto (Detalle Completo)

**Secciones mostradas:**

1. **Header**
   - Nombre proyecto
   - Estado (color) + % avance
   - Responsable + participantes
   - Días restantes (rojo si plazo vencido)

2. **Contexto**
   - Descripción ejecutiva
   - Objetivo
   - Resultado esperado
   - Tipo y subtipo

3. **Timeline**
   - Inicio, fin planificada, fin real (si aplica)
   - Hito próximo
   - Días restantes

4. **Bloqueos Activos** (si existen)
   - Tabla: Bloqueo | Tipo | Días Bloqueado | Acción Requerida
   - Acciones: Marcar como resuelto, agregar comentario

5. **Riesgos Identificados** (si existen)
   - Tabla: Riesgo | Probabilidad | Impacto | Mitigación
   - Acciones: Actualizar, cerrar

6. **Subproyectos / Tareas** (si aplica)
   - Tabla: Nombre | Estado | % Avance | Responsable
   - Acciones: Crear nueva tarea, abrir tarea

7. **Historial de Cambios**
   - Timeline: Cambios de estado, bloqueos registrados, decisiones
   - Mostrar: Qué cambió, quién, cuándo, comentario

8. **Comentarios/Decisiones**
   - Thread de comentarios (similar a Slack)
   - Filtro: Solo decisiones
   - Marcador: "Decisión registrada" vs "Comentario"

---

#### 4.1.5 Eliminar Proyecto

**Restricciones:**
- Solo se puede eliminar si Estado = Pendiente
- Requiere confirmación con "¿Estás seguro?"
- Envía notificación a responsable y gerente

---

### 4.2 Feature: Gestión de Bloqueos

#### 4.2.1 Registrar Bloqueo

**Flujo:**
1. Usuario abre Detalle de Proyecto
2. Hace click en "Agregar Bloqueo"
3. Sistema abre formulario modal
4. Usuario completa:
   - Descripción (obligatorio, min 20 caracteres)
   - Tipo [Pendiente definición | Espera recursos | Espera decisión | Capacity] (obligatorio)
   - Acción Requerida [Informar | Seguimiento | Decisión | Intervención] (obligatorio)
   - Requiere escalamiento [sí | no]
5. Usuario confirma
6. Sistema registra bloqueo + timestamp + autor
7. Sistema notifica a gerente (siempre) + responsable del proyecto
8. Sistema marca proyecto como "Bloqueado" (si no lo estaba)

**Validaciones:**
- Descripción min 20 caracteres, max 500
- Al menos uno de: Tipo o Acción Requerida

**Post-registro:**
- Bloqueo aparece en Detalle del Proyecto
- Bloqueo aparece en Vista de Bloqueos (transversal)
- Si Acción = Decisión o Intervención → aparece en Vista Gerencial como "Acción Requerida"
- Email a gerente: "Nuevo bloqueo en Proyecto X - Acción requerida: [tipo]"

---

#### 4.2.2 Resolver Bloqueo

**Flujo:**
1. Usuario abre Detalle de Proyecto
2. Hace click en bloqueo activo
3. Hace click en "Marcar como Resuelto"
4. Sistema solicita comentario de resolución (obligatorio)
5. Usuario ingresa comentario
6. Usuario confirma
7. Sistema registra resolución + timestamp + autor
8. Bloqueo se mueve a "Resuelto" (historial)
9. Sistema notifica a gerente y responsable

**Post-resolución:**
- Si proyecto estaba en estado "Bloqueado" y no hay más bloqueos activos → sugerir cambio a estado anterior
- Email: "Bloqueo en Proyecto X fue resuelto por [usuario]: [comentario]"

---

#### 4.2.3 Ver Todos los Bloqueos (Vista Transversal)

**Vista específica: "Bloqueos Activos"**

**Tabla dinámmica:**
```
Proyecto | Bloqueo | Tipo | Días Bloqueado | Acción Req. | Responsable | Status
```

**Filtros aplicables:**
- Por tipo de bloqueo
- Por días bloqueado (> 3 días, > 1 semana, > 2 semanas)
- Por acción requerida (solo Decisión, solo Intervención, etc.)
- Por responsable
- Por área

**Acciones:**
- Click en bloqueo → abre Detalle del Proyecto
- Ordenar por "Días Bloqueado" (descendente)
- Exportar lista a CSV

**Alertas visuales:**
- Bloqueos > 5 días: fondo rojo
- Bloqueos > 3 días: fondo naranja
- Bloqueos < 3 días: fondo amarillo

---

### 4.3 Feature: Gestión de Riesgos

#### 4.3.1 Registrar Riesgo

**Flujo:**
1. Usuario abre Detalle de Proyecto
2. Hace click en "Agregar Riesgo"
3. Sistema abre formulario modal
4. Usuario completa:
   - Descripción (obligatorio, min 20 caracteres)
   - Probabilidad [Alta | Media | Baja] (obligatorio)
   - Impacto [Alto | Medio | Bajo] (obligatorio)
   - Plan de Mitigación (opcional, texto libre)
5. Usuario confirma
6. Sistema registra riesgo + timestamp

**Matriz de Prioridad (automática):**
```
           Probabilidad
           Alta  Media  Baja
Impacto Alto | 1   | 2   | 3  |
       Medio | 2   | 3   | 4  |
       Bajo  | 3   | 4   | 5  |

1 = Crítico (rojo)
2 = Alto (naranja)
3 = Medio (amarillo)
4 = Bajo (azul)
5 = Mínimo (gris)
```

---

#### 4.3.2 Actualizar / Cerrar Riesgo

**Flujo:**
1. Usuario abre Detalle de Proyecto
2. Hace click en riesgo
3. Puede:
   - Actualizar probabilidad/impacto
   - Actualizar plan de mitigación
   - Marcar como "Mitigado" (cierra riesgo, va a historial)
4. Usuario confirma
5. Sistema registra cambio + timestamp

---

### 4.4 Feature: Vistas del Sistema

#### 4.4.1 Vista Gerencial (Dashboard Principal)

**Acceso:** home page, usuarios Gerente

**Tabla dinámmica:**

Columnas:
- Proyecto/Línea (nombre, clickeable)
- Foco (color-coded)
- Área
- Estado (icono: 🟢 verde, 🟡 amarillo, 🔴 rojo)
- % Avance (barra visual)
- Bloqueos (número, rojo si > 0)
- Riesgo (icono, color)
- Plazo (días restantes, rojo si vencido)
- Responsable (nombre)
- Acción Requerida (icono + texto)

**Comportamiento:**
- Ordenable por cualquier columna
- Clickeable: click en proyecto abre detalle
- Filas resaltadas: rojo si Bloqueado, naranja si En Riesgo

**Filtros (panel lateral):**
- ☐ Por área (checkboxes)
- ☐ Por foco (checkboxes)
- ☐ Por estado (checkboxes)
- ☐ Mostrar solo con bloqueos
- ☐ Mostrar solo con acciones pendientes
- ☐ Mostrar solo críticos (prioridad 1-2)
- ☐ Mostrar solo vencidos
- Fecha rango (start - end date picker)

**Acciones rápidas (hover sobre fila):**
- Abrir detalle
- Cambiar estado (dropdown)
- Agregar comentario

**Resumen superior (KPI dashboard):**
```
┌─────────────────────────────────────┐
│ Total Proyectos: 35                 │
│ 🟢 Verde: 15 (43%)                  │
│ 🟡 Amarillo: 12 (34%)               │
│ 🔴 Rojo: 8 (23%)                    │
│ ⚠️ Bloqueos Activos: 8              │
│ 📋 Acciones Pendientes: 5           │
└─────────────────────────────────────┘
```

---

#### 4.4.2 Vista de Proyecto (Detalle - Pestaña Híbrida)

**Acceso:** Click en proyecto desde Vista Gerencial → Abre Detalle con 3 pestañas

**Header del Proyecto:**
```
┌─────────────────────────────────────────────────────┐
│ Proyecto: Planes de Desarrollo 2026                 │
│ Estado: En Curso | % Avance: 75% | Plazo: 265 días │
│ Responsable: Sandra García | Participantes: 3       │
└─────────────────────────────────────────────────────┘
```

**Pestañas principales:**

---

### PESTAÑA 1: KANBAN (Tablero de Tareas)

**Descripción:** Visualización tipo Kanban con columnas de estado. Drag & drop para cambiar estado.

**Estructura:**

```
┌─────────────────────────────────────────────────────────────────┐
│           KANBAN - Tareas del Proyecto                          │
├─────────────────────────────────────────────────────────────────┤
│
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ │  PENDIENTE   │  │  EN CURSO    │  │ FINALIZADO   │
│ │   (3)        │  │   (2)        │  │   (5)        │
│ ├──────────────┤  ├──────────────┤  ├──────────────┤
│ │              │  │              │  │              │
│ │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │
│ │ │ Tarea A  │ │  │ │ Tarea C  │ │  │ │ Tarea E  │ │
│ │ │ Contenido│ │  │ │ 🔴 BLOQ  │ │  │ │ ✓ Hecho  │ │
│ │ │ diseño   │ │  │ │ 80%      │ │  │ │ 100%     │ │
│ │ └──────────┘ │  │ │ Hace 3d  │ │  │ └──────────┘ │
│ │              │  │ └──────────┘ │  │              │
│ │ ┌──────────┐ │  │              │  │ ┌──────────┐ │
│ │ │ Tarea B  │ │  │ ┌──────────┐ │  │ │ Tarea F  │ │
│ │ │ Estructura│ │  │ │ Tarea D  │ │  │ │ ✓ Hecho  │ │
│ │ │ 0%       │ │  │ │ 50%      │ │  │ │ 100%     │ │
│ │ │ Por hacer│ │  │ │ En progr.│ │  │ └──────────┘ │
│ │ └──────────┘ │  │ └──────────┘ │  │              │
│ │              │  │              │  │ ... (3 más)  │
│ └──────────────┘  └──────────────┘  └──────────────┘
│
│ [+ Agregar Tarea]
└─────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**

1. **Columnas de Estado:**
   - Pendiente (tareas no iniciadas)
   - En Curso (en progreso)
   - Finalizado (completadas)

2. **Tarjeta de Tarea (Tarea):**
   - Nombre (título)
   - Indicador de bloqueo (🔴 si tiene bloqueo activo)
   - % avance (barra visual)
   - Días desde inicio o "Hace X días bloqueado"
   - Responsable (avatar)
   - Click → abre detalle de tarea + comentarios

3. **Drag & Drop:**
   - Arrastrar tarea entre columnas
   - Al soltar → actualiza estado
   - Notificación a responsable
   - Registra en historial

4. **Filtros (Panel lateral):**
   - ☐ Mostrar solo bloqueadas
   - ☐ Mostrar solo en riesgo
   - ☐ Por responsable
   - ☐ Por prioridad

5. **Acciones rápidas (hover):**
   - Editar tarea
   - Agregar bloqueo
   - Marcar como bloqueada
   - Ver detalles

**Colores de tarjeta:**
- Verde: Sin bloqueos, on-time
- Amarillo: En riesgo (% avance bajo vs tiempo)
- Rojo: Bloqueada o con bloqueos activos

---

### PESTAÑA 2: TIMELINE / GANTT (Progreso Visual)

**Descripción:** Vista tipo Gantt para ver % avance, duración y dependencias.

```
┌─────────────────────────────────────────────────────────────────┐
│           TIMELINE - Progreso de Tareas                         │
├─────────────────────────────────────────────────────────────────┤
│
│ Tarea A: Diseño
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 15%  (2 de 13 días)
│
│ Tarea B: Estructura
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%   (0 de 10 días)
│
│ Tarea C: Validaciones
│ ████████████████░░░░░░░░░░░░░░░░░░ 80%  (8 de 10 días) 🔴 BLOQ
│
│ Tarea D: Testing
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 50%  (5 de 10 días)
│
│ Tarea E: Deploy
│ ██████████████████░░░░░░░░░░░░░░░░ 100% (10 de 10 días) ✓
│
│ Leyenda:
│ ████ = Progreso real
│ ░░░░ = Pendiente
│ 🔴   = Bloqueado
│ ✓    = Finalizado
│
│ [Escala: 1 semana] [Mostrar dependencias]
└─────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**

1. **Barras de progreso:**
   - Proporcional a duración real (no lineal)
   - Color según estado (verde, amarillo, rojo, gris)
   - Hover: muestra "X de Y días completados"

2. **Indicadores:**
   - 🔴 Bloqueado
   - ⚠️ En riesgo
   - ✓ Finalizado
   - → Tarea padre
   - ⤷ Dependencia

3. **Escalas de tiempo:**
   - [1 día] [1 semana] [1 mes]
   - Selector dropdown

4. **Mostrar/Ocultar:**
   - ☑️ Tareas
   - ☑️ Dependencias
   - ☑️ Hitos

---

### PESTAÑA 3: LISTA DETALLADA (Tabla)

**Descripción:** Vista de tabla con toda la información de tareas.

```
┌─────────────────────────────────────────────────────────────────┐
│           LISTA - Detalles de Tareas                            │
├─────────────────────────────────────────────────────────────────┤
│
│ Tarea      │ Estado    │ % │ Responsable │ Plazo      │ Bloques │
├────────────┼───────────┼───┼─────────────┼────────────┼─────────┤
│ Diseño     │ En Curso  │15%│ Carlos      │ 2026-04-15 │ 0       │
│ Estructura │ Pendiente │ 0%│ María       │ 2026-04-20 │ 0       │
│ Validac.   │ En Curso  │80%│ Juan        │ 2026-04-18 │ 1 🔴    │
│ Testing    │ En Curso  │50%│ Sandra      │ 2026-04-22 │ 0       │
│ Deploy     │ Finalizado│100%│ DevOps      │ 2026-04-10 │ 0       │
│
└─────────────────────────────────────────────────────────────────┘
```

**Columnas:**
1. **Tarea** (nombre, clickeable)
2. **Estado** (Pendiente, En Curso, Finalizado)
3. **% Avance** (0-100, barra visual)
4. **Responsable** (nombre + avatar)
5. **Plazo** (fecha fin planificada, rojo si vencido)
6. **Bloques** (número de bloqueos activos, rojo si > 0)
7. **Últimas 24h** (si cambió estado, agregado, etc)

**Funcionalidades:**
- Ordenable por columna
- Filtrable (mismo panel que Kanban)
- Editable inline (click en celda)
- Click en tarea → detalle + comentarios

---

### MODAL: DETALLE DE TAREA (Pestaña General)

**Cuando clicks en una tarea desde Kanban/Timeline/Lista:**

```
┌─────────────────────────────────────────────────────────────────┐
│ DETALLE DE TAREA: Diseño de UI                                  │
├─────────────────────────────────────────────────────────────────┤
│
│ Estado: [En Curso dropdown]  % Avance: [████████░░ 80%]
│ Responsable: [Carlos García]
│ Fecha Inicio: 2026-04-01     Fecha Fin: 2026-04-15 (14 días)
│
│ Descripción:
│ Diseñar interfaz de usuario para vista gerencial
│
│ Bloqueos Activos:
│ ☐ Espera aprobación del cliente  (registrado: 2026-04-05)
│   Acción requerida: Decisión
│   [Marcar como resuelto]
│
│ Comentarios & Historial:
│ [Thread de comentarios similar a Proyecto]
│
│ [Editar Tarea] [Agregar Bloqueo] [Cerrar]
│
└─────────────────────────────────────────────────────────────────┘
```

---

### Integración con Vista Gerencial:

En la tabla de proyectos (Vista Gerencial), agregar columna opcional:
```
Proyecto | Estado | % | Tareas | Bloques | ...
...
Planes Dev | En Curso | 75% | 5/10 | 1 🔴 | ...
           |          |     |↓ (expandir para ver Kanban inline)
           |          |     | ┌────┬────┬────┐
           |          |     | │Pend│Cur│Fin│
           |          |     | ├────┼────┼────┤
           |          |     | │ 3  │ 2  │ 5  │
           |          |     | └────┴────┴────┘
```

**Nota:** Futuro - expandir inline para vista rápida sin abrir detalle.

---

---

#### 4.4.3 Vista por Foco Estratégico

**Acceso:** Tab secundario o icono en Vista Gerencial

**Muestra:**
- Foco 1: Desarrollo Organizacional
- Foco 2: Gestión de Personas
- Foco 3: Cultura de Seguridad
- Foco 4: Comunicaciones

**Para cada foco:**
- Descripción del foco (texto informativo)
- Estado general (% avance ponderado)
- Proyectos/líneas asociadas (mini-tabla):
  - Nombre | Estado | % Avance | Responsable | Próximo hito
- Alertas críticas (si existen bloqueos > 5 días)
- Hitos próximos (2 semanas)
- Gráfico de estado (donut: verde, amarillo, rojo)

**Acción:**
- Click en proyecto mini → abre detalle

---

#### 4.4.4 Vista de Bloqueos (Transversal)

**Descrito en 4.2.3**

---

### 4.5 Feature: Reportería Automática

#### 4.5.1 Semáforo Automático Completo

**Acceso:** Menu → Reportería → Semáforo Mensual

**Generación:**
- Automática el 1º de cada mes (batch job)
- O manual on-demand (click en "Generar Semáforo Ahora")

**Algoritmo de colores:**

```
Para cada Proyecto/Línea:
  si Estado = Finalizado → Verde
  si Estado = En Curso Y % avance ≥ % tiempo transcurrido Y Sin bloqueos → Verde
  si Estado = En Curso Y (% avance < % tiempo transcurrido OR Bloqueos < 5 días) → Amarillo
  si Estado = En Riesgo → Amarillo
  si Estado = Bloqueado OR Bloqueos > 5 días → Rojo

Consolidar por color:
  Verde: lista de proyectos verdes
  Amarillo: lista de proyectos amarillos + comentarios de acción
  Rojo: lista de proyectos rojos + comentarios de escalamiento
```

**Estructura de output:**

```
═══════════════════════════════════════════════════
     SEMÁFORO MENSUAL - [ABRIL 2026]
═══════════════════════════════════════════════════

🟢 VERDE - [N] Logros Principales
────────────────────────────────────────────────────
Estado: Cerrado/En Curso Sin Bloqueos
Situaciones - Comentarios:
  • Proyecto A: [resultado corto]
  • Proyecto B: [resultado corto]
  • Proyecto C: [resultado corto]

Áreas Involucradas: [listado]

Acciones: Mantener ritmo de ejecución


🟡 AMARILLO - [N] Temas en Seguimiento
────────────────────────────────────────────────────
Estado: En Riesgo/En Curso con Bloqueos < 5 días
Situaciones - Comentarios:
  • Proyecto D: [descripción, qué se está monitoreando]
  • Proyecto E: [descripción, qué se está monitoreando]
  • Proyecto F: [descripción, qué se está monitoreando]

Áreas Involucradas: [listado]

Acciones Requeridas:
  - Acción 1: [descripción específica]
  - Acción 2: [descripción específica]


🔴 ROJO - [N] Críticos / Bloqueados
────────────────────────────────────────────────────
Estado: Bloqueado / Retraso Crítico / Vencido
Situaciones - Comentarios:
  • Proyecto G: [descripción, por qué está rojo]
  • Proyecto H: [descripción, por qué está rojo]
  • Proyecto I: [descripción, por qué está rojo]

Áreas Involucradas: [listado]

Acciones de Escalamiento:
  - Acción 1: [quién hace qué, plazo]
  - Acción 2: [quién hace qué, plazo]

═══════════════════════════════════════════════════
```

**Post-generación:**
- Sistema guarda semáforo como "versión del mes"
- Gerente puede revisar, editar comentarios (si quiere)
- Gerente exporta a PDF o copia a PowerPoint

---

#### 4.5.2 Semáforo Abreviado (Selección Manual)

**Acceso:** Menu → Reportería → Generar Semáforo Abreviado

**Flujo:**

1. Sistema pre-llena sugerencias (top 3 por color, basado en: criticidad, visibilidad, impacto)

2. Para cada color, gerente ve:
   ```
   🟢 VERDE - Sugerencia del Sistema
   Proyectos sugeridos:
   ☐ Proyecto A (estado: Finalizado, criticidad: media)
   ☐ Proyecto B (estado: En Curso, % avance: 95%)
   ☐ Proyecto C (estado: En Curso, % avance: 92%)
   
   [Botón: Aceptar Sugerencia] [Botón: Editar Selección]
   ```

3. Gerente puede:
   - ✅ Aceptar sugerencia (click)
   - 🔧 Cambiar selección (abre multi-select de proyectos verdes)

4. Para cada proyecto seleccionado:
   - Gerente puede editar "punto principal" que aparecerá (texto de 1 línea)
   - Ejemplo: "Planes de Desarrollo - 20 planes diseñados, capacitación iniciada"

5. Gerente redacta "comentario ejecutivo" para cada color

6. Gerente revisa preview (como se vería)

7. Gerente exporta a PDF

**4. Tabla Editable por Color (Nueva estructura):**

Para cada color (Verde, Amarillo, Rojo), gerente visualiza y edita tabla:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🟢 VERDE - 3 LOGROS PRINCIPALES                                │
├──────────────┬──────────────┬────────────────┬──────────────────┤
│ ÁREA         │ CATEGORÍA    │ PROYECTO       │ DETALLE          │
├──────────────┼──────────────┼────────────────┼──────────────────┤
│ DO           │ Capacitación │ Planes de Dev  │ ✏️ [EDITABLE]  │
│              │              │ 2026           │ 20 planes        │
│              │              │                │ diseñados,       │
│              │              │                │ capacitación     │
│              │              │                │ iniciada         │
├──────────────┼──────────────┼────────────────┼──────────────────┤
│ DO           │ Liderazgo    │ Diplomado      │ ✏️ [EDITABLE]  │
│              │              │ Liderazgo      │ 24 personas      │
│              │              │ Operacional    │ certificadas     │
├──────────────┼──────────────┼────────────────┼──────────────────┤
│ Gest.Personas│ Normativo    │ Jornada 40h    │ ✏️ [EDITABLE]  │
│              │              │                │ Normalización    │
│              │              │                │ completada       │
└──────────────┴──────────────┴────────────────┴──────────────────┘

Indicadores: ☑️ % Avance (95%) | ☑️ Status (On-time) | ☑️ Bloqueos (0)

Comentario Ejecutivo: [TEXTAREA EDITABLE - Max 500 caracteres]
```

**Características de la tabla editable:**

- **Área** (read-only): Muestra área responsable
- **Categoría** (read-only): Categoría del proyecto dentro del área
- **Proyecto** (read-only): Nombre del proyecto
- **Detalle** (EDITABLE, text field):
  - Click en campo → se activa editor
  - Puede escribir/editar comentario o explicación
  - Max 200 caracteres por celda
  - Auto-save al salir del campo
  - Muestra contador de caracteres

- **Indicadores** (SELECCIONABLES, checkboxes):
  - ☑️ % Avance
  - ☑️ Status (On-time / Delayed)
  - ☑️ Bloqueos
  - ☑️ Responsable
  - ☑️ Próximo hito
  - Usuario elige cuáles mostrar en PDF

5. **Gestionar filas:**
   - Botón "Agregar fila" (si gerente quiere agregar otro proyecto que sistema no sugirió)
   - Botón "Eliminar fila" (si quiere sacar alguno)
   - Drag & drop para reordenar prioridad de filas

6. **Redactar comentario ejecutivo:**
   - Para cada color, textarea editable
   - Gerente redacta narrativa ejecutiva
   - Max 500 caracteres

7. **Revisar preview:**
   - Botón "Vista Previa" muestra cómo se vería al exportar
   - Permite ediciones finales antes de exportar

8. **Exportar:**
   - Botón "Exportar a PDF"
   - Genera PDF con estructura: tabla + comentario ejecutivo + indicadores seleccionados
   - Archivo: "Semáforo_Abreviado_Abril_2026.pdf"

**Estructura de output final (PDF):**

```
═══════════════════════════════════════════════════════════════
        SEMÁFORO EJECUTIVO ABREVIADO
              ABRIL 2026
═══════════════════════════════════════════════════════════════

🟢 VERDE - 3 LOGROS PRINCIPALES

┌──────────────┬──────────────┬────────────────┬──────────────┐
│ ÁREA         │ CATEGORÍA    │ PROYECTO       │ DETALLE      │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ DO           │ Capacitación │ Planes de Dev  │ 20 planes    │
│              │              │                │ diseñados    │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ DO           │ Liderazgo    │ Diplomado      │ 24 certif.   │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ Gest.Personas│ Normativo    │ Jornada 40h    │ Normalizado  │
└──────────────┴──────────────┴────────────────┴──────────────┘

Indicadores: % Avance (95%) | Status (On-time) | Bloqueos (0)

Comentario Ejecutivo:
El equipo ha logrado avances significativos en desarrollo 
organizacional. Las iniciativas estratégicas están en línea con 
el plan anual. Se mantiene el momentum en temas de capacitación.

───────────────────────────────────────────────────────────────

🟡 AMARILLO - 3 TEMAS EN SEGUIMIENTO

┌──────────────┬──────────────┬────────────────┬──────────────┐
│ ÁREA         │ CATEGORÍA    │ PROYECTO       │ DETALLE      │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ Gest.Personas│ Reportería   │ Migración BUK  │ Diseño compl.│
├──────────────┼──────────────┼────────────────┼──────────────┤
│ Gest.Personas│ Normativo    │ Control Interno│ 60% avance   │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ Gest.Personas│ Normativo    │ Negociación    │ En curso     │
│              │              │ Sindical       │              │
└──────────────┴──────────────┴────────────────┴──────────────┘

Indicadores: % Avance (68%) | Bloqueos (2) | Status (Requiere acción)

Comentario Ejecutivo:
Varios proyectos tácticos requieren seguimiento cercano para 
mantener los plazos comprometidos. Las dependencias con otras 
áreas están siendo coordinadas activamente.

Acciones Requeridas:
• Confirmar fechas con IT para go-live BUK (responsable: GG)
• Resolver punto X de negociación sindical (responsable: L&P)

───────────────────────────────────────────────────────────────

🔴 ROJO - 3 CRÍTICOS

┌──────────────┬──────────────┬────────────────┬──────────────┐
│ ÁREA         │ CATEGORÍA    │ PROYECTO       │ DETALLE      │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ DO           │ Desempeño    │ Plan de        │ Bloqueado 3d │
│              │              │ Sucesión       │              │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ SSO          │ Sist. Gestión│ Agilidad       │ Retraso 5d   │
│              │              │ Procesos       │              │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ SSO          │ Cumplimiento │ Resoluciones   │ Replanteo    │
│              │              │ Sanitarias     │ normativo    │
└──────────────┴──────────────┴────────────────┴──────────────┘

Indicadores: % Avance (25%) | Bloqueos (3) | Status (Escalamiento)

Comentario Ejecutivo:
Tres iniciativas estratégicas requieren intervención inmediata.
Los bloqueos están relacionados a decisiones externas y cambios 
normativos que necesitan gestión a nivel directivo.

Escalamientos Necesarios:
• Sesión con GG para definir perfil de sucesores (semana 15/04)
• Replanteo de resoluciones sanitarias con asuntos públicos (8/04)

═══════════════════════════════════════════════════════════════
```

---

### 4.6 Feature: Notificaciones

#### 4.6.1 Tipos de Notificación

| Evento | Disparador | Destinatario | Canal (Configurable) |
|--------|-----------|--------------|----------------------|
| Bloqueo registrado | Nuevo bloqueo creado | Gerente + Responsable proyecto | Alerta Visual (default) |
| Estado cambió | Cambio de estado | Responsable + Participantes | Alerta Visual (default) |
| Acción asignada | Acción Requerida = Decisión/Intervención | Gerente | Alerta Visual (default) |
| Bloqueo > 3 días | Sin progreso en bloqueo | Gerente | Alerta Visual (default) |
| Bloqueo > 5 días | Sin progreso en bloqueo | Gerente + Responsable | Alerta Visual + Email (default) |
| Plazo vencido | Fecha fin planificada < hoy | Gerente + Responsable | Alerta Visual + Email (default) |
| Comentario nuevo | Alguien comenta en proyecto | Responsable + Gerente | Alerta Visual (default) |
| Semáforo generado | Semáforo automático completado | Gerente | Alerta Visual (default) |

#### 4.6.2 Canal de Notificación (MVP)

**Opciones de notificación (configurable por usuario):**

1. **Alertas Visuales** (en-app, default)
   - Banner en la parte superior de la pantalla
   - Icono + color + descripción breve
   - Desaparece en 5 segundos o click en X
   - Clickeable → abre detalle del proyecto

2. **Email** (SMTP, opcional)
   - Usuario puede activar/desactivar por tipo de evento
   - Formato HTML personalizado

**Ejemplo de Alerta Visual:**

```
┌─────────────────────────────────────────────────────┐
│ 🔴 BLOQUEO CRÍTICO                                  │
│ Proyecto "Planes de Desarrollo" tiene un bloqueo    │
│ sin resolver por más de 5 días. Acción requerida.   │
│ [Ver detalle]  [Descartar]                          │
└─────────────────────────────────────────────────────┘
```

**Preferencias de notificación (por usuario, en Settings):**

| Evento | Alerta Visual | Email | En-app Pop-up |
|--------|---------------|-------|---------------|
| Bloqueo registrado | ✅ (default) | ☐ | ✅ |
| Estado cambió | ✅ (default) | ☐ | ☐ |
| Acción asignada | ✅ (default) | ☐ | ✅ |
| Bloqueo > 3 días | ✅ (default) | ☐ | ☐ |
| Bloqueo > 5 días | ✅ (default) | ✅ (default) | ✅ |
| Plazo vencido | ✅ (default) | ✅ (default) | ✅ |
| Comentario nuevo | ✅ (default) | ☐ | ☐ |
| Semáforo generado | ✅ (default) | ☐ | ☐ |

**Nota:** Usuario puede personalizar en Settings qué eventos generan alerta vs email

---

### 4.7 Feature: Autenticación y Permisos

#### 4.7.1 Autenticación

**Método:** OAuth 2.0 con Azure AD / Office 365 (SSO)

**Flujo:**
1. Usuario accede a la plataforma
2. Si no está autenticado → redirige a login de Office 365
3. Usuario entra con credenciales corporativas
4. Sistema valida contra Azure AD
5. Si válido → crea sesión y redirige al home

**Sesión:**
- Duración: 8 horas (sesión laboral)
- Renovación automática si actividad
- Logout manual disponible

---

#### 4.7.2 Permisos por Rol

**Rol: Gerente de Personas (1)**

| Recurso | Crear | Leer | Actualizar | Eliminar |
|---------|-------|------|-----------|----------|
| Proyectos/Líneas | ✅ | ✅ | ✅ | ✅ |
| Bloqueos | ✅ | ✅ | ✅ | ✅ |
| Riesgos | ✅ | ✅ | ✅ | ✅ |
| Comentarios | ✅ | ✅ | ✅ | ✅ |
| Semáforo | - | ✅ | ✅ (comentarios) | - |
| Reportería | - | ✅ | ✅ | - |
| Permisos | ✅ | ✅ | ✅ | ✅ |
| Historial | - | ✅ | - | - |

**Rol: Líder de Área (4)**

| Recurso | Crear | Leer | Actualizar | Eliminar |
|---------|-------|------|-----------|----------|
| Sus proyectos/líneas | ✅ | ✅ | ✅ | ❌ (solo gerente) |
| Proyectos compartidas | - | ✅ | ✅ (estado, comentarios) | ❌ |
| Otros proyectos | - | ✅ (vista general) | ❌ | ❌ |
| Bloqueos (sus proyectos) | ✅ | ✅ | ✅ | ✅ |
| Riesgos (sus proyectos) | ✅ | ✅ | ✅ | ✅ |
| Comentarios | ✅ | ✅ | ✅ (propios) | ✅ (propios) |
| Semáforo | - | ✅ | - | - |
| Reportería | - | ✅ | - | - |

---

#### 4.7.3 Historial de Auditoría

**Registro automático de:**
- Quién hizo qué
- Cuándo
- Cambio anterior → cambio nuevo

**Acceso:** Solo Gerente, en vista "Historial" por proyecto o vista global

**Datos capturados:**
- Creación de proyecto (quién, cuándo)
- Cambio de estado (quién, cuándo, anterior, nuevo, comentario)
- Cambio de % avance (quién, cuándo, anterior, nuevo)
- Bloqueo registrado (quién, cuándo, descripción)
- Bloqueo resuelto (quién, cuándo, comentario resolución)
- Comentario nuevo (quién, cuándo, contenido)
- Cambio de responsable (quién, cuándo, anterior, nuevo)

---

### 4.8 Feature: Integración con Office 365

#### 4.8.1 Notificaciones por Email

**Implementación:**
- SMTP con Office 365 (Exchange Online)
- Plantillas HTML personalizadas
- Tracking de apertura (opcional)

#### 4.8.2 Integración Teams (Futura)

**No en MVP, pero arquitectura debe permitir:**
- Notificaciones en Teams (webhook)
- Link directo a proyecto en Teams
- Posible: Posts automáticos en canal #personas

---

## 5. REQUISITOS NO FUNCIONALES

### 5.1 Performance

| Requisito | Target |
|-----------|--------|
| Tiempo carga Vista Gerencial | < 2 segundos (35 proyectos) |
| Tiempo carga Detalle Proyecto | < 1 segundo |
| Tiempo respuesta filtros | < 500ms |
| Tiempo generación Semáforo | < 5 segundos |
| Tiempo envío email notificación | < 30 segundos |
| Disponibilidad del servicio | 99.5% (uptime) |

---

### 5.2 Seguridad

| Requisito | Implementación |
|-----------|-------------------|
| **Autenticación** | OAuth 2.0 + Azure AD |
| **Autorización** | Role-based access control (RBAC) |
| **Encriptación en tránsito** | HTTPS/TLS 1.3+ |
| **Encriptación en reposo** | AES-256 para datos sensibles |
| **Auditoría** | Historial completo de cambios |
| **Protección CSRF** | Token en formularios POST |
| **Inyección SQL** | Prepared statements / ORM |
| **XSS** | Sanitización de entrada + Content-Security-Policy |
| **Rate limiting** | 100 requests/min por usuario |
| **Política de cookies** | HttpOnly, Secure, SameSite=Strict |

---

### 5.3 Escalabilidad

| Requisito | Target |
|-----------|--------|
| Usuarios concurrentes | 10-20 (MVP), escalable a 100+ |
| Proyectos en BD | 100 (MVP), escalable a 1000+ |
| Volumen historial | Sin límite (archivado en cold storage) |
| DB queries por segundo | < 100 |
| Almacenamiento | < 100 MB (MVP) |

---

### 5.4 Usabilidad

| Requisito | Criterio |
|-----------|----------|
| **Tiempo aprendizaje** | < 30 minutos (sin capacitación formal) |
| **Tasa adopción** | > 80% en mes 1 |
| **Facilidad de uso** | Escala SUS > 70 |
| **Accesibilidad** | WCAG 2.1 AA (colores, contraste, navegación teclado) |
| **Responsividad** | Desktop-first (tablet secundario) |
| **Lenguaje** | Español (Chile, formal) |

---

### 5.5 Mantenibilidad

| Requisito | Implementación |
|-----------|-------------------|
| **Código** | Limpio, documentado, modular |
| **Testing** | 80%+ cobertura unitaria |
| **Logs** | Structured logging (ERROR, WARN, INFO, DEBUG) |
| **Monitoreo** | Alertas en tiempo real (downtime, errores críticos) |
| **Backups** | Diarios, retenidos 30 días |
| **Recuperación** | RTO < 1 hora, RPO < 15 min |

---

## 6. CASOS DE USO

### 6.1 UC-001: Gerente revisa estado diario (15 min)

**Actor:** Gerente de Personas  
**Precondición:** Sistema disponible, usuario autenticado  
**Flujo Principal:**

1. Gerente abre plataforma
2. Aterriza en Vista Gerencial
3. Filtra por "Acción Requerida" = Decisión o Intervención
4. Ve 3 proyectos que necesitan su atención hoy
5. Click en primero, abre detalle
6. Lee contexto, bloqueo, comentarios
7. Registra su decisión en comentario (2-3 líneas)
8. Cambia estado a "En Curso" (si estaba bloqueado)
9. Sistema notifica al líder de área
10. Gerente cierra, repite con otros 2 proyectos
11. De-filtra, revisa vista general (color rojo, amarillo, verde)
12. Identifica patrones de bloqueos
13. Cierra sesión

**Post-condición:** Todas las acciones requeridas fueron procesadas, líderes notificados

**Excepciones:**
- Si hay más de 5 acciones pendientes → gerente prioriza (ordena por criticidad)
- Si bloqueo requiere llamada → registra "en progreso" + se compromete a actualizar en 2 horas

---

### 6.2 UC-002: Líder de área actualiza proyecto (2 min)

**Actor:** Líder de Área  
**Precondición:** Proyecto asignado, cambio de estado o bloqueo  
**Flujo Principal:**

1. Líder abre plataforma
2. Click en su proyecto (desde Vista Gerencial filtrada)
3. Ve estado actual, % avance, bloqueos
4. Actualiza % avance (ej: 50% → 75%)
5. Sistema calcula automáticamente si está on-time
6. Líder nota que descubrió un bloqueo
7. Click en "Agregar Bloqueo"
8. Completa formulario:
   - Descripción: "Espera aprobación del cliente interno (Gerencia Operacional) para proceder con fase 2"
   - Tipo: Espera decisión
   - Acción requerida: Decisión
   - Requiere escalamiento: Sí
9. Click Guardar
10. Sistema notifica a gerente
11. Líder cierra

**Post-condición:** Bloqueo registrado, gerente notificada, proyecto marcado como "Bloqueado"

---

### 6.3 UC-003: Gerente genera Semáforo Mensual

**Actor:** Gerente de Personas  
**Precondición:** Fin de mes (o manual on-demand), todos los líderes actualizaron  
**Flujo Principal:**

1. Gerente accede a Menu → Reportería → Semáforo Mensual
2. Hace click en "Generar Semáforo Ahora"
3. Sistema analiza todos los proyectos, calcula colores, genera resumen automático
4. Gerente revisa (5 min):
   - ¿Están los proyectos en el color correcto?
   - ¿Los comentarios automáticos son claros?
   - ¿Hay acciones que falten?
5. Gerente edita comentarios de Amarillo y Rojo (si necesario)
6. Click "Guardar Semáforo Mensual"
7. Sistema genera versión de abril
8. Gerente exporta a PDF o copia contenido a PowerPoint

**Post-condición:** Semáforo listo para presentar a gerente general

**Alternativa (Semáforo Abreviado):**
- Gerente hace click en "Generar Semáforo Abreviado"
- Sistema sugiere top 3 por color
- Gerente acepta o cambia selección
- Gerente redacta comentario ejecutivo breve
- Exporta PDF (1 página)

---

### 6.4 UC-004: Líder ve proyectos compartidos y su impacto

**Actor:** Líder de SSO  
**Precondición:** Proyecto compartido entre 2 áreas  
**Flujo Principal:**

1. Líder SSO abre Vista Gerencial
2. Ve su proyecto "Cultura de Seguridad" (responsable él)
3. Ve también proyecto "Capacitación en Seguridad" (responsable DO, pero participante él)
4. En Vista Gerencial:
   - Fila "Cultura de Seguridad": puede ver detalles, actualizar
   - Fila "Capacitación en Seguridad": puede ver resumen (estado, responsable), NO puede editar (solo comentar)
5. Click en "Capacitación en Seguridad"
6. Abre detalle, pero campos están deshabilitados (read-only)
7. Puede agregar comentario: "Necesitamos atrasar inicio 1 semana por disponibilidad de facilitadores"
8. Click Guardar
9. Sistema notifica al líder de DO (responsable)

**Post-condición:** Líder informado de impacto, responsable notificado de comentario

---

### 6.5 UC-005: Gerente resuelve bloqueo

**Actor:** Gerente de Personas  
**Precondición:** Bloqueo registrado, se tomó decisión  
**Flujo Principal:**

1. Gerente recibe notificación: "Nuevo bloqueo en Plan de Sucesión - Acción: Decisión"
2. Click en email → abre detalle del proyecto
3. Ve bloqueo: "Definir criterios de sucesión para 3 posiciones críticas"
4. Accede a sesión ejecutiva, consulta con GG
5. Vuelve al sistema
6. Click en bloqueo → "Marcar como Resuelto"
7. Ingresa comentario: "Aprobado criterios de sucesión: antigüedad 40%, desempeño 40%, potencial 20%. Comunicar a equipos esta semana."
8. Click Confirmar
9. Sistema actualiza bloqueo a "Resuelto"
10. Sistema notifica al líder de DO: "Tu bloqueo fue resuelto: [comentario]"

**Post-condición:** Bloqueo cerrado, líder informado, proyecto puede proseguir

---

## 7. FLUJOS TÉCNICOS (ALTO NIVEL)

### 7.1 Flujo de Autenticación

```
Usuario accede /home
    ↓
¿Sesión válida? → SÍ → Redirige a Vista Gerencial
    ↓
   NO
    ↓
Redirige a /login
    ↓
Usuario ve botón "Ingresar con Office 365"
    ↓
Click → redirige a Azure AD authorization endpoint
    ↓
Usuario entra credenciales corporativas
    ↓
Azure AD retorna authorization code
    ↓
Backend intercambia code por access token + refresh token
    ↓
Backend valida token, crea sesión local
    ↓
Backend redirige a /home con sesión cookie
    ↓
Usuario ve Vista Gerencial
```

---

### 7.2 Flujo de Crear Proyecto

```
Usuario click "+ Nuevo Proyecto"
    ↓
Frontend abre modal con formulario
    ↓
Usuario completa campos y click "Guardar"
    ↓
Frontend valida campos (cliente)
    ↓
Frontend POST a /api/projects { nombre, tipo, foco, ... }
    ↓
Backend valida campos (servidor)
    ↓
Backend valida permisos (solo Gerente o Líder puede crear)
    ↓
Backend insert en DB
    ↓
Backend retorna proyecto creado + ID
    ↓
Frontend muestra success toast "Proyecto creado"
    ↓
Frontend agrega proyecto a tabla Vista Gerencial
    ↓
Backend enviá email a responsable: "Se te asignó..."
    ↓
Responsable recibe notificación
```

---

### 7.3 Flujo de Cambiar Estado de Proyecto

```
Usuario abre Detalle, click en Estado dropdown
    ↓
Frontend muestra opciones disponibles [Pendiente, En Curso, En Riesgo, Bloqueado, Finalizado]
    ↓
Usuario selecciona nuevo estado
    ↓
Frontend abre modal pidiendo "Comentario" (obligatorio)
    ↓
Usuario ingresa comentario
    ↓
Frontend valida comentario (min 10 caracteres)
    ↓
Frontend PATCH a /api/projects/{id}/status { estado, comentario }
    ↓
Backend valida permisos (usuario es responsable o gerente)
    ↓
Backend valida transición (ej: no pasar a Finalizado si hay bloqueos activos)
    ↓
Backend insert en tabla `historial_cambios` (estado anterior, nuevo, timestamp, usuario, comentario)
    ↓
Backend actualiza campo `estado` en tabla `proyectos`
    ↓
Backend retorna 200 OK + proyecto actualizado
    ↓
Frontend actualiza Vista Gerencial (fila, color)
    ↓
Backend trigger: genera notificación email a responsable y participantes
    ↓
Backend trigger: recalcula colores de semáforo (si están en tabla cache)
    ↓
Usuarios reciben notificación
```

---

### 7.4 Flujo de Generar Semáforo Automático

```
Trigger: Cada 1º de mes a las 22:00 UTC (o manual click "Generar")
    ↓
Backend query: SELECT * FROM proyectos WHERE fecha_fin >= mes anterior AND fecha_fin < mes actual
    ↓
Para cada proyecto:
    ├─ Calcular estado basado en lógica de colores
    ├─ Contar bloqueos activos
    ├─ Generar comentario automático (template)
    └─ Asignar acción requerida (si aplica)
    ↓
Backend agrupa por color (Verde, Amarillo, Rojo)
    ↓
Backend genera documento JSON con estructura de semáforo
    ↓
Backend guarda en tabla `semaforos` (id, mes, año, contenido_json, creado_por, fecha_creacion)
    ↓
Frontend carga Vista Reportería → Semáforo Mensual
    ↓
Frontend renderiza tabla con Verde | Amarillo | Rojo
    ↓
Gerente revisa, edita comentarios si es necesario
    ↓
Gerente click "Guardar Semáforo"
    ↓
Backend update tabla `semaforos` con cambios
    ↓
Gerente click "Exportar PDF"
    ↓
Backend genera PDF (usando librería como pdfkit o reportlab)
    ↓
Gerente descarga archivo "Semáforo_Abril_2026.pdf"
```

---

## 8. CRITERIOS DE TERMINADO (DoD)

### 8.1 General

- ✅ Código está escrito, reviewed, y merged a rama `main`
- ✅ 80%+ cobertura de unit tests
- ✅ Tests de integración pasan
- ✅ No hay errores en consola de desarrollo (Chrome DevTools)
- ✅ Performance tests pasan (carga < 2s)
- ✅ Documentación técnica actualizada
- ✅ Se ejecutó manual testing en navegador
- ✅ Feature funciona en Edge, Chrome, Firefox (último año)
- ✅ UI responsiva (desktop 1920px, 1024px, móvil 375px)
- ✅ Validaciones de entrada funcionan correctamente
- ✅ Manejo de errores y excepciones implementado
- ✅ Logs incluidos para debugging

### 8.2 Por Feature (Ejemplo: Crear Proyecto)

- ✅ Formulario se abre correctamente
- ✅ Campos obligatorios validados (cliente + servidor)
- ✅ Proyecto se inserta en DB correctamente
- ✅ Historial registra creación
- ✅ Email de notificación se envía a responsable
- ✅ Proyecto aparece en Vista Gerencial inmediatamente
- ✅ Usuario puede ver su proyecto creado en detalle
- ✅ Permisos: solo Gerente y Líder de su área pueden crear
- ✅ No hay SQL injection, XSS, CSRF
- ✅ Código fue revieweado por 1 dev senior

---

## 9. ROADMAP POST-MVP

### Fase 2 (2-3 meses post-MVP)

- 📍 Integración con plataforma GTR documental
- 📍 KPIs (dotación, accidentabilidad, reclutamiento, capacitación, comunicaciones)
- 📍 Presupuesto vinculado a proyectos
- 📍 Notificaciones en Teams
- 📍 Móvil (visualización read-only)

### Fase 3 (3-6 meses post-MVP)

- 📍 Integración con Book (módulo talento)
- 📍 Integración con BUK (remuneraciones)
- 📍 Análisis predictivo de bloqueos (ML)
- 📍 App móvil nativa (iOS, Android)

### Fase 4 (6-12 meses post-MVP)

- 📍 Escalabilidad a otras áreas de la compañía
- 📍 SaaS para venta externa

---

## 10. ASUNCIONES

1. ✅ Todos los líderes de área tienen acceso a Teams, Excel, email
2. ✅ Conectividad estable (no hay puntos de terreno con baja cobertura)
3. ✅ Office 365 disponible y configurable para OAuth 2.0
4. ✅ No hay restricciones de IT para hosting cloud
5. ✅ Presupuesto asignado para desarrollo (ver TDD/Plan)
6. ✅ Gerente estará disponible para validaciones de UI/UX (~4 sesiones de 1h)
7. ✅ Cambios normativos (Ley 40 horas) NO impactarán arquitectura del sistema

---

## 11. RIESGOS Y MITIGATION

| Riesgo | Probabilidad | Impacto | Mitigation |
|--------|-------------|--------|-----------|
| Baja adopción de líderes (olvidan actualizar) | Media | Alto | Notificaciones diarias, recordatorios en reunión semanal, UX super simple |
| Líderes usan para "ejecutar tareas" (anti-patrón) | Media | Alto | Capacitación clara: "Es dashboard de dirección, no Jira", naming correcto |
| Retraso en integración OAuth (IT) | Baja | Medio | Comenzar early, tener fallback (login básico con email) |
| Cambios de scope en MVP | Alta | Medio | Roadmap claro, "decir no" explícitamente, documentar fuera de alcance |
| Performance degradación con más datos | Baja | Medio | Índices DB, paginación, caching, load testing en 200 proyectos |
| Cambios normativos (Ley 40h, etc.) impactan proyectos | Media | Bajo | Proyectos son ágiles, sistema permaneció estable |

---

## 12. ÉXITO DEL PRODUCTO

**Métrica de Éxito #1: Adopción**
- ✅ 80%+ de líderes actualizando proyectos 2+ veces/semana
- ✅ Semáforo generado automáticamente (0% manual)
- ✅ < 3 reuniones post-MVP para "capacitar" (auto-servicio)

**Métrica de Éxito #2: Eficiencia**
- ✅ Consolidación semáforo: 2 horas → 15 minutos (87.5% reducción)
- ✅ Reuniones coordinación: 45 min → 30 min (33% reducción)
- ✅ Toma de decisiones: 2-3 reuniones → 15 min en sistema

**Métrica de Éxito #3: Calidad**
- ✅ Bloqueos resueltos en < 3 días (80% de casos)
- ✅ Cero proyectos "olvidados" (todos con estado actualizado)
- ✅ Visibilidad transversal: gerente ve todo sin preguntar

**Métrica de Éxito #4: Satisfacción**
- ✅ NPS > 7/10 (líderes de área)
- ✅ SUS > 70 (usabilidad)
- ✅ Recomendación interna a otras áreas

---

## 13. APROBACIÓN PRD

**Revisado por:**
- [ ] Gerente de Personas
- [ ] Product Owner
- [ ] Tech Lead

**Observaciones / Cambios:**

```
[Espacio para feedback]
```

**Aprobado:** ☐ Sí ☐ No

**Fecha aprobación:** _______________

---

**Documento preparado por:** Agente Senior Producto & Tecnología - Intuivo  
**Versión:** 2.0 PRD  
**Última actualización:** Abril 2026

---

## APÉNDICE A: Glosario

| Término | Definición |
|---------|-----------|
| **Foco Estratégico** | Uno de los 4 pilares anuales (Desar.Org, Gest.Personas, SSO, Comunicaciones) |
| **Proyecto** | Iniciativa con fin definido, resultado concreto, fecha fin |
| **Línea** | Operación recurrente, permanente, sin fecha fin |
| **Bloqueo** | Obstáculo que impide avance, requiere acción |
| **Riesgo** | Evento potencial que podría afectar el proyecto |
| **Acción Requerida** | Tipo de intervención necesaria (Informar, Seguimiento, Decisión, Intervención) |
| **Semáforo** | Reporte estado proyectos por color (Verde, Amarillo, Rojo) |
| **MVP** | Minimum Viable Product (versión 1.0 con features core) |
| **SUS** | System Usability Scale (métrica de usabilidad 0-100) |
| **NPS** | Net Promoter Score (métrica de satisfacción) |

---

## APÉNDICE B: Referencias Externas

- Microsoft Office 365 / Azure AD
- SMTP (email)
- WCAG 2.1 AA (accesibilidad)
- OWASP Top 10 (seguridad)

