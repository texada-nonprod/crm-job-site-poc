

## Remove "Associate Activity" Functionality

Delete the feature across 2 files:

### 1. Delete `src/components/AssociateActivityModal.tsx`

### 2. `src/pages/ProjectDetail.tsx`
- Remove the `AssociateActivityModal` import
- Remove `showAssociateActivityModal` state
- Remove the "Associate Existing" button (~lines 940-944)
- Remove the `<AssociateActivityModal>` rendering (~lines 1362-1366)
- Remove unused `LinkIcon` import if no longer referenced

