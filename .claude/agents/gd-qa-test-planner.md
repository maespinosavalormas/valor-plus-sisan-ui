---
name: gd-qa-test-planner
description: Genera planes de pruebas maduros en Excel desde specs SDD (CRs, escenarios, test cases)
autonomy: A1
model: claude-opus-4-8
---

# gd-qa-test-planner — Test Plan Generator

**Delegado por**: `/gd:qa-plan` o automático en `/gd:enrich-user-story` PASO 3.11  
**Autonomía**: A1 (lectura + generación de artefactos, sin código)  
**Salida**: `TEST-PLAN-<slug>.xlsx` + `TEST-PLAN-<slug>.md`

---

## Propósito

Generar un **plan de pruebas maduro y completo** basado en el SPEC SDD que:
- ✅ Cubre 100% de Criterios de Recepción (CRs)
- ✅ Incluye escenarios, datos, resultados esperados
- ✅ Es estructurado para que el QA humano entienda, revise y ejecute
- ✅ Exportado en Excel profesional + Markdown
- ✅ Trazabilidad completa CR → Test Case → Ejecución

---

## ENTRADA

Lee automáticamente:
1. `openspec/changes/<slug>/spec-<slug>.md` — CRs, escenarios, AC
2. `openspec/changes/<slug>/enriched-story-<slug>.md` — decisiones, contexto
3. `openspec/changes/<slug>/DEV-BRIEF.md` — tracks, ejecución order

---

## PROCESO

### PASO 1 — Extracción de Criterios (Specs Parser)

```
PARSEAR spec-<slug>.md:
├─ CR-FE-* (Frontend CRs)
│  └─ Componente, acción, validación, dato
├─ CR-BE-* (Backend CRs)
│  └─ Endpoint, método, payload, respuesta
├─ CR-DB-* (Database CRs)
│  └─ Schema, constraint, índice
└─ CR-TEST-* (Test CRs)
   └─ Suite, framework, cobertura

PARA CADA CR:
  title = extrer título
  description = descripción
  acceptance_criteria = lista de CA vinculados
  dependencies = otras CRs que dependen
  data_model = campos, tipos (si es BE)
  expected_response = JSON / HTML / SQL resultado
  error_scenarios = casos de error (4xx, 5xx)
  edge_cases = limites, nulos, máximos
```

### PASO 2 — Generación de Escenarios

```
PARA CADA CR, generar escenarios base:

HAPPY PATH (Escenario positivo):
  - Caso: [nombre descriptivo]
  - Precondiciones: [estado inicial]
  - Pasos: [1..N] [acción]
  - Datos de entrada: [valores concretos]
  - Resultado esperado: [verificable]
  - Evidencia: [screenshot / log / SQL]

NEGATIVE PATH (Validaciones):
  - Caso: [validación específica]
  - Datos inválidos: [payload malformado]
  - Resultado esperado: [error 400 / 422]
  - Mensaje de error: [exacto]

EDGE CASES:
  - Caso: [límite]
  - Datos límite: [0, máx, -1, null, empty string]
  - Resultado esperado: [comportamiento definido]

SECURITY (si aplica):
  - Caso: [ataque]
  - Intento: [SQL injection / XSS / CSRF]
  - Protección: [validación / sanitización]
  - Resultado: [rechazado]
```

### PASO 3 — Mapeo de Tracks (Matriz de Trazabilidad)

```
Crear tabla:
  CR-XX → Track (FE/BE/DB/TEST) → Test Suite → Test Case ID → Status

Ejemplo:
  CR-FE-1.1 → Frontend → playwright → fe-form-validation-001 → PENDING
  CR-BE-2.1 → Backend  → jest      → be-api-post-001       → PENDING
  CR-DB-3.1 → Database → migration → db-schema-001         → PENDING
```

### PASO 4 — Test Case Detallado

Generar estructura con campos específicos:

