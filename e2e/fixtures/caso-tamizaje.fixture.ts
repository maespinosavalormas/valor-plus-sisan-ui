/** E2E fixture — caso IDs for tamizajes HU-014 */
export const INVALID_CASO_ID = '999999999';

/** Default tenant for tamizajes E2E (change-meta tenant_id) */
export const E2E_TENANT_ID = process.env.E2E_TENANT_ID ?? 'valor-plus';

/**
 * Set via PLAYWRIGHT_CASO_ID / E2E_CASO_ID after `npm run seed:e2e-tamizajes` in sisan-backend.
 * Fallback '1' only when seed has not been run.
 */
export const E2E_CASO_ID =
  process.env.PLAYWRIGHT_CASO_ID ?? process.env.E2E_CASO_ID ?? '1';

/**
 * Set via PLAYWRIGHT_CASO_RECUPERADO_ID after `npm run e2e:tamizajes:seed`.
 * Fallback '2' matches default seed-e2e-tamizajes recuperado case.
 */
export const E2E_CASO_RECUPERADO_ID =
  process.env.PLAYWRIGHT_CASO_RECUPERADO_ID ??
  process.env.E2E_CASO_RECUPERADO_ID ??
  '2';

export function expedientePath(casoId: string): string {
  return `/cases/${casoId}?tab=tamizajes`;
}

/** Legacy alias — redirects to case detail tamizajes tab. */
export function legacyExpedientePath(casoId: string): string {
  return `/casos/${casoId}/expediente`;
}
