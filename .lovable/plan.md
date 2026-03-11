

## Add `ClipboardList` Icon to "Project Information" Heading

### Changes to `src/pages/ProjectDetail.tsx`

1. **Add `ClipboardList` to the existing lucide-react import**
2. **Line 367**: Change the heading from plain text to include the icon:
   ```tsx
   <h2 className="text-lg font-semibold flex items-center gap-2">
     <ClipboardList className="h-5 w-5 text-muted-foreground" />
     Project Information
   </h2>
   ```

No changes to the Description icon (`FileText` stays).