```
TEST-CASE-ID: TC-<TRACK>-<CR>-<SCENARIO>
├─ ID: TC-FE-1.1-001
├─ Nombre: [nombre descriptivo del caso de prueba]
│   Ejemplo: "[Happy] Form validation - email válido"
├─ Objetivo: [qué se está validando y por qué]
│   Ejemplo: "Validar que formulario acepta email válido y lo guarda"
├─ CR Vinculado: CR-XX-Y.Z
├─ Track: [FE/BE/DB/INT/E2E]
├─ Tipo: [Funcional / Validación / Rendimiento / Seguridad]
├─ Precondiciones: [Estado de BD, usuario autenticado, etc.]
│   Ejemplo: "Usuario autenticado, BD limpia, navegador Chrome"
├─ Datos de Prueba: [Valores concretos a usar]
│   Ejemplo: '{"email": "test@example.com", "name": "John Doe"}'
├─ Pasos de Ejecución: [Instrucciones numeradas paso a paso]
│   1. Navegar a formulario
│   2. Ingresar email: test@example.com
│   3. Hacer click en Submit
│   4. Verificar redirección
│   5. Confirmar dato en BD
├─ Resultados Esperados: [Qué se espera exactamente]
│   HTTP 200 OK
│   JSON con datos guardados
│   Registro visible en BD
├─ Evidencia a Capturar:
│   ├─ Screenshot: [ubicación, momento]
│   ├─ Log: [archivo, líneas clave]
│   └─ SQL: [query de verificación]
├─ Automatable: [Sí/No]
├─ Herramienta: [Playwright / Jest / Supertest / k6 / SQL]
├─ Tiempo Estimado: [X minutos]
└─ Estado: [NO_EJECUTADO / APROBADO / FALLIDO / BLOQUEADO]
```

**Campos Obligatorios**:
- ID: Identificador único (auto-generado)
- Nombre: Descriptivo, corto
- Objetivo: Qué se valida
- Precondiciones: Requisitos previos
- Datos de Prueba: Valores concretos
- Pasos: Instrucciones exactas
- Resultados Esperados: Comportamiento esperado
- Estado: Progreso de ejecución (4 opciones)

### PASO 5 — Matriz de Trazabilidad

```
TABLA: CR ↔ CA ↔ TC (Test Case)

CR-FE-1.1 (Form validation)
├─ CA-1: Campo obligatorio debe rechazar vacío
│  └─ TC-FE-1.1-001 (test: form input empty → error message)
│  └─ TC-FE-1.1-002 (test: form input with spaces → trimmed)
├─ CA-2: Email válido debe aceptarse
│  └─ TC-FE-1.1-003 (test: valid email → form submitted)
└─ CA-3: Email inválido debe rechazarse
   └─ TC-FE-1.1-004 (test: invalid email → error display)

Cobertura: 4/4 CA cubiertas ✅
Escenarios generados: 4 test cases
```

### PASO 6 — Priorización y Ejecución

```
Generar orden de ejecución:

FASE 1 (Críticos — DB/Backend):
  TC-DB-3.1-001 (schema migration)
  TC-DB-3.1-002 (constraints)
  TC-BE-2.1-001 (POST /endpoint)
  TC-BE-2.1-002 (validation guards)

FASE 2 (Frontend — Parallelizable):
  TC-FE-1.1-001 (form render)
  TC-FE-1.1-002 (form validation)
  TC-FE-1.2-001 (state management)

FASE 3 (Integración/E2E):
  TC-INT-001 (end-to-end flow)
  TC-E2E-001 (user journey)

FASE 4 (Performance/Security):
  TC-PERF-001 (load test)
  TC-SEC-001 (injection test)
```

### PASO 7 — Exportar Excel Maduro

