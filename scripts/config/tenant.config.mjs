export const tenantConfig = {
  id: 'valor-plus',
  name: 'Valor-Plus SISAN',
  type: 'frontend',
  framework: 'angular17',
  paths: {
    src: 'src',
    spec: 'openspec/valor-plus/_changes',
    devBrief: 'openspec/valor-plus/_changes',
    components: 'src/app/features',
    state: 'src/app/store',
    tests: 'src/**/*.spec.ts',
    e2e: 'e2e',
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
  cache: {
    strategy: 'tenant-local',
    hitRateTarget: '70-85%',
  },
};
