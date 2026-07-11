# CLAUDE.md — Valor-Plus Frontend (SISAN UI)

**Contexto:** Este es el repo de implementación frontend. Los developers trabajan AQUÍ, no en framework-sdd.

## Enrutamiento Automático (REGLA 0 — Local)

| Intent | Comando | Ejecuta |
|---|---|---|
| explorar | `/gd:explore` | Claude Code (desde este repo) |
| arquitectura | `/gd:architect` | Claude Code (desde este repo) |
| review | `/gd:review` | Claude Code (desde este repo) |
| implementar | `/gd:implement` | opencode/qwen (desde este repo) |
| frontend | `/gd:frontend` | opencode/qwen (desde este repo) |
| test/e2e | `/gd:test` / `/gd:e2e` | opencode/qwen (desde este repo) |

**Diferencia:** Todos los comandos usan `openspec/valor-plus/_changes/<slug>/` LOCAL (no framework-sdd).

---

## Estructura Local

```
valor-plus-sisan-ui/
├── src/
│   ├── app/features/              # Feature modules (estilos-vida, etc)
│   └── ...
├── openspec/
│   └── valor-plus/
│       └── _changes/
│           ├── hu003-consultar-elsa/    # SDD artifacts (spec, ui-spec, dev-brief, etc)
│           ├── hu004-expediente-elsa/
│           └── ...
├── .claude/
│   ├── skills/                  # Symlinks a framework-sdd central
│   ├── commands/                # Symlinks a framework-sdd central
│   └── agents/                  # Locales si hay customización
├── CLAUDE.md                    # Este archivo
├── scripts/                     # Symlinks a framework-sdd central (o copias)
├── playwright.config.ts         # Playwright E2E config
└── package.json                 # npm scripts

```

---

## Reglas Activas (Heredadas)

1. `tenantId` JWT `custom:tenant_id` — nunca body/query
2. TDD, Coverage ≥ 85% (frontend + tests unitarios)
3. **data-testid MANDATORY** en todos los componentes (E2E readiness)
4. Playwright E2E tests (95+ tests, 100% pass rate)
5. Patrones maduros antes de inventar
6. Path verificado con `find` SIEMPRE
7. **Valor-Plus Tenant Paths (FIJOS):**
   - Backend: `develop/valor-plus/backend/valor-plus-sisan-backend` (sibling)
   - Frontend: `develop/valor-plus/frontend/valor-plus-sisan-ui` (this repo)

---

## Flujo: Nuevo HU desde Frontend

### 1. Enriquecer Historia (Framework-SDD, pero prepare aquí)

```bash
# Desde framework-sdd SOLO para SDD chain completo
cd /home/gooderp-dev/framework-sdd
npm run gd:enrich-user-story -- --hu=003 --tenant=valor-plus

# Resultado: enriched-story + SDD artifacts en framework-sdd
```

### 2. Crear Rama Local + Spec

```bash
# YA AUTOMATIZADO (gd-enrich-user-story lo hace):
# - Crea rama feat/hu003-e2e-certification en este frontend repo
# - Copia spec.md, api-spec.yml, ui-spec.md, DEV-BRIEF.md a openspec/valor-plus/_changes/hu003-*/
# - Listo para implementar
```

### 3. Implementar (DESDE ESTE REPO)

```bash
# Frontend developers trabajan AQUÍ
cd /path/to/valor-plus-sisan-ui  # Tu clone de GitHub o monorepo local

# Crear cambio (Angular components, state, tests)
npm run gd:implement -- --change=hu003-consultar-elsa --tenant=valor-plus

# o usar skill directamente
/gd:implement --change=hu003-consultar-elsa --tenant=valor-plus
```

### 4. Validar (DESDE ESTE REPO)

```bash
# Revisar spec ↔ implementation alignment
npm run gd:verify -- --change=hu003-consultar-elsa --tenant=valor-plus

# Ejecutar tests unitarios
npm run gd:test -- --change=hu003-consultar-elsa --tenant=valor-plus

# E2E testing con Playwright (MANDATORY report)
npm run gd:e2e -- --change=hu003-consultar-elsa --tenant=valor-plus

# Accessibility + Performance checks
npm run gd:frontend-e2e -- --change=hu003-consultar-elsa --tenant=valor-plus
```

### 5. Merge & Post-Merge

```bash
# Crear PR desde este repo a develop
git push origin feat/hu003-e2e-certification
# → GitHub: Create PR to develop

# Post-merge: Pipeline automática (CI/CD)
# .github/workflows/post-merge-release-pipeline.yml corre automáticamente
# → Documentación generada automáticamente
```

---

## Paths Críticos (NUNCA cambiar)

