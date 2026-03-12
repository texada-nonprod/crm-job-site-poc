

# Remove PAR (Planned Annual Rate) from Projects

PAR consists of three concepts: `plannedAnnualRate`, `parStartDate`, and `showBehindPAR` filter. All must be removed across 6 files + 1 data file.

## Changes

### 1. `src/types/index.ts`
- Remove `plannedAnnualRate` and `parStartDate` from `Project` interface
- Remove `showBehindPAR` from `Filters` interface

### 2. `src/data/Project.json`
- Remove `plannedAnnualRate` and `parStartDate` fields from all project records

### 3. `src/contexts/DataContext.tsx`
- Remove `showBehindPAR: false` from default filters
- Remove the `showBehindPAR` filter logic (lines ~312-315 that check `plannedAnnualRate`)
- Remove changelog entry referencing `plannedAnnualRate` (id 18)

### 4. `src/components/FilterBar.tsx`
- Remove the "Behind on PAR only" switch (the entire PAR filter div, lines ~42-45)

### 5. `src/components/EditProjectModal.tsx`
- Remove `plannedAnnualRate` state, `parStartDate` state, and `parStartDateOpen` state
- Remove their reset in `useEffect`
- Remove the PAR validation check
- Remove `plannedAnnualRate` and `parStartDate` from the `updateProject` call
- Remove the Planned Annual Rate input field and PAR Start Date picker from the form

### 6. `src/components/CreateProjectModal.tsx`
- Remove `plannedAnnualRate` state, `parStartDate` state, and `parStartDateOpen` state
- Remove PAR validation
- Remove `plannedAnnualRate` and `parStartDate` from new project object
- Remove the Planned Annual Rate input and PAR Start Date picker from the form

### 7. `src/pages/ProjectDetail.tsx`
- Remove the "Planned Annual Rate" and "PAR Start Date" display fields (~lines 474-481)

