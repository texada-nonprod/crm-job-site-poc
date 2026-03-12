

## Add Mail Codes & Address Toggle to Create Contact Form

### Changes

**1. Create `src/data/MailCodes.json`**
- Store the 43 mail codes as `{ code: string, description: string }[]` with trimmed code values.

**2. Update `src/types/index.ts`**
- Add `mailCodes?: string[]` to `CompanyContact`.

**3. Update `src/components/CreateContactForm.tsx`**

**Address toggle** — Replace the current "Address (Optional)" section with a two-option button group: "Same as Company" (default, selected) | "Different Address". Only show the address fields when "Different Address" is selected. Track via `addressType: 'same' | 'different'` state.

**Additional Fields section** — After the Divisions section and the address toggle/fields, add a collapsible "Additional Fields" section (collapsed by default, toggled via a text button with chevron). This section contains only:
- **Mail Codes** — A searchable multi-select using Popover + Command pattern (43 items warrant search). Selected codes displayed as removable badges. Uses `mailCodes` state (`string[]`).

**Layout sketch:**
```text
[Required fields...]
[Divisions]

── Address ──────────────────────
[ Same as Company | Different Address ]   ← toggle button group
  (address fields shown only if "Different Address")

▸ Additional Fields              ← collapsed by default
  Mail Codes
  [Search mail codes...        ]
  [6] [A] [MC]  ×  ×  ×         ← removable badges
```

**4. Update `src/components/ManageCompanyContactsModal.tsx`**
- Add `mailCodes` to `editForm` state, pre-populate from contact.
- Show mail code badges on read-only contact cards when present.
- In edit form, add the same "Additional Fields" collapsible with Mail Codes selector.

### Technical Details
- Address toggle uses the existing `Button` with `variant="outline"` / `variant="default"` for the selected state (inline button group pattern).
- When "Same as Company" is selected, address fields are cleared and not sent in the payload.
- Mail Codes multi-select: Popover containing a Command with CommandInput for search, CommandList of checkable items. Badge + X for removing selected codes.
- Include `mailCodes` in the simulated API payload and saved `CompanyContact` object.

### Files

| File | Action |
|------|--------|
| `src/data/MailCodes.json` | Create |
| `src/types/index.ts` | Edit — add `mailCodes` to CompanyContact |
| `src/components/CreateContactForm.tsx` | Edit — add address toggle, collapsible "Additional Fields" with Mail Codes |
| `src/components/ManageCompanyContactsModal.tsx` | Edit — add mailCodes to edit form, display badges |

