import { test, expect } from '@playwright/test';

test('simple navigation test', async ({ page }) => {
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(3000);
  const url = page.url();
  console.log('URL:', url);
  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('HTML snippet:', html.substring(0, 500));
  const hasTestId = await page.getByTestId('evolutionary-record-page').isVisible().catch(() => false);
  console.log('Has testid:', hasTestId);
});
