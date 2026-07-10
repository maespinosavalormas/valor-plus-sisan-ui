import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticateInPage } from './utils/auth.helper';

test('constructor test 2', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    logs.push(msg.text());
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Constructor logs:', logs.filter(l => l.includes('constructor')));
});
