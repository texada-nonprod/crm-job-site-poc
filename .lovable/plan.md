

## Plan: Company & Contact Lookup in Activity Modal

### Current Behavior
The Activity modal has a free-text `contactName` input that's always visible. The `Activity` type already has an optional `customerId` field.

### New Behavior
1. Add an optional **Company** searchable dropdown populated from the current project's `projectCompanies`
2. Only when a company is selected does the **Contact** field appear — as a searchable dropdown of that company's `companyContacts`
3. Both fields are optional (the user can create an activity without associating a company/contact)
4. Clearing the company clears the contact selection

### Changes

**`src/components/ActivityModal.tsx`**:
- Add state: `selectedCompanyId` (string | '') and `selectedContactId` (number | '')
- Get the current project from context to access `projectCompanies`
- Replace the free-text `contactName` input with:
  - A searchable **Company** select (using Command/Combobox pattern with Popover) listing the project's companies by `companyName`
  - Include a clear button to deselect
- Conditionally render a searchable **Contact** select (same Combobox pattern) showing `companyContacts` for the selected company, displaying name and title
- When company changes, reset contact selection
- On submit: derive `contactName` from the selected contact's name (and store `customerId` from the selected company's `companyId`)
- On edit: initialize company/contact from `activity.customerId` and `activity.contactName` by matching against project companies
- Remove `contactName` from required field validation (now optional, only required if company is selected)

**`src/types/index.ts`** — No changes needed; `customerId` and `contactName` already exist on `Activity`

