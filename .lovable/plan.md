
## Simplified Dodge Project Linkage

The user clarification: the URL contains the ID (extractable if needed), and if a `dodgeProject` link exists, it always has both `url` and `name` (not optional).

### Revised Data Model
```typescript
dodgeProject?: {
  url: string;       // Complete link to external Dodge Project
  name: string;      // Project name from external system
};
```

### Changes
1. **`src/types/index.ts`**: Update `Project.dodgeProject` to remove `id` field, make `name` required.
2. **`src/data/Project.json`**: Update sample data for 4 projects with simplified structure.
3. **`src/pages/ProjectDetail.tsx`**: Display link using the `name` as link text; URL already contains ID.
4. **`src/components/EditProjectModal.tsx`**: Two fields: Dodge Project Name and Dodge Project URL (both required if filling out either). Clear button to unlink.
5. **`src/components/CreateProjectModal.tsx`**: Same fields, optional group.
6. **`src/contexts/DataContext.tsx`**: Handle simplified structure in CRUD operations.

This removes redundancy and tightens the architecture—URL is the canonical reference, name is always present for display.
