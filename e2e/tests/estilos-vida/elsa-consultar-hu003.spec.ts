import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:3000/api/v1';

const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImN1c3RvbTp0ZW5hbnRfaWQiOiJ0MSIsImN1c3RvbTp0ZW5hbnRfcm9sZSI6IkdPQkVSTkFDSU9OIn0.sig';

const FAKE_USER = {
  id: 'u1',
  email: 'e2e@sisan.com',
  username: 'e2e-obrero',
  roles: ['GOBERNACION'],
};

function buildItem(i: number) {
  return {
    id: `elsa-${i}`,
    patientId: `1000000${i}`,
    evaluationDate: `2026-07-0${(i % 9) + 1}T10:00:00Z`,
    riskNutrition: i % 2 === 0 ? 'ALTO' : 'BAJO',
    riskPhysicalActivity: 'MEDIO',
    riskAlcohol: 'BAJO',
    metsScore: 2.5,
    nutritionScore: 18,
    alcoholScore: 5,
    createdAt: `2026-07-0${(i % 9) + 1}T10:00:00Z`,
    createdByUsername: 'clinician@org',
  };
}

const DETAIL = {
  id: 'elsa-1',
  patient_id: '10000001',
  evaluation_date: '2026-07-01',
  alim_total_portions_day: 3,
  af_mets_total: 1680,
  alcohol_audit_score: 3,
  risk_profile: {
    nutrition: { classification: 'RISK', label: 'Bajo consumo', threshold: '<5', total: 3 },
    physical_activity: { classification: 'MODERADO', label: 'Moderado', mets: 1680, range: '600-3000' },
    alcohol: { classification: 'RISK', label: 'Consumo de riesgo', threshold: 'M>=4', score: 3 },
  },
  created_at: '2026-07-01T10:00:00Z',
  created_by_username: 'clinician@org',
};

async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    },
    { token: FAKE_JWT, user: FAKE_USER },
  );
}

async function mockApis(page: Page): Promise<void> {
  await page.route(`${API}/auth/me`, (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) }),
  );
  await page.route(`${API}/users/profile/me*`, (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) }),
  );
  await page.route(`${API}/notifications/me*`, (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) }),
  );

  // List endpoint — honors pagination + filters
  await page.route(`${API}/estilos-vida/elsa?**`, async (route) => {
    const url = new URL(route.request().url());
    const page_ = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const patientId = url.searchParams.get('patientId');
    let all = Array.from({ length: 25 }, (_, k) => buildItem(k + 1));
    if (patientId) all = all.filter((it) => it.patientId.includes(patientId));
    const total = all.length;
    const start = (page_ - 1) * pageSize;
    const data = all.slice(start, start + pageSize);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data,
        meta: { page: page_, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      }),
    });
  });

  // Detail endpoint
  await page.route(`${API}/estilos-vida/elsa/*`, async (route) => {
    if (route.request().url().includes('?')) return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: DETAIL, status: 200 }),
    });
  });
}

test.describe('HU-003 Consultar ELSA — list & detail', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
  });

  test('lista, filtra por paciente, navega al detalle y vuelve', async ({ page }) => {
    await page.goto('/estilos-vida', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('elsa-list-page')).toBeVisible();
    await expect(page.getByTestId('elsa-table')).toBeVisible();
    await expect(page.getByTestId('elsa-paginator')).toBeVisible();

    // Filter by patient document
    await page.getByTestId('filter-patient').locator('input').fill('10000001');
    await expect(page.getByTestId('elsa-row-elsa-1')).toBeVisible();

    // Navigate to detail
    await page.getByTestId('elsa-row-elsa-1').click();
    await expect(page.getByTestId('elsa-detail-page')).toBeVisible();
    await expect(page.getByTestId('elsa-detail-card')).toContainText('clinician@org');

    // Back to list
    await page.goBack();
    await expect(page.getByTestId('elsa-list-page')).toBeVisible();
  });

  test('estado vacío cuando no hay coincidencias', async ({ page }) => {
    await page.goto('/estilos-vida', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('filter-patient').locator('input').fill('99999999');
    await expect(page.getByTestId('elsa-list-empty')).toBeVisible();
  });
});
