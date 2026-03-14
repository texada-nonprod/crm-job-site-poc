# Android Jetpack Compose Prototype — Projects CRM

## Context
Existing web CRM (React/TypeScript) at `Z:\jobsites\`. Android prototype at `Z:\jobsites\android\` using Kotlin + Jetpack Compose + Material 3.

## Scope
**Included:** Project List, Project Detail, Create/Edit Project — the core field-user workflows.
**Excluded:** Administrative screens (Manage Dropdowns, Dodge Mappings) — these are back-office/desktop-only functions not needed on mobile.

## Current State
- Android Studio project created: AGP 9.1.0, Kotlin 2.2.10, Compose BOM 2024.09.00
- Uses version catalog (`gradle/libs.versions.toml`)
- Package: `com.jobsites.crm`, min SDK 29, compile/target SDK 36
- App name: "Projects"

## Architecture
- Hilt (DI), Kotlinx Serialization (JSON), Navigation Compose (routing)
- ViewModel + Repository pattern (StateFlow-based)
- DataStore Preferences (replaces web's localStorage)
- In-memory mock data from JSON assets (no Room DB)

## JSON Data Notes
- `Project.json`: wrapped in `{"content":[...]}`, uses **siteCompanies** (not projectCompanies)
- `Opportunity.json`: wrapped in `{"content":[...]}`, uses **jobSiteId** (not projectId)
- `CompanyEquipment.json`: direct array (no wrapper)
- `ContactTypes.json`, `MailCodes.json`: direct arrays
- `OpportunityStages.json`: `{"content":[...]}` with lowercase keys + PascalCase `DisplayStageName`
- `OpportunityTypes.json`: `{"content":[...]}` with lowercase keys
- `Lookups.json`: object with `primaryStages`, `primaryProjectTypes`, `ownershipTypes`, `uomTypes` arrays
- `SalesReps.json`: `{"content":[...]}` with lowercase keys (`salesrepid`, `firstname`, `lastname`)

---

## Step-by-Step Implementation

### Step 1: Add dependencies to version catalog
**File:** `android/gradle/libs.versions.toml`
**Action:** Add versions, libraries, and plugins for: Hilt, KSP, Kotlinx Serialization, Navigation Compose, Lifecycle ViewModel Compose, DataStore Preferences, Material Icons Extended
**Assertion:** `gradlew projects` completes without errors (Gradle can parse the catalog)

### Step 2: Update project-level build.gradle.kts
**File:** `android/build.gradle.kts`
**Action:** Add plugin aliases for `kotlin-android`, `kotlin-serialization`, `hilt`, `ksp` (all `apply false`)
**Assertion:** `gradlew projects` still succeeds

### Step 3: Update app-level build.gradle.kts
**File:** `android/app/build.gradle.kts`
**Action:** Apply plugins (`kotlin-android`, `kotlin-serialization`, `hilt`, `ksp`), add all new library dependencies, set Java 17 compatibility
**Assertion:** `gradlew :app:dependencies` succeeds and lists hilt, serialization, navigation libraries

### Step 4: Create assets directory and copy JSON mock data
**Action:** Create `android/app/src/main/assets/`, copy all JSON files from `src/data/` (Project.json, Opportunity.json, SalesReps.json, Users.json, OpportunityStages.json, OpportunityTypes.json, Lookups.json, CompanyEquipment.json, ActivityTypes.json, Campaigns.json, Issues.json, ContactTypes.json)
**Assertion:** All 12 JSON files exist under `android/app/src/main/assets/`

### Step 5: Create data model — CustomerEquipment.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/CustomerEquipment.kt`
**Action:** `@Serializable data class` with fields: id, companyId, equipmentType, make, model, year?, serialNumber?, smu?, uom?, ownershipStatus
**Assertion:** File compiles (no syntax errors in IDE)

### Step 6: Create data model — CompanyContact.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/CompanyContact.kt`
**Action:** `@Serializable data class` with all contact fields (id, name, firstName?, lastName?, title?, typeCode?, phone, mobilePhone?, email, address fields, divisionIds?, mailCodes?)
**Assertion:** File compiles

### Step 7: Create data model — ProjectCompany.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/ProjectCompany.kt`
**Action:** `@Serializable data class` with companyId, companyName, roleId, roleDescription, roleIds?, roleDescriptions?, isPrimaryContact, companyContacts list, divisionIds?, primaryContactIndex?. Add helper methods `getAllRoleIds()`, `getAllRoleDescriptions()`
**Assertion:** File compiles (references CompanyContact from Step 6)

### Step 8: Create data model — Note.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/Note.kt`
**Action:** `@Serializable` classes: `Note`, `Attachment`, `NoteModification`, `NoteTag`
**Assertion:** File compiles

### Step 9: Create data model — Activity.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/Activity.kt`
**Action:** `@Serializable data class` with all activity fields
**Assertion:** File compiles

### Step 10: Create data model — Project.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/Project.kt`
**Action:** `@Serializable` classes: `Project`, `Address`, `ProjectOwner`, `AssociatedOpportunity`, `ExternalReference`. Use `@SerialName("siteCompanies")` for the projectCompanies field to match JSON
**Assertion:** File compiles (references types from Steps 5-9)

