# HU-003: Consultar ELSA — UI/UX Specification

**Status:** ✅ PRODUCTION-READY  
**Framework:** Angular 17 + Material Design  
**Date:** 2026-07-11

## List Page

**Route:** `/estilos-vida/elsa`
**Guards:** RoleGuard (GOBERNACION, MUNICIPIO, AUDITOR)

**Components:**
- MatTable (9 columns)
- MatPaginator (20/50/100 items)
- Filter panel (patient, date range, risk levels)
- Sort dropdown (evaluation date / created at)

**Features:**
- Debounce: 400ms on filter changes
- States: Loading, Error (with retry), Empty, Data
- Navigation: Click row → detail page

## Detail Page

**Route:** `/estilos-vida/elsa/:id`
**Guards:** RoleGuard (GOBERNACION, MUNICIPIO, AUDITOR)

**Display:**
- Patient ID, evaluation date
- Nutrition/activity/alcohol profiles
- Created by username
- Created at timestamp
- Back button

## State Management (NgRx)

**State Structure:**
```typescript
{
  list: ELSAListItem[],
  listLoading: boolean,
  listError: string | null,
  listMeta: PaginationMeta,
  listFilters: FilterState
}
```

**Actions:**
- loadElsaList
- loadElsaListSuccess
- loadElsaListFailure
- setElsaListFilters
- setElsaListPage

**Selectors:**
- selectElsaList$
- selectElsaListLoading$
- selectElsaListError$
- selectElsaListMeta$
- selectElsaListFilters$

## Performance

- First Paint: < 1s
- Interactive: < 2s
- List load: < 500ms (p95)
- Detail load: < 200ms (p95)

---

Complete UI guide: See E2E-CERTIFICATION.md
