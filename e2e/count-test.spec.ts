import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticateInPage } from './utils/auth.helper';

test('count test', async ({ page }) => {
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  await page.reload();
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  const count = await page.locator('[data-testid="wall-timeline-item"]').count();
  console.log('Count:', count);
  
  const html = await page.content();
  const matches = html.match(/data-testid="wall-timeline-item"/g);
  console.log('HTML matches:', matches ? matches.length : 0);
});
