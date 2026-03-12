

## Add Role Selection and API Stub to Create Prospect Modal

### Changes

**`src/components/CreateProspectModal.tsx`**
- Add `roleIds: string[]` to `ProspectData` interface
- Add `selectedRoles` state (`string[]`) and `rolesOpen` state
- Add `ROLE_OPTIONS` array (same as in `AssociateCompanyModal`: GC, SUB-EXC, SUB-PAV, SUB-ELEC, SUB-MECH, SUB-SPEC, SUB-STEEL)
- Add multi-role Popover+Command selector with removable badges, placed in the Company Information section after Division(s)
- Label as "Role(s)" — optional, no validation required
- Include `roleIds` in the `onSave` data and reset in `resetForm`
- Add an async `createCompanyApi` stub function that logs the payload and returns a mock company ID. Call it during `handleSubmit` before calling `onSave`, simulating the backend call with a `console.log` and `TODO` comment

**`src/pages/ProjectDetail.tsx`**
- Update the `onSave` callback for `CreateProspectModal`:
  - If `data.roleIds` has entries, use the first as `roleId`/`roleDescription` and pass `roleIds`/`roleDescriptions` arrays
  - Otherwise keep current `PROSPECT` default

### API Stub (in CreateProspectModal.tsx)

```typescript
// TODO: Replace with actual API call
const createCompanyApi = async (data: ProspectData): Promise<string> => {
  console.log('[API STUB] Creating company:', data);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return `PROSPECT-${Date.now()}`;
};
```

The stub will be called in `handleSubmit` before invoking `onSave`, and the returned company ID will be passed along in the prospect data.

