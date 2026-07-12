# HU-003: Consultar ELSA — Technical Specification

**Status:** ✅ PRODUCTION-READY  
**Version:** 1.0  
**Date:** 2026-07-08  
**Tenant:** valor-plus (SISAN)

---

## 1. Overview

Query ELSA forms with pagination, filtering, and detail retrieval. Enables clinicians and auditors to review lifestyle evaluation data across patients.

**Endpoints:**
- `GET /api/estilos-vida/elsa` — List with pagination & filters
- `GET /api/estilos-vida/elsa/:id` — Detail view

**Stack:** NestJS (backend) + Angular 17 (frontend) + TypeORM + PostgreSQL

---

## 2. API Contract

### 2.1 List Endpoint

**Request:**
```
GET /api/estilos-vida/elsa
Authorization: Bearer <JWT>
Content-Type: application/json

Query Parameters:
  - page: number (1-based, default: 1)
  - pageSize: number (1-100, default: 20)
  - patientId?: string (filter)
  - dateFrom?: ISO8601 (filter)
  - dateTo?: ISO8601 (filter)
  - riskAlim?: 'BAJO' | 'MEDIO' | 'ALTO' (filter)
  - riskActividad?: 'BAJO' | 'MEDIO' | 'ALTO' (filter)
  - riskAlcohol?: 'BAJO' | 'MEDIO' | 'ALTO' (filter)
  - sortBy?: 'EVALUATION_DATE' | 'CREATED_AT' (default: CREATED_AT)
  - sortDir?: 'ASC' | 'DESC' (default: DESC)
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "cedula",
      "evaluationDate": "2026-07-08T10:30:00Z",
      "riskNutrition": "ALTO",
      "riskPhysicalActivity": "MEDIO",
      "riskAlcohol": "BAJO",
      "metsScore": 2.5,
      "nutritionScore": 18,
      "alcoholScore": 5,
      "createdAt": "2026-07-08T10:30:00Z",
      "createdByUsername": "clinician@org"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

**Error Responses:**
- `400 Bad Request` — Invalid query params
- `401 Unauthorized` — Missing/invalid JWT
- `403 Forbidden` — Insufficient permissions (not GOBERNACION|MUNICIPIO|AUDITOR)
- `500 Internal Server Error` — Database error

---

### 2.2 Detail Endpoint

**Request:**
```
GET /api/estilos-vida/elsa/:id
Authorization: Bearer <JWT>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patientId": "cedula",
  "evaluationDate": "2026-07-08T10:30:00Z",
  "nutritionProfile": {
    "waterIntake": 3,
    "fiberIntake": 4,
    "...": "..."
  },
  "physicalActivityProfile": {
    "metsPerWeek": 2.5,
    "...": "..."
  },
  "alcoholProfile": {
    "unitsPerWeek": 5,
    "...": "..."
  },
  "createdAt": "2026-07-08T10:30:00Z",
  "createdByUsername": "clinician@org"
}
```

**Error Responses:**
- `401 Unauthorized` — Missing/invalid JWT
- `403 Forbidden` — Insufficient permissions
- `404 Not Found` — ID not found in tenant
- `500 Internal Server Error` — Database error

---

## 3. Data Model

### 3.1 FormElsa Entity

**Table:** `form_elsa`  
**Tenant Isolation:** `tenantId` (foreign key to `tenants`)

```typescript
@Entity()
class FormElsa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({ type: 'timestamp' })
  evaluationDate: Date;

  @Column({ type: 'enum', enum: RiskLevel })
  riskNutrition: 'BAJO' | 'MEDIO' | 'ALTO';

  @Column({ type: 'enum', enum: RiskLevel })
  riskPhysicalActivity: 'BAJO' | 'MEDIO' | 'ALTO';

  @Column({ type: 'enum', enum: RiskLevel })
  riskAlcohol: 'BAJO' | 'MEDIO' | 'ALTO';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  metsScore: number;

  @Column({ type: 'int' })
  nutritionScore: number;

  @Column({ type: 'int' })
  alcoholScore: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string; // user_id

  @Column({ type: 'uuid' })
  tenantId: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean; // soft delete

  // Indices
  @Index(['patientId', 'tenantId'])
  @Index(['evaluationDate', 'tenantId'])
  @Index(['createdAt', 'tenantId'])
}
```

---

## 4. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| **AC1** | Backend GET `/estilos-vida/elsa` returns paginado list with filters | Unit + Integration test |
| **AC2** | Each list item includes id, patientId, evaluationDate, risk categories, scores, createdAt | Response schema validation |
| **AC3** | Detail endpoint returns real `createdByUsername` (lookup from user service) | Unit test + E2E |
| **AC4** | Frontend list page with MatTable, pagination, filters, sorting | Visual regression + E2E |
| **AC5** | Frontend detail page shows all ELSA data including `createdByUsername` | E2E test |
| **AC6** | RoleGuard on list/detail routes (GOBERNACION, MUNICIPIO, AUDITOR) | Security unit test |
| **AC7** | Backend audit log on detail read via `audit.logReadFormElsa()` | Audit service test |
| **AC8** | Comprehensive unit tests (backend ≥41, frontend ≥95) | Coverage ≥85% |

---

## 5. Security & Compliance

| Aspect | Requirement | Implementation |
|--------|-------------|-----------------|
| **Authentication** | JWT token required | AuthGuard on all endpoints |
| **Tenant Isolation** | `tenantId` from JWT claim | All queries include `WHERE tenantId = ?` |
| **Authorization** | Role-based access (RoleGuard) | GOBERNACION, MUNICIPIO, AUDITOR only |
| **Audit Logging** | Read events logged | `audit.logReadFormElsa()` on detail view |
| **Data Sensitivity** | No PII in logs | Patient ID only, no medical details in audit log |
| **Soft Delete** | Logical deletion only | `isDeleted = true`, no DELETE statements |

---

## 6. Performance Requirements

| Metric | Target | Implementation |
|--------|--------|-----------------|
| **List Response Time** | < 500ms (p95) | Indexed queries, paginado |
| **Detail Response Time** | < 200ms (p95) | Direct UUID lookup + user service call |
| **Database Indices** | Composite (patientId, tenantId) + (evaluationDate, tenantId) + (createdAt, tenantId) | @Index decorators + migration |
| **Connection Pool** | Default (10-20) | No tuning required |
| **Caching** | Redis for user lookups | UserService caches createdByUsername |

---

## 7. Testing Strategy

### 7.1 Unit Tests (Backend)

**Coverage:** ≥85%

- **ElsaFormService:** CRUD, sorting, filtering, pagination
- **ElsaController:** Request validation, response shape, error handling
- **AuditService:** Read event logging, IP/UserAgent extraction
- **RoleGuard:** Authorization logic

**Command:** `npm run test -- valor-plus/backend elsa`

### 7.2 Integration Tests (Backend)

- **Database:** Queries with real indices
- **User Service:** `createdByUsername` lookup
- **Tenant Isolation:** Filter by tenant_id

**Command:** `npm run test:integration -- valor-plus/backend elsa`

### 7.3 Frontend Tests (Angular)

**Coverage:** ≥85%

- **ElsaService:** HTTP GET calls
- **ElsaFacade:** State dispatch
- **ElsaReducer:** Action handling
- **ElsaEffects:** Service integration
- **ElsaListPageComponent:** Table rendering, pagination, filters, sorting, navigation
- **ElsaDetailPageComponent:** Display, back navigation

**Command:** `npm run test -- valor-plus/frontend estilos-vida`

### 7.4 E2E Tests (Playwright)

- **Happy Path:** List → filter → sort → paginate → click detail → back
- **Role Guards:** 403 for unauthorized roles
- **Filters:** Apply filters, verify results updated
- **Audit:** Verify detail read triggers audit log (backend check)

**Command:** `npm run e2e -- valor-plus/estilos-vida`

---

## 8. Deployment Checklist

- [x] Database migration (1772000000016) applied
- [x] Backend tests passing (41/41)
- [x] Frontend tests passing (95/95)
- [x] Build successful (no TypeScript errors)
- [x] Audit logging working
- [x] Tenant isolation verified
- [x] RoleGuard enforced
- [x] API contract validated
- [x] Documentation complete

**Next Steps (Post-Merge):**
1. `/gd:verify` — Code quality gates
2. `/gd:living-doc-certify` — Smart contract validation
3. `npm run release:gate` — Release certification
4. `/gd:archive` — Archive SDD artifacts
5. `npm run docs:portal` — Publish Docusaurus
6. `npm run docs:wiki` — Publish internal wiki

---

## 9. References

- **EVIDENCE.md** — Implementation report
- **USER-MANUAL.md** — End-user guide
- **Backend:** `develop/valor-plus/backend/valor-plus-sisan-backend`
- **Frontend:** `develop/valor-plus/frontend/sisan-ui`
- **Database:** Migration 1772000000016 (indices)

