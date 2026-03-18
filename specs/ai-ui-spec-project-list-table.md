# AI UI Spec: Project List Table POC

**Source User Story:** `poc-project-list-table.md` (Scenario 1.1: Default Data Load)
**PRD Sections:** 1.1 View Project List, 1.12 Customize Visible Columns
**Target Agent:** UI Agent
**Companion Spec:** `ai-api-spec-project-list-table.md`

---

## 1. Context & Goal

Build a read-only Project List table page that fetches project data from `GET /api/projects` and renders it in a table with 15 columns. This is a **POC to validate the data structure and rendering** of the application's main list view. No create, edit, delete, filtering, or KPI card functionality is in scope.

---

## 2. Tech Stack (Existing Codebase)

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18.3.1 + TypeScript | Existing |
| Build | Vite 5.4.19 | Existing |
| Routing | React Router v6.30.1 | Existing |
| UI Components | shadcn/ui (Radix primitives) | 52 components in `src/components/ui/` |
| Styling | Tailwind CSS v3.4.17 | HSL design tokens in `src/index.css` |
| Data Fetching | TanStack React Query v5.83.0 | Existing but currently unused (data loaded from JSON) |
| Icons | Lucide React v0.462.0 | Existing |
| Date formatting | date-fns | Existing |

**Reusable components available:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge`, `Tooltip`, `Skeleton`, `Card`.

**Existing patterns:**
- Status colors via `src/hooks/useStatusColors.ts` (emerald, sky, amber, rose, violet, slate)
- Currency formatting already used in `KPICard.tsx` and `ProjectTable.tsx`
- `src/pages/ProjectList.tsx` is the existing page at route `/` — this spec replaces its table implementation

---

## 3. Route & Page

| Property | Value |
|---|---|
| Route | `/` |
| Page component | `src/pages/ProjectList.tsx` (modify existing) |
| Page title | `"Projects List"` |
| Layout | Full-width, no sidebar |

---

## 4. Data Source

### 4.1 Primary Endpoint

**`GET /api/projects`** — returns the full project list with all fields needed for the table.

During the POC (no backend), this is served from the existing `src/data/Project.json` via the `DataContext`. The seed data must be augmented with the new fields defined in the API spec.

### 4.2 Secondary Data (for field resolution)

| Data | Source | Purpose |
|---|---|---|
| Sales rep names | `src/data/SalesReps.json` via DataContext | Resolve `salesRepIds` → display names for the Assignee column |
| Opportunity records | `src/data/Opportunity.json` via DataContext | Compute Won Revenue and Pipeline Revenue per project |
| Opportunity stages | `src/data/OpportunityStages.json` via DataContext | Determine terminal stages for revenue bucketing |

All secondary data is already loaded by the existing `DataContext`.

---

## 5. Component Specification

### 5.1 Layout

```
┌─────────────────────────────────────────────────────┐
│  Projects List                                       │
│  {N} projects                                        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │  [Table with 15 columns, horizontal scroll]      │ │
│ │  Project Name (sticky) | Address | Assignee | …  │ │
│ │  ─────────────────────────────────────────────── │ │
│ │  Row 1                                           │ │
│ │  Row 2                                           │ │
│ │  …                                               │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Full-width page container with standard page padding (`px-4 sm:px-6 lg:px-8`)
- Table is inside a `rounded-md border` container with `overflow-x-auto` for horizontal scroll

### 5.2 Page Header

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Projects List</h1>
    <p className="text-sm text-muted-foreground">
      {projects.length} project{projects.length !== 1 ? 's' : ''}
    </p>
  </div>
