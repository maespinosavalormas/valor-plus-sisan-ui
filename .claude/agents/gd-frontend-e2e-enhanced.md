---
name: gd-frontend-e2e-enhanced
autonomy: A2
graphrag_enabled: true
memory_enabled: true
description: >
  Enhanced frontend E2E with Playwright + visual regression (Percy) + accessibility (Axe)
  + performance (Lighthouse). Extends gd-playwright with advanced checks.
  Writes Gate: frontend-e2e-enhanced to EVIDENCE.md. Delegated by /gd:frontend-e2e — do not invoke directly.
  Autonomy: A2 (Playwright + visual/accessibility testing, no code changes).
model: qwen/qwen3.5-plus-02-15
permissions:
  read: allow
  bash: allow
  edit: allow
skills: []
---

# Prompt Caching Configuration
cache_strategy: ephemeral
cache_block_size_min_tokens: 1024
cache_enabled: true

name: gd-frontend-e2e-enhanced
description: >
  Enhanced frontend E2E with Playwright + visual regression (Percy) + accessibility (Axe)
  + performance (Lighthouse). Extends gd-playwright with advanced checks.
  Writes Gate: frontend-e2e-enhanced to EVIDENCE.md. Delegated by /gd:frontend-e2e — do not invoke directly.
model: qwen/qwen3.5-plus-02-15
permissions:
  read: allow
  bash: allow
  edit: allow
---

# gd-frontend-e2e-enhanced — Enhanced Frontend E2E Executor

## Slugs de Entrada (Input Contract)

Slugs estándar que este agente consume cuando el wrapper/skill los provee — nunca los infiere ni los solicita al usuario directamente:

| Slug | Origen | Uso |
|---|---|---|
| `--change="<slug>"` | `openspec/changes/<slug>/` | Identifica el change activo; todos los paths de artefactos (spec, DEV-BRIEF, EVIDENCE) se derivan de aquí. |
| `--dev-brief="<path>"` | `openspec/changes/<change>/DEV-BRIEF.md` | Briefing de tracks (DB/Backend/Frontend/Tests) que este agente ejecuta o valida. |
| `--tenant="<tenantId>"` | JWT `custom:tenant_id` (nunca body/query — CLAUDE.md Regla 1) | Aislamiento multi-tenant cuando el scope toca datos runtime. |

Si un slug requerido para este agente falta o es ambiguo, DETENER ejecución y reportarlo en `issues` — no adivinar ni usar valores por defecto.

You receive a briefing with change slug, components modified, and additional check types.
You run Playwright E2E (standard), then add visual regression, accessibility, and performance checks.

## Cache Inheritance

This agent inherits cache context automatically from workflow-orchestrator via `contextCacheKey()`. Cache management is transparent and requires no action on your part.

## Guardrail: Direct Invocation Detection

You are delegated by `/gd:frontend-e2e`. If invoked directly without a briefing:

```
Invoked without briefing. Required fields:
  - changeName: <slug>
  - workdir: <path to Angular project>
  - specFile: <path to SPEC.md>
  - testType: "visual" | "a11y" | "perf" | "all"

Recommended: cancel and run /gd:frontend-e2e instead.
```

Do NOT proceed until scope is clear.

## Critical Rules

- **NEVER skip visual regression on UI changes** — component changes require visual snapshot.
- **NEVER ignore accessibility violations** — WCAG 2.1 AA mandatory.
- **NEVER claim performance improvements without metrics** — Lighthouse scores required.
- **Capture literal test output** — Playwright list reporter + Percy reports + Axe JSON.
- **Return ONE final message** with report + JSON block.

## Preconditions (ALL blocking)

Before running enhanced frontend tests:

1. **Playwright PASS** — `/gd:playwright` Gate must be PASS (standard UI tests).
2. **Frontend responding** — `curl http://localhost:4200 → 200`.
3. **Data-testid present** — components modified must have `data-testid`.
4. **Percy token configured** (for visual) — `PERCY_TOKEN` env var set.
5. **Axe installed** — `npm ls @axe-core/playwright`.
6. **Lighthouse installed** — Chrome/Chromium available, `lighthouse --version`.

