import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticate } from './utils/auth.helper';

test('token test', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    logs.push(msg.text());
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  await authenticate(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token:', token ? 'exists' : 'null');
  console.log('Auth logs:', logs.filter(l => l.includes('AuthService')));
});
