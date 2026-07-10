/**
 * Debug test — verify token injection works in the browser context
 */

import { test, expect } from '@playwright/test';
import { authenticateInPage } from './utils/auth.helper';
import { mockAuthApis } from './utils/api-mocks';

test.describe('Auth Debug', () => {
  test('token is present in localStorage and authService recognizes it', async ({ page }) => {
    await mockAuthApis(page);
    await page.goto('/auth/login');
    await authenticateInPage(page);
    
    // Verify localStorage has the token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('currentUser'));
    console.log('Token present:', !!token);
    console.log('User present:', !!user);
    expect(token).toBeTruthy();
    expect(user).toBeTruthy();
    
    // Debug: test atob directly in the browser
    const atobResult = await page.evaluate((token) => {
      try {
        const parts = token.split('.');
        const payload = parts[1];
        const decoded = atob(payload);
        return { success: true, decoded, parsed: JSON.parse(decoded) };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }, token);
    console.log('atob result:', atobResult);
    
    // Check if authService isLoggedIn works by mimicking its logic
    const isLoggedIn = await page.evaluate((token) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return 'parts-not-3';
        const payload = parts[1];
        const decoded = atob(payload);
        const parsed = JSON.parse(decoded);
        if (!parsed || !parsed.exp) return 'no-exp';
        const expirationTime = parsed.exp * 1000;
        const currentTime = Date.now();
        return { expired: currentTime > expirationTime, exp: parsed.exp, now: currentTime };
      } catch (e: any) {
        return { error: e.message };
      }
    }, token);
    console.log('isLoggedIn mimic:', isLoggedIn);
  });
  
  test('navigate to protected route after auth', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    await mockAuthApis(page);
    await page.goto('/auth/login');
    await authenticateInPage(page);
    await page.reload();
    
    // After reload, verify isLoggedIn directly
    const isLoggedInResult = await page.evaluate(() => {
      // Try to access authService via Angular's global debug tools
      const ng = (window as any).ng;
      if (ng) {
        const root = document.querySelector('app-root');
        if (root) {
          const injector = ng.getInjector(root);
          const authService = injector.get(ng.getComponent(root)?.constructor?.injector?.get);
          return { hasNg: true, hasAuthService: !!authService };
        }
      }
      return { hasNg: false };
    });
    console.log('Angular debug tools:', isLoggedInResult);
    
    await page.goto('/nutritional-follow-up/caso-e2e-001/expediente-evolutivo');
    
    // Wait a bit for any redirects
    await page.waitForTimeout(1000);
    
    // Check current URL
    const url = page.url();
    console.log('Current URL:', url);
    console.log('Browser logs:', logs.slice(0, 20));
    
    // Check if we are on the login page or the protected page
    const loginButton = page.getByRole('button', { name: 'Iniciar Sesión' });
    const isLoginVisible = await loginButton.isVisible().catch(() => false);
    console.log('Is login visible:', isLoginVisible);
    
    const recordPage = page.getByTestId('evolutionary-record-page');
    const isRecordVisible = await recordPage.isVisible().catch(() => false);
    console.log('Is record page visible:', isRecordVisible);
  });
});