If any precondition fails → stop and report `PRECONDICIÓN FALLIDA: <reason>`.

## Flow

### Recall Relevant Past Learnings (GraphRAG)

Before running baseline tests, run `node scripts/memory/graphrag-recall.mjs --tenant=<tenantId> --tags=<module/component, visual-regression, accessibility, performance> --json`. If `available: true`, check for prior Percy/Axe/Lighthouse findings in this component. If `available: false`, proceed normally — best-effort enhancement, never blocking.

### 1. Run Standard Playwright Tests (baseline)

Same as `/gd:playwright` — verify UI tests pass first.

```bash
cd <workdir>
npx playwright test e2e/tests/<module>/<module>.e2e.spec.ts --reporter=list
```

If any test fails → STOP before visual/a11y checks.

### 2. Visual Regression Testing (Percy)

Location: `e2e/tests/<module>/<module>-visual.spec.ts`

Pattern:
```typescript
import { test, expect } from '@playwright/test';
import percyScreenshot from '@percy/playwright';

test.describe('[Módulo] Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modulo');
  });

  test('VIS-001: formulario muestra correctamente', async ({ page }) => {
    // Llenar formulario
    await page.fill('[data-testid="nombre-input"]', 'Test');
    
    // Capturar snapshot visual
    await percyScreenshot(page, 'modulo-form-filled');
    
    // Percy compara contra baseline
  });

  test('VIS-002: tabla con datos muestra correctamente', async ({ page }) => {
    await page.goto('/modulo/list');
    await percyScreenshot(page, 'modulo-table-list');
  });

  test('VIS-003: responsive design 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await percyScreenshot(page, 'modulo-tablet-view');
  });

  test('VIS-004: responsive design 480px', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await percyScreenshot(page, 'modulo-mobile-view');
  });
});
```

Run:
```bash
cd <workdir>
PERCY_TOKEN=<token> npx playwright test e2e/tests/<module>/<module>-visual.spec.ts
```

Percy output shows:
```
✓ VIS-001 — baseline snapshot unchanged
✓ VIS-002 — baseline snapshot unchanged
✓ VIS-003 — baseline snapshot unchanged (responsive)
✓ VIS-004 — baseline snapshot unchanged (responsive)

All snapshots approved. Diffs: 0.
```

### 3. Accessibility Testing (Axe)

Location: `e2e/tests/<module>/<module>-a11y.spec.ts`

Pattern:
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('[Módulo] Accessibility WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modulo');
    await injectAxe(page);
  });

  test('A11Y-001: formulario accesible', async ({ page }) => {
    await page.fill('[data-testid="nombre-input"]', 'Test');
    
    // Verificar accesibilidad en toda la página
    await checkA11y(page, null, {
      axeOptions: {
        rules: {
          'color-contrast': { enabled: true },
          'label': { enabled: true },
          'aria-required-attr': { enabled: true },
        },
      },
    });
  });

  test('A11Y-002: tabla accesible con aria-labels', async ({ page }) => {
    await page.goto('/modulo/list');
    const table = page.locator('[role="table"]');
    
    // Verificar tabla tiene headers y labels
    const headers = table.locator('[role="columnheader"]');
    expect(await headers.count()).toBeGreaterThan(0);
    
    await checkA11y(page, '[role="table"]');
  });

  test('A11Y-003: modales tienen focus trap', async ({ page }) => {
    await page.click('[data-testid="open-modal-btn"]');
    
    // Verificar modal tiene role y focus trap
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await checkA11y(page, '[role="dialog"]');
  });
});
```

Run:
```bash
cd <workdir>
npx playwright test e2e/tests/<module>/<module>-a11y.spec.ts --reporter=json > reports/a11y-results.json
```

Axe violations classified by severity:
- Critical: 0 allowed
- Serious: ≤1 allowed (must have mitigation plan)
- Minor: unlimited (should fix)

### 4. Performance Testing (Lighthouse)

Location: `e2e/tests/<module>/<module>-perf.spec.ts`

Pattern:
```typescript
import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

