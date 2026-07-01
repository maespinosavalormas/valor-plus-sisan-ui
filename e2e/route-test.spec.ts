import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis } from './utils/api-mocks';

test('route test', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('seguimientos')) {
      requests.push(request.url());
    }
  });
  
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Seguimientos requests:', requests);
});
