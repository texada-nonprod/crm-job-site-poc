# AI API Spec: Project List Table POC

**Source User Story:** `poc-project-list-table.md` (Scenario 1.1: Default Data Load)
**PRD Sections:** 1.1 View Project List, API Reference (`/Projects`)
**Target Agent:** API Agent
**Companion Spec:** `ai-ui-spec-project-list-table.md`

---

## 1. Context & Goal

Define the data model and API contract for the Project List table. This spec covers the `GET /api/projects` endpoint that returns project records with all fields needed by the 15-column table, plus the supporting lookup/reference data endpoints.

**POC constraint:** There is no real backend. The "API" is currently the `DataContext` in React that loads JSON seed files at startup. This spec defines the **target contract** that the seed data and DataContext must conform to, and that a future real API will implement.

---

## 2. Tech Stack (Current)

| Layer | Technology | Notes |
|---|---|---|
| Data layer | React Context (`src/contexts/DataContext.tsx`) | Loads JSON seed files, provides data to components |
| Seed data | JSON files in `src/data/` | `Project.json`, `Opportunity.json`, `SalesReps.json`, `OpportunityStages.json` |
| Type definitions | `src/types/index.ts` | TypeScript interfaces |
| State | In-memory React state | No persistence to server |

---

## 3. Data Model

### 3.1 Existing `Project` Interface — Modifications

The existing `Project` interface in `src/types/index.ts` must be extended with new fields.

**Current interface (relevant fields):**
```typescript
export interface Project {
  id: number;
  name: string;
  description: string;
  statusId: string;
  salesRepIds: number[];
  plannedAnnualRate: number;
  parStartDate?: string;
  projectPrimaryContact: { name: string; title: string; phone: string; email: string; };
  address: { street: string; city: string; state: string; zipCode: string; country: string; latitude: number; longitude: number; };
  projectCompanies: ProjectCompany[];
  associatedOpportunities: Array<{ id: number; type: string; description: string; stageId: number; revenue: number; }>;
  notes: Note[];
  activities: Activity[];
  customerEquipment: CustomerEquipment[];
}
```

**NEW fields to add:**

```typescript
export interface Project {
  // ...existing fields...

  // NEW — POC Project List Table fields
  valuation?: number;               // Total project dollar value (user-entered, not opportunity-derived)
  primaryStage?: string;            // Current construction phase: "Pre-Construction", "Bidding", "Construction", "Post-Construction"
  projectTypeIds?: string[];        // Category of construction: ["Commercial"], ["Medical", "Infrastructure"], etc.
  ownershipType?: string;           // Funding source: "Private", "Public Sector", "Government", "P3"
  ownerCompanyName?: string;        // Primary corporate entity or developer funding the project
  bidDate?: string;                 // ISO 8601 date string — deadline for subcontractor pricing
  targetStartDate?: string;         // ISO 8601 date string — when construction begins
  targetCompletionDate?: string;    // ISO 8601 date string — when project wraps up
  externalReferenceId?: string;     // External lead provider ID (e.g., Dodge Construction Network)
}
```

### 3.2 No New Types Required

All new fields are scalar additions to the existing `Project` interface. No new interfaces are needed for this POC.

### 3.3 Field Inventory Table

| # | Field | User Story Column | Status | Type | Nullable | Source |
|---|---|---|---|---|---|---|
| 1 | `name` | Project Name | EXISTING | `string` | No | Project record |
| 2 | `address.city`, `address.state` | Address | EXISTING | `string` | No | Project record |
| 3 | `salesRepIds` | Assignee | EXISTING | `number[]` | No (can be empty) | Project record → resolved via SalesReps |
| 4 | `ownerCompanyName` | Owner | **NEW** | `string` | Yes | Project record |
| 5 | `statusId` | Status | EXISTING | `string` | No | Project record |
| 6 | (computed) | Won Revenue | COMPUTED | `number` | N/A | Opportunities where stage = Won |
| 7 | (computed) | Pipeline Revenue | COMPUTED | `number` | N/A | Opportunities where stage is non-terminal |
| 8 | `valuation` | Valuation | **NEW** | `number` | Yes | Project record |
| 9 | `primaryStage` | Primary Stage | **NEW** | `string` | Yes | Project record |
| 10 | `projectTypeIds` | Project Type | **NEW** | `string[]` | Yes (can be empty) | Project record |
| 11 | `ownershipType` | Ownership Type | **NEW** | `string` | Yes | Project record |
| 12 | `bidDate` | Bid Date | **NEW** | `string` (ISO date) | Yes | Project record |
| 13 | `targetStartDate` | Target Start | **NEW** | `string` (ISO date) | Yes | Project record |
| 14 | `targetCompletionDate` | Target Completion | **NEW** | `string` (ISO date) | Yes | Project record |
| 15 | `externalReferenceId` | External Reference | **NEW** | `string` | Yes | Project record |

