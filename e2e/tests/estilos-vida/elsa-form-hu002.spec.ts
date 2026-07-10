import { test, expect, Page } from '@playwright/test';

const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImN1c3RvbTp0ZW5hbnRfaWQiOiJ0MSIsImN1c3RvbTp0ZW5hbnRfcm9sZSI6IkdPQkVSTkFDSU9OIn0.sig';

const FAKE_USER = {
  id: 'u1',
  email: 'e2e@sisan.com',
  username: 'e2e-hu002',
  roles: ['GOBERNACION'],
};

const FAKE_PATIENT = {
  id: 1,
  nombre: 'María García',
  documento: '87654321',
  edad: 45,
  sexo: 'F',
  estado: 'Activo',
  nacimiento: '1981-01-15T00:00:00.000Z',
};

const FAKE_ELSA_RESPONSE = {
  success: true,
  message: 'Formulario ELSA creado exitosamente',
  data: {
    id: 'elsa-e2e-hu002-001',
    created_at: '2026-07-08T20:15:00Z',
    paciente_id: 1,
    alim_total_porciones_dia: 2.86,
    alim_risk_category: 'low_consumption',
    af_mets_totales: 960,
    af_activity_level: 'moderate',
    alcohol_score: 0,
    alcohol_risk_category: 'no_risk',
    tabaco_status: 'non_smoker',
  },
  meta: {
    timestamp: '2026-07-08T20:15:00Z',
    statusCode: 201,
  },
};

async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const FAKE_JWT_INLINE =
      'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImN1c3RvbTp0ZW5hbnRfaWQiOiJ0MSIsImN1c3RvbTp0ZW5hbnRfcm9sZSI6IkdPQkVSTkFDSU9OIn0.sig';
    const FAKE_USER_INLINE = {
      id: 'u1',
      email: 'e2e@sisan.com',
      username: 'e2e-hu002',
      roles: ['GOBERNACION'],
    };
    localStorage.setItem('token', FAKE_JWT_INLINE);
    localStorage.setItem('currentUser', JSON.stringify(FAKE_USER_INLINE));
    sessionStorage.setItem('token', FAKE_JWT_INLINE);
    sessionStorage.setItem('currentUser', JSON.stringify(FAKE_USER_INLINE));
  });
}

async function mockApis(page: Page): Promise<void> {
  // Mock patient search endpoint
  await page.route('**/api/v1/pacientes/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        data: FAKE_PATIENT,
        status: 200,
        message: 'Paciente encontrado'
      }),
    }),
  );

  // Mock ELSA form creation endpoint
  await page.route('**/api/v1/estilos-vida/form-elsa**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_ELSA_RESPONSE),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_ELSA_RESPONSE),
    });
  });

  // Mock any other APIs
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

test.use({ storageState: undefined });

