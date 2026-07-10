import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function loadE2eCasoEnv(): void {
  const envPath = path.join(__dirname, '.e2e-caso.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadE2eCasoEnv();

export const STORAGE_STATE = path.join(__dirname, 'e2e/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL_SISAN ??
      process.env['PLAYWRIGHT_BASE_URL'] ??
      'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    viewport: { width: 1440, height: 900 },
  },
  outputDir: 'test-results/artifacts',
  projects: [
    {
      name: 'setup',
      testDir: './e2e/setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'sisan',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      testMatch: /e2e\/tests\/(?!tamizajes\/).+\.e2e\.spec\.ts/,
      dependencies: ['setup'],
    },
    {
      name: 'sisan-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*login\.e2e\.spec\.ts/,
    },
    {
      name: 'tamizajes',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      testDir: './e2e/tests/tamizajes',
      dependencies: ['setup'],
    },
    {
      name: 'estilos-vida-ui',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /e2e\/tests\/estilos-vida\/.*\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npx ng serve --configuration e2e --poll=2000',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
