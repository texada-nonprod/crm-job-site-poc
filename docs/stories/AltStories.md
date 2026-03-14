# **User stories for Projects functionality within Equipment CRM**

Functionality for managing job site projects, sales opportunities, company relationships, activities, notes, and equipment inventory. This part of the system is focused on the **sales pipeline**: tracking which equipment deals are being pursued on which job sites, rather than on general-contractor project execution (scheduling, submittals, compliance, etc.).

**System context:** This module lives inside Equipment CRM which has its own Executive and Sales Rep views, customer detail views, opportunity detail views, and Dodge Project integration. Sections §1–§10 describe features within this module's own UI. Sections §11–§13 describe features that surface within the broader CRM's existing views and navigation.

---

## **Architecture Constraints**

The following constraints apply to all stories. Developers and QA must read this section before implementing or testing any story.

1. **No backend today: transition required.** The current implementation is entirely client-side: data lives in seeded JSON files loaded at startup, mutations are held in React state, and nothing is persisted to a server. All stories in this document are written against the *intended* backend architecture. Before any story can be considered production-ready, a real API and persistence layer must be in place.  
2. **localStorage for storing filter states.** Filter states are currently persisted to localStorage.  
3. **No authentication exists in the prototype but must be in scope for the final product.** There is no login, no session, and no concept of a current user. The changedById field on all change log entries is currently unpopulated or hardcoded. All stories referencing "who made the change" or "editor identity" depend on the /Users API described below being implemented first.  
4. **No multi-user concurrency support.** The application is not designed for simultaneous editing by multiple users in the same browser session or across sessions. ID generation uses timestamp and Math.max() strategies that are not collision-safe under concurrent load. Multi-tab and multi-user concurrent editing are **out of scope** until a proper backend with server-side ID generation is in place.  
5. **Opportunity records are linked to exactly one project** via a foreign key (projectId). An opportunity cannot be shared across multiple projects. Associating an opportunity means creating it under that project; it belongs to that project exclusively. Story 3.8 (Reassign Opportunity to a Different Project) is therefore an administrative re-parenting action, not a shared-link operation.  
6. **Opportunity stages are API-driven and configurable.** Stage definitions (names, phases, default probabilities) are managed through the /OpportunityStages API and are not hardcoded. The CRM Settings UI surfaces this configuration (see story 10.4).  
7. **Lookup value deletion is disallowed when values are in use.** Deleting a status, role, tag, or stage that is referenced by any existing record is blocked. Administrators may instead **hide** a value to prevent future selection while preserving historical data integrity. This applies to all Settings stories (10.1–10.4).  
8. **PAR (Planned Annual Rate) measures sales activity frequency, not revenue.** PAR is optional. When set, a PAR value of 24 means 24 sales activities per year are expected on the project (two per month). A PAR value of 0, a blank PAR field, or a missing PAR Start Date means no target is set; such projects show "N/A" for PAR status. "Behind PAR" means that, given the elapsed time since the PAR Start Date, fewer activities have been logged than expected by linear interpolation. Revenue is tracked separately through opportunity estimated revenue; it is not used in PAR calculations.  
9. **A single project spans multiple divisions; there are no division-based restrictions on participation.** A project is not owned by or limited to a single business division. Sales reps, customers, and opportunities from any division may be associated with any project. Division is an attribute of an *opportunity* (3.1), not a gate on project membership. This applies to, but is not limited to, sales rep assignments (1.6), company/customer associations (§2), and opportunity records (§3).  
10. **Creating and editing records must respect existing field requirements and referential integrity.** When building create or edit workflows for activity, prospect, customer, or opportunity records, the engineering team is responsible for identifying and enforcing all applicable mandatory-field validations and referential integrity constraints. These rules are not exhaustively repeated in each story; developers must assess them during implementation and apply them consistently.  
11. **Dodge Project records are read-only and sourced externally; the link to a CRM Project is one-to-one.** The CRM consumes Dodge Project data via the /DodgeProjects API but never creates or modifies Dodge records. A Dodge Project may be linked to at most one CRM Project, and a CRM Project may be linked to at most one Dodge Project. Once established, the link is surfaced as bidirectional navigation on both record views (see §11).  
12. **Terminal stages are Won, Lost, No Deal, and No Lead.** These four stages represent closed outcomes. At opportunity creation, only non-terminal stages are available for selection. Terminal stages become selectable when editing an existing opportunity. All references to "terminal stages" throughout this document mean exactly these four.  
13. **Currency formatting is driven by configuration.** All monetary values are formatted using the currency defined by the configuration key ckSlCommon.CatCss.DefaultCurrency. Dollar signs ($) shown in story examples are illustrative; the actual symbol and formatting are configuration-dependent.

---

## **Scope Exclusions**

The following are explicitly out of scope for the current phase and must not be built without a new story:

* Multi-user concurrent editing  
* Multi-tab session safety  
* Email or push notifications / reminders  
* CSV import or export  
* ERP / external CRM integration  
* Mobile offline mode  
* User-facing error recovery for localStorage corruption (silent fallback is acceptable)  
* Bid / RFQ lifecycle management  
* Permit and compliance tracking  
* Change order management  
* RFI (Request for Information) tracking  
* Submittal tracking  
* Lien waiver management  
* Insurance certificate tracking  
* Subcontractor prequalification  
* Project scheduling / milestone tracking  
* Reporting and analytics beyond the KPI card  
* Multi-currency support

---

## **API Reference**

The following APIs are required to support the stories in this document. All are RESTful JSON APIs. Stories reference these by name where relevant.

| API | Methods | Description |
| ----- | ----- | ----- |
| /Projects | GET, POST, PUT | Create, read, and update project records. Deletion is not supported; use status to archive. |
| /Projects/:id/ChangeLog | GET | Retrieve the audit trail for a single project, with optional ?category= filter. |
| /Opportunities | GET, POST, PUT | Create, read, and update opportunity records. Each opportunity has a projectId foreign key. |
| /OpportunityStages | GET, POST, PUT, PATCH | Retrieve and manage pipeline stage definitions (name, phase, default probability, display order, active/hidden flag). |
| /OpportunityTypes | GET | Retrieve the list of opportunity types (Sales, Rent, Parts, Service, Rental Service, Lease). Read-only in the current phase. |
| /Companies | GET, POST, PUT | Retrieve and manage company records. Companies are global; association to projects is managed via /ProjectCompanies. |
| /ProjectCompanies | GET, POST, PUT, DELETE | Manage the many-to-many relationship between projects and companies, including role assignment and GC flag. |
| /Contacts | GET, POST, PUT, DELETE | Manage contacts associated with a company. |
| /Activities | GET, POST, PUT, DELETE | Log and manage sales activities against a project. |
| /Notes | GET, POST, PUT, DELETE | Manage notes on a project, including tag assignments, attachment metadata, and embedded modification history. Each note's GET response includes a modificationHistory array containing timestamped entries with editor identity, change summary, previous content, and previous tag set. |
| /Notes/:id/Attachments | GET, POST, DELETE | Upload, retrieve, and remove file attachments on a note. |
| /CustomerEquipment | GET, POST, PUT, DELETE | Manage equipment records associated with a project and owning company. |
| /SalesReps | GET | Retrieve the list of sales representatives. Read-only in the current phase. |
| /Users | GET | Retrieve user records (id, name, email, role). Used to resolve changedById in change log entries and to populate "current user" identity for auditing. |
| /Lookups/ProjectStatuses | GET, POST, PUT, PATCH | Manage project status picklist values (label, color, display order, hidden flag). |
| /Lookups/SubcontractorRoles | GET, POST, PUT, PATCH | Manage subcontractor role picklist values (label, display order, hidden flag). The GC system role is read-only. |
| /Lookups/NoteTags | GET, POST, PUT, PATCH | Manage note tag picklist values (label, color, display order, hidden flag). |
| /Lookups/Divisions | GET | Retrieve the list of business divisions. Read-only in the current phase. |
| /DodgeProjects | GET | Retrieve Dodge Project records (list and individual detail). Read-only; this data is sourced from the external Dodge feed and is not created or modified within the CRM. |
| /Lookups/ProjectTypes | GET | Retrieve the list of Primary Project Type picklist values (e.g., Hospital, Office, Warehouse, Stadium). Read-only in the current phase. |
| /Lookups/MarketSegments | GET | Retrieve the list of Market Segment picklist values (Engineering, School, Commercial, Multi-Residential). Read-only in the current phase. |
| /CompanyFleet | GET, POST | Browse and register equipment in a company's fleet. Equipment must exist in a company's fleet before it can be assigned to a project (see §6). Adding equipment to a **customer** company's fleet is routed through the existing Gatekeeper process; adding to a **prospect** company uses this API directly. |
| /Prospects | GET, POST, PUT | Create and manage prospect records. When a prospect is created from the project context (6.7), it is simultaneously associated with the project via /ProjectCompanies. |

**Authentication:** All API calls must include a bearer token obtained from the authentication layer (out of scope for current phase; placeholder for now).

**Audit fields:** All POST and PUT requests automatically stamp createdById / updatedById with the current user's ID resolved from /Users, and createdAt / updatedAt with the server timestamp.

---

## **1\. Project Management**

* **1.1 View Project List**  
  As a sales rep, I can view all projects in a sortable table so that I have a quick overview of my portfolio.  
  **Acceptance Criteria:**  
  * Projects are fetched from GET /Projects and displayed in a table. The default visible columns are: Project Name, Status, General Contractor, Sales Rep(s), PAR, PAR Start Date, and PAR status indicator (on track / behind). Additional columns can be enabled or disabled via the column visibility selector (1.12).  
  * Table defaults to sorting by Status ascending, using the display order configured in /Lookups/ProjectStatuses.  
  * Clicking any column header cycles through ascending → descending → unsorted (tri-state).  
  * Each row is clickable and navigates to the Project Detail page.  
  * The total number of visible projects is shown.  
  * Applying filters reduces the visible rows in real time without a page reload.  
  * On navigating back from the Project Detail page, the list restores to the same scroll position, sort, and filter state as when the user left.  
* **Edge Cases:**  
  * If no projects exist (or all are filtered out), display an empty-state message rather than a blank table.  
  * Projects with no assigned sales rep still appear; the Sales Rep column shows a dash.  
  * Very long project names truncate with an ellipsis; full name visible on hover.  
  * Projects whose status has been hidden in Settings still appear in the list using that status label (historical data is preserved); hidden statuses cannot be selected for new projects.  
  * When the "Estimated Pipeline Revenue" column is visible, the value for each row is the sum of Estimated Revenue across all linked opportunities for that project. This column is always labeled distinctly from the "Valuation" and "Total Project Value" columns, which are project-level fields set directly on the project record.

---

