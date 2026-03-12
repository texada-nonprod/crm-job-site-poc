

## Updated: Multi-Contact and Multi-Role in Associate Company Modal

Same plan as before, with one UI correction for primary contact designation.

### Primary Contact Change

Replace the single "Set as primary contact" checkbox with a **star icon on each contact row**. When multiple contacts are selected, clicking the star on one marks it as primary (deselects any other). This matches the existing star-icon pattern in the Project Companies table.

```text
┌─────────────────────────────┐
│ Company *    [combobox]     │
│ Role(s) *   [multi-select]  │
│   [Badge: GC ×] [Badge: …] │
│ Contacts (optional)         │
│   ☐ ★ John Smith            │
│   ☐ ☆ Jane Doe              │
└─────────────────────────────┘
```

Star is only clickable for checked contacts. `primaryContactId` state replaces the boolean `isPrimaryContact`.

### All Other Changes (unchanged from prior plan)

- **Multi-role**: Replace single Select with Popover+Command checkboxes using managed dropdown roles. `selectedRoles: string[]`. Removable badges.
- **Contact selection**: After company chosen, show its `companyContacts` as checkboxes. `selectedContactIds: number[]`.
- **Submit**: Require ≥1 role. Pass `roleIds`/`roleDescriptions` arrays. Pass only selected contacts (or all if none selected). Set `isPrimaryContact` on the designated contact.
- **Reset**: Clear selections on company change or modal close.

### Files

| File | Action |
|------|--------|
| `src/components/AssociateCompanyModal.tsx` | Modify |

