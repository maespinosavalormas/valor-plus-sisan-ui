import { test, expect } from '@playwright/test';
import { authenticateInPage } from './utils/auth.helper';
import { mockAuthApis } from './utils/api-mocks';

test('localStorage persistence test', async ({ page }) => {
  await mockAuthApis(page);
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  await page.reload();
  await page.waitForTimeout(1000);
  
  const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token before goto:', tokenBefore ? 'present' : 'missing');
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(2000);
  
  const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token after goto:', tokenAfter ? 'present' : 'missing');
  
  const url = page.url();
  console.log('Final URL:', url);
});