* **1.2 Create Project**  
  As a sales rep, I can create a new project by entering a name, status, sales rep assignments, PAR, location (address or coordinates), description, and primary contact so that a job site is fully captured from day one.  
  **API:** POST /Projects, GET /Lookups/ProjectTypes, GET /Lookups/MarketSegments  
  **Acceptance Criteria:**  
  * A "Create Project" button opens a modal form.  
  * **Required fields:** Project Name, Status, at least one Sales Rep, location fields matching the selected location type, Primary Contact Name, Primary Contact Phone, Primary Contact Email.  
  * **Optional fields:** Description, Primary Contact Title, Planned Annual Rate (positive integer ≥ 1 when provided), PAR Start Date (required when PAR is set), Total Project Value (numeric, ≥ 0), Valuation (numeric, ≥ 0, currency-formatted per constraint \#13), Target Start Date (date), Primary Project Type (multi-select from GET /Lookups/ProjectTypes), Market Segment (multi-select from GET /Lookups/MarketSegments).  
  * Location type is toggled between "Address" (Street, City, State, Zip Code, Country) and "Coordinates" (Latitude −90 to 90, Longitude −180 to 180); only the active type's fields are required.  
  * Sales rep assignment uses a multi-select control populated from GET /SalesReps; at least one rep must be selected.  
  * Status picklist is populated from GET /Lookups/ProjectStatuses, showing only non-hidden values.  
  * On successful save, the new project appears in the project list and a success toast is shown.  
  * Form validates inline before submission; each required field shows an error message if left blank.  
* **Edge Cases:**  
  * Submitting with an invalid email format on the primary contact shows a field-level validation error.  
  * If PAR is provided, it must be a positive integer (≥ 1); a value of 0 is treated as "no PAR set." Negative values are rejected with a validation message.  
  * Coordinates outside the valid ranges (lat \> 90, lon \> 180, etc.) are rejected.  
  * The modal can be dismissed without saving; no partial record is created.  
  * If the user switches location type (address ↔ coordinates) during form entry, previously typed data in the deselected type's fields is cleared and not recoverable within the same form session.

---

* **1.3 Edit Project Details**  
  As a sales rep, I can edit all fields on an existing project so that information stays current as the project evolves.  
  **API:** PUT /Projects/:id  
  **Acceptance Criteria:**  
  * An "Edit" action on the project detail page opens a pre-populated modal.  
  * All fields from Create are editable, including Project Name and Status.  
  * Sales rep assignments, PAR, PAR Start Date, Description, location, and primary contact are all modifiable.  
  * Saving writes the changes via the API immediately and a success toast confirms.  
  * The change log is updated server-side with field-level before/after detail and the current user's ID.  
* **Edge Cases:**  
  * Removing all sales reps is blocked; at least one must remain.  
  * Switching location type (address ↔ coordinates) in edit mode clears the fields for the deselected type.  
  * If no changes are made and the user saves, no change log entry is written.  
  * If the project was previously saved with invalid latitude or longitude values (e.g., from a data migration), the edit modal pre-populates with those values; the user must correct them before saving.  
  * Project identity is maintained by its immutable system-generated ID, not by name. Renaming a project does not affect any foreign-key references.

---

* **1.4 View Project Detail**  
  As a sales rep, I can open a dedicated project detail page that surfaces companies, opportunities, activities, notes, and equipment in sectioned panels so that all context is available in one place.  
  **API:** GET /Projects/:id  
  **Acceptance Criteria:**  
  * The page header shows the project name, status badge (colored per status), assigned sales rep(s), PAR, PAR start date, PAR status indicator (on track / behind / N/A; see 7.3), Total Project Value (if set), and Valuation (if set). Additional project fields (Target Start Date, Primary Project Type if set, and Market Segment if set) are displayed in a project metadata section on the detail page.  
  * The detail page surfaces both project-level value fields (Valuation, Total Project Value) and the Estimated Pipeline Revenue (sum of all linked opportunity estimated revenues) as clearly labeled, visually distinct values so that the two types are never confused.  
  * Sections present on the page: General Contractor card, Companies table, Opportunities table, Activities table, Notes section, Customer Equipment section.  
  * A "View Change Log" link navigates to the project's change log page.  
  * Each section has its own add/edit/delete controls inline.  
  * The page is accessible via the URL /project/:id; navigating directly to a valid ID loads the correct project.  
* **Edge Cases:**  
  * Navigating to /project/:id with a non-existent ID shows a not-found state.  
  * Sections with no data show an empty-state prompt with a call to action.

---

* **1.5 Set Project Status**  
  As a sales rep, I can set and update a project's status from a configurable picklist so that the list accurately reflects current state.  
  **API:** PUT /Projects/:id, GET /Lookups/ProjectStatuses  
  **Acceptance Criteria:**  
  * Status is set at creation and can be changed via the Edit Project modal.  
  * Available statuses are drawn from GET /Lookups/ProjectStatuses, showing only non-hidden values.  
  * The current status is displayed as a colored badge on both the project list and the detail page; badge color matches the color configured for that status.  
  * Changing the status is recorded in the change log with the previous and new status values.  
* **Edge Cases:**  
  * If a project's current status is subsequently hidden by an admin, the project retains and displays that status label; the status simply cannot be selected for new assignments.  
  * Status field cannot be left blank.  
  * A project whose status is hidden is still visible in the project list unless also filtered out by the Status filter (8.4).

---

* **1.6 Assign Multiple Sales Reps to Project**  
  As a sales rep, I can assign one or more sales reps to a project so that shared ownership is clearly recorded.  
  **API:** PUT /Projects/:id, GET /SalesReps  
  **Acceptance Criteria:**  
  * The sales rep assignment control in Create and Edit modals is a multi-select dropdown populated from GET /SalesReps, with search/type-ahead support for long lists.  
  * At least one rep is required; the form blocks submission if none are selected.  
  * All assigned reps' names appear on the project list row and the detail page header.  
  * The Filter by Sales Rep filter (8.1) matches projects where the selected rep is any one of the assigned reps.  
* **Edge Cases:**  
  * Removing a rep who is also an opportunity owner on this project does not remove them from their opportunities.

---

* **1.7 Set Planned Annual Rate (PAR)**  
  As a sales rep, I can optionally set a planned annual activity rate and a PAR start date on a project so that activity pace against target can be tracked.  
  **API:** PUT /Projects/:id  
  **Acceptance Criteria:**  
  * PAR and PAR Start Date are optional fields, settable during project creation and editable thereafter.  
  * When set, PAR is a positive integer (≥ 1\) representing the number of sales activities expected per year. PAR Start Date is required whenever PAR is set.  
  * PAR value and start date are displayed on the project list table and the project detail header. Projects with no PAR show a dash in the PAR column.  
  * PAR drives the "Behind PAR" indicator (see 7.3): expected activities to date \= PAR × (days elapsed since PAR Start Date / 365); if actual logged activities \< expected, the project is behind PAR.  
  * Changes to PAR or PAR Start Date are recorded in the change log.  
* **Edge Cases:**  
  * A PAR value of 0 is treated as unset; the PAR status indicator shows "N/A." Negative values are rejected.  
  * A project without a PAR value or without a PAR Start Date shows "N/A" for PAR status and is excluded from the Behind PAR filter.  
  * PAR Start Date may be in the past (typical for in-progress projects) or future (pre-planned projects whose PAR clock has not yet started; these are never behind PAR).

---

* **1.8 Hide Completed Projects**  
  As a user, I can toggle a switch to hide projects whose status is "Completed" so that the list stays focused on active work.  
  **Acceptance Criteria:**  
  * A toggle labeled "Hide Completed" is present in the filter bar.  
  * When enabled, all projects with a status whose isCompleted flag is true are excluded from the list and PAR calculations.  
  * The toggle state is persisted and restored on next visit (see 8.5).  
  * The toggle works in combination with all other active filters.  
* **Design Note:** The "Completed" concept is tied to the isCompleted boolean flag on the status record (managed in Settings 10.1), not to the status label. This means renaming or creating additional "done" statuses works correctly as long as the flag is set. Admins can flag any status as isCompleted.  
  **Edge Cases:**  
  * If all visible projects have a completed status and the toggle is on, the list shows an empty state.  
  * If an admin hides the status that was previously flagged isCompleted, the toggle still functions correctly because it keys off the flag, not the label or ID.

---

* **1.9 Project Location: Address or Coordinates**  
  As a sales rep, I can enter either a street address or GPS coordinates for a project, and switch between the two views on the detail page, so that the job site location is recorded in whatever format is available.  
  **API:** PUT /Projects/:id  
  **Acceptance Criteria:**  
  * In the Create and Edit modals, a toggle switches the location input between "Address" mode (Street, City, State, Zip Code, Country) and "Coordinates" mode (Latitude, Longitude).  
  * Only the fields for the selected mode are shown and required.  
  * On the Project Detail page, two buttons ("Address" / "Coordinates") switch the display; a button is disabled and greyed out if no data exists for that mode.  
  * Each location view on the Project Detail page includes a "Copy" button that copies the displayed value to the clipboard for easy pasting into an external mapping application. For Address, the full formatted address string is copied. For Coordinates, the latitude and longitude are copied as a comma-separated pair (e.g., "41.8781, \-87.6298").  
  * Latitude must be between −90 and 90; Longitude between −180 and 180; form validates on submit.  
* **Edge Cases:**  
  * A project may have both address and coordinate data stored; either view can be toggled on the detail page.  
  * A project with neither address nor coordinates shows both detail-page buttons as disabled.  
  * Switching modes in the edit modal does not delete the data for the deselected mode from the record.  
  * If no data exists for the active location view, the Copy button is disabled.

---

* **1.10 Project Primary Contact**  
  As a sales rep, I can store a primary contact (name, title, phone, email) on a project so that the key decision-maker is always surfaced at the top of the detail page.  
  **API:** PUT /Projects/:id  
  **Acceptance Criteria:**  
  * Primary Contact Name, Phone, and Email are required at project creation; Title is optional.  
  * The contact is displayed prominently on the Project Detail page header area.  
  * All four fields are editable via the Edit Project modal.  
  * Changes are captured in the change log.  
* **Edge Cases:**  
  * Email must pass standard format validation.  
  * The project-level primary contact is distinct from company contacts (§2); they are stored separately on the project record.

---

* **1.11 Navigate to Projects from the Top Navigation Menu**  
  As a user, I can reach the Projects list from the top navigation menu of either CRM app so that the project list is accessible from anywhere in the application.  
  **Acceptance Criteria:**  
  * In both the Executive app and the Sales Rep app, the top navigation menu's "Leads and Opportunities" section includes a "Projects" link as its last item.  
  * Clicking the link navigates to the main Projects list view (1.1).  
  * The link is present in both apps for all users, regardless of role.  
* **Edge Cases:**  
  * Navigating to the Projects list via this link restores any previously saved filter state (per 8.5), consistent with all other entry points to the list.  
  * The link is the same in both the Executive and Sales Rep apps; there is no app-specific variant of the Projects list at this time.

---

* **1.12 Customize Visible Columns on the Project List**  
  As a user, I can choose which project fields appear as columns in the project list so that I can focus on the data most relevant to my workflow.  
  **Acceptance Criteria:**  
  * A "Columns" control in the project list toolbar opens a panel listing all available columns with checkboxes.  
  * **Always-visible columns:** Project Name and Status. These cannot be deselected.  
  * **Never-visible:** The system-generated project ID is excluded from the picker and is never shown as a column.  
  * **Selectable columns include:** General Contractor, Sales Rep(s), PAR, PAR Start Date, PAR Status, Description, Target Start Date, Primary Project Type, Market Segment, Valuation, Total Project Value, Estimated Pipeline Revenue, Primary Contact Name, Primary Contact Title, Primary Contact Phone, Primary Contact Email, and Location.  
  * "Valuation" and "Total Project Value" are listed under a "Project Value Fields" group in the picker. "Estimated Pipeline Revenue" is listed under a separate "Opportunity Metrics" group. This grouping signals that they represent different things: project-level fields vs. aggregated opportunity revenue.  
  * Checking or unchecking a column takes effect immediately without a page reload.  
  * The selected column set is persisted to user preferences (localStorage as a temporary fallback) and restored on next page load.  
  * A "Reset to Defaults" action restores the default column set: Project Name, Status, General Contractor, Sales Rep(s), PAR, PAR Start Date, PAR Status.  
* **Edge Cases:**  
  * If all optional columns are deselected, only Project Name and Status remain visible.  
  * If a saved column preference references a field that no longer exists (e.g., after a schema change), that entry is silently dropped and defaults apply for that slot only.  
  * When many columns are enabled and the table exceeds the viewport width, horizontal scroll is enabled; the Project Name column remains frozen (sticky) so it is always visible during scroll.

---

## **2\. Company & Contact Management**

* **2.1 Associate Existing Company to Project**  
  As a sales rep, I can search for and associate an existing company with a project, assigning it a role, so that the full contractor network for a job site is visible.  
  **API:** POST /ProjectCompanies, GET /Companies, GET /Lookups/SubcontractorRoles  
  **Acceptance Criteria:**  
  * An "Add Company" action on the Project Detail page opens a modal with a searchable combobox populated from GET /Companies.  
  * User selects a company, chooses a role from the picklist (non-hidden values from GET /Lookups/SubcontractorRoles), and optionally marks the company as primary contact.  
  * On save, the company appears in the Companies table on the Project Detail page.  
  * The association is recorded in the change log.  
* **Edge Cases:**  
  * A company already associated with the project does not appear in the combobox (prevents duplicates).  
  * If the company list is empty, the combobox shows an empty-state message and the user is prompted to create a new company instead (2.2).

---

* **2.2 Add New Company to Project**  
  As a sales rep, I can create a new company record inline while associating it with a project so that I don't have to navigate away to add a net-new contractor.  
  **API:** POST /Companies, POST /ProjectCompanies  
  **Acceptance Criteria:**  
  * From the Associate Company modal, a "Create new company" option allows entering a company name directly.  
  * The new company is saved to the system-wide company list via POST /Companies and simultaneously associated with the current project.  
  * Role assignment and primary contact flag apply as per 2.1.  
* **Edge Cases:**  
  * Company Name is required; submitting without a name shows a validation error.  
  * Duplicate company names are permitted (two distinct legal entities may share a name).

---

* **2.3 Add General Contractor (GC)**  
  As a sales rep, I can designate exactly one company per project as the General Contractor using a dedicated GC form so that the GC is surfaced in its own card on the project detail page.  
  **API:** POST /ProjectCompanies (with roleId: "GC" and isPrimaryContact: true), POST /Contacts  
  **Acceptance Criteria:**  
  * An "Add GC" button appears on the Project Detail page when no GC is yet assigned.  
  * The GC form captures: Company Name (required), Contact Name (required), Contact Title (optional), Contact Phone (optional), Contact Email (required).  
  * Only one GC may exist per project; adding a GC hides the "Add GC" button until the existing GC is removed.  
  * The GC is shown in a dedicated card above the general companies table.  
  * The addition is recorded in the change log under the "Company" category.  
* **Edge Cases:**  
  * The "GC" role is a system role and cannot be assigned via the standard subcontractor role picklist; it is reserved exclusively for the GC card flow.  
  * A company serving as GC may also be associated as a subcontractor as a separate project company record; the two records are independent.  
  * If required fields are missing, the form shows inline validation errors and does not save.

---

* **2.4 Edit General Contractor**  
  As a sales rep, I can edit the GC's company name and primary contact details so that the record stays accurate.  
  **API:** PUT /ProjectCompanies/:id, PUT /Contacts/:id  
  **Acceptance Criteria:**  
  * An "Edit" button on the GC card opens a pre-populated form with all GC fields.  
  * All fields (name, contact name, title, phone, email) are editable.  
  * Saving updates the GC card immediately and records the change in the change log.  
* **Edge Cases:**  
  * Clearing a required field (Company Name, Contact Name, Contact Email) blocks saving and shows a validation error.  
  * Editing the GC does not affect any separately associated subcontractor record for the same company.

---

* **2.5 Edit Subcontractor on Project**  
  As a sales rep, I can edit a subcontractor's name, role, and role description on a project so that the relationship is accurately described as work scopes shift.  
  **API:** PUT /ProjectCompanies/:id, GET /Lookups/SubcontractorRoles  
  **Acceptance Criteria:**  
  * An "Edit" action on a row in the Companies table opens an edit form pre-populated with the company's current name, role, and role description.  
  * All three fields are editable; role is selected from non-hidden values in the picklist.  
  * Saving updates the table row immediately and records the change in the change log.  
* **Edge Cases:**  
  * Role is required; saving without a role selected shows a validation error.  
  * The "GC" role does not appear in the subcontractor role picklist; GC assignment is handled exclusively through the dedicated GC card (2.3).  
  * If a company's currently assigned role has been hidden by an admin, the role label is still displayed on the existing record; only non-hidden roles are available for new assignments.

---

* **2.6 Remove Company from Project**  
  As a sales rep, I can remove a company from a project so that inactive relationships are no longer displayed.  
  **API:** DELETE /ProjectCompanies/:id  
  **Acceptance Criteria:**  
  * A "Remove" action is available on each row in the Companies table and on the GC card.  
  * A confirmation prompt appears before deletion to prevent accidental removal.  
  * On confirmation, the project-company association is deleted; the company record itself is not deleted from the system.  
  * The removal is recorded in the change log.  
* **Edge Cases:**  
  * Removing a company that owns customer equipment on the project does not delete the equipment records; those records remain attributed to the company name.  
  * Removing the GC re-enables the "Add GC" button.

---

* **2.7 View Companies Table**  
  As a sales rep, I can see all companies on a project in a sortable table with collapsible rows showing each company's contacts so that the full contractor network is easy to scan.  
  **API:** GET /ProjectCompanies?projectId=:id, GET /Contacts?companyId=:id  
  **Acceptance Criteria:**  
  * The table displays columns: Company Name, Role, Contact Count.  
  * Columns are sortable (tri-state: asc → desc → off) by clicking the column header.  
  * Each row is expandable/collapsible to reveal the list of contacts (name, title, phone, email), with the primary contact marked by a star icon. The contacts list within each expanded row is sortable by Name, Title, Phone, and Email using tri-state sort (ascending → descending → unsorted).  
  * Edit and Remove actions are accessible per row.  
* **Edge Cases:**  
  * A company with zero contacts still appears in the table with a contact count of 0; the expand toggle shows an empty-state message.  
  * If only one company is on the project, the table renders normally with a single row.

---

* **2.8 Add Company Contact**  
  As a sales rep, I can add one or more contacts to a company on a project so that I can reach the right person for each situation.  
  **API:** POST /Contacts  
  **Acceptance Criteria:**  
  * Contacts are managed via a "Manage Contacts" modal accessible from the Companies table row.  
  * A form within the modal allows entering: Name (required), Title (required), Phone (required), Email (required).  
  * The existing data quality enforcement (Trifecta) applies; the form blocks submission until all four fields pass validation.  
  * Multiple contacts can be added in a single session; each is added via a discrete form submission.  
  * Newly added contacts appear immediately in the contacts list within the modal and in the collapsible row on the table.  
* **Edge Cases:**  
  * All four fields (Name, Title, Phone, Email) are required; the form blocks saving if any field is blank or fails validation.  
  * Adding a second contact to a company that currently has one does not auto-promote either contact to primary; the existing primary remains.

---

* **2.9 Edit Company Contact**  
  As a sales rep, I can edit an existing company contact's details so that phone numbers and emails stay current.  
  **API:** PUT /Contacts/:id  
  **Acceptance Criteria:**  
  * Each contact in the Manage Contacts modal has an "Edit" toggle that switches that contact's row into an inline editable form.  
  * All four fields (Name, Title, Phone, Email) are editable inline.  
  * Saving updates the contact immediately in the modal; changes are visible in the collapsible table row.  
* **Edge Cases:**  
  * Clearing any required field (Name, Title, Phone, or Email) blocks saving and shows a validation error.  
  * Editing a contact's details does not change their primary status.

---

* **2.10 Set Primary Contact per Company**  
  As a sales rep, I can designate one contact per company as the primary contact so that the key relationship is clearly flagged.  
  **API:** PUT /Contacts/:id (sets isPrimary: true; API atomically demotes the previous primary)  
  **Acceptance Criteria:**  
  * Each contact in the Manage Contacts modal has a "Set as Primary" button (star icon).  
  * Clicking it promotes that contact to primary and demotes the previously primary contact.  
  * Only one contact per company can be primary at any time; this is enforced by the API.  
  * The primary contact is marked with a star in both the modal and the collapsible table row.  
* **Edge Cases:**  
  * If a company has only one contact, that contact is automatically the primary and the "Set as Primary" button is hidden.  
  * Removing the primary contact (2.11) automatically promotes the contact with the earliest creation date, or leaves primary unset if blocked (which 2.11's minimum rule prevents).

---

* **2.11 Remove Company Contact**  
  As a sales rep, I can remove a contact from a company, with the constraint that at least one contact must always remain.  
  **API:** DELETE /Contacts/:id  
  **Acceptance Criteria:**  
  * Each contact in the Manage Contacts modal has a "Delete" button.  
  * If the company has only one contact, the Delete button is disabled with a tooltip explaining the minimum requirement.  
  * A confirmation prompt appears before deletion.  
  * On confirmation, the contact is removed and the modal list updates immediately.  
* **Edge Cases:**  
  * Deleting the primary contact when others exist automatically promotes the next contact (earliest creation date) to primary.  
  * Deleted contacts are not recoverable; the deletion is recorded in the change log.

---

* **2.12 Add Contact from Company's Existing Pool**  
  As a sales rep, I can add a contact already associated with a company on another project so that shared contacts don't need to be re-entered manually.  
  **API:** GET /Contacts?companyId=:id, POST /Contacts (copy/link operation)  
  **Acceptance Criteria:**  
  * Within the Manage Contacts modal, a collapsible "Add existing contacts" section lists contacts already linked to that company on other projects.  
  * Each available contact is shown with a checkbox; selecting one or more and clicking "Add Selected" imports them into the current project's company contact list.  
  * Imported contacts appear immediately in the contacts list.  
* **Edge Cases:**  
  * If the company has no contacts on other projects, the "Add existing contacts" section is hidden or shows an empty-state message.  
  * Contacts already present on the current project are excluded from the pool list silently; the user simply sees a shorter list with no explanation.

---

## **3\. Opportunity Management**

* **3.1 Create Opportunity**  
  As a sales rep, I can create a new opportunity on a project by entering a description, estimated revenue, division, and pipeline stage so that potential revenue is captured immediately.  
  **API:** POST /Opportunities, GET /OpportunityStages, GET /OpportunityTypes, GET /Lookups/Divisions  
  **Acceptance Criteria:**  
  * A "Create Opportunity" button on the Project Detail page opens a modal form.  
  * **Required fields:** Description, Estimated Revenue (numeric, ≥ 0), Division, Opportunity Type (from GET /OpportunityTypes), Stage (filtered to non-terminal stages only; see constraint \#12).  
  * The new opportunity is created with projectId set to the current project's ID; it belongs exclusively to this project.  
  * On save, the opportunity appears in the Opportunities table and is reflected in the KPI card revenue totals.  
  * A success toast confirms creation; the change log records the new opportunity.  
* **Edge Cases:**  
  * Estimated Revenue of 0 is valid.  
  * Terminal stages (Won, Lost, No Deal, No Lead) are excluded from the stage picklist at creation time; they are only reachable by editing an existing opportunity.  
  * If the modal is dismissed without saving, no record is created.

---

* **3.2 Edit Opportunity**  
  As a sales rep, I can edit all fields on an opportunity so that the record reflects current negotiations.  
  **API:** PUT /Opportunities/:id, GET /OpportunityStages, GET /SalesReps  
  **Acceptance Criteria:**  
  * An "Edit" action on the opportunity row opens a pre-populated form.  
  * Editable fields: Description, Estimated Revenue, Stage (all stages available), Division, Delivery Month, Delivery Year, Customer Name, Customer Address, Contact Name, Contact Phone, Contact Email, Sales Rep (owner), Urgency flag.  
  * Saving writes changes immediately; the Opportunities table and KPI card update.  
  * Each save is recorded in the change log with before/after field values and the current user's identity.  
* **Edge Cases:**  
  * Changing stage to a terminal stage (Won, Lost, No Deal, No Lead) does not delete the opportunity; it remains visible unless the "Show Open Only" filter is active.  
  * Revenue cannot be set below 0\.  
  * An opportunity's projectId cannot be changed via this form; project re-assignment is an admin operation (see 3.8).

---

* **3.3 View Opportunity Detail**  
  As a sales rep, I can open an opportunity detail modal showing full deal context so that I have everything I need without navigating away.  
  **API:** GET /Opportunities/:id  
  **Acceptance Criteria:**  
  * Clicking an opportunity row (or a "View" action) opens a read-oriented detail modal.  
  * The modal displays: Description, Stage (with colored badge), Division, Estimated Revenue, Delivery Month/Year, Urgency badge (if flagged), Probability of Closing (from stage definition), Customer Name and Address, Contact Name/Phone/Email, assigned Sales Rep, and associated Products/Equipment (if any).  
  * An "Edit" button within the modal opens the editable form (3.2).  
  * A red "Urgent" badge with an alert icon is shown prominently when the urgency flag is set.  
* **Edge Cases:**  
  * If no products/equipment are associated with the opportunity, that section is hidden or shows an empty state.  
  * If Delivery Month/Year are not set, those fields show a dash.  
  * The Delivery Month picker includes a "None" option (distinct from the field being absent); selecting "None" explicitly clears a previously set month without affecting the year, and vice versa.

---

* **3.4 Advance Opportunity Stage**  
  As a sales rep, I can move an opportunity through defined pipeline stages so that the pipeline accurately reflects deal progress.  
  **API:** PUT /Opportunities/:id, GET /OpportunityStages  
  **Acceptance Criteria:**  
  * Stage is selectable from the full list of non-hidden stages returned by GET /OpportunityStages.  
  * Stage changes are made via the Edit Opportunity form (3.2).  
  * Each stage has a configured default probability of closing; changing the stage updates the displayed probability to the new stage's default.  
  * Stage changes are captured in the change log.  
* **Edge Cases:**  
  * There is no enforced sequential progression; a rep may skip stages or move backwards as needed.  
  * Terminal stages (Won, Lost, No Deal, No Lead) are visually distinct in the stage picklist (e.g., grouped or styled differently).  
  * If a stage has been hidden by an admin, it no longer appears in the picklist for new assignments; existing opportunities retaining that stage still display it.

---

* **3.5 Mark Opportunity as Urgent**  
  As a sales rep, I can flag an opportunity as urgent so that it is visually highlighted and prioritized during pipeline reviews.  
  **API:** PUT /Opportunities/:id (isUrgent: true/false)  
  **Acceptance Criteria:**  
  * An "Urgent" toggle is available in the Edit Opportunity form.  
  * When flagged, a red "Urgent" badge with an alert icon appears on the opportunity row in the table and at the top of the detail modal.  
  * The flag can be toggled off; removing it removes the badge.  
  * Urgency changes are recorded in the change log.  
* **Edge Cases:**  
  * Multiple opportunities on a single project can be marked urgent simultaneously.  
  * Urgency is purely visual/organizational and does not affect revenue calculations or stage logic.

---

* **3.6 View Probability of Closing**  
  As a sales rep, I can see the probability of closing on an opportunity so that I understand the deal's weighted value.  
  **API:** GET /OpportunityStages (probability is a property of the stage definition)  
  **Acceptance Criteria:**  
  * Probability of Closing is displayed in the Opportunity Detail modal (3.3) and in the Opportunities table.  
  * The value is derived from the opportunity's current stage definition returned by GET /OpportunityStages.  
  * The probability is shown as a percentage (e.g., "60%").  
* **Edge Cases:**  
  * If a stage has no probability configured, the field displays a dash.  
  * Changing the stage automatically updates the displayed probability to the new stage's configured default; there is no manual override.

---

* **3.7 Assign Opportunity Owner**  
  As a sales rep, I can assign an opportunity to a specific sales rep so that deal accountability is clear.  
  **API:** PUT /Opportunities/:id, GET /SalesReps  
  **Acceptance Criteria:**  
  * A Sales Rep selector (single-select dropdown from GET /SalesReps) is available in the Edit Opportunity form.  
  * The assigned rep's name is displayed in the Opportunities table column and in the detail modal.  
  * Ownership changes are recorded in the change log.  
* **Edge Cases:**  
  * The opportunity owner does not have to be one of the sales reps assigned to the parent project.  
  * A rep can own opportunities across multiple projects.

---

* **3.8 Reassign Opportunity to a Different Project**  
  As an admin, I can move an opportunity from one project to another by updating its projectId so that opportunities that were created under the wrong project are corrected without data loss.  
  **API:** PUT /Opportunities/:id (projectId: newProjectId)  
  **Acceptance Criteria:**  
  * Opportunity reassignment is an admin-only action, accessible from the Opportunity Detail modal via an "Reassign to Project" option.  
  * The admin selects the target project from a searchable dropdown of all projects.  
  * On save, the opportunity disappears from the original project's Opportunities table and appears on the target project's table.  
  * Both the source and target project change logs record the reassignment, including the user who performed it.  
  * Revenue KPI cards for both projects update immediately.  
* **Edge Cases:**  
  * Reassigning to the same project is a no-op (blocked or ignored with a message).  
  * An opportunity cannot be associated with multiple projects; the reassignment fully transfers ownership.

---

* **3.9 Set Opportunity Delivery Timeline**  
  As a sales rep, I can set an estimated delivery month and year on an opportunity so that delivery forecasting is informed.  
  **API:** PUT /Opportunities/:id  
  **Acceptance Criteria:**  
  * Delivery Month is a dropdown of the 12 calendar months (January–December) plus a "None" option.  
  * Delivery Year is a dropdown ranging from the current calendar year to current year \+ 7\.  
  * Both fields are optional; if set, they are displayed in the Opportunity Detail modal and the Opportunities table column.  
  * Values are saved via the Edit Opportunity form (3.2) and changes are logged.  
* **Edge Cases:**  
  * Month and Year are independent; a user may set Year without Month or vice versa.  
  * If neither is set, the table column and detail field show a dash.  
  * Selecting "None" for Month explicitly clears a previously set month value without affecting the year.

---

* **3.10 Filter and Sort Opportunities on Project Detail**  
  As a sales rep, I can filter and sort the opportunities table on the Project Detail page so that I can focus on deals that need attention.  
  **Acceptance Criteria:**  
  * Filter controls above the table allow filtering by: Stage, Division, Opportunity Type, and assigned Sales Rep.  
  * A "Show Open Only" toggle excludes opportunities in terminal stages.  
  * Each table column header (Type, Description, Division, Stage, Sales Rep, Est. Close, Revenue) supports tri-state sort (asc → desc → off).  
  * Filters and sorts operate together and update the table in real time.  
  * Filter/sort state is local to the session and does not persist across page navigations.  
* **Edge Cases:**  
  * If all opportunities are filtered out, the table shows an empty-state message.  
  * Resetting all filters restores all opportunities.

---

* **3.11 View Opportunity Products / Equipment**  
  As a sales rep, I can view products or equipment associated with an opportunity so that I understand exactly what is being quoted.  
  **API:** GET /Opportunities/:id (products embedded in response)  
  **Acceptance Criteria:**  
  * Within the Opportunity Detail modal (3.3), a Products/Equipment section lists all associated line items.  
  * Each item displays: Make, Base Model, Description, Quantity, Age, Hours, Rent Duration, Unit Price, Stock Number.  
  * A "primary product" indicator highlights the lead item in a product group.  
  * Multiple product groups may be shown, each containing one or more items.  
  * Column headers within each product group support tri-state sort (ascending → descending → unsorted).  
* **Edge Cases:**  
  * If an opportunity has no associated products/equipment, the section is hidden or shows "No products associated."  
  * This data is read-only in the CRM UI; product/equipment data is sourced from the ERP system and is not editable here.

---

* **3.12 Link Equipment to Parts/Service Opportunity via Serial Number**  
  As a sales rep, I can link a customer equipment record to an opportunity of type Parts or Service by serial number so that the deal is tied to the specific machine being serviced or supplied.  
  **API:** PUT /Opportunities/:id, GET /CustomerEquipment?projectId=:id  
  **Acceptance Criteria:**  
  * For opportunities whose Opportunity Type is Parts or Service, the Edit Opportunity form includes a "Serial Number" lookup field.  
  * The lookup searches customer equipment records on the same project by serial number and displays matching results (Make, Model, Year, Serial Number, Hours).  
  * Selecting an equipment record links it to the opportunity; the serial number and equipment summary are displayed on the Opportunity Detail modal (3.3) alongside the product/equipment section.  
  * The link is stored as an equipment reference on the opportunity record.  
  * The Serial Number lookup field is hidden for opportunity types other than Parts and Service.  
* **Edge Cases:**  
  * If the entered serial number does not match any equipment on the current project, the lookup shows "No matching equipment found."  
  * An opportunity may be linked to at most one equipment record via serial number at a time; selecting a new match replaces the previous link.  
  * If the linked equipment record is subsequently deleted from the project (6.3), the opportunity retains the serial number reference but displays it as unresolved with a "(equipment removed)" indicator.  
  * Linking is optional; a Parts or Service opportunity may be saved without a serial number link.

---

## **4\. Activity Tracking**

* **4.1 Log Activity**  
  As a sales rep, I can log a sales activity against a project by selecting an assignee, activity type, date, and description so that all customer touchpoints are recorded and counted toward PAR.  
  **API:** POST /Activities, GET /SalesReps  
  **Acceptance Criteria:**  
  * An "Add Activity" button on the Project Detail page opens a modal form.  
  * **Required fields:** Assignee (selected from GET /SalesReps), Activity Type (one of: Site Visit, Phone Call, Email, Meeting, Follow-up, Proposal, Demo, Other), Date (date picker), Description (free text).  
  * On save, the activity appears in the Activities table, a success toast is shown, and the project's PAR status indicator (7.3) recalculates.  
  * The activity is recorded in the change log under the "Activity" category with the current user's identity.  
* **Edge Cases:**  
  * Future dates are permitted (to log a planned visit); future-dated activities do not count toward the PAR calculation until their date arrives.  
  * Description cannot be left blank; form blocks submission with a validation error.  
  * The assignee does not have to be one of the project's assigned sales reps.  
  * If a previously assigned sales rep is later removed from the system, their activities remain on the project but the assignee name displays as "Unknown" in the table.

---

* **4.2 Edit Activity**  
  As a sales rep, I can edit an existing activity's assignee, type, date, and description so that inaccurate entries can be corrected.  
  **API:** PUT /Activities/:id  
  **Acceptance Criteria:**  
  * An "Edit" action on an activity row opens a pre-populated modal form with all four fields editable.  
  * Saving updates the activity immediately in the Activities table and recalculates the PAR status indicator.  
  * The change is recorded in the change log.  
* **Edge Cases:**  
  * All four fields remain required in edit mode; clearing a required field blocks saving.  
  * Editing an activity's date affects the PAR calculation for the project immediately.

---

* **4.3 Delete Activity**  
  As a sales rep, I can delete an activity log entry so that erroneous records are removed.  
  **API:** DELETE /Activities/:id  
  **Acceptance Criteria:**  
  * A "Delete" action is available on each activity row.  
  * A confirmation prompt appears before deletion.  
  * On confirmation, the activity is removed from the table immediately and the PAR status indicator recalculates.  
  * The deletion is recorded in the change log.  
* **Edge Cases:**  
  * Deletion is permanent; there is no undo.  
  * Deleting an activity that was copied from another project (4.5) only removes it from the current project; the source project's activity is unaffected.

---

* **4.4 View and Sort Activity History**  
  As a sales rep, I can view all activities on a project in a sortable table so that I have full chronological context before a site visit or call.  
  **API:** GET /Activities?projectId=:id  
  **Acceptance Criteria:**  
  * The Activities table on the Project Detail page displays columns: Assignee, Activity Type, Date, Description.  
  * Default sort is by Date descending (most recent first).  
  * Clicking any column header cycles through tri-state sort (asc → desc → off).  
  * All activities for the project are shown without pagination on this table.  
* **Edge Cases:**  
  * If no activities exist yet, the table shows an empty-state with an "Add Activity" prompt.  
  * Very long descriptions truncate in the table cell; full text is visible in the edit modal.

---

* **4.5 Associate Activity from Another Project**  
  As a sales rep, I can copy an activity from a different project into the current project so that related cross-site touchpoints are captured without manual re-entry.  
  **API:** GET /Activities, POST /Activities (new record with current projectId)  
  **Acceptance Criteria:**  
  * An "Associate Activity" action opens a modal listing activities from other projects, labeled by source project name.  
  * User selects one or more activities and confirms; selected activities are copied as new independent records on the current project.  
  * The copied activity's metadata includes a reference to the source project.  
  * The association is recorded in the change log and the PAR status indicator recalculates.  
* **Edge Cases:**  
  * Copied activities are independent records; editing or deleting the copy does not affect the original.  
  * Activities already present on the current project are not shown in the association list.  
  * If no activities exist on other projects, the modal shows an empty-state message.  
  * The modal labels each activity with its source project name at time of copy; if that source project is subsequently deleted, the label becomes a stale reference (the copied activity itself is unaffected).

---

## **5\. Notes & Documentation**

* **5.1 Add Note**  
  As a sales rep, I can add a free-text note to a project with optional tags and file attachments so that important observations and documents are captured in context.  
  **API:** POST /Notes, POST /Notes/:id/Attachments, GET /Lookups/NoteTags  
  **Acceptance Criteria:**  
  * An "Add Note" button opens a modal with: Content (textarea, required), Tags (multi-select toggle buttons from GET /Lookups/NoteTags, non-hidden values only), and an Attachments zone (drag-and-drop or click-to-browse, max 10 files, max 5 MB per file).  
  * On save, the note is persisted via POST /Notes; attachments are uploaded via POST /Notes/:id/Attachments.  
  * The note appears in the Notes section with author name (resolved from /Users), timestamp, tags as colored badges, and a file attachment list.  
  * A success toast confirms; the creation is recorded in the change log.  
* **Edge Cases:**  
  * Content is the only required field.  
  * Uploading a file exceeding 5 MB shows an error for that file and prevents it from being attached.  
  * Files beyond the 10-file limit are rejected one-by-one with individual error toasts (not a single bulk rejection message).  
  * No file type restriction is enforced in the current implementation.

---

* **5.2 Edit Note**  
  As a sales rep, I can edit an existing note's content, tags, and attachments, with the original version preserved in modification history.  
  **API:** PUT /Notes/:id, POST /Notes/:id/Attachments, DELETE /Notes/:id/Attachments/:attachmentId  
  **Acceptance Criteria:**  
  * An "Edit" action on a note opens the same modal pre-populated with current content, tags, and attachment list.  
  * Content, tags, and attachments are all editable (attachments can be added or removed).  
  * On save, a modification history entry is written by the API capturing: timestamp, editor identity (from /Users), a summary of the change, the previous content, and the previous tag set.  
  * The note displays the original creation timestamp and author alongside the latest edit timestamp and editor.  
* **Edge Cases:**  
  * Saving with no actual changes (content, tags, and attachments all identical) does NOT create a modification history entry and does NOT write a change log record.  
  * Content cannot be cleared to empty; at least one character is required.  
  * Removing an attachment calls DELETE /Notes/:id/Attachments/:attachmentId to delete the file from the server.

---

* **5.3 Delete Note**  
  As a sales rep, I can delete a note so that duplicate or erroneous entries are removed.  
  **API:** DELETE /Notes/:id  
  **Acceptance Criteria:**  
  * A "Delete" action is available on each note.  
  * A confirmation prompt appears before deletion.  
  * On confirmation, the note and all its modification history and attachments are deleted server-side.  
  * The deletion is recorded in the change log.  
* **Edge Cases:**  
  * Deletion is permanent; there is no undo or trash/archive state.  
  * The API cascades deletion to all associated attachments.

---

* **5.4 View Note Modification History**  
  As a user, I can expand a note's edit history to see who changed it, when, and what was changed so that the evolution of key observations is fully transparent.  
  **API:** GET /Notes/:id (modification history embedded in response)  
  **Acceptance Criteria:**  
  * Each note shows a modification count and an expand control ("Show history").  
  * Expanding reveals up to three most recent edits by default; a "Show all" link loads the full history.  
  * Each history entry displays: timestamp, editor's name (resolved from /Users via modifiedById), a text summary of the change, the previous note content (in italics), and the previous tag set (if tags changed).  
  * The history is read-only and cannot be edited or deleted independently.  
* **Edge Cases:**  
  * If a note has never been edited, no modification history section is shown.  
  * If a note has exactly one edit, "Show all" is unnecessary and is hidden.

---

* **5.5 Tag Notes**  
  As a sales rep, I can apply one or more colored tags to a note so that notes are categorized for quick retrieval.  
  **API:** PUT /Notes/:id, GET /Lookups/NoteTags  
  **Acceptance Criteria:**  
  * Tags are displayed as toggle buttons in the note creation and edit modal; clicking a tag toggles its selected state.  
  * Multiple tags can be applied simultaneously.  
  * Applied tags appear as colored badges on the note card; badge color matches the tag's configured color (managed in 10.3).  
  * Tag changes are preserved in modification history when a note is edited.  
* **Edge Cases:**  
  * If no tags are configured, the tag section in the modal is empty; the note can still be saved without tags.  
  * A note may have zero tags.  
  * Only non-hidden tags appear in the modal for selection; existing notes retaining a hidden tag still display that badge.

---

* **5.6 Filter Notes by Tag**  
  As a sales rep, I can filter a project's notes by one or more tags so that I can quickly surface all notes of a specific category.  
  **Acceptance Criteria:**  
  * A tag filter control in the Notes section allows selecting one or more tags.  
  * Selecting tags shows only notes that have at least one of the selected tags.  
  * The filter can be cleared to restore all notes.  
  * The filter state persists across sessions (see 8.5).  
* **Edge Cases:**  
  * If no notes match the selected tag(s), an empty-state message is shown.  
  * Notes with no tags are excluded when any tag filter is active.  
  * If a tag is hidden in Settings (10.3) while notes still reference it, those notes remain visible with no filter applied but will not appear when that tag is used as a filter criterion (since hidden tags are not selectable in the filter control).

---

* **5.7 Search Notes by Content**  
  As a sales rep, I can perform a full-text search across all notes on a project so that I can find a specific observation quickly.  
  **Acceptance Criteria:**  
  * A search input in the Notes section filters the visible notes in real time as the user types.  
  * The search matches against note content (body text) and is case-insensitive.  
  * Search and tag filter (5.6) can be active simultaneously; both conditions must be satisfied for a note to appear.  
  * Clearing the search input restores all notes (subject to any active tag filter).  
* **Edge Cases:**  
  * If no notes match the search term, an empty-state message is shown.  
  * Search does not match against tag names or author names; it is content-only.

---

* **5.8 Download Note Attachments**  
  As a sales rep, I can view files attached to a note and click to download them so that supporting documents are always accessible.  
  **API:** GET /Notes/:id/Attachments/:attachmentId  
  **Acceptance Criteria:**  
  * Attached files are listed on the note card, showing the file name, file size, and a file type icon.  
  * Each attachment has a download link/button that fetches and downloads the file from the server.  
* **Edge Cases:**  
  * If a note has no attachments, no attachment list is shown.  
  * If the file has been deleted server-side independently of the note record, the download link returns a 404 and an error toast is shown to the user.

---

* **5.9 Filter Notes by Author**  
  As a sales rep, I can filter a project's notes by the sales rep who authored them so that I can quickly review contributions from a specific team member.  
  **API:** GET /Notes?projectId=:id, GET /Users  
  **Acceptance Criteria:**  
  * An Author filter control in the Notes section lists all users who have authored at least one note on the current project.  
  * Selecting an author shows only notes created by that person.  
  * The author filter and tag filter (5.6) and content search (5.7) can all be active simultaneously; all active conditions must be satisfied for a note to appear.  
  * The filter can be cleared independently.  
* **Edge Cases:**  
  * If only one author has written notes on the project, the Author filter still renders but selecting that author has no effect on the visible list (all notes are already shown).  
  * If an author's user account is deleted from the system, their name may not resolve from /Users; their notes still appear and the filter option shows the user's ID or "Unknown" as the label.  
  * The author filter state does not persist across sessions and is not affected by the global "Clear All Filters" action (8.6), which operates only on project-list filters.

---

## **6\. Customer Equipment Inventory**

* **6.1 Add Equipment to Project from Company Fleet**  
  As a sales rep, I can select equipment from a company's known fleet to add to the project so that only registered, trackable machines appear on the job site record.  
  **API:** GET /CompanyFleet?companyId=:id, GET /CustomerEquipment?fleetItemId=:id, POST /CustomerEquipment  
  **Acceptance Criteria:**  
  * An "Add Equipment" button on the Project Detail page opens a modal.  
  * The user first selects a company from a dropdown showing only companies currently associated with the project (from GET /ProjectCompanies?projectId=:id).  
  * After selecting a company, a searchable fleet table appears showing that company's registered equipment (from GET /CompanyFleet?companyId=:id). Columns: Equipment Type, Make, Model, Year, Serial Number, Hours. The table supports tri-state sort on each column.  
  * The user selects a fleet item and clicks "Add." A POST /CustomerEquipment record is created linking the selected fleet item to the project.  
  * On success, the equipment appears under the owning company's group in the Equipment section and the addition is recorded in the change log.  
  * If the selected fleet item is already assigned to one or more other projects, a confirmation dialog is shown before committing the assignment (see Edge Cases).  
* **Edge Cases:**  
  * If the selected fleet item is already assigned to any other project(s), a warning dialog is shown listing those projects by name. The user must explicitly confirm ("Add Anyway") to proceed; dismissing the dialog cancels the operation without creating the record.  
  * If the selected company has no registered fleet items, the fleet table shows an empty-state message with a prompt to register new equipment via story 6.6.  
  * If the project has no associated companies, the company dropdown is empty; a prompt directs the user to first add a company (§2) before adding equipment.  
  * If a company is removed from the project after its equipment was added, the equipment records remain on the project attributed to that company; those records can still be edited (6.2) or deleted (6.3).

---

* **6.2 Edit Customer Equipment**  
  As a sales rep, I can update any field on an equipment record so that the inventory stays accurate.  
  **API:** PUT /CustomerEquipment/:id  
  **Acceptance Criteria:**  
  * An "Edit" action on an equipment row opens a pre-populated modal with all fields editable, including the owning company.  
  * Saving updates the record immediately; if the company is changed, the equipment moves to the new company's group in the UI.  
  * The update is recorded in the change log.  
* **Edge Cases:**  
  * Required fields (Type, Make, Model) cannot be cleared; form blocks saving with a validation error.  
  * The company dropdown is constrained to companies currently associated with the project.

---

* **6.3 Delete Customer Equipment**  
  As a sales rep, I can remove an equipment record from a project so that disposed or reassigned machines are no longer tracked.  
  **API:** DELETE /CustomerEquipment/:id  
  **Acceptance Criteria:**  
  * A "Delete" action is available on each equipment row.  
  * A confirmation prompt appears before deletion.  
  * On confirmation, the record is removed from the Equipment section immediately.  
  * The deletion is recorded in the change log.  
* **Edge Cases:**  
  * Deletion is permanent; there is no undo.  
  * Deleting all equipment under a company collapses or hides that company's group header in the Equipment section.

---

* **6.4 View and Sort Equipment by Company**  
  As a sales rep, I can see all equipment on a project grouped by owning company in collapsible sections with sortable columns so that I can find specific machines quickly.  
  **API:** GET /CustomerEquipment?projectId=:id  
  **Acceptance Criteria:**  
  * Equipment is organized into one collapsible group per owning company.  
  * Each group's table shows columns: Equipment Type, Make, Model, Year, Serial Number, Hours.  
  * Columns within each group are independently sortable via tri-state sort.  
  * Group headers show the company name and equipment count; clicking the header collapses or expands the group.  
  * Edit and Delete actions are available per row.  
* **Edge Cases:**  
  * If a company has been removed from the project but its equipment records remain, those records are still shown attributed to the company name.  
  * If no equipment exists on the project, the entire Equipment section shows an empty-state message.

---

* **6.5 Search Equipment**  
  As a sales rep, I can search across all equipment on a project by keyword so that I can locate a specific machine without scrolling.  
  **Acceptance Criteria:**  
  * A search input above the Equipment section filters records in real time.  
  * Search matches against: Company Name, Equipment Type, Make, Model, Year, and Serial Number.  
  * Groups with no matching results are hidden; groups with matches show only matching rows.  
  * Clearing the search input restores all equipment groups and rows.  
* **Edge Cases:**  
  * Search is case-insensitive.  
  * If no equipment matches the search term, all groups are hidden and an empty-state message is shown.  
  * Year is matched as a string substring (e.g., typing "202" matches 2020–2029), which may produce false positives when searching for a specific year. This is known behavior.

---

* **6.6 Add New Equipment to Company Fleet from Project Context**  
  As a sales rep, I can register a new piece of equipment in a company's fleet without leaving the project so that newly identified machines can be tracked immediately.  
  **API:** POST /CompanyFleet (prospect companies); Gatekeeper process (customer companies)  
  **Acceptance Criteria:**  
  * A "Create New Equipment" link in the "Add Equipment" modal (6.1), visible after a company has been selected, opens an inline equipment creation form.  
  * **Required fields:** Equipment Type (free text), Make (free text), Model (free text).  
  * **Optional fields:** Year (positive integer), Hours (non-negative number), Serial Number (free text).  
  * **Prospect company:** On submit, the new equipment is registered directly in the fleet via POST /CompanyFleet. On success, the newly created fleet item is immediately selectable in the fleet table (6.1) and the user is prompted to add it to the current project.  
  * **Customer company:** On submit, the registration request is forwarded to the existing Gatekeeper process. The user is informed that the request is pending Gatekeeper approval and that the equipment will appear in the fleet once approved; it cannot be added to the project until approval is granted.  
  * The new record (or pending Gatekeeper request) is logged in the change log.  
* **Edge Cases:**  
  * Year must be a positive integer if provided; negative values are rejected.  
  * Hours must be ≥ 0 if provided; 0 is valid (brand-new machine); leave blank to indicate hours are unknown.  
  * If the selected company is removed from the project between opening and submitting the form, submission is blocked with a validation error and no fleet record is created.

---

* **6.7 Create Prospect Record from Project Context**  
  As a sales rep, I can create a new prospect and link it to the project without leaving the project so that potential customers identified on-site are captured and associated immediately.  
  **API:** POST /Prospects, POST /ProjectCompanies  
  **Acceptance Criteria:**  
  * An "Add Prospect" action on the Project Detail page (alongside the existing "Add Company" action in §2) opens an inline prospect creation form.  
  * Required and optional fields follow the existing prospect creation requirements enforced by the broader CRM; at minimum, Prospect Name is required.  
  * On successful save, the prospect is created via POST /Prospects and simultaneously associated with the current project via POST /ProjectCompanies; the user is prompted to assign a role to the association before it is committed.  
  * The new prospect appears in the Companies table on the Project Detail page immediately.  
  * Both the prospect creation and the project association are recorded in the change log.  
* **Edge Cases:**  
  * The inline form exposes only the minimum fields required to create the prospect; full profile editing is available through the broader CRM's prospect detail view.  
  * If the API call fails (e.g., validation error), neither the prospect record nor the project association is created; the user sees an inline validation error and can correct and resubmit.  
  * If a prospect with the same name already exists in the system, the user is warned but not blocked; duplicate names are permitted (consistent with 2.2 for companies).

---

## **7\. Pipeline & Revenue Analytics**

* **7.1 Estimated Pipeline Revenue KPI**  
  As a user, I can see the total estimated pipeline revenue for the currently filtered set of projects on the dashboard so that I have an at-a-glance indicator of deal flow that is visually distinct from project-level value fields.  
  **API:** GET /Projects (with opportunity revenue aggregated), GET /Opportunities  
  **Acceptance Criteria:**  
  * A KPI card labeled **"Estimated Pipeline Revenue"** is displayed prominently above the project list.  
  * The card shows the sum of Estimated Revenue across all opportunities linked to the currently visible (filtered) projects. This value is opportunity-aggregated and is always visually distinct from project-level value fields (Valuation, Total Project Value) shown in a companion card (7.4) or in the project list columns.  
  * The value updates dynamically whenever the active filters change.  
  * Revenue is formatted using the currency from the ckSlCommon.CatCss.DefaultCurrency configuration key (e.g., $1,250,000 for USD).  
* **Edge Cases:**  
  * If no projects are visible (all filtered out), the KPI shows $0.  
  * Opportunities in terminal stages (Won, Lost, No Deal, No Lead) are included in the total unless filtered out at the opportunity level.  
  * If a project has no associated opportunities, it contributes $0 to the total.  
  * Opportunities whose stageId references a hidden or deleted stage are still included in the revenue total; they display "Unknown" for stage name but their revenue is not excluded.

---

* **7.2 Revenue Breakdown by Opportunity Type**  
  As a user, I can see pipeline revenue broken down by opportunity type in the KPI card so that I can identify which lines of business are performing strongest.  
  **API:** GET /OpportunityTypes, GET /Opportunities  
  **Acceptance Criteria:**  
  * The KPI card shows a breakdown of total revenue by opportunity type: Sales, Rent, Parts, Service, Rental Service, Lease.  
  * Only types with a non-zero total are shown in the breakdown.  
  * The breakdown reflects the current filter state (same project scope as the total KPI in 7.1).  
* **Edge Cases:**  
  * If all opportunities are of a single type, only that type appears in the breakdown.  
  * Types with $0 contribution are omitted from the display.

---

* **7.3 PAR Status: Behind PAR Indicator**  
  As a user, I can see which projects are behind their Planned Annual Rate of sales activity so that at-risk accounts can be prioritized for follow-up.  
  **API:** GET /Projects, GET /Activities?projectId=:id  
  **PAR Calculation:**  
  * PAR is the expected number of sales activities per year on a project.  
  * Expected activities to date \= PAR × (days elapsed since PAR Start Date / 365), calculated linearly.  
  * Actual activities to date \= count of activities logged against the project with a date ≤ today.  
  * A project is **Behind PAR** if: actual activities \< expected activities to date.  
  * Example: PAR \= 24, start date \= 6 months ago → 12 activities expected. If only 9 are logged, the project is behind PAR.  
* **Acceptance Criteria:**  
  * Each project row in the project list shows a PAR status indicator: "On Track," "Behind PAR," or "N/A" (if no PAR Start Date is set).  
  * A "Behind PAR" filter toggle in the filter bar shows only projects that are currently behind PAR.  
  * The filter toggle works in combination with all other active filters.  
  * The KPI card (7.1) updates to reflect only behind-PAR projects when the toggle is active.  
  * The PAR status indicator on the Project Detail page header also reflects this calculation.  
  * The toggle state persists to session storage (see 8.5).  
* **Edge Cases:**  
  * Projects with no PAR Start Date show "N/A" and are excluded from the Behind PAR filter.  
  * Projects where PAR Start Date is in the future are "On Track" (0 activities expected, 0 logged).  
  * Future-dated activities do not count toward the actual activity count for PAR purposes.  
  * Adding, editing, or deleting an activity recalculates PAR status immediately for the affected project.  
  * Projects with a PAR of 0 or with no PAR value set (null/blank) are treated as having no target; their status shows "N/A."

---

* **7.4 Project Valuation KPI**  
  As a user, I can see the aggregate project-level valuation for the currently filtered set of projects so that I understand the total construction scope represented by the visible projects, separately from the estimated pipeline revenue.  
  **API:** GET /Projects (Valuation fields aggregated client-side)  
  **Acceptance Criteria:**  
  * A KPI card labeled **"Project Valuation"** is displayed alongside the Estimated Pipeline Revenue card (7.1).  
  * The card shows the sum of the Valuation field across all currently visible (filtered) projects; projects with no Valuation set contribute $0.  
  * The value updates dynamically whenever the active filters change.  
  * Revenue is formatted using the currency from the ckSlCommon.CatCss.DefaultCurrency configuration key.  
  * The card is visually distinct from the Estimated Pipeline Revenue card (7.1) to prevent confusion between project-level value and opportunity-aggregated revenue.  
* **Edge Cases:**  
  * If no projects are visible (all filtered out), the card shows $0.  
  * If none of the visible projects have a Valuation set, the card shows $0. The card remains visible; the contrast with the Estimated Pipeline Revenue card is informative even when the value is zero.  
  * This card aggregates only the user-entered Valuation field. Total Project Value (the Dodge-sourced field) is a separate project field and is not included in this aggregate.

---

## **8\. Filtering**

* **8.1 Filter by Sales Rep**  
  As a user, I can filter the project list by an assigned sales rep so that I can review one person's portfolio at a time.  
  **API:** GET /SalesReps  
  **Acceptance Criteria:**  
  * A Sales Rep dropdown in the filter bar lists all sales reps who appear on at least one project.  
  * Selecting a rep shows only projects where that rep is one of the assigned sales reps.  
  * Selecting "All" (default) removes the rep filter.  
* **Edge Cases:**  
  * If a rep is assigned to zero projects, they do not appear in the filter dropdown.  
  * The filter matches any project where the selected rep is listed, even if multiple reps are assigned.  
  * If a sales rep has been deleted from the system but is still assigned to projects, their entry in the filter dropdown displays as "(deleted user)." Selecting it filters to their projects as normal.

---

* **8.2 Filter by Division**  
  As a user, I can filter projects by business division so that divisional performance can be evaluated in isolation.  
  **API:** GET /Lookups/Divisions  
  **Acceptance Criteria:**  
  * A Division dropdown in the filter bar lists the seven configured divisions: General Line (G), Compact (C), Paving (P), Heavy Rents (R), Power Systems (S), Rental Services (V), Power Rental (X).  
  * Selecting a division shows only projects that have at least one opportunity in that division.  
  * Selecting "All" (default) removes the division filter.  
* **Edge Cases:**  
  * Division is derived from opportunity records; a project with no opportunities is excluded when any division filter is active.  
  * Divisions are read-only in the current phase; adding or renaming divisions requires a new story.

---

* **8.3 Filter by General Contractor**  
  As a user, I can filter projects by their associated GC so that all job sites for a given contractor are immediately visible.  
  **API:** GET /ProjectCompanies?role=GC  
  **Acceptance Criteria:**  
  * A General Contractor dropdown in the filter bar lists all companies designated as GC on at least one project.  
  * Selecting a GC shows only projects where that company is the designated General Contractor.  
  * Selecting "All" (default) removes the GC filter.  
* **Edge Cases:**  
  * Projects with no GC assigned are excluded when any GC filter is active.  
  * GC names in the dropdown are matched by company name; if two projects have GCs with the same name they are treated as the same filter option.

---

* **8.4 Filter by Project Status**  
  As a user, I can filter the project list by status so that only projects in a specific state are shown.  
  **API:** GET /Lookups/ProjectStatuses  
  **Acceptance Criteria:**  
  * A Status dropdown in the filter bar lists all project statuses, including hidden ones (so users can still view records that carry a hidden status).  
  * Selecting a status shows only projects with that status.  
  * Selecting "All" (default) removes the status filter.  
  * The "Hide Completed" toggle (1.8) operates independently and additively with this filter.  
* **Edge Cases:**  
  * If a status is hidden from Settings while it is the active filter, the filter remains applied and the status label is shown in the dropdown with a "(hidden)" indicator.  
  * Newly added statuses appear in the filter dropdown immediately.

---

* **8.5 Persist Filters Across Sessions**  
  As a user, my active filter selections are saved automatically and restored when I return so that I don't have to re-apply them each day.  
  **Acceptance Criteria:**  
  * All project-list filter state (Sales Rep, Division, GC, Status, Behind PAR toggle, Hide Completed toggle) is written to the user's preferences on the server (or localStorage as a temporary fallback) whenever any filter changes.  
  * On page load, the saved filter state is read and applied before the project list renders.  
  * Note tag filter state (5.6) is persisted independently.  
* **Edge Cases:**  
  * If localStorage is unavailable (e.g., private browsing mode), filters fall back to defaults silently with no error shown.  
  * If the saved localStorage value cannot be parsed as valid JSON (e.g., corrupted data), the error is silently swallowed and defaults are applied.  
  * If a previously saved filter value no longer exists (e.g., a sales rep was removed), the filter clears gracefully and the full list is shown.

---

* **8.6 Clear All Filters**  
  As a user, I can reset all project-list filters to their defaults with a single action so that the full project list is restored immediately.  
  **Acceptance Criteria:**  
  * A "Clear Filters" button is visible in the filter bar whenever any project-list filter is active.  
  * Clicking it resets all filter dropdowns to "All" and all toggles to their default off state.  
  * The cleared state is persisted, replacing the previous saved state.  
  * The project list and KPI card update immediately.  
* **Edge Cases:**  
  * If no filters are currently active, the "Clear Filters" button is hidden or disabled.  
  * Clearing project-list filters does not reset the note tag filter (5.6) or note author filter (5.9), which are scoped to individual project notes and persist independently.

---

## **9\. Change Log & Audit Trail**

* **9.1 View Project Change Log**  
  As a user, I can navigate to a dedicated change log page for a project and see a timestamped list of all changes so that full accountability is maintained.  
  **API:** GET /Projects/:id/ChangeLog  
  **Acceptance Criteria:**  
  * A "View Change Log" link on the Project Detail page navigates to /project/:id/changelog.  
  * The page lists all change log entries for the project in reverse-chronological order (newest first).  
  * Each entry shows: Action (e.g., Created, Updated, Deleted), Category (Project, Opportunity, Company, Activity, Note, Equipment), Summary text, the name of the user who made the change (resolved from changedById via GET /Users), and the timestamp.  
  * Each column header (Action, Category, User, Timestamp) supports tri-state sort (ascending → descending → unsorted). The default is Timestamp descending; sorting by another column overrides this default for the current session.  
  * A "Back to Project" link navigates back to the Project Detail page.  
* **Edge Cases:**  
  * If a project has no change log entries, the page shows an empty-state message.  
  * Navigating directly to /project/:id/changelog for a non-existent project ID shows a not-found state.  
  * If changedById cannot be resolved from /Users (e.g., user was deleted), the name column shows "Unknown User."

---

* **9.2 Filter Change Log by Category**  
  As a user, I can filter the change log to a specific category so that I can focus on the type of changes I care about.  
  **API:** GET /Projects/:id/ChangeLog?category=:category  
  **Acceptance Criteria:**  
  * Category filter buttons or a dropdown on the Change Log page allow selecting one category at a time: All, Project, Opportunity, Company, Activity, Note, Equipment.  
  * Selecting a category shows only entries of that category; pagination (9.3) resets to page 1 when the filter changes.  
  * "All" (default) shows entries from every category.  
* **Edge Cases:**  
  * If no entries exist for the selected category, an empty-state message is shown.  
  * Filter selection does not persist across page navigations.

---

* **9.3 Paginate Change Log**  
  As a user, I can paginate through the change log and control how many entries are shown per page so that long histories remain easy to navigate.  
  **Acceptance Criteria:**  
  * A pagination control at the bottom of the Change Log page shows Previous and Next buttons and an "X–Y of Z entries" count.  
  * A rows-per-page selector offers options: 10, 15, 25, 50; defaulting to 10\.  
  * Changing the rows-per-page resets to page 1\.  
  * Previous is disabled on page 1; Next is disabled on the last page.  
* **Edge Cases:**  
  * If the total number of entries is less than or equal to the selected rows-per-page, Previous and Next are both disabled.  
  * Changing the category filter (9.2) resets to page 1 automatically.

---

* **9.4 Expand Change Log Entry Detail**  
  As a user, I can click on a change log entry to expand it and view its field-level detail so that I understand exactly what was modified.  
  **Acceptance Criteria:**  
  * Each change log entry row is clickable (expand/collapse toggle).  
  * Expanded entries show a structured detail payload: a list of field names and their before/after values.  
  * Entries without a detail payload (e.g., simple deletions) show "No additional details."  
* **Edge Cases:**  
  * The detail payload is rendered as a readable key-value list, not raw JSON.  
  * The expand/collapse state is local to the current page view; navigating away and returning collapses all entries.

---

## **10\. Settings & Configuration**

**Important: Deletion Policy:** Across all Settings stories, **deletion of a lookup value is blocked if that value is referenced by any existing record**. Instead, an administrator may **hide** a value, which removes it from future-selection picklists while preserving it on all records that currently reference it. This protects data integrity and ensures historical records remain accurate.

* **10.1 Manage Project Statuses**  
  As an admin, I can add, rename, reorder, assign a color, set an isCompleted flag, hide, and (if unused) delete project status values so that the picklist reflects current business terminology.  
  **API:** GET /Lookups/ProjectStatuses, POST /Lookups/ProjectStatuses, PUT /Lookups/ProjectStatuses/:id, PATCH /Lookups/ProjectStatuses/:id  
  **Acceptance Criteria:**  
  * The Settings page has a "Project Status" tab listing all status values, including hidden ones (marked with a "(hidden)" badge).  
  * Each status shows: Label (editable), Color (color picker), Display Order (numeric), isCompleted checkbox, Hidden toggle, and a Delete button.  
  * Delete is enabled only when the status is not referenced by any project; if referenced, the Delete button is replaced by a "Hide" button.  
  * Hiding a status removes it from future picklist selections but does not affect existing records.  
  * An "Add" form at the bottom allows entering a new status label, color, order, and isCompleted flag.  
  * Changes are applied globally; updated labels and colors appear immediately across the application.  
* **Edge Cases:**  
  * Two statuses may not share the same label; a duplicate label shows a validation warning.  
  * Display Order values may have gaps or duplicates; sort order between ties is undefined.  
  * The isCompleted flag drives the "Hide Completed" toggle (1.8) and must be settable independently of the label.

---

* **10.2 Manage Subcontractor Roles**  
  As an admin, I can add, rename, reorder, hide, and (if unused) delete company role values so that new contractor categories can be supported without a code change.  
  **API:** GET /Lookups/SubcontractorRoles, POST /Lookups/SubcontractorRoles, PUT /Lookups/SubcontractorRoles/:id, PATCH /Lookups/SubcontractorRoles/:id  
  **Acceptance Criteria:**  
  * The Settings page has a "Subcontractor Role" tab listing all role values, including hidden ones.  
  * Each role shows: Label (editable), Display Order (editable), Hidden toggle, and a Delete button.  
  * Delete is enabled only when the role is not referenced by any project-company association; if referenced, Delete is replaced by "Hide."  
  * Hiding a role removes it from future role picklists but preserves it on existing associations.  
  * An "Add" form allows creating a new role with a label and display order.  
* **Edge Cases:**  
  * The "GC" role is a system role and is read-only; it cannot be renamed, hidden, or deleted. It does not appear in the subcontractor role picklist.  
  * Updated role labels appear in the Associate Company modal (2.1) and the Edit Subcontractor form (2.5) immediately.

---

* **10.3 Manage Note Tags**  
  As an admin, I can add, rename, reorder, assign a color, hide, and (if unused) delete note tag values so that tagging categories and their visual indicators stay relevant.  
  **API:** GET /Lookups/NoteTags, POST /Lookups/NoteTags, PUT /Lookups/NoteTags/:id, PATCH /Lookups/NoteTags/:id  
  **Acceptance Criteria:**  
  * The Settings page has a "Note Tags" tab listing all tag values, including hidden ones.  
  * Each tag shows: Label (editable), Color (color picker), Display Order (editable), Hidden toggle, and a Delete button.  
  * Delete is enabled only when the tag is not referenced by any note; if referenced, Delete is replaced by "Hide."  
  * Hiding a tag removes it from future note creation/edit modals but preserves it on existing notes as a displayed badge.  
  * An "Add" form allows creating a new tag with a label, color, and order.  
* **Edge Cases:**  
  * Updated tag labels and colors appear on existing notes immediately.  
  * Color options are constrained to a configured palette of named Tailwind colors.  
  * Two tags may not share the same label; a duplicate label shows a validation warning.

---

* **10.4 Manage Opportunity Stages**  
  As an admin, I can add, rename, reorder, set default probability, designate phase, hide, and (if unused) delete opportunity pipeline stages so that the sales process is accurately modeled in the CRM.  
  **API:** GET /OpportunityStages, POST /OpportunityStages, PUT /OpportunityStages/:id, PATCH /OpportunityStages/:id  
  **Acceptance Criteria:**  
  * The Settings page has an "Opportunity Stages" tab listing all stage values, including hidden ones.  
  * Each stage shows: Label (editable), Phase (Open / Closed; controls whether the stage is selectable at opportunity creation), Default Probability % (0–100, editable), Display Order (editable), Hidden toggle, and a Delete button.  
  * Delete is enabled only when the stage is not referenced by any opportunity; if referenced, Delete is replaced by "Hide."  
  * Hiding a stage removes it from the stage picklist in opportunity create/edit forms but preserves it on existing opportunities.  
  * An "Add" form allows creating a new stage with all fields.  
  * Changes to default probability are reflected immediately in the Opportunity Detail modal (3.6) for any opportunity currently at that stage.  
* **Edge Cases:**  
  * At least one non-hidden stage with Phase \= "Open" must exist at all times; the system blocks hiding or deleting the last open stage.  
  * Stage label changes are reflected immediately everywhere the stage name is displayed (tables, modals, filters, change log).  
  * Two stages may not share the same label; a duplicate label shows a validation warning.

---

## **11\. Dodge Project Integration**

* **11.1 Create CRM Project from Dodge Project**  
  As a sales rep, I can click "Create CRM Project" from either the Dodge Project list view or the Dodge Project detail view so that I can start a new CRM project record pre-filled with the Dodge data for that job site, without re-entering information already captured.  
  **API:** GET /DodgeProjects/:id, POST /Projects, POST /ProjectCompanies, POST /Contacts  
  **Acceptance Criteria:**  
  * **Entry point A (list view):** Each row in the Dodge Project list view has a "Create CRM Project" button. Clicking it navigates the user to the CRM Project creation screen (see 1.2).  
  * **Entry point B (detail view):** The Dodge Project detail view includes a prominent "Create CRM Project" button. Clicking it navigates the user to the same CRM Project creation screen.  
  * If the Dodge Project identifies a General Contractor, a GC section (per 2.3) is shown below the main project fields with the GC company name pre-populated. The user must supply the required GC contact fields (Contact Name and Contact Email) to save the GC record alongside the project. If the GC section is left incomplete, the project saves without a GC; the GC can be added later via story 2.3.  
  * Fields not present in the Dodge Project record are left blank and must be completed by the user before saving.  
  * All standard validation rules from story 1.2 apply to the pre-populated form; pre-filled values are not exempt from validation.  
  * Fields that cannot be derived from Dodge data (Status, Sales Rep assignment, PAR, PAR Start Date, Primary Contact Name, and Primary Contact Email) are always blank and must be completed by the user.  
  * On successful save, the new CRM Project is automatically linked to the originating Dodge Project (see 11.2) and the user is navigated to the new CRM Project's detail page.  
  * On both the list view and the detail view, any Dodge Project already linked to a CRM Project shows a "View CRM Project" link in place of the "Create CRM Project" button.  
* **Edge Cases:**  
  * If the Dodge Project has no address data and no coordinate data, the location section of the creation form is left blank; the user must supply location information or the form cannot be submitted.  
  * If the Dodge Project has both address and coordinate data, both sets of fields are pre-populated; the form defaults to Address view (per 1.9). The user may switch to Coordinates view, and both sets of data are retained on the saved record.  
  * Pre-populated field values may be edited freely before saving; changes made in the CRM creation form do not affect the Dodge Project record.  
  * If no GC has been identified on the Dodge Project, the GC section is not shown on the creation screen; the GC can be added to the project later via the normal flow (2.3).  
  * The pre-populated GC company name may be edited before saving; edits apply only to the CRM record and do not modify the Dodge Project data.  
  * If the user navigates away from the creation screen without saving, no CRM Project is created and no link is established.

---

* **11.2 Bidirectional Navigation Between Dodge Project and CRM Project**  
  As a user, I can navigate directly between a linked Dodge Project and its associated CRM Project so that I can move between the external source record and the CRM context without searching.  
  **API:** GET /DodgeProjects/:id, GET /Projects/:id  
  **Acceptance Criteria:**  
  * On the CRM Project detail page, a "View Dodge Project" link is displayed when the project has a linked Dodge Project. Clicking it navigates to the Dodge Project detail view.  
  * On the Dodge Project detail view, a "View CRM Project" link is displayed when the record is linked to a CRM Project. Clicking it navigates to the CRM Project detail page.  
  * Both links are visually distinct from standard navigation and show the name of the linked record (e.g., "View CRM Project: Riverside Overpass").  
  * The CRM Project detail page shows no Dodge Project link when no Dodge Project has been associated with it.  
  * The link is one-to-one in both directions: a CRM Project cannot link to more than one Dodge Project, and a Dodge Project cannot link to more than one CRM Project.  
* **Edge Cases:**  
  * If the linked Dodge Project record is no longer available in the external feed, the "View Dodge Project" link on the CRM Project detail page is hidden or replaced with a "Dodge Project unavailable" indicator; the CRM Project record itself is unaffected.  
  * Unlinking a Dodge Project from a CRM Project is not supported in this phase; a new story is required to add that capability.

---

## **12\. Customer Projects View**

* **12.1 View Projects Associated with a Customer**  
  As a user, I can navigate to a "Projects" page from a customer's detail view so that I have a full picture of every CRM project that customer is involved in across all job sites.  
  **API:** GET /ProjectCompanies?companyId=:id, GET /Projects, GET /Lookups/ProjectStatuses  
  **Acceptance Criteria:**  
  * The "Basics" section of the customer detail view's left-side navigation panel gains a "Projects" link, placed between the existing "Customer Profile" and "Job Sites" links.  
  * Clicking the "Projects" link navigates to a projects list page scoped to that customer, showing every CRM project in which the customer appears as an associated company (i.e., any record in /ProjectCompanies for that customer, regardless of role).  
  * The list uses the same table layout as the main CRM projects list (1.1): columns are Project Name, Status, General Contractor, Sales Rep(s), PAR, PAR Start Date, and PAR status indicator (On Track / Behind PAR / N/A).  
  * Each row is clickable and navigates to the CRM Project detail page (1.4).  
  * The total number of visible projects is shown above the table.  
  * If the customer has no associated projects, the page shows an empty-state message in place of the table.  
* **Edge Cases:**  
  * A project appears in the list regardless of the role the customer holds on that project (subcontractor, GC, or any configured role).  
  * Projects with a hidden status still appear in the list using their current status label; the status filter (12.2) governs which are shown.  
  * Very long project names truncate with an ellipsis; the full name is visible on hover.

---

* **12.2 Filter and Sort the Customer Projects List**  
  As a user, I can filter the customer projects list by project status and sort its columns so that I can quickly focus on the projects that matter.  
  **API:** GET /Lookups/ProjectStatuses  
  **Acceptance Criteria:**  
  * A Status filter dropdown is present above the table, populated from GET /Lookups/ProjectStatuses. The dropdown includes hidden statuses so that projects carrying a hidden status remain reachable.  
  * Selecting a status narrows the list to projects with that status; "All" (the default) removes the status filter.  
  * Clicking any column header cycles through tri-state sort (ascending → descending → unsorted), matching the sort behavior of the main projects list (1.1).  
  * Filter and sort state are local to the session and reset when the user navigates away from the page.  
* **Edge Cases:**  
  * If no projects match the selected status, the table shows an empty-state message.  
  * If a status that is active as a filter is subsequently hidden in Settings, the filter remains applied and the status label is shown with a "(hidden)" indicator in the dropdown.

---

## **13\. CRM Opportunity to Project Link**

* **13.1 Link a CRM Project to an Opportunity**  
  As a user, I can search for and link an existing CRM Project to an opportunity from the opportunity detail view so that the relationship between a deal and its job site is clearly recorded.  
  **API:** GET /Projects  
  **Acceptance Criteria:**  
  * The opportunity detail view includes a "CRM Project" lookup field.  
  * The lookup opens a searchable table of CRM Project records. The table uses the same column layout as the main projects list (1.1): Project Name, Status, General Contractor, Sales Rep(s), PAR, PAR Start Date, and PAR status indicator. Column headers support tri-state sort (ascending → descending → unsorted).  
  * The user can type to search and filter the table by project name to locate the target project.  
  * Selecting a project from the table links it to the opportunity, closes the lookup, and displays the linked project's name in the "CRM Project" field on the opportunity detail view.  
  * Once linked, the project name is rendered as a clickable link; clicking it navigates to that CRM Project's detail page (1.4).  
  * The user can change the linked project by opening the lookup again and selecting a different project; the previous link is replaced.  
* **Edge Cases:**  
  * An opportunity may be linked to at most one CRM Project at a time; selecting a new project always replaces the existing link rather than adding a second.  
  * This link is independent of any Dodge Project connection on the same opportunity (see §11); both links may exist simultaneously on the same opportunity without conflict.  
  * If the linked CRM Project's name or status changes after the link is established, the opportunity reflects the current name and navigates to the current project detail; the link is not broken by such changes.  
  * The project lookup table displays all CRM Projects regardless of status; no projects are excluded from selection.  
  * Removing the CRM Project link entirely (setting it to blank) is not in scope for this phase; a new story is required to support unlinking.