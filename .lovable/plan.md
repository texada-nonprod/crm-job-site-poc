

## Remove Divisions Column from Companies Table

### Changes

**`src/components/ProjectCompaniesTable.tsx`**
- Remove the `<TableHead>Divisions</TableHead>` header (line 90)
- Remove the Divisions `<TableCell>` block (lines 110-118)
- Update `colSpan={6}` to `colSpan={5}` on the expanded content row (line 128)
- Remove the `DIVISIONS` import from `@/contexts/DataContext` (line 10) if no longer used