</div>
```

### 5.3 Table Column Definitions

| # | Column Header | Source Field | Type | Format Rule | Sortable |
|---|---|---|---|---|---|
| 1 | Project Name | `name` | string | Truncate at 300px with ellipsis; full text in `<Tooltip>` | Yes |
| 2 | Address | `address.city` + `address.state` | string | `"{city}, {state}"` | Yes |
| 3 | Assignee | `salesRepIds` → SalesReps lookup | string[] | Comma-separated `"First Last"` names; `"—"` if empty | Yes |
| 4 | Owner | `ownerCompanyName` | string | Plain text; `"—"` if null | Yes |
| 5 | Status | `statusId` | string | shadcn `<Badge>` with color from `useStatusColors` | Yes |
| 6 | Won Revenue | computed client-side | currency | `$X,XXX,XXX`; `$0` if none | Yes |
| 7 | Pipeline Revenue | computed client-side | currency | `$X,XXX,XXX`; `$0` if none | Yes |
| 8 | Valuation | `valuation` | currency | `$X,XXX,XXX`; `"—"` if null | Yes |
| 9 | Primary Stage | `primaryStage` | string | Plain text; `"—"` if null | Yes |
| 10 | Project Type | `projectTypeIds` | string[] | Comma-separated labels; `"—"` if empty | Yes |
| 11 | Ownership Type | `ownershipType` | string | Plain text; `"—"` if null | Yes |
| 12 | Bid Date | `bidDate` | date | `MMM d, yyyy` (e.g., "Sep 15, 2024"); `"—"` if null | Yes |
| 13 | Target Start | `targetStartDate` | date | `MMM d, yyyy`; `"—"` if null | Yes |
| 14 | Target Completion | `targetCompletionDate` | date | `MMM d, yyyy`; `"—"` if null | Yes |
| 15 | External Reference | `externalReferenceId` | string | Plain text; `"—"` if null | Yes |

### 5.4 Sorting Behavior

- **Default sort:** Status ascending, using the display order from the status configuration (Active=1, Planning=2, On Hold=3, Completed=4)
- **Click behavior:** Column header click cycles: **ascending → descending → unsorted** (tri-state)
- **Sort indicator:** Lucide `<ArrowUp />` for ascending, `<ArrowDown />` for descending, no icon for unsorted. Icon appears next to the column header text.
- **Single-column sort only** — clicking a new column resets the previous column's sort

### 5.5 Interaction Behavior

| Interaction | Behavior |
|---|---|
| Row click | Navigate to `/project/:id` (existing ProjectDetail page) |
| Row hover | `hover:bg-muted/50` background highlight |
| Long project name hover | Show full name in `<Tooltip>` |
| Column header click | Cycle sort state (asc → desc → unsorted) |

---

## 6. Data Display Rules

### 6.1 Currency Formatting

Use `Intl.NumberFormat` for all currency columns:

```typescript
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
```

Apply to: Won Revenue, Pipeline Revenue, Valuation.

### 6.2 Date Formatting

Use date-fns `format()`:

```typescript
import { format, parseISO } from 'date-fns';

const formatDate = (isoString: string): string => {
  return format(parseISO(isoString), 'MMM d, yyyy');
};
```

Apply to: Bid Date, Target Start, Target Completion.

### 6.3 Null/Empty Handling

| Condition | Display |
|---|---|
| Field is `null`, `undefined`, or empty string | `"—"` (em dash) |
| `salesRepIds` is empty array | `"—"` |
| `projectTypeIds` is empty array | `"—"` |
| Won Revenue is 0 | `"$0"` (not dash — zero is a valid value) |
| Pipeline Revenue is 0 | `"$0"` |
| Valuation is `null`/`undefined` | `"—"` |
| Valuation is `0` | `"$0"` |

### 6.4 Computed Fields (Client-Side)

#### Won Revenue

```typescript
const TERMINAL_STAGE_WON = 'Won'; // stagename from OpportunityStages

const wonRevenue = opportunities
  .filter(o => o.projectId === project.id)
  .filter(o => {
    const stage = stages.find(s => s.stageid === o.stageId);
    return stage?.stagename === TERMINAL_STAGE_WON;
  })
  .reduce((sum, o) => sum + (o.estimateRevenue || 0), 0);
```

#### Pipeline Revenue

```typescript
const TERMINAL_STAGES = ['Won', 'Lost', 'No Deal', 'No Lead'];

const pipelineRevenue = opportunities
  .filter(o => o.projectId === project.id)
  .filter(o => {
    const stage = stages.find(s => s.stageid === o.stageId);
    return stage && !TERMINAL_STAGES.includes(stage.stagename);
  })
  .reduce((sum, o) => sum + (o.estimateRevenue || 0), 0);
```

#### Assignee Names

```typescript
const assigneeNames = project.salesRepIds
  .map(id => {
    const rep = salesReps.find(r => r.salesrepid === id);
    return rep ? `${rep.firstname} ${rep.lastname}` : null;
  })
  .filter(Boolean)
  .join(', ');
```

---

## 7. Component Hierarchy

```
ProjectList (page)
├── PageHeader
│   ├── <h1>Projects List</h1>
│   └── <p>{count} projects</p>
├── <div className="rounded-md border overflow-x-auto">
│   └── <Table>
│       ├── <TableHeader>
│       │   └── <TableRow>
│       │       └── <SortableColumnHeader /> × 15
│       └── <TableBody>
│           └── <TableRow /> × N  (one per project)
│               ├── ProjectNameCell (sticky left, truncated + Tooltip)
│               ├── TextCell (Address)
│               ├── TextCell (Assignee — resolved names)
│               ├── TextCell (Owner)
│               ├── StatusBadgeCell (Badge with color)
│               ├── CurrencyCell (Won Revenue)
│               ├── CurrencyCell (Pipeline Revenue)
│               ├── CurrencyCell (Valuation)
│               ├── TextCell (Primary Stage)
│               ├── TextCell (Project Type — joined labels)
│               ├── TextCell (Ownership Type)
│               ├── DateCell (Bid Date)
│               ├── DateCell (Target Start)
│               ├── DateCell (Target Completion)
│               └── TextCell (External Reference)
└── EmptyState (conditional — shown when projects array is empty)
```

### 7.1 SortableColumnHeader

```typescript
interface SortableColumnHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  className?: string;
}
```

- Renders a `<TableHead>` with `cursor-pointer select-none` and the sort icon
- Click handler cycles: `null → asc → desc → null`

### 7.2 Sticky Column

The Project Name column must remain visible during horizontal scroll:

```tsx
<TableHead className="sticky left-0 z-20 bg-background">Project Name</TableHead>
// ...
<TableCell className="sticky left-0 z-10 bg-background">
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="block max-w-[300px] truncate">{project.name}</span>
    </TooltipTrigger>
    <TooltipContent>{project.name}</TooltipContent>
  </Tooltip>
