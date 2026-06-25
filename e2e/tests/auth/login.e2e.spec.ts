import { test, expect } from '@playwright/test';

test.describe('Login E2E', () => {
  test('E2E-001 — P0 — login page shows email password and submit', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('E2E-002 — P0 — valid credentials redirect to home', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByTestId('login-email').fill(process.env.PLAYWRIGHT_USER_EMAIL || 'prueba@sisan.com');
    await page.getByTestId('login-password').fill(process.env.PLAYWRIGHT_USER_PASSWORD || 'Admin123.');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/home/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/home/);
  });
});
