import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticateInPage } from './utils/auth.helper';

test('effects test with errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  await page.reload();
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Errors:', errors.slice(0, 10));
});
