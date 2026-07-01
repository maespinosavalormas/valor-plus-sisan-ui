import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticate } from './utils/auth.helper';

test('network test', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (req) => {
    requests.push(req.url());
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  await authenticate(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Requests:', requests.filter(r => r.includes('index.html') || r.includes('main.js') || r.includes('polyfills')));
});
