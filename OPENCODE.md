# OPENCODE.md — Valor-Plus Sisan UI

## Reglas activas

1. `tenantId` JWT `custom:tenant_id` — nunca body/query
2. TDD, Coverage ≥85% (frontend + unitarios)
3. **data-testid MANDATORY** en todos los componentes (E2E readiness)
4. Playwright E2E tests (95+ tests, 100% pass rate)
5. Patrones maduros antes de inventar
6. RAG/memoria antes de asumir

## Flujo automático

```
[solicitud] → route-request → token-gate + session-gate + model-route → sub-agente briefing ≤30 palabras → resultado ≤50 palabras
```

## Agents Available

Todos los agentes están disponibles en `.claude/agents/`:
- `/gd:implement` — implementación de features (React componentes)
- `/gd:test` — generación de tests unitarios + E2E
- `/gd:bug` — debugging y fixes
- `/gd:playwright` — E2E con Playwright
- `/gd:frontend-e2e` — E2E avanzado (visual regression, accessibility)
- Y más (ver `.claude/agents/` para lista completa)

## Paths

- **src**: `src/app/features`
- **tests**: `src/**/*.spec.ts`
- **e2e**: `e2e/**/*.spec.ts`
- **spec**: `openspec/valor-plus/_changes/<hu>/ (LOCAL, no framework-sdd)`
- **playwright-report**: `playwright-report/index.html` (MANDATORY output)

Ver CLAUDE.md para reglas detalladas.