### Step 11: Create data model — Opportunity.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/model/Opportunity.kt`
**Action:** `@Serializable` classes: `Opportunity`, `ProductGroup`, `Product`. Use `@SerialName("jobSiteId")` for projectId field. Use `@SerialName("PSETypeId")` for pseTypeId
**Assertion:** File compiles

### Step 12: Create data model — SalesRep.kt, User.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/data/model/SalesRep.kt`, `User.kt`
**Action:** `@Serializable` with `@SerialName` for lowercase JSON keys (salesrepid, firstname, lastname)
**Assertion:** Files compile

### Step 13: Create data model — OpportunityStage.kt, OpportunityType.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/data/model/OpportunityStage.kt`, `OpportunityType.kt`
**Action:** `@Serializable` with `@SerialName` for all lowercase/mixed-case JSON keys
**Assertion:** Files compile

### Step 14: Create data model — Lookup.kt, ChangeLogEntry.kt, Filters.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/data/model/Lookup.kt`, `ChangeLogEntry.kt`, `Filters.kt`
**Action:** LookupOption, LookupsData (with primaryStages/primaryProjectTypes/ownershipTypes/uomTypes arrays), ChangeLogEntry, Filters (non-serializable, UI state only)
**Assertion:** Files compile

### Step 15: Create JSON wrapper classes
**File:** `android/app/src/main/java/com/jobsites/crm/data/json/JsonWrappers.kt`
**Action:** Generic `ContentWrapper<T>` for `{"content":[...]}` structure
**Assertion:** File compiles

### Step 16: Build — verify all models compile
**Action:** Run `gradlew :app:compileDebugKotlin`
**Assertion:** BUILD SUCCESSFUL with 0 errors

### Step 17: Create JsonDataSource.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/repository/JsonDataSource.kt`
**Action:** Class that reads each JSON asset, deserializes with `kotlinx.serialization.json.Json { ignoreUnknownKeys = true; isLenient = true }`. Methods for loading each data type
**Assertion:** Compiles; each JSON file deserializes without exceptions

### Step 18: Create CrmRepository.kt
**File:** `android/app/src/main/java/com/jobsites/crm/data/repository/CrmRepository.kt`
**Action:** Central state holder with StateFlows. Methods: initialize(), all CRUD operations, revenue calculations (won/pipeline/byType), filtering logic, name resolution helpers. Port logic from `src/contexts/DataContext.tsx`
**Assertion:** Compiles; `initialize()` loads all mock data into StateFlows

### Step 19: Create Hilt DI module + Application class
**Files:** `android/app/src/main/java/com/jobsites/crm/di/AppModule.kt`, `CrmApplication.kt`
**Action:** `@Module @InstallIn(SingletonComponent)` providing JsonDataSource and CrmRepository as `@Singleton`. `@HiltAndroidApp` Application class
**Assertion:** Compiles

### Step 20: Update AndroidManifest.xml and MainActivity.kt for Hilt
**Action:** Set `android:name=".CrmApplication"` in manifest, add `@AndroidEntryPoint` to MainActivity
**Assertion:** `gradlew :app:compileDebugKotlin` succeeds with Hilt annotation processing

### Step 21: Build — verify data layer compiles with Hilt
**Action:** Run `gradlew :app:compileDebugKotlin`
**Assertion:** BUILD SUCCESSFUL

### Step 22: Update theme — Color.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/theme/Color.kt`
**Action:** Replace defaults with CRM status colors (emerald, sky, amber, slate) + Material scheme
**Assertion:** File compiles

### Step 23: Update theme — Theme.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/theme/Theme.kt`
**Action:** Update light/dark color schemes with CRM colors
**Assertion:** File compiles

### Step 24: Create component — StatusBadge.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/components/StatusBadge.kt`
**Action:** Composable mapping statusId to colored chip
**Assertion:** File compiles

### Step 25: Create components — EmptyState.kt, LoadingState.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/ui/components/EmptyState.kt`, `LoadingState.kt`
**Assertion:** Files compile

### Step 26: Create component — ConfirmDialog.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/components/ConfirmDialog.kt`
**Assertion:** File compiles

### Step 27: Create components — DatePickerField.kt, DropdownField.kt, MultiSelectField.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/ui/components/`
**Assertion:** Files compile

### Step 28: Create navigation — Screen.kt + CrmNavigation.kt
**Files:** `android/app/src/main/java/com/jobsites/crm/ui/navigation/Screen.kt`, `CrmNavigation.kt`
**Action:** Sealed class with routes, NavHost with all destinations
**Assertion:** Files compile

### Step 29: Build — verify components + navigation compile
**Action:** Run `gradlew :app:compileDebugKotlin`
**Assertion:** BUILD SUCCESSFUL

### Step 30: Create ProjectListViewModel.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectlist/ProjectListViewModel.kt`
**Action:** `@HiltViewModel` with UiState, filter/sort/search methods
**Assertion:** File compiles

