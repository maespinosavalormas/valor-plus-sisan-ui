import { test, expect } from '@playwright/test';

test.describe('ELSA Inactivation Modal - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/elsa/list');
    // Assuming user is already authenticated in the test environment
  });

  test('CA-06: Happy path - valid form + token → success alert + grid refresh', async ({
    page,
  }) => {
    // Open modal
    await page.click('button:has-text("Inactivar")');
    await expect(page.locator('[data-testid="inactivate-elsa-modal"]')).toBeVisible();

    // Fill motivo
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar este registro ELSA');

    // Fill token
    await page.locator('[data-testid="token-input"]').fill('123456');

    // Click confirm
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for success alert
    await expect(page.locator('text=Éxito')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=inactivado exitosamente')).toBeVisible();

    // Verify modal closes
    await page.locator('button:has-text("Aceptar")').click();
    await expect(page.locator('[data-testid="inactivate-elsa-modal"]')).not.toBeVisible();

    // Verify grid refreshes (record should be marked as deleted)
    await expect(page.locator('text=INACTIVO')).toBeVisible({ timeout: 3000 });
  });

  test('CA-02: Motivo validation - 14 chars → error', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page.locator('[data-testid="motivo-textarea"]').fill('Solo 14 caract');

    // Confirm button should be disabled
    const confirmButton = page.locator('[data-testid="confirm-button"]');
    await expect(confirmButton).toBeDisabled();

    // Error message should appear
    await page.locator('[data-testid="motivo-textarea"]').blur();
    await expect(page.locator('[data-testid="motivo-minlength-error"]')).toBeVisible();
  });

  test('CA-03: Token validation - 5 digits → error', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar');
    await page.locator('[data-testid="token-input"]').fill('12345');

    // Confirm button should be disabled
    const confirmButton = page.locator('[data-testid="confirm-button"]');
    await expect(confirmButton).toBeDisabled();

    // Error message should appear
    await expect(page.locator('[data-testid="token-minlength-error"]')).toBeVisible();
  });

  test('CA-04: Token input - rejects non-digit characters', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page.locator('[data-testid="token-input"]').fill('abc123def456');

    // Should only have digits
    const tokenValue = await page.locator('[data-testid="token-input"]').inputValue();
    expect(tokenValue).toMatch(/^\d{0,6}$/);
    expect(tokenValue).not.toContain('a');
    expect(tokenValue).not.toContain('b');
  });

  test('CA-05: Invalid token → error alert', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar');
    await page.locator('[data-testid="token-input"]').fill('000000'); // Invalid token

    await page.locator('[data-testid="confirm-button"]').click();

    // Error alert should appear
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Token inválido')).toBeVisible();
  });

  test('CA-09: Rate limit - 3 failures + block 4th', async ({ page }) => {
    let failureCount = 0;

    for (let i = 1; i <= 4; i++) {
      await page.click('button:has-text("Inactivar")');
      await page
        .locator('[data-testid="motivo-textarea"]')
        .fill('Esta es una razón válida para inactivar');
      await page.locator('[data-testid="token-input"]').fill('000000'); // Invalid token

      await page.locator('[data-testid="confirm-button"]').click();

      if (i < 4) {
        // First 3 attempts: error alert
        await expect(page.locator('text=Error')).toBeVisible();
        await page.locator('button:has-text("Aceptar")').click();
        failureCount++;
      } else {
        // 4th attempt: rate limit (429)
        await expect(page.locator('text=Demasiados intentos')).toBeVisible({ timeout: 5000 });
      }
    }

    expect(failureCount).toBe(3);
  });

  test('CA-10: Already inactive record → 400 error', async ({ page }) => {
    // This test assumes a record is already marked as inactive
    // The backend should return 400 with "Ya está inactivo"

    await page.click('button:has-text("Inactivar")');
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar');
    await page.locator('[data-testid="token-input"]').fill('123456');

    await page.locator('[data-testid="confirm-button"]').click();

    // Should show error about already being inactive
    await expect(page.locator('text=ya está inactivo')).toBeVisible({ timeout: 5000 });
  });

  test('CA-11: Cancel button - clears form', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar');
    await page.locator('[data-testid="token-input"]').fill('123456');

    // Click cancel
    await page.locator('[data-testid="cancel-button"]').click();

    // Modal should close
    await expect(page.locator('[data-testid="inactivate-elsa-modal"]')).not.toBeVisible();

    // Open again and verify form is cleared
    await page.click('button:has-text("Inactivar")');
    const motivoValue = await page.locator('[data-testid="motivo-textarea"]').inputValue();
    const tokenValue = await page.locator('[data-testid="token-input"]').inputValue();

    expect(motivoValue).toBe('');
    expect(tokenValue).toBe('');
  });

  test('CA-12: Non-authorized role (MEDICO) → button hidden', async ({ page }) => {
    // This test assumes a user with MEDICO role
    // The inactivate button should not be visible

    const inactivateButton = page.locator('button:has-text("Inactivar")');
    await expect(inactivateButton).not.toBeVisible();
  });

  test('CA-15: Success SweetAlert on 200 response', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');
    await page
      .locator('[data-testid="motivo-textarea"]')
      .fill('Esta es una razón válida para inactivar este registro ELSA');
    await page.locator('[data-testid="token-input"]').fill('123456');

    await page.locator('[data-testid="confirm-button"]').click();

    // Success alert with proper text
    await expect(page.locator('text=Éxito')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Registro ELSA inactivado exitosamente')).toBeVisible();

    // Take screenshot for evidence
    await page.screenshot({ path: 'evidence/elsa-success.png' });
  });

  test('Accessibility: ARIA labels present', async ({ page }) => {
    await page.click('button:has-text("Inactivar")');

    // Check for ARIA labels
    const modal = page.locator('[data-testid="inactivate-elsa-modal"]');
    const closeButton = modal.locator('[aria-label]');

    await expect(closeButton).toHaveAttribute('aria-label', /cerrar|close/i);
  });
});
