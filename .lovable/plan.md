

## Plan: Separate Won Revenue from Pipeline Revenue in KPI Card

Currently `getTotalPipelineRevenue` sums all opportunity revenue regardless of stage. We need to split this into "Won" (stageId 16, phaseid 3 with `readonlyind: 1`) vs "In Pipeline" (outstanding stages — phaseid 1 and 2). Lost/No Deal revenue should be excluded from both.

### Key logic
- **Won**: opportunity's stageId maps to a stage with `stageid === 16` (the "Won" stage)
- **Pipeline** (in funnel): opportunity's stageId maps to a stage with `phaseid` 1 or 2 (outstanding leads/opportunities)
- **Excluded**: Lost (32), No Deal (64), No Lead (128) — these are closed-negative

### Changes

**1. `src/contexts/DataContext.tsx`**
- Add two new functions: `getWonRevenue()` and `getPipelineRevenue()` that iterate filtered projects' associated opportunities, look up each opp's stageId against `opportunityStages`, and bucket accordingly
- Expose both on the context interface

**2. `src/components/KPICard.tsx`**
- Replace the single total with two side-by-side KPI sections:
  - **Pipeline Revenue** (funnel icon, shows revenue from open opportunities)
  - **Won Revenue** (check/trophy icon, shows revenue from won opportunities)
- Keep the revenue-by-type breakdown, but apply it to pipeline only (or both — will show for whichever has data)
- Layout: two KPI blocks in a flex row within the same card, separated by a vertical divider

### UI sketch
```text
┌──────────────────────────────────────────────────────────┐
│  💰 Pipeline Revenue          │  ✅ Won Revenue          │
│  $1,234,567                   │  $456,789                │
│  Sales $800K · Rent $434K     │                          │
└──────────────────────────────────────────────────────────┘
```

