import { test, expect } from '@playwright/test';
import { authenticateInPage } from './utils/auth.helper';
import { mockAuthApis, mockNutritionalFollowUpApis } from './utils/api-mocks';

test('find 401 requests', async ({ page }) => {
  const requests: { url: string; status: number }[] = [];
  page.on('response', (response) => {
    if (response.status() === 401 || response.status() === 404) {
      requests.push({ url: response.url(), status: response.status() });
    }
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(2000);
  
  console.log('401/404 requests:', requests);
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token present:', token ? 'yes' : 'no');
  
  const url = page.url();
  console.log('Final URL:', url);
});
