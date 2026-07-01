/**
 * E2E Auth Helper — injects mock JWT into localStorage so the Angular app
 * bypasses the login gate and loads authenticated routes.
 */

export interface MockUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export const MOCK_USER: MockUser = {
  id: 'e2e-user-id',
  email: 'e2e@sisan.local',
  username: 'e2e-user',
  firstName: 'E2E',
  lastName: 'Tester',
  roles: ['user'],
};

function buildMockToken(user: MockUser = MOCK_USER): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60; // 24h from now
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    'custom:tenant_id': 'tenant-e2e',
    exp,
    iat: now,
  };
  const encoded = btoa(JSON.stringify(payload));
  return `mock.${encoded}.signature`;
}

export async function authenticate(page: import('@playwright/test').Page): Promise<void> {
  const token = buildMockToken();
  const userJson = JSON.stringify(MOCK_USER);
  // addInitScript runs before any page scripts, avoiding about:blank issues
  await page.addInitScript(
    ({ token, userJson }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', userJson);
    },
    { token, userJson }
  );
}

export async function authenticateInPage(page: import('@playwright/test').Page): Promise<void> {
  const token = buildMockToken();
  const userJson = JSON.stringify(MOCK_USER);
  await page.evaluate(
    ({ token, userJson }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', userJson);
    },
    { token, userJson }
  );
}

export async function clearAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  });
}
