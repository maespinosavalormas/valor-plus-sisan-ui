import { test, expect } from '@playwright/test';
import { authenticateInPage } from './utils/auth.helper';
import { mockAuthApis } from './utils/api-mocks';

test('auth guard test', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  await mockAuthApis(page);
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  await page.reload();
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  const url = page.url();
  console.log('Final URL:', url);
  console.log('Logs:', logs.slice(0, 30));
  
  const hasTestId = await page.getByTestId('evolutionary-record-page').isVisible().catch(() => false);
  console.log('Has testid:', hasTestId);
});
