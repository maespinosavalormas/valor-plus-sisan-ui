# Lecciones Aprendidas — HU-015 E2E Playwright + Angular Material

> **Referencia**: `obs_b0067b76-866a-481e-be12-84c5d865dcb2` (memoria persistente del agente)
> **Fecha**: 2026-06-26
> **Proyecto**: sisan-ui (Angular 21 + Material + Playwright)
> **Tests**: 13/13 pasando (antes 10/13)

## 1. cdk-virtual-scroll-viewport no renderiza items para Playwright

**Causa**: Angular CDK solo renderiza items que caben en el viewport + buffer. Playwright no los "ve" si no hay scroll.

**Fix**: Forzar scroll programático para que CDK renderice el buffer:

```typescript
const viewport = page.getByTestId('wall-timeline-viewport').first();
await expect(viewport).toBeVisible();

await viewport.evaluate((el: HTMLElement) => {
  el.scrollTop = 0;
});
await page.waitForTimeout(200); // CDK debounce

// Verificar al menos 1 item renderizado
const firstItem = page.getByTestId('wall-timeline-item').first();
await firstItem.waitFor({ state: 'attached' });
```

❌ Anti-patrón: `page.getByTestId('wall-timeline-item').count()` — solo cuenta elementos visibles, no dataset.

## 2. mat-select overlay global bloquea interacción con elementos debajo

**Causa**: Las `mat-option` se renderizan en `.cdk-overlay-pane` (body), no dentro del componente.

**Fix**: Interactuar con el overlay pane explícitamente:

```typescript
await select.click();
const overlayPane = page.locator('.cdk-overlay-pane');
await overlayPane.waitFor({ state: 'visible' });

await overlayPane.locator('[data-testid="status-option-ABANDONO"]').click();
await overlayPane.waitFor({ state: 'hidden' }); // IMPORTANTE

// Ahora sí puedes interactuar con el formulario
```

❌ Anti-patrón: `page.getByTestId('status-option-...').click()` — busca en el DOM principal, no en el overlay.

## 3. matInput no propaga data-testid al input nativo

**Causa**: `data-testid` en `<textarea matInput>` se queda en el componente Angular, no en el elemento HTML.

**Fix**: Usar `getByLabel()` basado en el `mat-label`:

```typescript
const estadoFields = page.getByTestId('status-estado-fields').first();
const motive = estadoFields.getByLabel('Motivo del cambio (mínimo 10 caracteres)');
await motive.fill('...');
```

❌ Anti-patrón: `page.getByTestId('status-motive')` — no funciona con matInput.

## 4. Estados clínicos requieren evidencia (archivo)

**Causa**: `RECUPERADO` y `FALLECIDO` son estados clínicos (CA-02). El panel requiere upload de evidencia.

**Fix**: Usar estado no clínico en tests donde no se quiere subir archivo:

```typescript
// ❌ RECUPERADO requiere archivo (test falla)
// ✅ ABANDONO no requiere archivo (test pasa)
await overlayPane.locator('[data-testid="status-option-ABANDONO"]').click();
```

## 5. Angular dev mode renderiza 2 instancias del DOM

**Causa**: `ng serve` en development mode hace double render (bootstrap + hot reload).

**Fix**: Usar `.first()` en todos los locators de Angular Material:

```typescript
// ❌ strict mode violation: resolved to 2 elements
await expect(page.getByTestId('status-select')).toContainText('...');

// ✅ Solo toma el primero
await expect(page.getByTestId('status-select').first()).toContainText('...');
```

## 6. page.route handlers se acumulan entre tests

**Causa**: Playwright no limpia automáticamente los handlers de `page.route()` entre tests.

**Fix**: Desregistrar handlers antes de registrar nuevos:

```typescript
export async function mockApi(page: Page) {
  await page.unroute(`${API_BASE_URL}/casos/*`).catch(() => {});
  await page.route(`${API_BASE_URL}/casos/*`, async (route) => {
    // ...
  });
}
```

**Impacto**: Sin `unroute()`, el mock devuelve estado del test anterior → flaky tests.

## 7. FormData en PUT request no se lee con postDataJSON()

**Causa**: `postDataJSON()` falla con multipart/form-data (boundary WebKit).

**Fix**: Usar `postData()` + regex:

```typescript
const rawBody = route.request().postData() || '';
const match = rawBody.match(/nuevoEstado\r?\n\r?\n([A-Z]+)/);
const estadoNuevo = match ? match[1] : 'RECUPERADO';
```

❌ Anti-patrón: `const body = await route.request().postDataJSON();` — falla con FormData.

## 8. MOCK_EXPEDIENTE debe ser mutable pero reiniciado por test

**Causa**: Si el mock es `const` y se muta en test 1, test 2 ve el estado del test 1.

**Fix**: Usar `let` + reinicio por test + `page.unroute()`:

```typescript
export let MOCK_EXPEDIENTE: MockExpediente = { ...DEFAULT_MOCK };

export async function mockApi(page: Page) {
  MOCK_EXPEDIENTE = { ...DEFAULT_MOCK }; // Reset
  await page.unroute(`${API_BASE_URL}/*`).catch(() => {});
  // ...
}
```

---

## Recomendaciones para el equipo

- **Todos los helpers de mock** deben incluir `page.unroute()` de idempotencia
- **Usar `getByLabel()`** como fallback cuando `data-testid` no funcione con Material
- **Documentar** que estados clínicos requieren evidencia en E2E
- **Considerar `page.unrouteAll()`** en `afterEach` para limpieza global

## Archivos modificados

- `e2e/nutritional-follow-up.spec.ts`
- `e2e/utils/api-mocks.ts`

## Verificación

```bash
npx playwright test e2e/nutritional-follow-up.spec.ts
# 13 passed (11.8s)
```

---

*Generado automáticamente tras fix E2E HU-015 | Sistema: SDD Living Doc*
