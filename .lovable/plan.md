

## Add Date-Time Picker with Live Status Badge to Activity Modal

### Changes to `src/components/ActivityModal.tsx`

1. **Replace date-only picker with date+time picker**:
   - Keep the Calendar inside the Popover for date selection
   - Add an `<Input type="time">` below the Calendar inside the same Popover
   - Store time separately as a string (e.g. `"14:30"`), merge with calendar date into a single `Date` object on every change
   - Update the trigger button display format from `"PPP"` to `"MMM d, yyyy 'at' h:mm a"`

2. **Add live status badge**:
   - Compute status reactively: `const status = date ? (isPast(date) ? 'Completed' : 'Outstanding') : null`
   - Render a read-only `Badge` next to the "Date & Time" label
   - Green (`bg-emerald-100 text-emerald-700`) for Completed, amber (`bg-amber-100 text-amber-700`) for Outstanding
   - Updates instantly on any date or time change — no user interaction needed beyond picking a date/time

3. **Import `Badge` from `@/components/ui/badge`** and `isPast` from `date-fns`

No other files need changes — this is purely a modal UI enhancement.

