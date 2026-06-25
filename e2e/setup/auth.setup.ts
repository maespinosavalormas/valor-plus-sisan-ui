import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../.auth/user.json');
const email = process.env.PLAYWRIGHT_USER_EMAIL ?? 'prueba@sisan.com';
const password = process.env.PLAYWRIGHT_USER_PASSWORD ?? 'Admin123.';

setup('authenticate SISAN user', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByTestId('login-page')).toBeVisible();
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();

  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 30_000 });

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
