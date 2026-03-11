

## Replace "Leads / Opportunities" with "Leads & Opportunities"

All 14 instances are in `src/pages/ProjectDetail.tsx`. Simple text replacement:

### Changes to `src/pages/ProjectDetail.tsx`
- Line 635: `Open Leads / Opportunities` → `Open Leads & Opportunities`
- Line 639: `Total Leads / Opportunities` → `Total Leads & Opportunities`
- Line 661: Section heading `Leads / Opportunities` → `Leads & Opportunities`
- Line 681: Empty state text stays as `No leads or opportunities...` (reads naturally without the symbol)

