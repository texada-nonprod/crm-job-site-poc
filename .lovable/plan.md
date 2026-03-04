

# Add Company Filter and Revenue Total to Opportunities Table

## Changes — `src/pages/ProjectDetail.tsx`

### 1. Company filter
- Add state: `const [oppFilterCompany, setOppFilterCompany] = useState('all');`
- Derive unique company names from `project.associatedOpportunities` by looking up each opportunity's `customerName` from the full `opportunities` array
- Add filter logic in `filteredOpportunities`: if `oppFilterCompany !== 'all'`, check `fullOpp.customerName`
- Add a Select dropdown in the filter bar row (alongside existing Stage/Division/Type/Sales Rep filters)

### 2. Revenue total row
- After the `TableBody`, add a `TableFooter` with a single row showing the sum of `sortedOpportunities` revenue values
- Format: bold text in the last column showing `$X,XXX.XX`, with a "Total" label in an earlier column

