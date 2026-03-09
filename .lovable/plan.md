

## Equipment as ID-Only References with Company Master Registry

### Architecture Change

Projects will store only **equipment IDs** (not full objects). A master `CompanyEquipment.json` acts as the "API" source of truth. Equipment details are resolved at render time via a lookup helper.

---

### Data Model

**`src/types/index.ts`**
- Add `ownershipStatus: 'owned' | 'rented'` to `CustomerEquipment`
- Change `Project.customerEquipment` from `CustomerEquipment[]` to `number[]` (array of equipment IDs)

**New: `src/data/CompanyEquipment.json`**
- ~30 equipment records with globally unique IDs, `companyId`, `ownershipStatus` (`owned`/`rented`), and existing fields (type, make, model, year, serial, hours)
- Covers companies used across all example projects
- Some IDs appear in multiple projects' arrays (to test the "already assigned" warning)
- Some IDs are not assigned to any project (available inventory)

**`src/data/Project.json`**
- Replace each project's `customerEquipment` array of objects with a simple array of integer IDs referencing `CompanyEquipment.json`

---

### Context — `src/contexts/DataContext.tsx`

- Import `CompanyEquipment.json` as `companyEquipmentData`
- Expose `companyEquipment: CustomerEquipment[]` (the full master list)
- Add `getCompanyEquipment(companyId: string): CustomerEquipment[]` — filters master list by company
- Add `getEquipmentById(id: number): CustomerEquipment | undefined`
- Add `getEquipmentProjectAssignment(equipmentId: number, excludeProjectId?: number): { projectId: number; projectName: string } | null` — scans all projects' `customerEquipment` ID arrays
- Update `addCustomerEquipment` signature to `(projectId: number, equipmentId: number)` — just pushes the ID
- Update `deleteCustomerEquipment` — removes the ID from the array
- Remove `updateCustomerEquipment` (no longer meaningful — equipment data lives in the master registry)

---

### Modal — `src/components/AddCustomerEquipmentModal.tsx`

Rewrite as a two-step picker (no free-text fields):

1. **Select Company** — dropdown of project companies
2. **Select Equipment** — scrollable table of that company's equipment from the master registry, filtering out IDs already on this project. Shows type, make, model, year, serial, hours, ownership badge.

On confirm: check `getEquipmentProjectAssignment(selectedId, currentProjectId)`. If assigned elsewhere, show an `AlertDialog` warning with the other project's name. User confirms or cancels.

Props change: receives `projectId`, `projectCompanies`, `existingEquipmentIds: number[]`, and `onSave: (equipmentId: number) => void`.

Edit mode is removed (equipment details are read-only master data; users add/remove assignments only).

---

### Display — `src/pages/ProjectDetail.tsx`

- Resolve `project.customerEquipment` (now `number[]`) to full objects via `getEquipmentById`
- Add "Ownership" column with `Owned`/`Rented` badge
- Remove edit button from equipment rows (only delete/remove assignment remains)
- Update sort function to handle `ownership` column

---

### Files Summary

| File | Action |
|---|---|
| `src/types/index.ts` | Add `ownershipStatus`; change `Project.customerEquipment` to `number[]` |
| `src/data/CompanyEquipment.json` | New master registry (~30 records) |
| `src/data/Project.json` | Replace equipment objects with ID arrays |
| `src/contexts/DataContext.tsx` | Add master data, lookup helpers, simplify add/delete to ID-based |
| `src/components/AddCustomerEquipmentModal.tsx` | Rewrite as company→equipment picker with conflict warning |
| `src/pages/ProjectDetail.tsx` | Resolve IDs to objects, add ownership column, remove edit |