### Step 31: Create KpiCard.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectlist/components/KpiCard.kt`
**Assertion:** File compiles

### Step 32: Create ProjectCard.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectlist/components/ProjectCard.kt`
**Assertion:** File compiles

### Step 33: Create FilterSheet.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectlist/components/FilterSheet.kt`
**Assertion:** File compiles

### Step 34: Create ProjectListScreen.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectlist/ProjectListScreen.kt`
**Assertion:** File compiles

### Step 35: Wire ProjectListScreen into navigation + MainActivity
**Assertion:** `gradlew :app:assembleDebug` succeeds — APK builds

### Step 36: Run app — verify Project List
**Assertion:** App launches, shows project cards with mock data, KPI shows revenues, scrolling works

### Step 37: Create ProjectDetailViewModel.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectdetail/ProjectDetailViewModel.kt`
**Assertion:** File compiles

### Step 38: Create ProjectInfoCard.kt
**File:** `android/app/src/main/java/com/jobsites/crm/ui/screens/projectdetail/components/ProjectInfoCard.kt`
**Assertion:** File compiles

### Step 39: Create OpportunityCard.kt + OpportunitySection.kt
**Assertion:** Files compile

### Step 40: Create CompanyCard.kt + CompanySection.kt
**Assertion:** Files compile

### Step 41: Create ActivityCard.kt + ActivitySection.kt
**Assertion:** Files compile

### Step 42: Create EquipmentCard.kt + EquipmentSection.kt
**Assertion:** Files compile

### Step 43: Create NoteCard.kt + NotesSection.kt
**Assertion:** Files compile

### Step 44: Create ProjectDetailScreen.kt
**Assertion:** File compiles

### Step 45: Build and run — verify Project Detail
**Assertion:** Tapping project card navigates to detail. All sections display with correct data. Back works

### Step 46: Create CreateProjectViewModel.kt
**Assertion:** File compiles

### Step 47: Create CreateProjectScreen.kt
**Assertion:** File compiles

### Step 48: Create EditProjectViewModel.kt + EditProjectScreen.kt
**Assertion:** Files compile

### Step 49: Wire Create/Edit into navigation
**Assertion:** `gradlew :app:assembleDebug` succeeds

### Step 50: Final build and end-to-end verification
**Assertions:**
1. App launches to Project List with all mock data
2. KPI cards show correct revenue totals
3. Search filters projects by name
4. Filter sheet filters by status/assignee/division
5. Tapping project navigates to detail with all 5 sections
6. Collapsible sections expand/collapse
7. Company contacts show phone/email
8. FAB opens Create Project form
9. Form validates required fields
10. Submitting form adds project and returns to list
11. Edit screen pre-populates and saves changes
12. Back navigation works throughout

---

## Resolved Issues
- KSP uses new `{kotlin}-2.0.x` version scheme (not `1.0.x`) — version: `2.2.10-2.0.2`
- `kotlin-android` plugin is implicit via `kotlin-compose` in AGP 9 — do not apply separately
- Added `android.disallowKotlinSourceSets=false` to `gradle.properties` for KSP + AGP 9 compatibility
- Hilt requires 2.59+ for AGP 9 support — version: `2.59.2`

## Status
- Steps 1-3: DONE — Gradle config (version catalog, project build, app build)
- Step 4: DONE — JSON mock data copied to assets (12+1 files; added MailCodes.json)
- Steps 5-10: DONE — Data models: CustomerEquipment, CompanyContact, ProjectCompany, Note/Attachment/NoteModification/NoteTag, Activity, Project/Address/ProjectOwner/AssociatedOpportunity/ExternalReference
- Steps 11-14: DONE — Data models: Opportunity/Product/ProductGroup, SalesRep, User, OpportunityStage, OpportunityType, LookupOption/LookupsData, ChangeLogEntry, Filters (all compile ✓)
- Step 15: DONE — JSON wrapper classes (ContentWrapper<T>)
- Step 16: DONE — Clean build verification passed
- Step 17: DONE — JsonDataSource.kt + supporting models (ActivityType, Campaign, Issue, ContactType, MailCode) + MailCodes.json asset
- Step 18: DONE — CrmRepository.kt (StateFlows, CRUD, revenue calcs, filtering, change log, lookup helpers) compile ✓
- Steps 19-21: DONE — Hilt DI: AppModule.kt, CrmApplication.kt, @AndroidEntryPoint on MainActivity, AndroidManifest updated. compile ✓
- Steps 22-23: DONE — Theme: Color.kt (brand/status/revenue/tag colors), Theme.kt (light+dark schemes, status bar tinting)
- Steps 24-27: DONE — Components: StatusBadge, EmptyState, LoadingState, ConfirmDialog, DatePickerField, DropdownField, MultiSelectField
- Steps 28-29: DONE — Navigation: Screen.kt (sealed routes), CrmNavigation.kt (NavHost), MainActivity wired up, 4 stub screens. Clean build ✓
- Steps 30-50: PENDING — Screens (ProjectList, ProjectDetail, CreateProject, EditProject)
