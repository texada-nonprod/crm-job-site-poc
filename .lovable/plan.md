

## Plan: Rename "Hours" to "SMU" for Equipment

### Changes

**1. `src/pages/ProjectDetail.tsx`**
- Line 83: Change sort column type from `'hours'` to `'smu'`
- Line 328: Change sort case from `'hours'` to `'smu'`
- Lines 1048-1049: Change header label from "Hours" to "SMU" and sort references from `'hours'` to `'smu'`
- Line 1065: No code change needed (still reads `eq.hours`)

**2. `src/components/AddCustomerEquipmentModal.tsx`**
- Line 109: Change table header from "Hours" to "SMU"

**3. `src/types/index.ts`**
- Line 11: Rename `hours` field to `smu` in `CustomerEquipment` interface

**4. `src/data/CompanyEquipment.json`**
- Rename all `"hours"` keys to `"smu"` across all 45 entries

**5. `src/components/OpportunityDetailModal.tsx`**
- Line 203: Change label from "Hours:" to "SMU:" (this is for opportunity products, which also track usage)

All references to `eq.hours` in ProjectDetail and AddCustomerEquipmentModal will become `eq.smu` to match the renamed type field.

