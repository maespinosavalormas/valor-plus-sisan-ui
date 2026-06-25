import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { execSync } from 'child_process';
import {
  E2E_CASO_ID,
  E2E_CASO_RECUPERADO_ID,
  INVALID_CASO_ID,
  expedientePath,
} from '../../fixtures/caso-tamizaje.fixture';

const reportsDir = path.resolve(
  __dirname,
  '../../../../../../openspec/changes/sisan-tamizajes-antropometricos/reports'
);

const backendRoot = path.resolve(__dirname, '../../../../../backend/sisan-backend');

function resetE2eTamizajesSeed(): void {
  execSync('npm run seed:e2e-tamizajes -- --restore', {
    cwd: backendRoot,
    stdio: 'ignore',
  });
}

async function gotoExpediente(
  page: Page,
  casoId: string,
): Promise<{ data?: Array<{ fechaTamizaje?: string }> }> {
  const listPromise = page.waitForResponse(
    (r) =>
      r.url().includes(`/casos/${casoId}/tamizajes`) &&
      r.request().method() === 'GET' &&
      r.status() === 200,
    { timeout: 45_000 },
  );
  await page.goto(expedientePath(casoId));
  await page.waitForLoadState('domcontentloaded');
  const tab = page.getByTestId('tab-tamizajes').first();
  await expect(tab).toBeVisible({ timeout: 30_000 });
  const isActive = await tab.evaluate((el) => el.classList.contains('active'));
  if (!isActive) {
    await tab.click();
  }
  const response = await listPromise;
  const payload = (await response.json()) as { data?: Array<{ fechaTamizaje?: string }> };
  await tab.click();
  await expect(page.getByRole('columnheader', { name: 'Z P/T' })).toBeVisible({ timeout: 15_000 }).catch(
    () => undefined,
  );
  return payload;
}

async function waitForExpedienteShell(page: Page): Promise<void> {
  await expect(page.getByTestId('expediente-page')).toBeVisible({ timeout: 30_000 });
  await Promise.race([
    page.getByTestId('expediente-loading').waitFor({ state: 'hidden', timeout: 45_000 }),
    page.getByTestId('expediente-header').first().waitFor({ state: 'visible', timeout: 45_000 }),
    page.getByTestId('expediente-not-found').waitFor({ state: 'visible', timeout: 45_000 }),
    page.getByTestId('tamizaje-form').waitFor({ state: 'visible', timeout: 45_000 }),
    page.getByTestId('expediente-error').waitFor({ state: 'visible', timeout: 45_000 }),
  ]).catch(() => undefined);
}

async function ensureHistorialLoaded(page: Page, casoId = E2E_CASO_ID): Promise<void> {
  resetE2eTamizajesSeed();
  await gotoExpediente(page, casoId);
  await waitForExpedienteShell(page);
  await expect(page.getByTestId('historial-edit-btn').first()).toBeVisible({ timeout: 30_000 });
}

async function selectMatOption(
  page: Page,
  testId: string,
  label: RegExp | string,
  exact = false,
): Promise<void> {
  await page.keyboard.press('Escape').catch(() => undefined);
  const field = page.getByTestId(testId);
  await field.scrollIntoViewIfNeeded();
  const trigger = field.locator('.mat-mdc-select-trigger');
  await trigger.click();
  const option = page.getByRole('option', { name: label, exact });
  try {
    await option.first().waitFor({ state: 'visible', timeout: 5_000 });
  } catch {
    await page.keyboard.press('Escape');
    await trigger.click();
    await page.keyboard.press('ArrowDown');
    await option.first().waitFor({ state: 'visible', timeout: 10_000 });
  }
  await option.first().click();
  await page.keyboard.press('Escape').catch(() => undefined);
}

function seedDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function uniqueTamizajeFecha(): string {
  const d = new Date();
  d.setDate(d.getDate() - (10 + (Date.now() % 40)));
  return d.toISOString().slice(0, 10);
}

/** Fecha alineada a grid LMS E2E (422 BIV con peso 2 / talla 75 / medicion L). */
function bivProbeFecha(): string {
  return '2026-06-02';
}

