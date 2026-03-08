

# Add Optional Fields to Project Records

## New Fields on `Project` interface (`src/types/index.ts`)
- `valuation?: number` — currency, whole dollars
- `primaryStageId?: string` — references new lookup
- `primaryProjectTypeId?: string` — references new lookup
- `ownershipTypeId?: string` — references new lookup
- `bidDate?: string` — ISO date string (date only)
- `targetStartDate?: string` — ISO date string
- `targetCompletionDate?: string` — ISO date string

## New Lookup Types (`src/types/index.ts`)
```typescript
export interface LookupOption {
  id: string;
  label: string;
  displayOrder: number;
}

export interface DodgeMapping {
  externalValue: string;
  internalId: string;
}
```

## Default Lookup Data (`src/data/Lookups.json`)
- **Primary Stage**: Pre-Construction, Bidding, Awarded, Under Construction, Completed
- **Primary Project Type**: Commercial, Residential, Industrial, Infrastructure, Institutional
- **Ownership Type**: Governmental, Private

## Changes by File

### 1. `src/types/index.ts`
Add optional fields to `Project`, add `LookupOption` and `DodgeMapping` interfaces.

### 2. `src/data/Lookups.json` (new)
Default values for all three lookups.

### 3. `src/data/Project.json`
Add sample values for the new fields on existing projects (e.g., governmental projects get `ownershipTypeId: "GOVERNMENTAL"`, highway projects get `primaryProjectTypeId: "INFRASTRUCTURE"`, etc.).

### 4. `src/contexts/DataContext.tsx`
- Store lookups (primaryStages, primaryProjectTypes, ownershipTypes) in state, initialized from JSON, persisted to localStorage.
- Store Dodge mappings for each lookup type in state, persisted to localStorage.
- Expose getters: `primaryStages`, `primaryProjectTypes`, `ownershipTypes`, setter functions for each, plus Dodge mapping CRUD.
- Update `createProject`/`updateProject` to handle new fields.

### 5. `src/components/EditProjectModal.tsx`
Add form fields:
- Valuation: currency input
- Primary Stage: Select dropdown from lookup
- Primary Project Type: Select dropdown from lookup
- Ownership Type: Select dropdown from lookup
- Bid Date, Target Start Date, Target Completion Date: date pickers (using the Calendar/Popover pattern already in the project)

### 6. `src/components/CreateProjectModal.tsx`
Same new fields as Edit modal, all optional.

### 7. `src/pages/ProjectDetail.tsx`
Display the new fields in the project info card — valuation formatted as currency, lookups resolved to labels, dates formatted.

### 8. `src/pages/ManageDropdowns.tsx`
Add three new dropdown types to the sidebar: "Primary Stage", "Primary Project Type", "Ownership Type" — using the same CRUD grid pattern as existing dropdowns.

### 9. `src/pages/DodgeMappings.tsx` (new)
New admin page with three tabs (Primary Stage, Primary Project Type, Ownership Type). Each tab shows a mapping table: External Value (text input) → Internal Value (select from lookup). Supports add/edit/delete rows.

### 10. `src/App.tsx`
Add route: `/settings/dodge-mappings` → `DodgeMappings` page.

### 11. Navigation
Add a link to the Dodge Mappings page from the Settings area (same pattern as Manage Dropdowns link).

