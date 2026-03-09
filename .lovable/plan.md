
## Column Visibility for Project List

### What's Being Built
A "Columns" button in the project list header that opens a checklist popover. Users pick which columns appear in the table. Preferences are saved to `localStorage` and restored on next visit. "Project Name" is always shown and cannot be unchecked.

---

### Available Columns (13 toggleable + 1 locked)

| Column key | Header | Data source |
|---|---|---|
| `name` | Project Name | `project.name` | *(locked)* |
| `address` | Address | `city, state` |
| `assignee` | Assignee | `getUserNames(assigneeIds)` |
| `owner` | Owner | `getCompanyById(projectOwner.companyId)?.companyName` |
| `status` | Status | `statusId` (badge) |
| `revenue` | Revenue | `calculateProjectRevenue()` |
| `valuation` | Valuation | `valuation` (formatted $) |
| `primaryStage` | Primary Stage | `getLookupLabel('primaryStage', primaryStageId)` |
| `projectType` | Project Type | `getLookupLabel('primaryProjectType', primaryProjectTypeId)` |
| `ownershipType` | Ownership Type | `getLookupLabel('ownershipType', ownershipTypeId)` |
| `bidDate` | Bid Date | `bidDate` |
| `targetStartDate` | Target Start | `targetStartDate` |
| `targetCompletionDate` | Target Completion | `targetCompletionDate` |
| `externalRef` | External Reference | `externalReference?.name` |

Default visible (matches current behaviour): `address`, `assignee`, `owner`, `status`, `revenue`.

---

### New Files

**`src/hooks/useColumnVisibility.ts`**
- Reads/writes `crm-project-columns` in localStorage
- Default: `['address', 'assignee', 'owner', 'status', 'revenue']`  
- `name` is never stored — it's always rendered unconditionally
- Returns `{ visibleColumns, toggleColumn, isVisible }`

**`src/components/ColumnVisibilitySelector.tsx`**
- Outline button labelled "Columns" with a grid/columns icon
- Opens a Popover containing a scrollable checkbox list
- "Project Name" rendered first, disabled, always checked — with a `(required)` label in muted text
- All other columns are checkboxes wired to `toggleColumn`
- Uses existing `Checkbox`, `Popover`, `PopoverContent`, `PopoverTrigger` components

---

### Modified Files

**`src/components/ProjectTable.tsx`**
- Import and call `useColumnVisibility()`
- Define a `COLUMN_DEFS` array (id, header, sortable, align, renderCell) for all 13 optional columns
- Filter `COLUMN_DEFS` to only those where `isVisible(col.id)` before rendering headers and cells
- Update `SortColumn` type to include new sortable columns (`valuation`, `primaryStage`, `projectType`, `bidDate`, `targetStartDate`, `targetCompletionDate`)
- Add sort cases for those columns in `sortedProjects`
- Dynamic `colSpan` on empty-state row: `1 + visibleColumns.length`

**`src/pages/ProjectList.tsx`**
- Import `<ColumnVisibilitySelector />` and render it between "New Project" and `<SettingsPanel />`

---

### UI Layout

```text
[+ New Project]  [⋮⋮ Columns ▾]  [⚙]
```

Columns popover (left-aligned to button):
```text
┌─────────────────────────┐
│ ☑ Project Name (always) │  ← disabled, greyed
│ ☑ Address               │
│ ☑ Assignee              │
│ ☑ Owner                 │
│ ☑ Status                │
│ ☑ Revenue               │
│ ☐ Valuation             │
│ ☐ Primary Stage         │
│ ☐ Project Type          │
│ ☐ Ownership Type        │
│ ☐ Bid Date              │
│ ☐ Target Start          │
│ ☐ Target Completion     │
│ ☐ External Reference    │
└─────────────────────────┘
```