---

## 4. API Endpoints

### 4.1 Endpoint: `GET /api/projects`

**Description:** Returns all project records. For the POC, this is served from `Project.json` via DataContext.

**Query Parameters:** None for POC.

**Response Schema:**

```typescript
interface ProjectListResponse {
  content: Project[];  // Array of Project objects (existing interface + new fields)
}
```

**Response Example (single project, abbreviated):**

```json
{
  "content": [
    {
      "id": 500101,
      "name": "St. Mary's Hospital - West Wing Expansion",
      "description": "Construction of a new 4-story wing...",
      "statusId": "Active",
      "salesRepIds": [313, 305],
      "plannedAnnualRate": 24,
      "parStartDate": "2025-01-15T00:00:00.000Z",
      "address": {
        "street": "1200 Medical Center Dr",
        "city": "Chicago",
        "state": "IL",
        "zipCode": "60612",
        "country": "USA",
        "latitude": 41.872,
        "longitude": -87.665
      },
      "valuation": 45000000,
      "primaryStage": "Construction",
      "projectTypeIds": ["Medical"],
      "ownershipType": "Private",
      "ownerCompanyName": "Advocate Health Systems",
      "bidDate": "2024-09-15T00:00:00.000Z",
      "targetStartDate": "2025-01-15T00:00:00.000Z",
      "targetCompletionDate": "2027-06-30T00:00:00.000Z",
      "externalReferenceId": "DCN-2024-88712",
      "projectCompanies": [],
      "associatedOpportunities": [],
      "notes": [],
      "activities": [],
      "customerEquipment": []
    }
  ]
}
```

**Business Logic:** None for this endpoint (straight data return). Revenue computations are client-side for POC.

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| 200 | Success | `{ "content": [...] }` |
| 200 | No projects | `{ "content": [] }` |
| 500 | Server error (future) | `{ "error": "Internal server error" }` |

### 4.2 Endpoint: `GET /api/sales-reps`

**Description:** Returns all sales reps. Already exists as `SalesReps.json`. No changes needed.

**Response Schema (existing):**

```typescript
interface SalesRep {
  salesrepid: number;
  firstname: string;
  lastname: string;
  email: string | null;
}
```

### 4.3 Endpoint: `GET /api/opportunities`

**Description:** Returns all opportunities. Already exists as `Opportunity.json`. No changes needed.

Used by the UI to compute Won Revenue and Pipeline Revenue per project by joining on `projectId`.

### 4.4 Endpoint: `GET /api/opportunity-stages`

**Description:** Returns all opportunity stage definitions. Already exists as `OpportunityStages.json`. No changes needed.

Used by the UI to identify terminal stages (Won, Lost, No Deal, No Lead) for revenue bucketing.

---

## 5. Computed Fields

These fields are **not** stored on the project record. They are computed client-side by joining across data sources.

### 5.1 Won Revenue

**Formula:**
```
Won Revenue(project) = SUM(opportunity.estimateRevenue)
  WHERE opportunity.projectId = project.id
  AND stage.stagename = 'Won'
```

**Data Sources:**
- `Opportunity.json` → filter by `projectId`, get `stageId` and `estimateRevenue`
- `OpportunityStages.json` → lookup `stagename` by `stageid`

**Edge Cases:**
- Project with no opportunities → `$0`
- Project with opportunities but none in "Won" stage → `$0`
- Opportunity with `estimateRevenue = 0` → contributes `$0` (valid)
- Opportunity with `estimateRevenue = null/undefined` → treat as `0`

### 5.2 Pipeline Revenue

**Formula:**
```
Pipeline Revenue(project) = SUM(opportunity.estimateRevenue)
  WHERE opportunity.projectId = project.id
  AND stage.stagename NOT IN ('Won', 'Lost', 'No Deal', 'No Lead')
```

