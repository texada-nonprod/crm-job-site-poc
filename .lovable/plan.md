

## Update Activity Example Data to Match New Spec

The current activity records in `Project.json` use the old shape (`assigneeId`, `activityType`). They need to be updated to the new API-aligned shape with all required fields populated.

### Field Mapping

| Old field | New field | Notes |
|---|---|---|
| `assigneeId` | `salesRepId` | Same IDs, rename only |
| `activityType` | `typeId` | Map: "Site Visit"→"F", "Phone Call"→"P", "Email"→"E", "Meeting"→"F", "Follow-up"→"P" |
| `date` | `date` | Add realistic times instead of `T00:00:00.000Z` |
| `description` | `description` | Keep as-is |
| _(new)_ | `statusId` | 2 (Completed) for past dates, 1 (Outstanding) for future |
| _(new)_ | `contactName` | Pick a plausible contact from the project's companies |
| _(new)_ | `notes` | Add a short note per activity |

### What changes

**`src/data/Project.json`** — Update all ~17 activity records across 10 projects. Each activity gets the new shape, e.g.:

```json
{
  "id": 1001,
  "statusId": 2,
  "salesRepId": 313,
  "typeId": "F",
  "date": "2025-01-20T09:30:00.000Z",
  "description": "Initial site walkthrough with project manager",
  "contactName": "Michael Ross",
  "notes": "Reviewed crane placement options and staging area layout."
}
```

Some activities will get optional fields (`campaignId`, `issueId`, `customerId`) sprinkled in for realism. One pair will demonstrate the `previousRelatedActivityId` linkage (a completed activity with a follow-up outstanding one).

**`src/types/index.ts`** — Update `Activity` interface to match (as previously planned).

### New lookup data files

- **`src/data/ActivityTypes.json`** — E, P, F, Q
- **`src/data/Campaigns.json`** — 3 dealer campaigns
- **`src/data/Issues.json`** — Customer-scoped issues with `customerId` field