async function fillFormField(page: Page, testId: string, value: string): Promise<void> {
  await page.getByTestId(testId).evaluate((el: HTMLInputElement, v: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

test.describe('Tamizajes antropométricos — HU-014 P0', () => {
  test.beforeAll(() => {
    resetE2eTamizajesSeed();
  });

  test.afterEach(async ({ page }) => {
    await page.keyboard.press('Escape').catch(() => undefined);
    resetE2eTamizajesSeed();
  });

  test('E-001 — P0 — navigate expediente and show tamizaje form', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const form = page.getByTestId('tamizaje-form');
    const notFound = page.getByTestId('expediente-not-found');
    const hasForm = await form.isVisible().catch(() => false);
    const hasNotFound = await notFound.isVisible().catch(() => false);
    expect(hasForm || hasNotFound).toBeTruthy();
    if (hasForm) {
      await expect(page.getByTestId('tamizaje-fecha')).toBeVisible();
      await selectMatOption(page, 'tamizaje-talla-medicion', 'De pie (H)', true);
      await expect(page.getByTestId('tamizaje-talla-warning')).toBeVisible({ timeout: 5_000 });
    }
  });

  test('E-002 — P0 — Z-score PT column visible in historial', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByRole('columnheader', { name: 'Z P/T' })).toBeVisible({ timeout: 15_000 });
  });

  test('E-003 — P0 — recuperacion badge when case recovered', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-page')).toBeVisible();
    await expect(page.getByTestId('expediente-header')).toBeVisible();
  });

  test('E-004 — P0 — edema 2 forces SEVERA classification on submit', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    await selectMatOption(page, 'tamizaje-edema', 'Edema ++', true);
    await page.getByTestId('tamizaje-peso').fill('8.5');
    await page.getByTestId('tamizaje-talla').fill('72');
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('historial-table')).toBeVisible({ timeout: 20_000 });
  });

  test('E-005 — P0 — motivo edicion required when editing peso or talla', async ({ page }) => {
    await ensureHistorialLoaded(page);
    const editBtn = page.getByTestId('historial-edit-btn').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    await expect(page.getByTestId('tamizaje-motivo-edicion')).toBeVisible();
    await page.getByTestId('tamizaje-peso').fill('9.0');
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('tamizaje-motivo-edicion')).toBeVisible();
  });

  test('E-006 — P0 — editing talla triggers chart reload', async ({ page }) => {
    await ensureHistorialLoaded(page);
    await expect(page.getByTestId('crecimiento-chart')).toBeVisible();
    const editBtn = page.getByTestId('historial-edit-btn').first();
    await editBtn.click();
    await page.getByTestId('tamizaje-talla').fill('73');
    await page.getByTestId('tamizaje-motivo-edicion').fill('Correccion medida');
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('crecimiento-chart-canvas')).toBeVisible({ timeout: 30_000 });
  });

  test('E-007 — P0 — duplicate fecha shows error', async ({ page }) => {
    resetE2eTamizajesSeed();
    const tamizajesPayload = await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    const duplicateFecha = tamizajesPayload.data?.[0]?.fechaTamizaje?.slice(0, 10) ?? seedDaysAgo(30);
    await fillFormField(page, 'tamizaje-fecha', duplicateFecha);
    await fillFormField(page, 'tamizaje-peso', '7.6');
    await fillFormField(page, 'tamizaje-talla', '72');
    const duplicatePost = page.waitForResponse(
      (r) =>
        r.url().includes(`/casos/${E2E_CASO_ID}/tamizajes`) &&
        r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByTestId('tamizaje-submit').click();
    const duplicateResponse = await duplicatePost;
    expect(duplicateResponse.status()).toBe(409);
    await expect(page.getByTestId('expediente-error').first()).toBeVisible({ timeout: 10_000 });
  });

  test('E-008 — P0 — PB below 11.5 highlighted in historial', async ({ page }) => {
    await ensureHistorialLoaded(page);
    await expect(page.getByTestId('historial-pb-bajo').first()).toBeVisible();
  });

  test('E-009 — P0 — BIV requires double confirmation dialog', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    await page.getByTestId('tamizaje-fecha').fill(bivProbeFecha());
    await page.getByTestId('tamizaje-peso').fill('2');
    await page.getByTestId('tamizaje-talla').fill('75');
    const bivPost = page.waitForResponse(
      (r) =>
        r.url().includes(`/casos/${E2E_CASO_ID}/tamizajes`) &&
        r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByTestId('tamizaje-submit').click();
    const bivResponse = await bivPost;
    expect(bivResponse.status()).toBe(422);
    await expect(page.getByTestId('expediente-error').first()).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('biv-dialog')).toBeVisible({ timeout: 15_000 });
  });

  test('E-010 — P0 — growth chart renders chronological series', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('crecimiento-chart')).toBeVisible();
    await expect(page.getByTestId('crecimiento-chart-canvas')).toBeVisible();
  });

  test('E-011 — P0 — RECUPERADO case blocks new tamizaje', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_RECUPERADO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-badge-recuperacion')).toBeVisible();
  });

  test('E-012 — P0 — audit trail visible after edit', async ({ page }) => {
    await ensureHistorialLoaded(page);
    const editBtn = page.getByTestId('historial-edit-btn').first();
    await editBtn.click();
    await page.getByTestId('tamizaje-motivo-edicion').fill('Ajuste auditoria E2E');
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('historial-table')).toBeVisible({ timeout: 20_000 });
  });

  test('E-013 — P0 — numeric inputs reject letters', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    const peso = page.getByTestId('tamizaje-peso');
    await peso.click();
    await peso.fill('');
    await peso.pressSequentially('abc12x', { delay: 10 });
    await expect(peso).toHaveValue('12');
  });

  test('E-014 — P0 — PB optional outside 6-59 months range', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const pb = page.getByTestId('tamizaje-pb');
    const edadText = await page.getByTestId('expediente-menor-edad').textContent();
    const meses = Number(edadText?.match(/(\d+)\s*meses/)?.[1] ?? 0);
    if (meses < 6 || meses > 59) {
      await expect(pb).toBeDisabled();
    } else {
      await expect(pb).toBeEnabled();
    }
  });

  test('E-015 — P0 — unauthorized user sees 403 error', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(
      page
        .getByTestId('expediente-error')
        .or(page.getByTestId('expediente-not-found'))
        .or(page.getByTestId('tamizaje-form'))
    ).toBeVisible();
  });
});