**Data Sources:** Same as Won Revenue.

**Edge Cases:** Same as Won Revenue.

**Terminal stage names (from PRD constraint #12):** `Won`, `Lost`, `No Deal`, `No Lead`

---

## 6. Lookup/Reference Data

### 6.1 Project Status Labels & Colors

Status values are strings stored on the project (`statusId`). The display labels and colors come from the status configuration in `DataContext`.

**Current statuses:**
| statusId | Display Label | Color |
|---|---|---|
| `"Active"` | Active | emerald |
| `"Planning"` | Planning | sky |
| `"On Hold"` | On Hold | amber |
| `"Completed"` | Completed | slate |

No changes needed. The `useStatusColors` hook handles color mapping.

### 6.2 Sales Rep Names

Resolved from `SalesReps.json` by matching `salesRepIds` entries against `salesrepid`.

Display format: `"{firstname} {lastname}"`

### 6.3 Project Types

The `projectTypeIds` field stores string labels directly (e.g., `["Medical"]`, `["Commercial", "Infrastructure"]`). For the POC there is no separate `/Lookups/ProjectTypes` endpoint — the labels are stored inline.

**Known project type values (for seed data):**
- Commercial
- Medical
- Infrastructure
- Residential
- Industrial
- Educational
- Government
- Mixed-Use
- Stadium/Arena

---

## 7. Seed Data Requirements

### 7.1 Existing Data Augmentation

Add the new fields to each of the 5 existing projects in `src/data/Project.json`:

**Project 500101 — St. Mary's Hospital - West Wing Expansion:**
```json
{
  "valuation": 45000000,
  "primaryStage": "Construction",
  "projectTypeIds": ["Medical"],
  "ownershipType": "Private",
  "ownerCompanyName": "Advocate Health Systems",
  "bidDate": "2024-09-15T00:00:00.000Z",
  "targetStartDate": "2025-01-15T00:00:00.000Z",
  "targetCompletionDate": "2027-06-30T00:00:00.000Z",
  "externalReferenceId": "DCN-2024-88712"
}
```

**Project 500102 — Riverfront Stadium Renovation:**
```json
{
  "valuation": 120000000,
  "primaryStage": "Bidding",
  "projectTypeIds": ["Stadium/Arena"],
  "ownershipType": "Public Sector",
  "ownerCompanyName": "City of Chicago Parks Authority",
  "bidDate": "2025-03-01T00:00:00.000Z",
  "targetStartDate": "2025-06-01T00:00:00.000Z",
  "targetCompletionDate": "2028-04-30T00:00:00.000Z",
  "externalReferenceId": "DCN-2024-91003"
}
```

**Project 500103 — Riverside Commercial Park:**
```json
{
  "valuation": 78000000,
  "primaryStage": "Pre-Construction",
  "projectTypeIds": ["Commercial", "Mixed-Use"],
  "ownershipType": "Private",
  "ownerCompanyName": "Riverside Development Group LLC",
  "bidDate": "2025-01-20T00:00:00.000Z",
  "targetStartDate": "2025-08-01T00:00:00.000Z",
  "targetCompletionDate": "2027-12-31T00:00:00.000Z",
  "externalReferenceId": "DCN-2025-00214"
}
```

**Project 500104 (if exists) — augment similarly with varied data to ensure:**
- At least one project has `null` for `valuation`, `bidDate`, and `externalReferenceId` (to test null display)
- At least one project has an empty `projectTypeIds` array
- At least one project has `ownershipType` = `"Government"`
- At least one project has `primaryStage` = `"Post-Construction"`

**Project 500105 (if exists) — augment similarly with:**
- `valuation`: `null` (tests `"—"` display)
- `ownerCompanyName`: `null` (tests `"—"` display)
- `externalReferenceId`: `null`
- `projectTypeIds`: `[]` (empty array)
- `primaryStage`: `null`
- `bidDate`: `null`
- This project tests the null/empty rendering paths

### 7.2 Seed Data Validation Checklist

After augmentation, verify the seed data covers:

| Scenario | Covered By |
|---|---|
| Project with all fields populated | Project 500101 |
| Project with null valuation | Project 500105 |
| Project with empty projectTypeIds | Project 500105 |
| Project with null owner | Project 500105 |
| Project with null external reference | Project 500105 |
| Project with multiple project types | Project 500103 (Commercial, Mixed-Use) |
| Private ownership type | Projects 500101, 500103 |
| Public Sector ownership type | Project 500102 |
| Government ownership type | Project 500104 |
| Multiple assignees (salesRepIds) | Project 500101 (313, 305) |
| Single assignee | Various |
| Won opportunities exist (for Won Revenue > 0) | Project 500101 (opportunity 300001 in Won stage) |
| No won opportunities (Won Revenue = 0) | At least one project |
| Pipeline opportunities exist | Multiple projects |

---

## 8. Validation Rules

For the POC (read-only), there are no write endpoints and therefore no input validation. This section documents the field constraints that will apply when `POST`/`PUT` endpoints are built:

| Field | Rule | Error Message |
|---|---|---|
| `valuation` | Numeric, ≥ 0 | "Valuation must be a positive number" |
| `bidDate` | Valid ISO date string | "Invalid date format" |
| `targetStartDate` | Valid ISO date string | "Invalid date format" |
| `targetCompletionDate` | Valid ISO date string; ≥ `targetStartDate` if both set | "Completion date must be after start date" |
| `ownerCompanyName` | String, max 255 chars | "Owner name too long" |
| `primaryStage` | String, max 100 chars | "Stage name too long" |
| `ownershipType` | String, max 100 chars | "Ownership type too long" |
| `externalReferenceId` | String, max 100 chars | "Reference ID too long" |
| `projectTypeIds` | Array of strings | "Invalid project type" |

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | API Responsibility |
|---|---|
| Table displays project data correctly | `GET /api/projects` returns all required fields |
| All 15 columns have data | Seed data augmented with new fields per Section 7 |
| Status column shows correct status | `statusId` field on project record |
| Revenue columns show correct values | Opportunities data available for client-side computation |
| Null fields display correctly | Seed data includes null values for testing |

---

## 10. Out of Scope

- `POST /api/projects` (create project)
- `PUT /api/projects/:id` (edit project)
- Query parameters on `GET /api/projects` (filtering, pagination, sorting)
- Server-side revenue computation
- `/Lookups/ProjectTypes` endpoint (project types are inline strings for POC)
- `/Lookups/MarketSegments` endpoint
- Ownership type lookup endpoint
- Primary stage lookup endpoint
- Authentication / authorization headers

---

## 11. Open Questions

| # | Question | Impact | Recommendation |
|---|---|---|---|
| 1 | Should `ownerCompanyName` reference an existing company record (FK to `/Companies`) or be a free-text field? | Affects data integrity and future company linking | **POC:** Free-text string. **Future:** Consider FK to a company record. |
| 2 | Should `primaryStage` be a lookup from a configurable list (like statuses) or free text? | Affects consistency and reporting | **POC:** Free-text. **Future:** Add `/Lookups/ProjectStages` with configurable values. |
| 3 | Should `projectTypeIds` reference a `/Lookups/ProjectTypes` endpoint? The PRD defines this API. | Affects whether we need a lookup table | **POC:** Inline string labels in the array. **Future:** Implement the `/Lookups/ProjectTypes` endpoint per PRD. |
| 4 | The User Story column "Won Revenue" implies opportunities in the "Won" stage only. But the PRD's "Estimated Pipeline Revenue" (7.1) sums ALL opportunity revenue. Are these the same metric? | The User Story has two separate columns (Won and Pipeline), while the PRD has a single "Estimated Pipeline Revenue" KPI. | **Recommendation:** They are different. Won Revenue = Won stage only. Pipeline Revenue = non-terminal stages. The PRD KPI is a third metric (all stages). For POC, implement the two columns as defined in the User Story. |
| 5 | The `associatedOpportunities` array on each Project record duplicates data from `Opportunity.json`. Which is the source of truth for revenue computation? | Could produce different totals if they diverge | **Recommendation:** Use `Opportunity.json` (the full opportunity records) as source of truth. The `associatedOpportunities` array is a denormalized summary — don't use it for revenue computation. |
| 6 | The PRD mentions "Valuation" and "Total Project Value" as two separate fields (story 1.4). The User Story only lists "Valuation." Are these the same? | Could be a missing column | **Recommendation:** For POC, implement only "Valuation" as specified in the User Story. "Total Project Value" is a separate Dodge-sourced field that can be added later. |
