import { test, expect, Page } from '@playwright/test';

const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImN1c3RvbTp0ZW5hbnRfaWQiOiJ0MSIsImN1c3RvbTp0ZW5hbnRfcm9sZSI6IkdPQkVSTkFDSU9OIn0.sig';

const FAKE_USER = {
  id: 'u1',
  email: 'e2e@sisan.com',
  username: 'e2e-obrero',
  roles: ['GOBERNACION'],
};

const FAKE_PATIENT = {
  id: 'p-e2e-001',
  document: '12345678',
  fullName: 'Paciente E2E Prueba',
  sex: 'F',
  birthDate: '1990-01-01',
  age: 36,
  status: 'ACTIVO',
};

const FAKE_ELSA_RESPONSE = {
  id: 'e-e2e-001',
  patient_id: 'p-e2e-001',
  evaluation_date: '2026-07-03',
  alim_total_portions_day: 3,
  af_mets_total: 1680,
  alcohol_audit_score: 3,
  risk_profile: {
    nutrition: { classification: 'RISK', label: 'Bajo consumo', threshold: '<5' },
    physical_activity: { classification: 'MODERADO', label: 'Moderado', mets: 1680, range: '600-3000' },
    alcohol: { classification: 'RISK', label: 'Consumo de riesgo', threshold: 'M>=4' },
  },
  created_at: '2026-07-03T14:30:00Z',
  created_by_username: 'e2e@sisan.com',
};

async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const FAKE_JWT_INLINE =
      'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImN1c3RvbTp0ZW5hbnRfaWQiOiJ0MSIsImN1c3RvbTp0ZW5hbnRfcm9sZSI6IkdPQkVSTkFDSU9OIn0.sig';
    const FAKE_USER_INLINE = {
      id: 'u1',
      email: 'e2e@sisan.com',
      username: 'e2e-obrero',
      roles: ['GOBERNACION'],
    };
    localStorage.setItem('token', FAKE_JWT_INLINE);
    localStorage.setItem('currentUser', JSON.stringify(FAKE_USER_INLINE));
    // Also set sessionStorage as fallback
    sessionStorage.setItem('token', FAKE_JWT_INLINE);
    sessionStorage.setItem('currentUser', JSON.stringify(FAKE_USER_INLINE));
  });
}

async function ensureAuthReady(page: Page): Promise<void> {
  // Navigate to home to trigger AppComponent and checkAuth effect
  await page.goto('/home', { waitUntil: 'domcontentloaded' });
  // Wait for NgRx store to be populated by checkAuth effect
  await page.waitForTimeout(3000);
  // Verify we're not on auth or unauthorized pages
  const url = page.url();
  if (url.includes('/auth/') || url.includes('/unauthorized')) {
    console.log('Auth not ready, current URL:', url);
  }
  // Additional wait for RoleGuard to see populated user
  await page.waitForTimeout(1000);
}

async function mockApis(page: Page): Promise<void> {
  await page.route('**/api/v1/pacientes/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [FAKE_PATIENT], status: 200 }),
    }),
  );
  await page.route('**/api/v1/estilos-vida/elsa', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: FAKE_ELSA_RESPONSE, status: 201 }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: FAKE_ELSA_RESPONSE, status: 200 }),
    });
  });
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

test.use({ storageState: undefined });

