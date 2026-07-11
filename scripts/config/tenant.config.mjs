/**
 * Tenant Configuration (Auto-Generated)
 * Path: scripts/config/tenant.config.mjs
 */

export const TENANT_CONFIG = {
  id: 'valor-plus',
  name: 'valor plus',
  type: 'frontend',
  repos: {
    backend: process.cwd(),  // Current repo (may be backend or frontend)
    framework: '../../../..',  // Relative to this repo
  },
  paths: {
    spec: 'openspec/valor-plus/_changes',
    src: 'src/app',
    tests: 'src/**/*.spec.ts',
    e2e: 'e2e/**/*.spec.ts',
  },
  validation: {
    coverageThreshold: 85,
    testCommand: 'npm run test',
    e2eCommand: 'npm run e2e',
  },
};

export default TENANT_CONFIG;
