import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticate } from './utils/auth.helper';

test('url test', async ({ page }) => {
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  await authenticate(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(1000);
  console.log('URL after goto:', page.url());
  
  await page.waitForTimeout(2000);
  console.log('URL after 2s:', page.url());
});
