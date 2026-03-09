

## Follow-Up Activity Feature

### Overview
Add a "Follow Up" button to each completed activity row in the activities table. Clicking it opens the ActivityModal in create mode, pre-populated with context from the parent activity and storing `previousRelatedActivityId`. Also display a visual link indicator when an activity has a parent.

### Changes

**`src/pages/ProjectDetail.tsx`**:
- Add a "Follow Up" icon button (e.g. `Reply` or `CornerDownRight` from lucide) in the actions column for activities with `statusId === 2` (Completed)
- Add a `handleFollowUpActivity` function that sets state for `followUpFromActivity` and opens the ActivityModal in create mode
- Pass `followUpFromActivity` to `ActivityModal` as a new prop
- In the table, show a small link icon/badge on activities that have `previousRelatedActivityId`, with a tooltip showing the parent activity's description

**`src/components/ActivityModal.tsx`**:
- Add optional `followUpFrom?: Activity` prop
- When `followUpFrom` is provided and mode is `create`:
  - Pre-fill `salesRepId`, `selectedCompanyId`, `selectedContactId`, and `typeId` from the parent activity
  - Set `previousRelatedActivityId` in the submitted data
  - Show a read-only info banner at the top: "Follow-up to: [parent description]"
- Include `previousRelatedActivityId` in the `activityData` object passed to `addActivity`

**`src/contexts/DataContext.tsx`**:
- No schema changes needed — `previousRelatedActivityId` already exists on the `Activity` type and `addActivity` spreads the full activity object

