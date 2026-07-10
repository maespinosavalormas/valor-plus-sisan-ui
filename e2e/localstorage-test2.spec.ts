import { test, expect } from '@playwright/test';
import { authenticateInPage } from './utils/auth.helper';

test('localStorage persistence test 2', async ({ page }) => {
  await page.goto('http://localhost:4200/auth/login');
  await authenticateInPage(page);
  
  const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token before goto:', tokenBefore ? 'present' : 'missing');
  
  await page.goto('http://localhost:4200/nutritional-follow-up/123/expediente-evolutivo');
  await page.waitForTimeout(1000);
  
  const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token after goto:', tokenAfter ? 'present' : 'missing');
  
  // Try to inject again after goto
  await authenticateInPage(page);
  await page.reload();
  await page.waitForTimeout(1000);
  
  const tokenAfterReload = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token after reload:', tokenAfterReload ? 'present' : 'missing');
  
  const url = page.url();
  console.log('Final URL:', url);
});
