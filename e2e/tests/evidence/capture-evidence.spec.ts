/**
 * Visual evidence capture for living-doc certification (HU-014).
 * Run: PLAYWRIGHT_BASE_URL_SISAN=http://localhost:4200 PLAYWRIGHT_CASO_ID=1 \
 *   npx playwright test e2e/tests/evidence/capture-evidence.spec.ts --reporter=list
 *
 * After capture, sync portal (from framework-sdd root):
 *   npm run docs:portal -- --build-prep --change=sisan-tamizajes-antropometricos
 *   npm run docs:portal:build
 * Or: node scripts/docs/living-doc-auto-pipeline.mjs --change=sisan-tamizajes-antropometricos --sync-screenshots --execute
 */
import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  E2E_CASO_ID,
  E2E_CASO_RECUPERADO_ID,
  expedientePath,
} from '../../fixtures/caso-tamizaje.fixture';

const changeReportsDir = path.resolve(
  __dirname,
  '../../../../../../../openspec/changes/sisan-tamizajes-antropometricos/reports',
);
const screenshotsDir = path.join(changeReportsDir, 'evidence-screenshots');

async function capture(page: Page, filename: string): Promise<void> {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotsDir, filename),
    fullPage: true,
  });
}

async function gotoExpediente(page: Page, casoId: string): Promise<void> {
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
  await listPromise;
  await tab.click();
  await expect(page.getByRole('columnheader', { name: 'Z P/T' })).toBeVisible({ timeout: 15_000 }).catch(
    () => undefined,
  );
}

async function waitForExpedienteShell(page: Page): Promise<void> {
  await expect(page.getByTestId('expediente-page')).toBeVisible({ timeout: 30_000 });
  const loading = page.getByTestId('expediente-loading');
  if (await loading.isVisible().catch(() => false)) {
    await Promise.race([
      loading.waitFor({ state: 'hidden', timeout: 45_000 }),
      page.getByTestId('expediente-header').waitFor({ state: 'visible', timeout: 45_000 }),
      page.getByTestId('expediente-not-found').waitFor({ state: 'visible', timeout: 45_000 }),
    ]);
  }
}

async function waitForHistorialRows(page: Page): Promise<void> {
  await waitForExpedienteShell(page);
  await expect(page.getByTestId('historial-edit-btn').first()).toBeVisible({ timeout: 45_000 });
}

function seedDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fillFormField(page: Page, testId: string, value: string): Promise<void> {
  await page.getByTestId(testId).evaluate((el: HTMLInputElement, v: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
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

test.describe('Living-doc visual evidence — HU-014', () => {
  test.describe.configure({ mode: 'serial' });

  test('01 — login form', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await capture(page, '01-login.png');
    await context.close();
  });

  test('02 — expediente loaded with form and chart', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tab-tamizajes')).toBeVisible();
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    await expect(page.getByTestId('crecimiento-chart')).toBeVisible();
    await capture(page, '02-expediente-form.png');
  });

  test('03 — tamizaje form fields visible', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const form = page.getByTestId('tamizaje-form');
    await expect(form).toBeVisible();
    await selectMatOption(page, 'tamizaje-talla-medicion', 'De pie (H)', true);
    await expect(page.getByTestId('tamizaje-fecha')).toBeVisible();
    await expect(page.getByTestId('tamizaje-peso')).toBeVisible();
    await expect(page.getByTestId('tamizaje-talla')).toBeVisible();
    await expect(page.getByTestId('tamizaje-edema')).toBeVisible();
    await form.scrollIntoViewIfNeeded();
    await capture(page, '03-tamizaje-form-fields.png');
  });

  test('04 — historial with Z-score columns', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByRole('columnheader', { name: 'Z P/T' })).toBeVisible({ timeout: 15_000 });
    const table = page.getByTestId('historial-table');
    await table.scrollIntoViewIfNeeded();
    await capture(page, '04-historial-zscore.png');
  });

  test('05 — growth chart canvas', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const chart = page.getByTestId('crecimiento-chart');
    await expect(chart).toBeVisible();
    await expect(page.getByTestId('crecimiento-chart-canvas')).toBeVisible();
    await chart.scrollIntoViewIfNeeded();
    await capture(page, '05-crecimiento-chart.png');
  });

  test('06 — duplicate fecha error (E-007)', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    const duplicateFecha = seedDaysAgo(30);
    await fillFormField(page, 'tamizaje-fecha', duplicateFecha);
    await fillFormField(page, 'tamizaje-peso', '7.6');
    await fillFormField(page, 'tamizaje-talla', '72');
    await fillFormField(page, 'tamizaje-pb', '10.5');
    await selectMatOption(page, 'tamizaje-talla-medicion', 'Acostado (L)', true);
    const duplicatePost = page.waitForResponse(
      (r) => r.url().includes('/tamizajes') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByTestId('tamizaje-submit').click();
    const duplicateResponse = await duplicatePost;
    expect(duplicateResponse.status()).toBe(409);
    await expect(page.getByTestId('expediente-error').first()).toBeVisible({ timeout: 10_000 });
    await capture(page, '06-error-duplicado.png');
  });

  test('07 — BIV confirmation dialog (E-009)', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('tamizaje-form')).toBeVisible();
    await page.getByTestId('tamizaje-fecha').fill('2026-06-02');
    await page.getByTestId('tamizaje-peso').fill('2');
    await page.getByTestId('tamizaje-talla').fill('75');
    const bivPost = page.waitForResponse(
      (r) => r.url().includes('/tamizajes') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByTestId('tamizaje-submit').click();
    const bivResponse = await bivPost;
    expect(bivResponse.status()).toBe(422);
    await page.getByTestId('tamizaje-submit').click();
    await expect(page.getByTestId('biv-dialog')).toBeVisible({ timeout: 15_000 });
    await capture(page, '07-biv-dialog.png');
  });

  test('08 — RECUPERADO case blocked (E-011)', async ({ page }) => {
    await gotoExpediente(page, E2E_CASO_RECUPERADO_ID);
    await waitForExpedienteShell(page);
    await expect(page.getByTestId('expediente-badge-recuperacion')).toBeVisible();
    await capture(page, '08-recuperado-bloqueado.png');
  });
});