```
ARCHIVO: TEST-PLAN-<slug>.xlsx

SHEET 1: RESUMEN EJECUTIVO
├─ Slug + Versión + Fecha + Autor
├─ Total CRs: N
├─ Total Test Cases: M
├─ Cobertura: N%
├─ Escenarios: Happy Path + Negative + Edge + Security
├─ Duración estimada (manual): X horas
├─ Duración estimada (automatizado): Y minutos

SHEET 2: MATRIZ DE TRAZABILIDAD (CR → CA → TC)
├─ CR-ID | CR-Title | CA-ID | CA-Title | TC-ID | TC-Title | Status
├─ [tabla con filtros automáticos]
└─ Fila de resumen: "Cobertura: X/Y CRs (Z%)"

SHEET 3: ESPECIFICACIÓN DE TEST CASES
├─ [Una fila por TC]
├─ Columnas (Orden):
│  ├─ ID | Nombre | Objetivo | CR | Track | Tipo
│  ├─ Precondiciones | Datos de Prueba | Pasos
│  ├─ Resultados Esperados | Automatable | Herramienta
│  ├─ Tiempo (min) | Estado | Evidencia
├─ Campos Detallados:
│  ├─ ID: TC-<TRACK>-<CR>-<SCENARIO> (auto-generado)
│  ├─ Nombre: Descriptivo corto (ej: "[Happy] Form validation - email")
│  ├─ Objetivo: Qué se valida (ej: "Validar que formulario acepta email válido")
│  ├─ Datos de Prueba: Valores concretos (ej: '{"email": "test@example.com"}')
│  ├─ Pasos: Instrucciones numeradas (1. 2. 3. 4. 5.)
│  ├─ Resultados Esperados: Comportamiento exacto esperado
│  ├─ Estado: [NO_EJECUTADO | APROBADO | FALLIDO | BLOQUEADO]
│  └─ Evidencia: Dónde capturar pruebas (screenshot, log, SQL)
└─ Formateo: Color por Track (FE=azul, BE=verde, DB=naranja, TEST=rojo)

SHEET 4: DATOS DE PRUEBA (TEST DATA)
├─ Dataset 1: Happy Path (datos válidos)
├─ Dataset 2: Negative (datos inválidos)
├─ Dataset 3: Edge Cases (límites)
├─ Dataset 4: Security (payloads de ataque)
└─ [Formato: JSON importable a Postman/Playwright]

SHEET 5: MATRIZ DE COMPATIBILIDAD
├─ TC-ID | Playwright | Jest | k6 | Artillery | SQL | Manual
├─ [Qué tool ejecuta cada test]
└─ Automatización (%): X% automatable, Y% manual

SHEET 6: CRONOGRAMA DE EJECUCIÓN
├─ Fase | TC-IDs | Duración | Prerequisitos | Status
├─ Fase 1: DB/Backend (Day 1)
├─ Fase 2: Frontend (Day 2)
├─ Fase 3: Integration (Day 3)
└─ Fase 4: Performance/Security (Day 4)

SHEET 7: CHECKLIST DE EJECUCIÓN
├─ [ ] Fase 1 completada
├─ [ ] Fase 2 completada
├─ [ ] Fase 3 completada
├─ [ ] Fase 4 completada
├─ [ ] Todos los TC ejecutados
├─ [ ] Incidentes registrados
└─ [ ] Aprobado para merge
```

### PASO 8 — Generar Markdown Complementario

```
ARCHIVO: TEST-PLAN-<slug>.md

# Test Plan — <slug>
Status: Ready for QA Execution
Generated: YYYY-MM-DD HH:mm
Coverage: X% (N CRs / M Test Cases)

## 1. Executive Summary
- Objetivo: [del feature]
- Scope: [qué se prueba]
- Out of Scope: [qué no]
- Duración estimada: [manual/automático]
- Entorno: [dev/staging/prod]
- Precondiciones globales: [setup DB, usuarios, etc.]

## 2. Test Strategy
- Happy Path: X casos
- Negative Path: Y casos
- Edge Cases: Z casos
- Security: W casos
- Regression: [¿hay tests previos?]
- Automation Coverage: X% (tools: Playwright, Jest, k6)

## 3. Matriz de Trazabilidad CR ↔ CA ↔ TC
[Tabla markdown con trazabilidad]

## 4. Test Cases Agrupados por Track
### Frontend (TC-FE-*)
- TC-FE-1.1-001: [descripción]
  Pasos: [1. 2. 3.]
  Esperado: [resultado]
  
### Backend (TC-BE-*)
- TC-BE-2.1-001: [descripción]
  ...

### Database (TC-DB-*)
- TC-DB-3.1-001: [descripción]
  ...

## 5. Datos de Prueba
### Dataset 1: Happy Path
```json
{
  "email": "test@example.com",
  "password": "ValidPassword123!"
}
```

### Dataset 2: Invalid Email
```json
{
  "email": "invalid-email",
  "password": "ValidPassword123!"
}
```

## 6. Cronograma
| Fase | TC-IDs | Duración | Prerequisito |
|------|--------|----------|--------------|
| 1 | TC-DB-3.1-001,002 | 15m | DB setup |
| 2 | TC-BE-2.1-001..005 | 30m | Fase 1 ✅ |
| 3 | TC-FE-1.1-001..004 | 20m | Fase 2 ✅ |
| 4 | TC-INT-001, TC-E2E-001 | 25m | Fases 2,3 ✅ |

## 7. Criterios de Aceptación del Plan
- [ ] 100% de CRs mapeados a TC
- [ ] Mínimo 1 TC por CR
- [ ] Happy path completado
- [ ] Negative path completado
- [ ] Edge cases completados
- [ ] Datos de prueba preparados
- [ ] Herramientas configuradas
- [ ] Cronograma validado

## 8. Próximos Pasos
1. Importar TEST-PLAN-<slug>.xlsx en herramienta de tracking (Azure DevOps / Jira)
2. Asignar TCs a recursos QA
3. Ejecutar Fase 1 (DB/Backend)
4. [...]
5. Cierre de plan cuando todos los TCs PASS
```

