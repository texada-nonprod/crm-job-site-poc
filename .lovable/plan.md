

## Refinements to Create New Contact Form Plan

Two adjustments to the approved Create Contact plan before implementation:

### 1. Country-Aware Labels and Masking

The Create Contact form's address section must use the **project's country** (from `project.address.country`) as context for:
- **ZIP Code label** — displays "ZIP Code" (US), "Postal Code" (CA), or "Post Code" (AU) using `getCountryByCode()` from `Countries.ts`
- **State label** — displays "State" (US/AU) or "Province" (CA)
- **Phone masking** — applies the correct format per country
- **ZIP masking** — applies the correct format per country

The `CreateContactForm` component will receive the project's country code as a prop (passed from `ManageCompanyContactsModal` which receives it from the parent). The `ManageCompanyContactsModal` props will be extended to include `countryCode: string`.

In `ProjectDetail.tsx`, when opening the modal, pass the project's `address.country` value.

### 2. Division Selection (Already Covered)

The existing plan already specifies filtering divisions to the company's `divisionIds`. This is confirmed — the `availableDivisions` pattern already exists in `ManageCompanyContactsModal.tsx` (lines 39-41) and will be passed to `CreateContactForm` as a prop.

### Implementation Impact

| File | Change |
|------|--------|
| `src/components/ManageCompanyContactsModal.tsx` | Add `countryCode` prop, pass to `CreateContactForm` |
| `src/components/CreateContactForm.tsx` | Accept `countryCode` prop, use `getCountryByCode()` for labels/masks on ZIP, State, Phone fields |
| `src/pages/ProjectDetail.tsx` | Pass `project.address.country` to modal |

No other changes to the previously approved plan.

