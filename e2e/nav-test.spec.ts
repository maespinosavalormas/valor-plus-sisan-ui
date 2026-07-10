import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticate } from './utils/auth.helper';

test('nav test', async ({ page }) => {
  const navs: string[] = [];
  page.on('framenavigated', (frame) => {
    navs.push(frame.url());
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  await authenticate(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Navigations:', navs);
});
