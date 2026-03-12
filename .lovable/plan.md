

## Prospect vs Customer Companies

### Summary

Update the data and UI so that companies whose `companyId` starts with `$` are treated as "prospects" while others remain "customers." Add a prospect badge and optional Customer Number column to the Companies table, and make the Associate Existing Company dialog search lazily.

### Data Changes

**`src/data/Project.json`** — Change several company IDs to start with `$` to mark them as prospects. Target ~4-5 companies across projects, e.g.:
- `"1019550"` (Granite Excavation) → `"$1019550"`
- `"1140350"` (Rosendin Electric) → `"$1140350"`
- `"1764465"` (Christy Webber Landscapes) → `"$1764465"`
- `"NON-DBS"` Curran Contracting → `"$NON-DBS-CC"`

This keeps the rest as customers for contrast.

### UI Changes

**1. `src/components/ProjectCompaniesTable.tsx`** — Companies table:
- Add a "Prospect" badge (orange/amber) next to the company name when `companyId` starts with `$`.
- Add a toggleable "Customer #" column (using the existing `ColumnVisibilitySelector` pattern or a simpler local toggle) that displays `companyId`. Hidden by default; added to the column header row with a visibility option.

**2. `src/components/AssociateCompanyModal.tsx`** — Lazy search:
- Replace the current pattern that renders all `CommandItem`s immediately.
- Add a `searchQuery` state tracked from the `CommandInput`.
- Only show `CommandGroup` with results when `searchQuery.length >= 2`.
- When query is empty or too short, show a helper message like "Type at least 2 characters to search..."
- Filter `availableCompanies` by the search query before rendering items (limit to first 20 results for performance).
- Add the prospect badge in each search result item.

### Technical Details

**Prospect detection helper** (inline or small util):
```ts
const isProspect = (companyId: string) => companyId.startsWith('$');
```

**Companies table column visibility** — Add a local state `showCustomerNumber` with a small toggle button (eye icon or similar) in the table header area, or reuse the `ColumnVisibilitySelector` component if it fits. The column shows `companyId` (stripped of `$` prefix for prospects, or as-is for customers).

**Lazy search in AssociateCompanyModal** — Override `cmdk`'s built-in filtering by using `shouldFilter={false}` on `<Command>` and manually filtering `availableCompanies` based on the search input state. This prevents all items from rendering on open.

