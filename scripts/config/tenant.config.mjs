/**
 * Tenant Configuration — Merged from HU003 branches
 * Path: scripts/config/tenant.config.mjs
 * Combines HU003-e2e-certification (coverage/cache) + HU003-test-orchestration (validation/repos)
 */

export const tenantConfig = {
  id: 'valor-plus',
  name: 'Valor-Plus SISAN',
  type: 'frontend',
  framework: 'angular17',
  repos: {
    backend: '../../backend/valor-plus-sisan-backend',
    framework: '../../../..',
  },
  paths: {
    src: 'src',
    spec: 'openspec/valor-plus/_changes',
    devBrief: 'openspec/valor-plus/_changes',
    components: 'src/app/features',
    state: 'src/app/store',
    tests: 'src/**/*.spec.ts',
    e2e: 'e2e/**/*.spec.ts',
  },
  testing: {
    unit: 'jest',
    e2e: 'playwright',
    coverage: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
  validation: {
    coverageThreshold: 85,
    testCommand: 'npm run test',
    e2eCommand: 'npm run e2e',
  },
  cache: {
    strategy: 'tenant-local',
    hitRateTarget: '70-85%',
  },
};

export const TENANT_CONFIG = tenantConfig;
export default TENANT_CONFIG;
