

## Add Division Assignments to Company Contacts

### Summary

Each contact on a company must be associated with at least one division that the company operates in. This adds `divisionIds` to the `CompanyContact` type, updates sample data, and shows division badges in the expanded contact rows and the manage contacts modal.

### Changes

**1. Type Update (`src/types/index.ts`)**
- Add `divisionIds?: string[]` to the `CompanyContact` interface.

**2. Sample Data (`src/data/Project.json`)**
- Add `divisionIds` arrays to every contact in `siteCompanies[].companyContacts[]` across all projects. Use realistic division assignments — e.g., an excavation company's fleet manager gets `["G"]`, a power systems contact gets `["S", "P"]`, etc. Each company should have contacts covering different divisions to demonstrate the feature.

**3. Expanded Contact Row (`src/components/ProjectCompaniesTable.tsx`)**
- In the expanded contact cards (lines 138-151), add small division badges next to each contact's name/title line. Use `Badge variant="outline"` with compact styling, showing the division code (e.g., "G", "P", "S").

**4. Manage Contacts Modal (`src/components/ManageCompanyContactsModal.tsx`)**
- Display division badges on each contact card in the read-only view (line 89 area).
- In the edit form (lines 77-84), add a division multi-select using the same checkbox popover pattern from `CreateProspectModal`. Import `DIVISIONS` from `DataContext`.
- Track `divisionIds` in `editForm` state. Pre-populate from the contact being edited.
- When adding contacts from the "available contacts" list, show their division badges.
- Validate that at least one division is selected when saving a contact edit.

**5. Company-level division context**
- The company's `divisionIds` (from `ProjectCompany`) defines which divisions are available for its contacts. When editing a contact's divisions, filter the `DIVISIONS` list to only show divisions the company belongs to. If the company has no `divisionIds`, show all divisions.

### Visual Layout

In the expanded contact row:
```text
★ Michael Ross • Site Superintendent    [G] [C]
  312-555-8821 • mross@turner.com
```

Division badges use `Badge variant="outline"` with `text-[10px] px-1.5 py-0` sizing to stay compact.

