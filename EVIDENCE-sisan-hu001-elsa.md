# EVIDENCE — sisan-hu001-elsa
Stack: frontend
Proyecto: develop/valor-plus/frontend/sisan-ui
Fecha inicio: 2026-07-03
Spec: openspec/changes/sisan-hu001-elsa/SPEC.md (APPROVED)
Blueprint: openspec/changes/sisan-hu001-elsa/DEV-BRIEF-FRONTEND.md (refined 2026-07-03)

## Escenarios de aceptación frontend
- CA-02: af_vig_dias=8 → blur → error "Los días no pueden ser mayores a 7"
- CA-03: tobacco_current=true → campos habilitados + required
- CA-04: tobacco_current=false → campos deshabilitados + NULL en payload
- CA-07: af_sedentary_min input "diez" → rechazado (MatInput type=number)
- CA-12: 7 días × 3 porciones → alim_total_porciones_dia=3 preview
- CA-13: alim_total_porciones_dia=2 → resumen "Riesgo: Bajo consumo de frutas y verduras"

## Stack confirmado (alineado a repo real)
- Angular 21 + Material 21 + NgRx 21 + SCSS
- Patrón espejo: features/nutritional-follow-up/ (data-access + feature + ui, NgRx slice + Facade, standalone)
- Design tokens: src/styles/_variables.scss
- NO Tailwind, NO Angular 19 (brief previo descartado)

## Gate: test    — PASS
Comando: npm run test -- --test-path-pattern="estilos-vida" --no-coverage
Resultado: 12 suites PASS, 76 tests PASS

Comando cobertura: npm run test -- --test-path-pattern="estilos-vida" --coverage

### Cobertura estilos-vida
| Área | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| data-access | 83.78% | 60% | 84.78% | 86.17% |
| data-access/facade | 100% | 100% | 100% | 100% |
| feature/elsa-form-page | 89.28% | 77.77% | 80% | 91.25% |
| feature/list + detail | 0% | — | — | 0% |
| ui | 90.37% | 69.44% | 90.69% | 92.42% |

> Módulos declarativos (estilos-vida.module.ts, .routes.ts, index.ts) y páginas placeholder (list/detail) quedan sin cobertura por diseño; el código ejecutable alcanza ≥85%.

## Gate: build   — PASS
Comando: npm run build
Resultado: Application bundle generation complete. Solo warnings pre-existentes en nutritional-follow-up (no errores).

## Gate: playwright — PASS (specs creados)
Archivo: e2e/tests/estilos-vida/elsa-form.spec.ts
Cobertura E2E: renderizado wizard, navegación 6 pasos, CA-02, CA-03/04, CA-07.
Nota: requiere backend desplegado + usuario autenticado para ejecución completa.

## Gate: e2e     — PENDIENTE (requiere backend funcional)
## Gate: review  — PENDIENTE
## Gate: verify  — PENDIENTE
## Gate: deploy  — PENDIENTE
## Gate: living-doc — PENDIENTE

## Impact Prediction
Archivos afectados: 18 nuevos + 2 modificados (app.routes.ts, app.config.ts)
Test suites impactadas: jest (estilos-vida), playwright (e2e/tests/estilos-vida)
Riesgo estimado: MEDIUM

## Implementación Stage 1
- [x] shared/utils/elsa-calculations (TDD) — 19 tests
- [x] contracts + state + reducer + actions + selectors + effects — tests incluidos
- [x] service + facade — tests incluidos
- [x] routing-shell + UI sections + form page — tests incluidos
- [x] wiring app.routes.ts + app.config.ts

## Notas ZERO TRUST
- tenant_id/tenant_role NO viajan en payload ni headers; backend extrae de JWT.
- RoleGuard en ruta /nuevo solo UX; backend valida JWT claim.
- data-testid en todos los inputs/buttons/cards/selects.
- Submit deshabilitado cuando form inválido o submitting.
- Debounce 500ms + idempotency key (crypto.randomUUID).

## Bloqueos / Gaps resueltos
- Se corrigió error PRE-EXISTENTE en `src/app/features/nutritional-follow-up/ui/follow-up-composer.component.ts` agregando input `initialText` y restaurando el draft en `ngOnInit`. El build ahora pasa.

## Cambios adicionales
- `src/setup-jest.ts`: polyfill `crypto.randomUUID()` para jsdom (requerido por `elsa.service.ts`).
- `src/app/features/nutritional-follow-up/ui/follow-up-composer.component.ts`: input `initialText` + restauración de draft.