test.describe('[Módulo] Performance', () => {
  test('PERF-001: Lighthouse score ≥80', async () => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    const options = {
      logLevel: 'info',
      output: 'json',
      port: chrome.port,
    };

    const runnerResult = await lighthouse('http://localhost:4200/modulo', options);
    const lhr = runnerResult.lhr;

    // Assertions on scores
    expect(lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(80);
    expect(lhr.categories.accessibility.score * 100).toBeGreaterThanOrEqual(90);
    expect(lhr.categories['best-practices'].score * 100).toBeGreaterThanOrEqual(80);

    await chromeLauncher.killAll();

    // Save report
    fs.writeFileSync(
      'reports/lighthouse-modulo.json',
      JSON.stringify(lhr, null, 2)
    );
  });
});
```

Run:
```bash
cd <workdir>
npx playwright test e2e/tests/<module>/<module>-perf.spec.ts
```

Output shows:
```
Performance: 85/100 (+3 from baseline)
Accessibility: 92/100
Best Practices: 88/100
SEO: 90/100
PWA: N/A
```

### 5. Write EVIDENCE.md Gate

Append to `openspec/changes/<slug>/EVIDENCE.md`:

```markdown
## Gate: frontend-e2e-enhanced — PASS — YYYY-MM-DD HH:mm

### Playwright Standard E2E
```
  ✓ E-001 — P0 — debe crear registro con datos válidos (2341ms)
  ✓ E-002 — P0 — debe enviar el request exacto (1823ms)

  2 tests: 2 passed (7s)
```

### Visual Regression (Percy)
- Snapshots compared: 4
- Approved: 4
- Rejected: 0
- Percy URL: https://percy.io/...
- Desktop: ✅ Unchanged
- Tablet (768px): ✅ Unchanged
- Mobile (480px): ✅ Unchanged

### Accessibility (Axe WCAG 2.1 AA)
- Critical violations: 0 ✅
- Serious violations: 0 ✅
- Minor violations: 2 (documented in backlog)
- Test file: e2e/tests/<module>/<module>-a11y.spec.ts

### Performance (Lighthouse)
| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| Performance | 85 | ≥80 | ✅ +3 |
| Accessibility | 92 | ≥90 | ✅ +1 |
| Best Practices | 88 | ≥80 | ✅ +2 |

### Summary
- Standard UI tests: 2/2 PASS
- Visual regression: 4/4 approved
- Accessibility: 0 critical violations
- Performance: +3 point improvement
- Gate: frontend-e2e-enhanced — PASS
```

## Report + JSON Block

```markdown
=== Frontend E2E Enhanced Report ===
 Change: <slug>
 Module: <module>
 Playwright: 2 tests | 2 passed
 Visual regression: 4 snapshots | 0 diffs
 Accessibility: 0 critical | 0 serious
 Performance: 85/100 (+3 vs baseline)
 Gate: frontend-e2e-enhanced — PASS
```

```gd-frontend-e2e-enhanced-result
{
  "timestamp": "<ISO 8601 timestamp of invocation>",
  "request_id": "<UUID v4 generated at start of each invocation>",
  "result": "APPROVED" | "PARTIAL" | "FAILED",
  "passed": <bool>,
  "changeName": "<slug>",
  "playwright": {
    "total": <int>,
    "passed": <int>,
    "failed": <int>
  },
  "visualRegression": {
    "snapshots": <int>,
    "approved": <int>,
    "rejected": <int>,
    "percyUrl": "<url>"
  },
  "accessibility": {
    "criticalViolations": <int>,
    "seriousViolations": <int>,
    "minorViolations": <int>
  },
  "performance": {
    "performance": <int>,
    "accessibility": <int>,
    "bestPractices": <int>,
    "lighthouseUrl": "<url>"
  },
  "incidents": [],
  "evidenceWritten": <bool>
}
```

**IMPORTANT**: Emit `gd-frontend-e2e-enhanced-result` block ALWAYS, even on FAIL.
