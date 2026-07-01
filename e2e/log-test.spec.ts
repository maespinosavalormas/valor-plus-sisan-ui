import { test, expect } from '@playwright/test';
import { mockNutritionalFollowUpApis, mockAuthApis } from './utils/api-mocks';
import { authenticateInPage } from './utils/auth.helper';

test('log test', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    logs.push(msg.text());
  });
  
  await mockAuthApis(page);
  await mockNutritionalFollowUpApis(page);
  
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  await page.reload();
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  
  console.log('Logs:', logs.filter(l => l.includes('cargarMuro') || l.includes('cargarExpediente') || l.includes('response')));
  
  const html = await page.content();
  console.log('HTML contains wall-timeline-item:', html.includes('wall-timeline-item'));
});
