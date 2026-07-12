# HU-003: Consultar ELSA — User Manual

**Version:** 1.0  
**Audience:** Clinicians, Public Health Officials, Auditors  
**Date:** 2026-07-08

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing the ELSA Query Tool](#accessing-the-elsa-query-tool)
3. [List Page](#list-page)
4. [Filtering & Sorting](#filtering--sorting)
5. [Pagination](#pagination)
6. [Detail View](#detail-view)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The **ELSA Query Tool** allows authorized clinicians and auditors to view lifestyle evaluation forms (ELSA) for patients. You can:

- **List all ELSA forms** with pagination
- **Filter** by patient, date range, and risk levels
- **Sort** by evaluation date or creation date
- **View details** for individual forms
- **Track** who created each form

**Required Role:** GOBERNACION, MUNICIPIO, or AUDITOR

---

## Accessing the ELSA Query Tool

### Via Web Browser

1. Log in to SISAN UI with your credentials
2. Navigate to **Estilos de Vida** → **Consultar ELSA**
3. You should see a table of ELSA forms

### Via API (Developers)

**Endpoint:** `GET /api/estilos-vida/elsa`

**Example:**
```bash
curl -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  'https://api.valor-plus.local/api/estilos-vida/elsa?page=1&pageSize=20'
```

---

## List Page

The ELSA list page displays all ELSA forms available in your organization.

### Table Columns

| Column | Description |
|--------|-------------|
| **Patient ID** | Patient's cedula or ID number |
| **Evaluation Date** | When the ELSA was evaluated |
| **Nutrition Risk** | BAJO (Low), MEDIO (Medium), ALTO (High) |
| **Physical Activity Risk** | BAJO, MEDIO, or ALTO |
| **Alcohol Risk** | BAJO, MEDIO, or ALTO |
| **METs Score** | Metabolic equivalent score |
| **Nutrition Score** | Numerical nutrition assessment |
| **Alcohol Score** | Numerical alcohol assessment |
| **Created At** | Date the form was created in the system |

### Example List View

```
Patient ID    | Eval Date  | Nutrition | Activity | Alcohol | METs  | Created By
1234567890    | 2026-07-08 | ALTO      | MEDIO    | BAJO    | 2.5   | clinician@org
9876543210    | 2026-07-07 | BAJO      | BAJO     | MEDIO   | 3.2   | nurse@org
```

---

## Filtering & Sorting

### Available Filters

Click **Filters** to open the filter panel:

1. **Patient ID**
   - Enter patient cedula to find a specific patient
   - Supports partial search

2. **Date Range**
   - **From:** Earliest evaluation date
   - **To:** Latest evaluation date
   - Example: Show forms from 2026-06-01 to 2026-07-08

3. **Nutrition Risk**
   - Select: BAJO, MEDIO, ALTO, or All
   - Example: Show only HIGH-risk nutrition cases

4. **Physical Activity Risk**
   - Select: BAJO, MEDIO, ALTO, or All

5. **Alcohol Risk**
   - Select: BAJO, MEDIO, ALTO, or All

### Applying Filters

1. Fill in desired filter fields
2. Filters apply automatically (400ms debounce)
3. Table updates to show matching results
4. Clear filters by clicking **Reset Filters**

### Sorting

- Click the **Sort** dropdown
- Choose: **Evaluation Date** or **Created At**
- Choose direction: **Ascending** or **Descending** (default)
- Example: Sort by Evaluation Date DESC to see newest evaluations first

---

## Pagination

The list supports multiple page sizes:

- **20 items per page** (default)
- **50 items per page**
- **100 items per page** (maximum)

### Navigating Pages

1. Choose page size in dropdown at the bottom
2. Use **Previous/Next** buttons to navigate
3. Or enter page number directly
4. Page indicator shows: **Page 1 of 8** (example: 8 total pages)

---

## Detail View

Click any row in the list to view full details for that ELSA form.

### Detail Page Contains

**Header Information:**
- Patient ID (cedula)
- Evaluation Date
- Form Status (e.g., "COMPLETED")

**Lifestyle Profile Sections:**

1. **Nutrition Profile**
   - Water intake (cups per day)
   - Fiber intake (portions)
   - Processed food frequency
   - Overall nutrition risk assessment

2. **Physical Activity Profile**
   - METs per week (exercise intensity × duration)
   - Activity types (sedentary, light, moderate, vigorous)
   - Physical activity risk assessment

3. **Alcohol Profile**
   - Units per week
   - Consumption pattern (daily, weekend, occasional)
   - Alcohol risk assessment

**Metadata:**
- **Created At:** When the form was entered
- **Created By:** Username of clinician who completed the form

### Actions on Detail Page

- **Back to List:** Return to the list page
- **Print:** Print the full form (Ctrl+P)

---

## Common Tasks

### Task: Find all HIGH-risk nutrition cases in June

1. Go to **Consultar ELSA**
2. Click **Filters**
3. Set:
   - **Date From:** 2026-06-01
   - **Date To:** 2026-06-30
   - **Nutrition Risk:** ALTO
4. Table updates automatically
5. Review results and click any row for details

### Task: Sort forms by newest evaluation date

1. Click the **Sort** dropdown
2. Select **Evaluation Date**
3. Select **Descending**
4. Table re-sorts (newest first)

### Task: Find a specific patient's ELSA

1. Click **Filters**
2. Enter patient cedula in **Patient ID**
3. Press Enter or wait 400ms for search
4. Table filters to that patient
5. Click row to see full details

### Task: View who created each form

1. Look at the **Created By** column in the list
2. Or open detail view to see **Created By** name

---

## Troubleshooting

### Problem: I don't see any ELSA forms

**Possible Causes:**
1. You don't have the correct role (need GOBERNACION, MUNICIPIO, or AUDITOR)
2. No ELSA forms have been created yet
3. Filters are too restrictive

**Solution:**
1. Verify your role with your administrator
2. Clear filters: Click **Reset Filters**
3. Ask clinicians to create ELSA forms first

### Problem: Filter changes don't apply immediately

**Expected Behavior:**
- Filters have a 400ms debounce (to avoid excessive queries)
- After you stop typing, results update automatically

**Solution:**
- Wait 400ms after typing, or
- Press Enter to force immediate update

### Problem: I can't see patient details

**Possible Causes:**
1. Permission denied (insufficient role)
2. Patient ID is incorrect
3. Form was deleted (soft delete)

**Solution:**
1. Contact your administrator to verify permissions
2. Double-check patient cedula
3. Check audit logs for deletion events

### Problem: "Connection Error" or "Server Error"

**Solution:**
1. Refresh the page (F5)
2. Check your internet connection
3. If error persists, contact IT Support
4. Error reference ID is shown in browser console (F12)

### Problem: Page loads slowly or times out

**Causes:**
1. Large page size (100 items) on slow network
2. Complex filters
3. Server overload

**Solution:**
1. Switch to smaller page size (20 items)
2. Simplify filters
3. Wait a few minutes and retry
4. Try during off-peak hours

---

## Tips & Best Practices

1. **Use Patient ID filter** when looking for specific patient — faster than scrolling
2. **Set date range** to reduce result set — improves performance
3. **Sort by Evaluation Date DESC** to see most recent evaluations first
4. **Page size 50** balances detail visibility with performance
5. **Print detail view** for paper charts — Ctrl+P works in detail page
6. **Audit trail** is automatic — all reads are logged for compliance

---

## Contact & Support

**For Technical Support:**
- Email: backend@sisan.local
- Slack: #sisan-support

**For Access Issues:**
- Contact your Organization Administrator
- Or email: admin@sisan.local

**For Data Quality Issues:**
- Contact your Clinical Lead
- Review form completeness guidelines

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-08 | Initial release — List, Filter, Sort, Detail views |