test.describe('ELSA Form — HU-001 (UI Mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    // Navigate directly to the form page
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'domcontentloaded' });
    // Wait for lazy loading and RoleGuard
    await page.waitForTimeout(5000);
  });

  test('E-001 — renderiza wizard ELSA con data-testid canónicos', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('elsa-patient-search')).toBeVisible();
    await expect(page.getByTestId('patient-document-input')).toBeVisible();
    await expect(page.getByTestId('patient-search-btn')).toBeVisible();
  });

  test('E-002 — CA-02: días > 7 muestra error al blur', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('step-next-paciente').click();
    await expect(page.getByTestId('elsa-alimentacion-section')).toBeVisible();

    const daysInput = page.getByTestId('alim-fruits-days');
    await daysInput.fill('8');
    await daysInput.blur();
    await expect(page.getByTestId('alim-fruits-days-error')).toBeVisible({ timeout: 5_000 });
  });

  test('E-003 — CA-07: input numérico rechaza texto (MatInput type=number)', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('step-next-paciente').click();
    await expect(page.getByTestId('elsa-alimentacion-section')).toBeVisible();

    // Avanzar a Actividad Física llenando alimentación válida
    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-vegetables-days').fill('2');
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    const sedInput = page.getByTestId('af-sedentary-min');
    await sedInput.fill('diez');
    await expect(sedInput).toHaveValue('');
  });

  test('E-004 — CA-03/CA-04: tabaco habilita/deshabilita campos condicionales', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Saltar a tabaco: llenar patient + alimentación + AF válido
    await page.getByTestId('patient-document-input').fill('12345678');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('step-next-paciente').click();

    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-vegetables-days').fill('2');
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    await page.getByTestId('af-vigorous-days').fill('2');
    await page.getByTestId('af-moderate-days').fill('2');
    await page.getByTestId('af-sedentary-min').fill('480');
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    await expect(page.getByTestId('elsa-tabaco-section')).toBeVisible();

    // CA-03: Sí → habilita edad inicio
    await page.getByTestId('tobacco-current-yes').click();
    await expect(page.getByTestId('tobacco-start-age')).toBeEnabled({ timeout: 5_000 });

    // CA-04: No → deshabilita y null en payload
    await page.getByTestId('tobacco-current-no').click();
    await expect(page.getByTestId('tobacco-start-age')).toBeDisabled({ timeout: 5_000 });
  });

  test('E-005 — CA-12/CA-13: preview de porciones y clasificación de riesgo', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Paciente
    await page.getByTestId('patient-document-input').fill('12345678');
    await page.getByTestId('patient-search-btn').click();
    await page.getByTestId('step-next-paciente').click();

    // CA-12: 7 días × 3 porciones → 3 porciones/día
    await page.getByTestId('alim-fruits-days').fill('7');
    await page.getByTestId('alim-fruits-portions').fill('3');
    await expect(page.getByTestId('alimentacion-preview')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('alimentacion-preview')).toContainText(/3/);

    // CA-13: < 5 porciones/día → clasificación RISK visible en preview
    await expect(page.getByTestId('alimentacion-preview')).toContainText(/Bajo consumo|Riesgo/i);
  });

  test('E-006 — wizard completo termina con éxito POST 201', async ({ page }) => {
    await page.goto('/estilos-vida/nuevo');
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Paciente
    await page.getByTestId('patient-document-input').fill('12345678');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('step-next-paciente').click();

    // Alimentación
    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-fruits-portions').fill('2');
    await page.getByTestId('alim-vegetables-days').fill('4');
    await page.getByTestId('alim-vegetables-portions').fill('2');
    await page.getByTestId('alim-salt-added').check();
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    // Actividad Física
    await page.getByTestId('af-vigorous-days').fill('2');
    await page.getByTestId('af-vigorous-min').fill('60');
    await page.getByTestId('af-moderate-days').fill('2');
    await page.getByTestId('af-moderate-min').fill('30');
    await page.getByTestId('af-sedentary-min').fill('480');
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    // Tabaco
    await page.getByTestId('tobacco-current-no').click();
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    // Alcohol
    await page.getByTestId('alcohol-frequency').click();
    await page.getByTestId('alcohol-frequency-0').click();
    await page.locator('button').filter({ hasText: 'Siguiente' }).last().click();

    // Resumen
    await expect(page.getByTestId('elsa-resumen-section')).toBeVisible({ timeout: 10_000 });

    // POST: interceptado → redirige a /estilos-vida/e-e2e-001
    await page.getByTestId('elsa-submit').click();
    await expect(page).toHaveURL(/\/estilos-vida\/e-e2e-001/, { timeout: 15_000 });
    await expect(page.getByTestId('elsa-detail-card')).toBeVisible({ timeout: 10_000 });
  });
});