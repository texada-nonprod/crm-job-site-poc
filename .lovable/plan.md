

## Plan: Sticky Headers + Pagination for Project Table

The KPI card totals will continue to reflect **all filtered projects** (sourced from DataContext). Pagination only affects which rows render in the table.

### Changes

**1. `src/components/ui/table.tsx`**
- Add `sticky top-0 z-10 bg-card` classes to `TableHeader`

**2. `src/components/ProjectTable.tsx`**
- Wrap the table in a scrollable container with `max-h-[70vh] overflow-auto`
- Add state: `currentPage` (default 1), `pageSize` (default 25)
- Slice `sortedProjects` → `paginatedProjects` for rendering; KPI card is unaffected since it reads from DataContext directly
- Add a pagination footer bar below the table (inside the Card, outside the scroll container):
  - Left: rows-per-page `<Select>` (10, 25, 50, 100)
  - Right: "Showing 1–25 of 42" label + Previous/Next buttons
- Update the toolbar count to say "X projects total" (not just what's on the page)
- Reset `currentPage` to 1 when `sortedProjects.length` changes (filters/sort change)

