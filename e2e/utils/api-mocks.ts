/**
 * E2E API Mocks — intercepts backend calls for the nutritional-follow-up
 * module so the UI can be exercised without a live sisan-backend.
 */

import { Page, Route } from '@playwright/test';

export interface MockSeguimiento {
  uuid: string;
  tipo: 'MEDICA' | 'NUTRICIONAL' | 'SOCIAL';
  texto: string;
  fechaHora: string;
  autor: { nombre: string; cargo: string };
  evidenciaUuid?: string;
}

export interface MockExpediente {
  casoId: string;
  estadoActual: 'ACTIVO' | 'RECUPERADO' | 'FALLECIDO' | 'ABANDONO' | 'TRASLADO';
  diasEnPrograma: number;
  sparklineData: { fecha: string; deltaZ: number }[];
}

const DEFAULT_MOCK_EXPEDIENTE: MockExpediente = {
  casoId: 'caso-e2e-001',
  estadoActual: 'ACTIVO',
  diasEnPrograma: 42,
  sparklineData: [
    { fecha: '2026-01-01', deltaZ: -2.5 },
    { fecha: '2026-02-01', deltaZ: -1.8 },
    { fecha: '2026-03-01', deltaZ: -0.9 },
    { fecha: '2026-04-01', deltaZ: -0.3 },
    { fecha: '2026-05-01', deltaZ: 0.1 },
  ],
};

export let MOCK_EXPEDIENTE: MockExpediente = { ...DEFAULT_MOCK_EXPEDIENTE };

const baseSeguimientos: MockSeguimiento[] = [
  {
    uuid: 'seg-001',
    tipo: 'MEDICA',
    texto: 'Primera valoración médica. Paciente estable.',
    fechaHora: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    autor: { nombre: 'Dra. Martínez', cargo: 'Médico' },
  },
  {
    uuid: 'seg-002',
    tipo: 'NUTRICIONAL',
    texto: 'Plan nutricional ajustado. Incremento de 300 kcal/día.',
    fechaHora: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    autor: { nombre: 'Lic. Gómez', cargo: 'Nutricionista' },
  },
  {
    uuid: 'seg-003',
    tipo: 'SOCIAL',
    texto: 'Visita domiciliaria completada. Familia comprometida.',
    fechaHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    autor: { nombre: 'Trab. Social Pérez', cargo: 'Trabajador Social' },
  },
];

const API_BASE_URL = 'http://localhost:3000/api/v1';

export async function mockNutritionalFollowUpApis(page: Page, estadoInicial?: MockExpediente['estadoActual']): Promise<void> {
  // Reset mutable state at the start of each test
  MOCK_EXPEDIENTE = { ...DEFAULT_MOCK_EXPEDIENTE };
  if (estadoInicial) {
    MOCK_EXPEDIENTE.estadoActual = estadoInicial;
  }

  // Clean up previous routes to avoid accumulation between tests
  await page.unroute(`${API_BASE_URL}/casos/*/expediente-evolutivo*`).catch(() => {});
  await page.unroute(`${API_BASE_URL}/casos/*/seguimientos*`).catch(() => {});
  await page.unroute(`${API_BASE_URL}/casos/*/cambio-estado`).catch(() => {});
  await page.unroute(`${API_BASE_URL}/casos/*/evidencias/*/url-descarga`).catch(() => {});

  // GET /api/v1/casos/:casoId/expediente-evolutivo
  await page.route(`${API_BASE_URL}/casos/*/expediente-evolutivo*`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: MOCK_EXPEDIENTE,
        timestamp: new Date().toISOString(),
        request_id: 'req-e2e-001',
      }),
    });
  });

  // GET /api/v1/casos/:casoId/seguimientos
  await page.route(`${API_BASE_URL}/casos/*/seguimientos*`, async (route: Route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const tipo = new URL(url).searchParams.get('tipo');
      let items = baseSeguimientos;
      if (tipo) {
        items = items.filter((s) => s.tipo === tipo);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items,
            hasMore: false,
            nextCursor: null,
          },
          timestamp: new Date().toISOString(),
          request_id: 'req-e2e-002',
        }),
      });
      return;
    }
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON();
      const nuevo: MockSeguimiento = {
        uuid: `seg-${Date.now()}`,
        tipo: body.tipo || 'MEDICA',
        texto: body.texto,
        fechaHora: new Date().toISOString(),
        autor: { nombre: 'E2E Tester', cargo: 'Tester' },
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: nuevo,
          timestamp: new Date().toISOString(),
          request_id: 'req-e2e-003',
        }),
      });
      return;
    }
    await route.continue();
  });

  // PUT /api/v1/casos/:casoId/cambio-estado
  await page.route(`${API_BASE_URL}/casos/*/cambio-estado`, async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }
    // The frontend sends FormData (multipart), not JSON — parse from raw body
    const rawBody = route.request().postData() || '';
    const match = rawBody.match(/nuevoEstado\r?\n\r?\n([A-Z]+)/);
    const estadoNuevo = match ? match[1] : 'RECUPERADO';
    // Update the mutable mock so subsequent GETs return the new state
    MOCK_EXPEDIENTE = { ...MOCK_EXPEDIENTE, estadoActual: estadoNuevo as any };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { estadoAnterior: 'ACTIVO', estadoNuevo },
        timestamp: new Date().toISOString(),
        request_id: 'req-e2e-004',
      }),
    });
  });

  // GET /api/v1/casos/:casoId/evidencias/:evidenciaId/url-descarga
  await page.route(`${API_BASE_URL}/casos/*/evidencias/*/url-descarga`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          url: 'https://example.com/presigned-url',
          expiraEnSegundos: 300,
        },
        timestamp: new Date().toISOString(),
        request_id: 'req-e2e-005',
      }),
    });
  });
}

export async function mockAuthApis(page: Page): Promise<void> {
  // GET /api/v1/users/profile/me (current user)
  await page.route(`${API_BASE_URL}/users/profile/me*`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-user-id',
        email: 'e2e@sisan.local',
        username: 'e2e-user',
        firstName: 'E2E',
        lastName: 'Tester',
        roles: ['user'],
      }),
    });
  });

  // GET /api/v1/notifications/me (sidebar notifications)
  await page.route(`${API_BASE_URL}/notifications/me*`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [],
      }),
    });
  });

  // GET /api/v1/auth/me (used by AuthService.getCurrentUser)
  await page.route(`${API_BASE_URL}/auth/me`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-user-id',
        email: 'e2e@sisan.local',
        username: 'e2e-user',
        firstName: 'E2E',
        lastName: 'Tester',
        roles: ['user'],
      }),
    });
  });
}