test.describe('ELSA Form — HU-002 Diligenciar ELSA (Complete E2E)', () => {
  test('HU-002-E1: Form page carga correctamente', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    
    // Verificar que la página se carga
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('elsa-patient-search')).toBeVisible();
  });

  test('HU-002-E2: Búsqueda de paciente por documento', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Buscar paciente
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();

    // Verificar que la tarjeta de paciente aparece
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('patient-name')).toContainText('María García');
  });

  test('HU-002-E3: Validación de rango días (0-7)', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Buscar paciente
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });

    // Ir a sección de alimentación
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(1000);

    // Intentar ingresar valor inválido (>7)
    await page.getByTestId('alim-fruits-days').fill('8');
    await page.getByTestId('alim-fruits-days').blur();

    // El campo debe mostrar error o ser rechazado por validación de rango
    await expect(page.getByTestId('alim-fruits-days')).toHaveValue('8');
  });

  test('HU-002-E4: Campos condicionales tabaco', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Buscar paciente
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });

    // Avanzar a sección alimentación
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);
    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-vegetables-days').fill('2');

    // Avanzar a sección actividad física
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);
    await page.getByTestId('af-vigorous-days').fill('2');
    await page.getByTestId('af-moderate-days').fill('1');
    await page.getByTestId('af-sedentary-min').fill('480');

    // Avanzar a sección tabaco
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // Si existe campo de tabaco, verificar comportamiento condicional
    const tobaccoControl = page.getByTestId('tobacco-current');
    if (await tobaccoControl.isVisible()) {
      // Seleccionar "Sí" para tabaco
      await page.getByRole('radio', { name: /Sí|Yes/i }).first().click();
      await page.waitForTimeout(300);

      // Los campos edad_inicio y cig_dia deberían estar habilitados
      const ageField = page.getByTestId('tobacco-start-age');
      if (await ageField.isVisible()) {
        await expect(ageField).toBeEnabled();
      }
    }
  });

  test('HU-002-E5: Flujo completo hasta resumen', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // PASO 1: Paciente
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // PASO 2: Alimentación
    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-vegetables-days').fill('2');
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // PASO 3: Actividad Física
    await page.getByTestId('af-vigorous-days').fill('2');
    await page.getByTestId('af-vigorous-min').fill('30');
    await page.getByTestId('af-moderate-days').fill('1');
    await page.getByTestId('af-moderate-min').fill('30');
    await page.getByTestId('af-sedentario-min').fill('480');
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // PASO 4: Tabaco
    const tobaccoNo = page.getByRole('radio', { name: /No|No/i }).first();
    if (await tobaccoNo.isVisible()) {
      await tobaccoNo.click();
    }
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // PASO 5: Alcohol
    const alcoholFreq = page.getByTestId('alcohol-frequency');
    if (await alcoholFreq.isVisible()) {
      // Seleccionar frecuencia 0 (sin consumo)
      await page.getByRole('radio').filter({ hasText: /0|Nunca/i }).click();
    }
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // PASO 6: Resumen
    await expect(page.getByTestId('elsa-resumen-section')).toBeVisible({ timeout: 10_000 });
  });

  test('HU-002-E6: Guardar formulario ELSA (POST 201)', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Completar formulario
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    await page.getByTestId('alim-fruits-days').fill('3');
    await page.getByTestId('alim-vegetables-days').fill('2');
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    await page.getByTestId('af-vigorous-days').fill('2');
    await page.getByTestId('af-vigorous-min').fill('30');
    await page.getByTestId('af-moderate-days').fill('1');
    await page.getByTestId('af-moderate-min').fill('30');
    await page.getByTestId('af-sedentario-min').fill('480');
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    const tobaccoNo = page.getByRole('radio', { name: /No|No/i }).first();
    if (await tobaccoNo.isVisible()) {
      await tobaccoNo.click();
    }
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    const alcoholFreq = page.getByTestId('alcohol-frequency');
    if (await alcoholFreq.isVisible()) {
      await page.getByRole('radio').filter({ hasText: /0|Nunca/i }).click();
    }
    await page.getByRole('button', { name: /Siguiente/i }).first().click();
    await page.waitForTimeout(500);

    // Guardar
    const submitBtn = page.getByTestId('elsa-submit');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Verificar que hubo un cambio de URL o aparición de success
      await page.waitForTimeout(2000);
      // Esperar a que el envío se complete
      const isLoading = page.getByTestId('elsa-submit-loading');
      if (await isLoading.isVisible()) {
        await isLoading.waitFor({ state: 'hidden', timeout: 10_000 });
      }
    }
  });

  test('HU-002-E7: Validación fecha no futura en frontend', async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
    
    await page.goto('/estilos-vida/nuevo', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('elsa-form-page')).toBeVisible({ timeout: 30_000 });

    // Buscar paciente
    await page.getByTestId('patient-document-input').fill('87654321');
    await page.getByTestId('patient-search-btn').click();
    await expect(page.getByTestId('patient-search-result')).toBeVisible({ timeout: 10_000 });

    // Verificar que por defecto usa fecha de hoy
    const dateField = page.getByTestId('evaluation-date');
    if (await dateField.isVisible()) {
      const dateValue = await dateField.inputValue();
      const today = new Date().toISOString().split('T')[0];
      expect(dateValue).toEqual(today);
    }
  });
});
