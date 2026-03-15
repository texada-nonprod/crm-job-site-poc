# CRUD for Opportunities, Companies, Equipment, and Notes

## Checklist

- [x] **Step 1** — Add "+" buttons to Project Detail section headers
  - Modify `CollapsibleSection` to accept optional `onAdd` callback
  - Add state variables for bottom sheet visibility
  - Wire each section header's "+" to appropriate flow

- [x] **Step 2** — Note Create/Edit BottomSheet
  - Create `NoteFormSheet.kt` (ModalBottomSheet: content textarea + tag toggle chips)
  - Add `addNote()` / `updateNote()` to `ProjectDetailViewModel`
  - Add edit icon to `NotesSection` cards
  - Wire into `ProjectDetailScreen`

- [x] **Step 3** — Opportunity Create BottomSheet
  - Create `OpportunityFormSheet.kt` (description, revenue, division, type, stage)
  - Add `createOpportunity()` to `ProjectDetailViewModel`
  - Wire into `ProjectDetailScreen`

- [x] **Step 4** — Opportunity Edit BottomSheet
  - Extend `OpportunityFormSheet` for edit mode (+ est close month/year)
  - Make `OpportunityCard` tappable
  - Add `updateOpportunity()` / `getOpportunityById()` to ViewModel

- [x] **Step 5** — Associate Existing Company BottomSheet
  - Create `RoleConstants.kt` (GC, SUB-EXC, etc.)
  - Create `AssociateCompanySheet.kt` (searchable company + role chips)
  - Add `associateCompany()` to ViewModel

- [x] **Step 6** — Create New Prospect (Full-screen)
  - Create `AddProspectScreen.kt` (3 sections: company, address, contact)
  - Create `AddProspectViewModel.kt`
  - Add `AddProspect` route to `Screen.kt` + `CrmNavigation.kt`
  - Wire "New Prospect" option in Companies section

- [x] **Step 7** — Add Contact to Company BottomSheet
  - Create `AddContactSheet.kt` (name, title, phone, email, contact type)
  - Add "Add Contact" button to `CompanySection`
  - Add `addContactToCompany()` to ViewModel

- [x] **Step 8** — Associate Existing Equipment BottomSheet
  - Create `AssociateEquipmentSheet.kt` (select company → select equipment)
  - Add equipment helper methods to ViewModel

- [x] **Step 9** — Create New Equipment BottomSheet
  - Create `CreateEquipmentSheet.kt` (company, type, make, model, serial, year, ownership, SMU)
  - Add `createEquipment()` to ViewModel

- [x] **Step 10** — Wire Equipment Section Add Button
  - Equipment "+" opens menu: "From Company Fleet" / "Create New"

- [x] **Step 11** — Build Verification
  - `gradlew :app:assembleDebug` passes
  - Manual test all add/edit flows
