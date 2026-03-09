

## Plan: Make KPI Card Responsive

### Problem
On tablet widths, the `RevenueSection` uses `flex justify-between` in a single row, causing the large total number and the per-type breakdown to overlap when space is tight.

### Solution
Make the layout responsive at three breakpoints:

**Mobile (< 768px):**
- Stack Pipeline and Won sections vertically (remove horizontal separator)
- Within each section, stack the total and per-type breakdown vertically

**Tablet (768px–1024px):**
- Keep Pipeline and Won side-by-side
- Within each section, stack the total and per-type breakdown vertically (instead of horizontal `justify-between`)

**Desktop (> 1024px):**
- Current layout — everything horizontal

### Changes

**`src/components/KPICard.tsx`**
- Outer container: `flex flex-col md:flex-row` (stacks on mobile, row on tablet+)
- `RevenueSection` inner layout: change from `flex justify-between` to `flex flex-col lg:flex-row lg:justify-between` so the breakdown wraps below the total on tablet
- Per-type breakdown: `flex flex-wrap` to handle varying counts gracefully
- Separator between Pipeline/Won: hidden on mobile, visible on md+
- Reduce text size slightly on smaller screens (`text-2xl md:text-3xl` for the total)