</TableCell>
```

---

## 8. States

### 8.1 Loading State

While data is loading (React Query `isLoading`), show skeleton rows:

```tsx
<TableBody>
  {Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 15 }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))}
</TableBody>
```

### 8.2 Empty State

When `projects.length === 0` after loading:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
  <FolderOpen className="h-12 w-12 mb-4" />
  <p className="text-lg font-medium">No projects found</p>
  <p className="text-sm">No projects are available to display.</p>
</div>
```

Use Lucide `FolderOpen` icon.

### 8.3 Error State

If the data fetch fails:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-destructive">
  <AlertCircle className="h-12 w-12 mb-4" />
  <p className="text-lg font-medium">Failed to load projects</p>
  <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
</div>
```

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria (from User Story) | Implementation |
|---|---|
| See the "Projects List" header | `<h1>` with text "Projects List" |
| Table with 15 specified columns | All columns per Section 5.3 |
| Data displayed correctly in each column | Formatting rules per Section 6 |
| Sortable columns (tri-state) | SortableColumnHeader component per Section 5.4 |
| Row click → Project Detail | `onClick` → `navigate(\`/project/${id}\`)` |
| Project count visible | `{N} projects` below the header |
| Empty state for no projects | EmptyState per Section 8.2 |
| Long names truncate with ellipsis | `max-w-[300px] truncate` + `<Tooltip>` |
| Status as colored badge | shadcn `<Badge>` + `useStatusColors` |
| Dash for null/missing values | `"—"` per Section 6.3 |

**Source traceability:**
- Columns definition → `poc-project-list-table.md` Data Definitions section
- Sorting behavior → PRD 1.1 ("Clicking any column header cycles through ascending → descending → unsorted")
- Row click navigation → PRD 1.1 ("Each row is clickable and navigates to the Project Detail page")
- Empty state → PRD 1.1 Edge Cases ("display an empty-state message rather than a blank table")
- Truncation → PRD 1.1 Edge Cases ("Very long project names truncate with an ellipsis")

---

## 10. Out of Scope

These items are mentioned in the PRD but are **not** part of this POC:

- Create / Edit / Delete project
- Filter bar (Sales Rep, Division, GC, Status, Behind PAR, Hide Completed)
- KPI cards (Estimated Pipeline Revenue, Project Valuation)
- Column visibility selector (story 1.12)
- Scroll position / filter state persistence (story 8.5)
- Pagination
- Search/text filter
- "Create Project" button
- Behind PAR indicator

---

## 11. Open Questions

| # | Question | Impact | Recommendation |
|---|---|---|---|
| 1 | The User Story lists "Owner" as "primary corporate entity or developer funding the project." The PRD has no explicit `owner` field on the Project record. Is this the GC company, or a separate field? | Determines whether we add a new `ownerCompanyName` field or derive from GC | **Recommendation:** Add a new `ownerCompanyName` field to the Project model. The GC is a contractor relationship, not the project owner/funder. Proceed with this assumption. |
| 2 | "Primary Stage" (e.g., Bidding, Construction) does not exist in the current data model or PRD API reference. Should this be a free-text field or a lookup? | Affects API design and UI rendering | **Recommendation:** Add as a free-text `primaryStage` field for POC. Can be promoted to a lookup later. |
| 3 | "Ownership Type" (Private, Public Sector) is not in the PRD. Is this a fixed enum or configurable? | Affects validation and lookup design | **Recommendation:** Add as a free-text `ownershipType` field for POC. |
| 4 | "External Reference" — is this always a Dodge ID, or could it be from other sources? | Affects field naming and future extensibility | **Recommendation:** Name it `externalReferenceId` (generic). Map to Dodge IDs in seed data. |
| 5 | Should Won Revenue and Pipeline Revenue be computed client-side or returned by the API? | Affects where business logic lives | **Recommendation:** Client-side for POC (joins project → opportunities → stages). Move to API when backend exists. |
