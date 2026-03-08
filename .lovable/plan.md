

# Replace Sales Rep Assignment with General Users/Assignees

## Overview
Create a new Users data source separate from Sales Reps. Projects will have `assigneeIds` (referencing Users) instead of `salesRepIds`. All labels change from "Sales Rep" to "Assignee." Sales Reps remain in the system for opportunity-level fields (e.g., opportunity `salesRepId`).

## Data Changes

### 1. New file: `src/data/Users.json`
- Create a users list with fields: `id`, `firstName`, `lastName`, `email`
- Seed with the existing Sales Rep entries (converted) plus a few additional non-sales users to differentiate the lists

### 2. `src/types/index.ts`
- Add `User` interface: `{ id: number; firstName: string; lastName: string; email: string | null }`
- In `Project` interface: rename `salesRepIds` → `assigneeIds`
- In `Filters` interface: rename `salesRepId` → `assigneeId`

### 3. `src/data/Project.json`
- Rename `salesRepIds` → `assigneeIds` in every record (same numeric values)

## Context & Component Changes

### 4. `src/contexts/DataContext.tsx`
- Import `Users.json` and expose `users: User[]`
- Add `getUserName(id)` and `getUserNames(ids)` helpers
- Keep `salesReps` and `getSalesRepName`/`getSalesRepNames` for opportunity-related usage
- Update `getFilteredProjects` to check `assigneeIds` with `filters.assigneeId`
- Update `currentUserId` to reference user IDs
- Rename filter default from `salesRepId: ''` to `assigneeId: ''`

### 5. `src/components/FilterBar.tsx`
- Change "Sales Rep" label → "Assignee"
- Populate dropdown from `users` instead of `salesReps`
- Use `filters.assigneeId` instead of `filters.salesRepId`

### 6. `src/components/CreateProjectModal.tsx` & `src/components/EditProjectModal.tsx`
- Rename `salesRepIds` state → `assigneeIds`
- Label: "Assigned Sales Rep(s)" → "Assignee(s)"
- Populate multi-select from `users` instead of `salesReps`
- Use `getUserName` for display

### 7. `src/components/ProjectTable.tsx`
- Column header: "Sales Rep" → "Assignee"
- Use `getUserNames(project.assigneeIds)`

### 8. `src/pages/ProjectDetail.tsx`
- Display label: "Sales Rep(s)" → "Assignee(s)"
- Use `getUserNames` for display
- Opportunity filter for "Sales Rep" on opportunities stays as-is (still references opp-level salesRepId)

### 9. `src/components/SettingsPanel.tsx`
- "Current User" dropdown populates from `users`

### 10. `src/components/NotesSection.tsx` & `src/components/NoteModal.tsx`
- Note author display uses `getUserName` instead of `getSalesRepName`

### 11. `src/components/ActivityModal.tsx`
- Assignee dropdown populates from `users` instead of `salesReps`

### 12. `src/pages/ProjectChangeLog.tsx`
- `changedByName` uses `getUserName`

## Files touched
`src/data/Users.json` (new), `src/types/index.ts`, `src/data/Project.json`, `src/contexts/DataContext.tsx`, `src/components/FilterBar.tsx`, `src/components/CreateProjectModal.tsx`, `src/components/EditProjectModal.tsx`, `src/components/ProjectTable.tsx`, `src/pages/ProjectDetail.tsx`, `src/components/SettingsPanel.tsx`, `src/components/NotesSection.tsx`, `src/components/NoteModal.tsx`, `src/components/ActivityModal.tsx`, `src/pages/ProjectChangeLog.tsx`