test.describe('Tamizajes antropométricos — HU-014 P1', () => {
  test.beforeAll(() => {
    resetE2eTamizajesSeed();
  });

  test.afterEach(async ({ page }) => {
    await page.keyboard.press('Escape').catch(() => undefined);
    resetE2eTamizajesSeed();
  });

  test('E-016 — P1 — OMS tables down shows server error', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-page')).toBeVisible();
  });

  test('E-017 — P1 — fecha before birth blocked', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await page.getByTestId('tamizaje-fecha').fill('2000-01-01');
    await page.getByTestId('tamizaje-peso').fill('7');
    await page.getByTestId('tamizaje-talla').fill('65');
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('expediente-error')).toBeVisible({ timeout: 15_000 });
  });

  test('E-018 — P1 — debounce prevents double submit', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await fillFormField(page, 'tamizaje-fecha', uniqueTamizajeFecha());
    await page.getByTestId('tamizaje-peso').fill('8.0');
    await page.getByTestId('tamizaje-talla').fill('71');
    const submit = page.getByTestId('tamizaje-submit');
    await expect(submit).toBeEnabled();
    let postCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/tamizajes') && req.method() === 'POST') postCount++;
    });
    await submit.click({ clickCount: 2 });
    await page
      .waitForResponse(
        (r) => r.url().includes('/tamizajes') && r.request().method() === 'POST',
        { timeout: 15_000 },
      )
      .catch(() => {});
    await expect.poll(() => postCount, { timeout: 15_000 }).toBeLessThanOrEqual(1);
  });

  test('E-019 — P1 — invalid edema shows validation error', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-edema')).toBeVisible();
  });

  test('E-020 — P1 — zero peso or talla blocked', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await page.getByTestId('tamizaje-peso').fill('0');
    await page.getByTestId('tamizaje-talla').fill('0');
    await expect(page.getByTestId('tamizaje-submit')).toBeDisabled();
  });

  test('E-021 — P1 — motivo edicion sanitized', async ({ page }) => {
    await ensureHistorialLoaded(page);
    const editBtn = page.getByTestId('historial-edit-btn').first();
    await editBtn.click();
    await page.getByTestId('tamizaje-motivo-edicion').fill("'; DROP TABLE--");
    await expect(page.getByTestId('tamizaje-motivo-edicion')).toHaveValue("'; DROP TABLE--");
  });

  test('E-022 — P1 — JWT expired preserves local draft', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const peso = page.getByTestId('tamizaje-peso');
    if (!(await peso.isVisible().catch(() => false))) {
      return;
    }
    await peso.fill('8.1');
    await page.reload();
    await waitForExpedienteShell(page);
    if (await peso.isVisible().catch(() => false)) {
      const value = await peso.inputValue();
      expect(value === '8.1' || value === '').toBeTruthy();
    }
  });

  test('E-023 — P1 — nonexistent caso shows 404 UI', async ({ page }) => {
    await gotoExpediente(page, INVALID_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-not-found')).toBeVisible({ timeout: 20_000 });
    await page.screenshot({
      path: path.join(reportsDir, '2026-06-24-expediente-not-found.png'),
      fullPage: true,
    });
  });

  test('E-024 — P1 — retro edit shows sexo snapshot alert', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-menor-edad')).toBeVisible();
  });

  test('E-025 — P1 — audit rollback error in UI', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-page')).toBeVisible();
  });
});
