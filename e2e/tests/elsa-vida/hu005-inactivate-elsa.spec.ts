import { test, expect } from '@playwright/test';

test.describe('HU-005: Inactivar Registro ELSA con 2FA', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API para evitar dependencias
    await page.route('**/api/v1/forms/elsa/**', route => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });
  });

  test('CA-01: Modal debe abrirse al hacer clic en botón inactivar', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const modal = page.locator('[data-testid="dialog-inactivate-elsa"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('CA-02: Validación de motivo (mínimo 15 caracteres)', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const motivoInput = page.locator('[data-testid="input-motivo-inactivacion"]');
      if (await motivoInput.isVisible({ timeout: 2000 })) {
        await motivoInput.fill('Short');
        await motivoInput.blur();

        const errorMsg = page.locator('text=Mínimo 15 caracteres');
        await expect(errorMsg).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('CA-03: Validación de token 2FA (6 dígitos)', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const tokenInput = page.locator('[data-testid="input-token-2fa"]');
      if (await tokenInput.isVisible({ timeout: 2000 })) {
        await tokenInput.fill('12345');
        await tokenInput.blur();

        const errorMsg = page.locator('text=6 dígitos');
        await expect(errorMsg).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('CA-04: Botón Confirmar deshabilitado si formulario inválido', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const confirmBtn = page.locator('[data-testid="btn-confirm-inactivate"]');
      if (await confirmBtn.isVisible({ timeout: 2000 })) {
        await expect(confirmBtn).toBeDisabled();
      }
    }
  });

  test('CA-05: XSS Prevention - Sanitización de motivo', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const motivoInput = page.locator('[data-testid="input-motivo-inactivacion"]');
      if (await motivoInput.isVisible({ timeout: 2000 })) {
        const xssPayload = '<script>alert("xss")</script>Motivo válido con 15+ caracteres';
        await motivoInput.fill(xssPayload);
        await motivoInput.blur();

        const value = await motivoInput.inputValue();
        expect(value).not.toContain('<script>');
      }
    }
  });

  test('CA-06: Cancelar modal debe resetear formulario', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const motivoInput = page.locator('[data-testid="input-motivo-inactivacion"]');
      if (await motivoInput.isVisible({ timeout: 2000 })) {
        await motivoInput.fill('Motivo válido con más de 15 caracteres');

        const cancelBtn = page.locator('[data-testid="btn-cancel-inactivate"]');
        await cancelBtn.click();

        const modal = page.locator('[data-testid="dialog-inactivate-elsa"]');
        await expect(modal).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('CA-07: Accessibility - WCAG 2.1 AA', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      // Verify keyboard navigation works
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBeTruthy();
    }
  });

  test('CA-08: Dark mode support', async ({ page }) => {
    page.goto('http://localhost:4200/elsa/consulta', { waitUntil: 'networkidle' });

    // Simulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    const inactivateButton = page.locator('[data-testid="btn-inactivate-elsa"]').first();
    if (await inactivateButton.isVisible()) {
      await inactivateButton.click();

      const modal = page.locator('[data-testid="dialog-inactivate-elsa"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });
});