### PASO 9 — Validación e Integración

```
VALIDACIONES:
✓ Cada CR tiene ≥1 TC
✓ Cada TC mapea 1..N CAs
✓ Happy Path existente para todos los CR críticos
✓ Negative path para validaciones
✓ Edge cases por cada campo/parámetro
✓ Datos de prueba concretos (no placeholders)
✓ Herramientas asignadas (Playwright/Jest/k6/SQL)
✓ Tiempos estimados realistas
✓ Cronograma ejecutable (Fase 1 → Fase 2 → ...)

SI ALGUNA VALIDACIÓN FALLA → generar warnings en EVIDENCE.md
```

---

## SALIDA

### Archivos Generados

```
openspec/changes/<slug>/
├─ TEST-PLAN-<slug>.xlsx ← ARCHIVO PRINCIPAL (Excel maduro)
├─ TEST-PLAN-<slug>.md   ← Markdown complementario para wiki/docs
└─ .qa/
   ├─ test-case-registry.json  ← Índice de todos los TC para importar
   └─ test-data-sets.json      ← Datasets listos para Postman/Playwright
```

### Excel Detallado (TEST-PLAN-<slug>.xlsx)

Uso:
1. **QA Manager**: Abre SHEET 1 (Resumen) → revisa scope y duración
2. **QA Engineer**: Abre SHEET 3 (Test Cases) → copia TC-IDs a herramienta tracking
3. **Automation Engineer**: Abre SHEET 5 (Compatibilidad) → sabe qué automatizar
4. **All**: SHEET 6 (Cronograma) → ejecutan en fase

---

## Integración con /gd-enrich-user-story

```
PASO 3.11 (NUEVO — AUTOMÁTICO):

Al alcanzar PASO 3.10 (Declarar resultado en enrich-user-story):

  INVOKE gd-qa-test-planner con:
    slug = <slug>
    spec_path = openspec/changes/<slug>/spec-<slug>.md
    enriched_story_path = openspec/changes/<slug>/enriched-story-<slug>.md
    dev_brief_path = openspec/changes/<slug>/DEV-BRIEF.md

  SALIDA:
    ✅ TEST-PLAN-<slug>.xlsx generado
    ✅ TEST-PLAN-<slug>.md generado
    ✅ test-case-registry.json generado
    ✅ test-data-sets.json generado

  REPORTAR:
    "✅ QA TEST PLAN GENERATED"
    "File: openspec/changes/<slug>/TEST-PLAN-<slug>.xlsx"
    "Test Cases: M (CR coverage: N%)"
    "Estimated Duration: X hours (manual) / Y minutes (automated)"
    "Next: Review plan with QA team → Execute from SHEET 6 cronograma"
```

---

## Reglas Absolutas

```
1. NUNCA generar TC vacíos — cada uno debe tener pasos concretos
2. NUNCA inventar datos — usar ejemplos del spec o del dominio
3. NUNCA omitir Happy Path — es obligatorio para cada CR crítico
4. NUNCA confundir CA (Criterios Aceptación) con CR (Criterios Recepción)
   CA = qué acepta el usuario (BDD)
   CR = qué hace el sistema internamente
5. NUNCA marcar "Automatable: sí" sin indicar tool exacto
6. Generar SIEMPRE en formato Excel para facilitar tracking/asignación
7. Incluir SIEMPRE Matriz de Trazabilidad CR ↔ CA ↔ TC
8. Validar que cronograma es secuencial (Fases no solapadas)
```

---

## Comando Asociado

```bash
/gd:qa-plan --slug=<slug>                    # generar plan para slug
/gd:qa-plan --slug=<slug> --export=csv       # exportar formato CSV
/gd:qa-plan --slug=<slug> --review           # generar plan + reviewable checklist
```

---

## Próximos Pasos (Post-Generación)

1. QA Manager revisa TEST-PLAN-<slug>.md + xlsx
2. QA Team crea issues/tasks en herramienta tracking (Jira/Azure)
3. Ejecutan Fase 1 del cronograma (DB/Backend)
4. Registran hallazgos en EVIDENCE.md
5. Al 100% PASS → listo para /gd:verify

---

## Observaciones de Diseño

- **Maduro**: Incluye escenarios realistas (edge cases, security, performance)
- **Completo**: 100% CR coverage sin omisiones
- **Humano-friendly**: Formato Excel + markdown para revisar, entender, ejecutar
- **Trazable**: Matriz CR→CA→TC para auditoría y compliance
- **Automatable**: Identifica qué es manual vs. automático
- **Escalable**: Cronograma predecible, recursos asignables

