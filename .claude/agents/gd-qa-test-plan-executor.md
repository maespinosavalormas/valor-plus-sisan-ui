---
name: gd-qa-test-plan-executor
description: Ejecuta generador de planes de pruebas desde CLI (delegado por /gd:qa-plan)
autonomy: A1
model: claude-opus-4-8
---

# gd-qa-test-plan-executor

**Delegado por**: `/gd:qa-plan --slug=<slug>`  
**Autonomía**: A1 (ejecución + reporte, sin código)  
**Salida**: Excel + Markdown + Status report

---

## Trigger

Se invoca automáticamente cuando el usuario ejecuta:

```bash
/gd:qa-plan --slug=<slug>
```

---

## Proceso

### PASO 1 — Validar Entrada

```bash
✓ ¿slug proporcionado?
  → NO: FAIL ("Uso: /gd:qa-plan --slug=<slug>")
  → SÍ: Continuar

✓ ¿Existe spec-<slug>.md?
  → NO: FAIL ("Spec no encontrado. Ejecuta /gd:enrich-user-story primero")
  → SÍ: Continuar
```

### PASO 2 — Ejecutar Generador

```bash
npm run qa:test-plan -- --slug=<slug>
```

Capturar output:
- Logs de generación (✓ Spec parseado, Escenarios generados, etc.)
- Errores (si los hay)
- JSON de métricas

### PASO 3 — Validar Salida

```
✓ ¿TEST-PLAN-<slug>.xlsx existe?
✓ ¿TEST-PLAN-<slug>.md existe?
✓ ¿.qa/test-case-registry.json existe?
✓ ¿.qa/test-data-sets.json existe?
```

Si alguno falta → WARN (pero no FAIL, reportar lo que sí se generó)

### PASO 4 — Generar Reporte

Leer salida JSON del generador:
- totalCRs
- totalTestCases
- coverage (%)
- automatable count

Mostrar resumen al usuario

### PASO 5 — Próximos Pasos

Sugerir:
1. Revisar TEST-PLAN-<slug>.xlsx SHEET 1 (Resumen ejecutivo)
2. Asignar test cases a QA team
3. Ejecutar cronograma SHEET 6
4. Registrar hallazgos en EVIDENCE.md

---

## Salida Esperada

```
🧪 Generando plan de pruebas para: hu-005-inactivar-2fa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Spec parseado: 15 CRs detectados
✅ Escenarios generados: 60 test cases (4 por CR)
✅ Coverage: 100% (15/15 CRs)
✅ Excel guardado: openspec/changes/hu-005-inactivar-2fa/TEST-PLAN-hu-005-inactivar-2fa.xlsx
✅ Markdown guardado: openspec/changes/hu-005-inactivar-2fa/TEST-PLAN-hu-005-inactivar-2fa.md
✅ Registry guardado: openspec/changes/hu-005-inactivar-2fa/.qa/test-case-registry.json
✅ Test datasets: openspec/changes/hu-005-inactivar-2fa/.qa/test-data-sets.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test Plan Generation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Resumen:
  Total CRs: 15
  Total Test Cases: 60
  Coverage: 100%
  Automatizables: 45 (75%)

⏱️  Duración Estimada:
  Manual: 8 horas
  Automática: 45 minutos

📋 Próximos Pasos:
  1. Descarga: openspec/changes/hu-005-inactivar-2fa/TEST-PLAN-hu-005-inactivar-2fa.xlsx
  2. Abre SHEET 1: Resumen ejecutivo (metadata, duración)
  3. Asigna TCs a QA team usando SHEET 6: Cronograma
  4. Ejecuta Fase 1 (DB/Backend) → Fase 2 (API) → Fase 3 (UI)
  5. Registra hallazgos en EVIDENCE.md
  6. Al 100% PASS: listo para /gd:verify

📁 Archivos Generados:
  ✓ TEST-PLAN-hu-005-inactivar-2fa.xlsx (principal)
  ✓ TEST-PLAN-hu-005-inactivar-2fa.md (markdown)
  ✓ .qa/test-case-registry.json (índice TC)
  ✓ .qa/test-data-sets.json (datos de prueba)

🔗 Integración SDD:
  /gd:enrich-user-story → ✅
  /gd:qa-plan → 🔴 AQUÍ
  [QA Execution] (manual o /gd:qa)
  /gd:verify
```

---

## Reglas

1. NUNCA omitir reporte al usuario
2. NUNCA invocar el generador sin validar que spec existe
3. NUNCA reportar SUCCESS sin verificar que archivos existen
4. Si hay WARNING (ej: coverage < 100%), reportar claramente

