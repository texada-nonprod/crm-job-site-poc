

## Updated: Create New Equipment Modal

Incorporating that **Engine Make**, **Industry Code**, and a new **Industry Group** field are all API-backed dropdowns, not free text.

### Additional Fields section — updated fields

**Industry Group** (new field, optional) — Select dropdown, must be selected before Industry Code. Stub `fetchIndustryGroups()` returns 18 entries (Agriculture, Mining, Waste, etc.).

**Industry Code** — Select dropdown, dependent on Industry Group selection. Stub `fetchIndustryCodes(groupId)` returns 11 entries (same mock list for all groups). Changing Industry Group clears Industry Code.

**Engine Make** — Select dropdown. Stub `fetchEngineMakes()` returns: AA/Caterpillar, 2C/Doosan, DW/Daewoo.

### Full field layout for `CreateEquipmentModal.tsx`

**Required section:**
Make → FPC (dep. on Make) → Compatibility Code (dep. on FPC) → Model → Serial Number → Year of Manufacture → Territory (toggle)

**Additional Fields section (collapsible, all optional):**
Equipment Number, SMU, SMU Date, Industry Group → Industry Code (dep. on Industry Group), Principal Work Code (dropdown), Application Code (dropdown), Annual Use Hours, Engine Make (dropdown), Engine Model (text), Engine Serial Number (text), Purchase Date

### API stubs summary

| Stub | Trigger | Mock data |
|------|---------|-----------|
| `fetchMakes` | Modal open | 3 makes |
| `fetchFPCs(makeId)` | Make change | 21 FPCs filtered by oem |
| `fetchCompatibilityCodes(fpcId)` | FPC change | 33 codes (static) |
| `fetchPrincipalWorkCodes` | Modal open | 22 entries |
| `fetchApplicationCodes` | Modal open | 3 entries |
| `fetchEngineMakes` | Modal open | 3 engine makes |
| `fetchIndustryGroups` | Modal open | 18 groups |
| `fetchIndustryCodes(groupId)` | Industry Group change | 11 codes (static) |
| `createEquipmentApi(data)` | Submit | Logs + returns mock ID |

### Files

| File | Action |
|------|--------|
| `src/components/CreateEquipmentModal.tsx` | Create |
| `src/pages/ProjectDetail.tsx` | Modify — add state + render new modal |

