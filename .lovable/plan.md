

## Allow Companies to Have Multiple Roles on a Project

### Summary

Change the data model so a company can hold more than one role on a project (e.g., a company could be both GC and a Supplier). Instead of `roleId: string` / `roleDescription: string`, use arrays. Update all references across the app.

### Data Model Change (`src/types/index.ts`)

```typescript
export interface ProjectCompany {
  companyId: string;
  companyName: string;
  roleId: string;           // primary role (backward compat)
  roleDescription: string;  // primary role label
  roleIds?: string[];       // all roles (when multiple)
  roleDescriptions?: string[]; // all role labels
  // ...rest unchanged
}
```

A helper `getCompanyRoles(company)` returns the roles array (falls back to `[roleId]` for legacy data).

### Changes

**1. `src/types/index.ts`** — Add `roleIds?: string[]` and `roleDescriptions?: string[]` to `ProjectCompany`.

**2. `src/data/Project.json`** — Add `roleIds`/`roleDescriptions` arrays to a few example companies to demonstrate multi-role (e.g., Turner Construction as both GC and Supplier on project 500101, Granite Excavation as both SUB-EXC and SUB-SPEC on project 500104).

**3. `src/components/ProjectCompaniesTable.tsx`**
- Role column: render multiple badges when `roleIds` has more than one entry.
- Sort by role: join role descriptions for comparison.
- GC badge styling: apply `variant="default"` if any role is GC.

**4. `src/components/AssociateCompanyModal.tsx`**
- Change role selector from single `Select` to multi-select (checkboxes in a Popover + Command, same pattern as mail codes). Selected roles shown as badges.
- Remove the `currentCompanyNames` exclusion — instead, when a company already exists on the project, pre-populate its current roles and let the user add more. Or simpler: still allow the same company to be selected, and the submit handler merges roles with the existing entry.
- Actually, simplest approach: keep excluding already-associated companies. Users add additional roles via the edit (pencil) button on existing companies.

**5. `src/components/ManageCompanyContactsModal.tsx`**
- Show current roles as badges in the header. Add an "Edit Roles" section with the multi-select role picker (using the subcontractorRole dropdown values from ManageDropdowns).
- On save, update the company's `roleIds`/`roleDescriptions`.

**6. `src/contexts/DataContext.tsx`**
- `addProjectCompany`: if a company with the same `companyName` already exists, merge `roleIds` instead of adding a duplicate.
- GC filter (`filters.generalContractor`): check if `roleIds` includes `'GC'` (fallback to `roleId`).
- Migration in `migrateProjectCompanies` or load: ensure `roleIds` is populated from `roleId` for legacy entries.

**7. `src/components/EditGCModal.tsx`** — When filtering available GC companies, check `roleIds?.includes('GC')` in addition to `roleId === 'GC'`.

**8. `src/components/ActivityModal.tsx`** — The company dropdown shows `roleDescription`; update to show all role descriptions joined.

**9. `src/pages/ProjectDetail.tsx`**
- The OWNER filter: `c.roleId !== 'OWNER'` → also check `roleIds` doesn't include OWNER (or more precisely, filter out companies whose *only* role is OWNER).
- `currentCompanyNames` passed to `AssociateCompanyModal` — unchanged behavior.

### UI for Editing Roles

In the `ManageCompanyContactsModal`, add a "Roles" section above the contacts list:
```text
Roles: [General Contractor] [Supplier] [+ Add Role ▼]
```
Clicking "+ Add Role" opens a dropdown of available roles (from the subcontractorRole lookup). Selected roles appear as removable badges (except GC which is protected if it's the project's GC).

### Example Data Updates

Project 500101 — Turner Construction:
```json
"roleId": "GC", "roleDescription": "General Contractor",
"roleIds": ["GC", "SUPPLIER"], "roleDescriptions": ["General Contractor", "Supplier"]
```

Project 500105 — one company with dual sub roles.

### Files

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `roleIds?`, `roleDescriptions?` to `ProjectCompany` |
| `src/data/Project.json` | Add multi-role examples to 2-3 companies |
| `src/components/ProjectCompaniesTable.tsx` | Render multiple role badges, update sort |
| `src/components/ManageCompanyContactsModal.tsx` | Add role editing section |
| `src/components/AssociateCompanyModal.tsx` | Change role selector to multi-select |
| `src/contexts/DataContext.tsx` | Update GC filter, migration, merge logic |
| `src/components/EditGCModal.tsx` | Check `roleIds` for GC |
| `src/components/ActivityModal.tsx` | Show joined role descriptions |
| `src/pages/ProjectDetail.tsx` | Update OWNER filter to check `roleIds` |