| Recurso | Path | Propiedad |
|---------|------|----------|
| SDD Artifacts | `openspec/valor-plus/_changes/<slug>/` | Frontend repo (este) |
| Spec | `openspec/valor-plus/_changes/<slug>/spec.md` | Frontend repo (este) |
| UI Spec | `openspec/valor-plus/_changes/<slug>/ui-spec.md` | Frontend repo (este) |
| Dev-Brief | `openspec/valor-plus/_changes/<slug>/DEV-BRIEF.md` | Frontend repo (este) |
| Code | `src/app/features/<feature>/` | Frontend repo (este) |
| Tests | `src/**/*.spec.ts` | Frontend repo (este) |
| E2E Tests | `e2e/**/*.spec.ts` (Playwright) | Frontend repo (este) |
| E2E Report | `playwright-report/index.html` | Frontend repo (este) |
| E2E Evidence | `openspec/valor-plus/_changes/<slug>/EVIDENCE.md` | Frontend repo (este) |

**NO usar:** `framework-sdd/openspec/` para spec frontend (eso es solo para SDD chain central).

---

## Frontend-Specific Comandos

### data-testid Validation (MANDATORY)

```bash
# Verifica que TODOS los componentes tienen data-testid
npm run data-testid:gate -- --change=hu003-consultar-elsa --tenant=valor-plus

# Fail si hay campos interactivos sin data-testid
# → E2E readiness check (bloqueante para PR)
```

### Playwright Report (MANDATORY)

```bash
# Ejecuta E2E + genera playwright-report/index.html
npm run gd:e2e -- --change=hu003-consultar-elsa --tenant=valor-plus

# Fail si playwright-report/index.html no existe
# → SLA: 95+ tests, 100% pass rate
```

### Accessibility Scan (AXAA/Axe)

```bash
# Verifica accesibilidad en todos los componentes
npm run accessibility:scan -- --change=hu003-consultar-elsa

# Fail si hay issues WCAG 2.1 Level AA
```

### Visual Regression (Percy, opcional)

```bash
# Captura screenshots + compara con baseline
npm run visual:regression -- --change=hu003-consultar-elsa

# Fail si hay diferencias significativas
```

---

## Scripts NPM (Locales)

```json
{
  "scripts": {
    "gd:explore": "node scripts/lib/gd-explore.mjs",
    "gd:implement": "node scripts/lib/gd-implement.mjs",
    "gd:verify": "node scripts/lib/gd-verify.mjs",
    "gd:test": "node scripts/lib/gd-test.mjs",
    "gd:e2e": "node scripts/lib/gd-e2e.mjs",
    "gd:frontend-e2e": "node scripts/lib/gd-frontend-e2e.mjs",
    "gd:bug": "node scripts/lib/gd-bug.mjs",
    "gd:review": "node scripts/lib/gd-review.mjs",
    "data-testid:gate": "node scripts/lib/data-testid-gate.mjs"
  }
}
```

**Nota:** Scripts son symlinks a `framework-sdd/scripts/lib/` (o copias si se clona este repo independientemente).

---

## Tenant Configuration

```typescript
// scripts/config/tenant.config.ts
export const TENANT_CONFIG = {
  id: 'valor-plus',
  name: 'Valor Plus SISAN',
  repos: {
    backend: '../../backend/valor-plus-sisan-backend',  // Sibling backend repo
    frontend: process.cwd(),  // Este repo (valor-plus-sisan-ui)
    framework: '../../../framework-sdd'  // Central framework (si está disponible)
  },
  paths: {
    spec: 'openspec/valor-plus/_changes',
    src: 'src/app/features',
    tests: 'src/**/*.spec.ts',
    e2e: 'e2e/**/*.spec.ts',
    playwright: 'playwright-report'
  },
  jwt: {
    custom_tenant_id: 'valor-plus'  // Nunca body/query
  }
};
```

---

## Playwright Config (E2E Base)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',  // MANDATORY: generates playwright-report/index.html
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## Integración con Framework-SDD (Opcional)

Si estás en el monorepo local (`framework-sdd`), los comandos apuntan automáticamente a este repo:

```bash
cd /home/gooderp-dev/framework-sdd

# Estos dos son equivalentes:
npm run gd:implement -- --change=hu003 --tenant=valor-plus --frontend

# Vs. desde el repo frontend:
cd develop/valor-plus/frontend/valor-plus-sisan-ui
npm run gd:implement -- --change=hu003 --tenant=valor-plus
```

**Diferencia:** El segundo es el flujo recomendado (developers trabajan en su repo directamente).

---

## ✅ Checklist: Setup Developer

- [ ] Clone repo: `git clone https://github.com/carlosamesar/valor-plus-sisan-ui.git`
- [ ] `npm install`
- [ ] Verifica que `.claude/skills/` tiene symlinks a central (o copias)
- [ ] Verifica que `scripts/lib/` existe (symlinks o copias)
- [ ] `npm run gd:explore` — debería funcionar
- [ ] `npm run test` — todos los tests pasan
- [ ] Está listo para implementar

---

## 🔗 Related

- `framework-sdd/CLAUDE.md` — Estrategia central
- `framework-sdd/docs/GUIDELINES-HU-BRANCH-STRATEGY.md` — Branch strategy
- `valor-plus-sisan-backend/CLAUDE.md` — Backend equivalent
- Playwright: https://playwright.dev
- data-testid: https://testing-library.com/docs/queries/bytestid

---

**Status:** ACTIVE  
**Applies To:** All developers working on valor-plus frontend  
**Last Updated:** 2026-07-11

