package com.jobsites.crm.data.repository

import com.jobsites.crm.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.Instant
import java.util.concurrent.atomic.AtomicInteger
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Division constants — same as web app.
 */
data class Division(val code: String, val name: String)

val DIVISIONS = listOf(
    Division("G", "General Line"),
    Division("C", "Compact"),
    Division("P", "Paving"),
    Division("R", "Heavy Rents"),
    Division("S", "Power Systems"),
    Division("V", "Rental Services"),
    Division("X", "Power Rental"),
)

fun getDivisionName(code: String): String =
    DIVISIONS.find { it.code == code }?.name ?: code

/**
 * Revenue breakdown by opportunity type.
 */
data class RevenueByType(
    val typeId: Int,
    val typeName: String,
    val revenue: Double
)

/**
 * Default note tags (matches web defaultNoteTags).
 */
val DEFAULT_NOTE_TAGS = listOf(
    NoteTag(id = "SAFETY", label = "Safety", displayOrder = 1, color = "red"),
    NoteTag(id = "SECURITY", label = "Security", displayOrder = 2, color = "amber"),
    NoteTag(id = "COMPLIANCE", label = "Compliance", displayOrder = 3, color = "sky"),
    NoteTag(id = "GENERAL", label = "General", displayOrder = 4, color = "slate"),
)

/**
 * Central repository — Kotlin equivalent of the web app's DataContext.
 *
 * All mutable state is exposed as [StateFlow]s; CRUD methods update those flows.
 * Data is loaded once from [JsonDataSource] at construction time.
 *
 * Excluded from the mobile prototype:
 *   - DodgeMappings (admin-only, desktop feature)
 *   - DataStore persistence (future enhancement)
 */
@Singleton
class CrmRepository @Inject constructor(
    private val dataSource: JsonDataSource
) {

    // ═══════════════════════════════════════════════════════════════════
    //  State flows
    // ═══════════════════════════════════════════════════════════════════

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects.asStateFlow()

    private val _opportunities = MutableStateFlow<List<Opportunity>>(emptyList())
    val opportunities: StateFlow<List<Opportunity>> = _opportunities.asStateFlow()

    private val _salesReps = MutableStateFlow<List<SalesRep>>(emptyList())
    val salesReps: StateFlow<List<SalesRep>> = _salesReps.asStateFlow()

    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    private val _opportunityStages = MutableStateFlow<List<OpportunityStage>>(emptyList())
    val opportunityStages: StateFlow<List<OpportunityStage>> = _opportunityStages.asStateFlow()

    private val _opportunityTypes = MutableStateFlow<List<OpportunityType>>(emptyList())
    val opportunityTypes: StateFlow<List<OpportunityType>> = _opportunityTypes.asStateFlow()

    private val _masterEquipment = MutableStateFlow<List<CustomerEquipment>>(emptyList())
    val masterEquipment: StateFlow<List<CustomerEquipment>> = _masterEquipment.asStateFlow()

    private val _filters = MutableStateFlow(Filters(hideCompleted = true))
    val filters: StateFlow<Filters> = _filters.asStateFlow()

    private val _noteTags = MutableStateFlow(DEFAULT_NOTE_TAGS)
    val noteTags: StateFlow<List<NoteTag>> = _noteTags.asStateFlow()

    private val _changeLog = MutableStateFlow<List<ChangeLogEntry>>(emptyList())
    val changeLog: StateFlow<List<ChangeLogEntry>> = _changeLog.asStateFlow()

    // Lookups
    private val _lookups = MutableStateFlow(LookupsData())
    val lookups: StateFlow<LookupsData> = _lookups.asStateFlow()

    // Reference data (read-only after load)
    private val _activityTypes = MutableStateFlow<List<ActivityType>>(emptyList())
    val activityTypes: StateFlow<List<ActivityType>> = _activityTypes.asStateFlow()

    private val _campaigns = MutableStateFlow<List<Campaign>>(emptyList())
    val campaigns: StateFlow<List<Campaign>> = _campaigns.asStateFlow()

    private val _issues = MutableStateFlow<List<Issue>>(emptyList())
    val issues: StateFlow<List<Issue>> = _issues.asStateFlow()

    private val _contactTypes = MutableStateFlow<List<ContactType>>(emptyList())
    val contactTypes: StateFlow<List<ContactType>> = _contactTypes.asStateFlow()

    private val _mailCodes = MutableStateFlow<List<MailCode>>(emptyList())
    val mailCodes: StateFlow<List<MailCode>> = _mailCodes.asStateFlow()

    // Current user
    private val _currentUserId = MutableStateFlow(313)
    val currentUserId: StateFlow<Int> = _currentUserId.asStateFlow()

    // Auto-incrementing IDs
    private val nextLogId = AtomicInteger(1)

    // ═══════════════════════════════════════════════════════════════════
    //  Initialization — load all JSON assets
    // ═══════════════════════════════════════════════════════════════════

    init {
        loadAllData()
    }

    private fun loadAllData() {
        _salesReps.value = dataSource.loadSalesReps()
        _users.value = dataSource.loadUsers()
        _opportunities.value = dataSource.loadOpportunities()
        _opportunityStages.value = dataSource.loadOpportunityStages()
        _opportunityTypes.value = dataSource.loadOpportunityTypes()
        _masterEquipment.value = dataSource.loadCompanyEquipment()
        _lookups.value = dataSource.loadLookups()
        _activityTypes.value = dataSource.loadActivityTypes()
        _campaigns.value = dataSource.loadCampaigns()
        _issues.value = dataSource.loadIssues()
        _contactTypes.value = dataSource.loadContactTypes()
        _mailCodes.value = dataSource.loadMailCodes()
        _projects.value = dataSource.loadProjects()
        _changeLog.value = seedChangeLog()
        nextLogId.set(_changeLog.value.size + 1)
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Change log
    // ═══════════════════════════════════════════════════════════════════

    private fun logChange(
        projectId: Int,
        action: String,
        category: String,
        summary: String,
        details: Map<String, String>? = null
    ) {
        val entry = ChangeLogEntry(
            id = nextLogId.getAndIncrement(),
            projectId = projectId,
            timestamp = Instant.now().toString(),
            action = action,
            category = category,
            summary = summary,
            changedById = _currentUserId.value,
            details = details
        )
        _changeLog.value = _changeLog.value + entry
    }

    fun getChangeLog(projectId: Int): List<ChangeLogEntry> =
        _changeLog.value.filter { it.projectId == projectId }

    fun setCurrentUserId(id: Int) {
        _currentUserId.value = id
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Filters
    // ═══════════════════════════════════════════════════════════════════

    fun setFilters(newFilters: Filters) {
        _filters.value = newFilters
    }

    fun getFilteredProjects(): List<Project> {
        val f = _filters.value
        val opps = _opportunities.value
        return _projects.value.filter { project ->
            if (f.hideCompleted && project.statusId == "Completed") return@filter false
            if (f.assigneeIds.isNotEmpty() &&
                project.assigneeIds.none { id -> f.assigneeIds.contains(id.toString()) }
            ) return@filter false
            if (f.statuses.isNotEmpty() && project.statusId !in f.statuses) return@filter false
            if (f.divisions.isNotEmpty()) {
                val projectOpps = project.associatedOpportunities
                    .mapNotNull { ao -> opps.find { it.id == ao.id } }
                val division = if (projectOpps.isNotEmpty()) projectOpps[0].divisionId else "E"
                if (division !in f.divisions) return@filter false
            }
            if (f.generalContractor.isNotBlank()) {
                val hasMatchingGC = project.projectCompanies.any { company ->
                    val roles = company.getAllRoleIds()
                    roles.contains("GC") &&
                            company.companyName.contains(f.generalContractor, ignoreCase = true)
                }
                if (!hasMatchingGC) return@filter false
            }
            true
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Lookup helpers
    // ═══════════════════════════════════════════════════════════════════

    fun getSalesRepName(id: Int): String {
        val rep = _salesReps.value.find { it.salesRepId == id }
        return if (rep != null) "${rep.lastName}, ${rep.firstName}" else "Unknown"
    }

    fun getSalesRepNames(ids: List<Int>): String =
        ids.joinToString("; ") { getSalesRepName(it) }

    fun getUserName(id: Int): String {
        val user = _users.value.find { it.id == id }
        return if (user != null) "${user.lastName}, ${user.firstName}" else "Unknown"
    }

    fun getUserNames(ids: List<Int>): String =
        ids.joinToString("; ") { getUserName(it) }

    fun getStageName(id: Int): String =
        _opportunityStages.value.find { it.stageId == id }?.stageName ?: "Unknown"

    fun getStage(id: Int): OpportunityStage? =
        _opportunityStages.value.find { it.stageId == id }

    fun getTypeName(typeId: Int): String =
        _opportunityTypes.value.find { it.oppTypeId == typeId }?.oppTypeDesc ?: "Unknown"

    fun getLookupLabel(type: String, id: String): String {
        val list = when (type) {
            "primaryStage" -> _lookups.value.primaryStages
            "primaryProjectType" -> _lookups.value.primaryProjectTypes
            "ownershipType" -> _lookups.value.ownershipTypes
            "uomTypes" -> _lookups.value.uomTypes
            else -> emptyList()
        }
        return list.find { it.id == id }?.label ?: id
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Revenue calculations
    // ═══════════════════════════════════════════════════════════════════

    fun calculateProjectRevenue(project: Project): Double =
        project.associatedOpportunities.sumOf { it.revenue }

    fun calculateProjectWonRevenue(project: Project): Double =
        project.associatedOpportunities
            .filter { it.stageId == 16 }
            .sumOf { it.revenue }

    fun calculateProjectPipelineRevenue(project: Project): Double {
        val stages = _opportunityStages.value
        return project.associatedOpportunities
            .filter { ao ->
                val stage = stages.find { it.stageId == ao.stageId }
                stage != null && (stage.phaseId == 1 || stage.phaseId == 2)
            }
            .sumOf { it.revenue }
    }

    fun getTotalPipelineRevenue(): Double =
        getFilteredProjects().sumOf { calculateProjectRevenue(it) }

    fun getWonRevenue(): Double {
        val result = classifyRevenue(getFilteredProjects())
        return result.wonTotal
    }

    fun getPipelineRevenue(): Double {
        val result = classifyRevenue(getFilteredProjects())
        return result.pipelineTotal
    }

    fun getRevenueByType(): List<RevenueByType> {
        val filtered = getFilteredProjects()
        val opps = _opportunities.value
        val revenueMap = mutableMapOf<Int, Double>()
        for (project in filtered) {
            for (ao in project.associatedOpportunities) {
                val opp = opps.find { it.id == ao.id }
                if (opp != null) {
                    revenueMap[opp.typeId] = (revenueMap[opp.typeId] ?: 0.0) + ao.revenue
                }
            }
        }
        return buildRevenueByType(revenueMap)
    }

    fun getWonRevenueByType(): List<RevenueByType> =
        buildRevenueByType(classifyRevenue(getFilteredProjects()).wonByType)

    fun getPipelineRevenueByType(): List<RevenueByType> =
        buildRevenueByType(classifyRevenue(getFilteredProjects()).pipelineByType)

    private data class ClassifiedRevenue(
        val wonTotal: Double,
        val pipelineTotal: Double,
        val wonByType: Map<Int, Double>,
        val pipelineByType: Map<Int, Double>
    )

    private fun classifyRevenue(filteredProjects: List<Project>): ClassifiedRevenue {
        val stages = _opportunityStages.value
        val opps = _opportunities.value
        var wonTotal = 0.0
        var pipelineTotal = 0.0
        val wonByType = mutableMapOf<Int, Double>()
        val pipelineByType = mutableMapOf<Int, Double>()

        for (project in filteredProjects) {
            for (ao in project.associatedOpportunities) {
                val opp = opps.find { it.id == ao.id } ?: continue
                val stage = stages.find { it.stageId == ao.stageId } ?: continue

                if (stage.stageId == 16) {
                    wonTotal += ao.revenue
                    wonByType[opp.typeId] = (wonByType[opp.typeId] ?: 0.0) + ao.revenue
                } else if (stage.phaseId == 1 || stage.phaseId == 2) {
                    pipelineTotal += ao.revenue
                    pipelineByType[opp.typeId] = (pipelineByType[opp.typeId] ?: 0.0) + ao.revenue
                }
            }
        }
        return ClassifiedRevenue(wonTotal, pipelineTotal, wonByType, pipelineByType)
    }

    private fun buildRevenueByType(revenueMap: Map<Int, Double>): List<RevenueByType> {
        val types = _opportunityTypes.value
        return revenueMap.entries
            .filter { it.value > 0.0 }
            .map { (typeId, revenue) ->
                val type = types.find { it.oppTypeId == typeId }
                RevenueByType(
                    typeId = typeId,
                    typeName = type?.oppTypeDesc ?: "Unknown",
                    revenue = revenue
                ) to (type?.displayOrder ?: 999)
            }
            .sortedBy { it.second }
            .map { it.first }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Company helpers
    // ═══════════════════════════════════════════════════════════════════

    fun getCompanyById(companyId: String): ProjectCompany? {
        for (project in _projects.value) {
            val company = project.projectCompanies.find { it.companyId == companyId }
            if (company != null) return company
        }
        return null
    }

    fun getAllKnownCompanies(): List<ProjectCompany> {
        val seen = mutableSetOf<String>()
        val result = mutableListOf<ProjectCompany>()
        for (project in _projects.value) {
            for (company in project.projectCompanies) {
                if (seen.add(company.companyId)) {
                    result.add(company)
                }
            }
        }
        return result.sortedBy { it.companyName }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Equipment helpers
    // ═══════════════════════════════════════════════════════════════════

    fun getEquipmentById(id: Int): CustomerEquipment? =
        _masterEquipment.value.find { it.id == id }

    fun getCompanyEquipment(companyId: String): List<CustomerEquipment> =
        _masterEquipment.value.filter { it.companyId == companyId }

    fun getEquipmentProjectAssignment(
        equipmentId: Int,
        excludeProjectId: Int? = null
    ): Pair<Int, String>? {
        for (p in _projects.value) {
            if (excludeProjectId != null && p.id == excludeProjectId) continue
            if (p.customerEquipment.contains(equipmentId)) {
                return p.id to p.name
            }
        }
        return null
    }

    fun addEquipmentToMaster(equipment: CustomerEquipment) {
        _masterEquipment.value = _masterEquipment.value + equipment
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Projects
    // ═══════════════════════════════════════════════════════════════════

    fun createProject(project: Project) {
        val newId = (_projects.value.maxOfOrNull { it.id } ?: 0) + 1
        val newProject = project.copy(id = newId)
        _projects.value = _projects.value + newProject
        logChange(newId, "PROJECT_CREATED", "Project", "Project \"${project.name}\" created")
    }

    fun updateProject(projectId: Int, transform: (Project) -> Project) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId) transform(p) else p
        }
        logChange(projectId, "PROJECT_UPDATED", "Project", "Project details updated")
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Project Companies
    // ═══════════════════════════════════════════════════════════════════

    fun addProjectCompany(projectId: Int, company: ProjectCompany) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(projectCompanies = p.projectCompanies + company)
            else p
        }
        logChange(
            projectId, "COMPANY_ADDED", "Company",
            "Company \"${company.companyName}\" added as ${company.roleDescription.ifEmpty { company.roleId }}"
        )
    }

    fun removeProjectCompany(projectId: Int, companyName: String) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(projectCompanies = p.projectCompanies.filter { it.companyName != companyName })
            else p
        }
        logChange(projectId, "COMPANY_REMOVED", "Company", "Company \"$companyName\" disassociated")
    }

    fun updateProjectCompany(projectId: Int, oldCompanyName: String, updated: ProjectCompany) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(projectCompanies = p.projectCompanies.map { c ->
                    if (c.companyName == oldCompanyName) updated else c
                })
            else p
        }
        logChange(projectId, "COMPANY_UPDATED", "Company", "Company \"${updated.companyName}\" updated")
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Opportunities
    // ═══════════════════════════════════════════════════════════════════

    fun addOpportunityToProject(projectId: Int, opportunityId: Int) {
        val opp = _opportunities.value.find { it.id == opportunityId } ?: return
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId && p.associatedOpportunities.none { it.id == opportunityId }) {
                p.copy(
                    associatedOpportunities = p.associatedOpportunities + AssociatedOpportunity(
                        id = opp.id,
                        type = if (opp.typeId == 1) "Sale" else "Rental",
                        description = opp.description,
                        stageId = opp.stageId,
                        revenue = opp.estimateRevenue
                    )
                )
            } else p
        }
        logChange(projectId, "OPPORTUNITY_ASSOCIATED", "Opportunity", "Opportunity \"${opp.description}\" associated")
    }

    fun createNewOpportunity(opportunity: Opportunity) {
        _opportunities.value = _opportunities.value + opportunity
        _projects.value = _projects.value.map { p ->
            if (p.id == opportunity.projectId) {
                p.copy(
                    associatedOpportunities = p.associatedOpportunities + AssociatedOpportunity(
                        id = opportunity.id,
                        type = if (opportunity.typeId == 1) "Sale" else "Rental",
                        description = opportunity.description,
                        stageId = opportunity.stageId,
                        revenue = opportunity.estimateRevenue
                    )
                )
            } else p
        }
        logChange(
            opportunity.projectId, "OPPORTUNITY_CREATED", "Opportunity",
            "Opportunity \"${opportunity.description}\" created"
        )
    }

    fun updateOpportunity(opportunityId: Int, transform: (Opportunity) -> Opportunity) {
        val existing = _opportunities.value.find { it.id == opportunityId }
        _opportunities.value = _opportunities.value.map { o ->
            if (o.id == opportunityId) transform(o) else o
        }
        if (existing != null) {
            logChange(
                existing.projectId, "OPPORTUNITY_UPDATED", "Opportunity",
                "Opportunity \"${existing.description}\" updated"
            )
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Activities
    // ═══════════════════════════════════════════════════════════════════

    fun addActivity(projectId: Int, activity: Activity) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId) {
                val maxId = p.activities.maxOfOrNull { it.id } ?: 0
                val newActivity = activity.copy(id = maxId + 1)
                p.copy(activities = p.activities + newActivity)
            } else p
        }
        logChange(projectId, "ACTIVITY_ADDED", "Activity", "Activity \"${activity.typeId}\" added")
    }

    fun updateActivity(projectId: Int, activityId: Int, transform: (Activity) -> Activity) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(activities = p.activities.map { a ->
                    if (a.id == activityId) transform(a) else a
                })
            else p
        }
        logChange(projectId, "ACTIVITY_UPDATED", "Activity", "Activity updated")
    }

    fun deleteActivity(projectId: Int, activityId: Int) {
        var desc = ""
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId) {
                desc = p.activities.find { it.id == activityId }?.typeId ?: ""
                p.copy(activities = p.activities.filter { it.id != activityId })
            } else p
        }
        logChange(projectId, "ACTIVITY_DELETED", "Activity", "Activity \"$desc\" deleted")
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Notes
    // ═══════════════════════════════════════════════════════════════════

    fun addNote(projectId: Int, noteData: Note) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId) {
                val maxId = p.notes.maxOfOrNull { it.id } ?: 0
                val newNote = noteData.copy(
                    id = maxId + 1,
                    createdAt = Instant.now().toString(),
                    createdById = _currentUserId.value
                )
                p.copy(notes = p.notes + newNote)
            } else p
        }
        logChange(projectId, "NOTE_ADDED", "Note", "Note added")
    }

    fun updateNote(projectId: Int, noteId: Int, transform: (Note) -> Note) {
        val now = Instant.now().toString()
        val userId = _currentUserId.value

        _projects.value = _projects.value.map { p ->
            if (p.id == projectId) {
                p.copy(notes = p.notes.map { note ->
                    if (note.id == noteId) {
                        val updated = transform(note)
                        // Build modification history entry
                        val changes = mutableListOf<String>()
                        if (updated.content != note.content) changes.add("Content updated")
                        if (updated.tagIds != note.tagIds) changes.add("Tags changed")
                        if (updated.attachments != note.attachments) changes.add("Attachments changed")
                        val summary = if (changes.isNotEmpty()) changes.joinToString(", ") else "Note updated"

                        val modification = NoteModification(
                            modifiedAt = now,
                            modifiedById = userId,
                            summary = summary,
                            previousContent = if (updated.content != note.content) note.content else null,
                            previousTagIds = if (updated.tagIds != note.tagIds) note.tagIds else null
                        )
                        updated.copy(
                            lastModifiedAt = now,
                            lastModifiedById = userId,
                            modificationHistory = (note.modificationHistory ?: emptyList()) + modification
                        )
                    } else note
                })
            } else p
        }
        logChange(projectId, "NOTE_UPDATED", "Note", "Note updated")
    }

    fun deleteNote(projectId: Int, noteId: Int) {
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(notes = p.notes.filter { it.id != noteId })
            else p
        }
        logChange(projectId, "NOTE_DELETED", "Note", "Note deleted")
    }

    fun setNoteTags(tags: List<NoteTag>) {
        _noteTags.value = tags
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CRUD — Equipment on projects
    // ═══════════════════════════════════════════════════════════════════

    fun addCustomerEquipment(projectId: Int, equipmentId: Int) {
        val eq = getEquipmentById(equipmentId)
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId && !p.customerEquipment.contains(equipmentId))
                p.copy(customerEquipment = p.customerEquipment + equipmentId)
            else p
        }
        val label = if (eq != null) "${eq.make} ${eq.model}" else equipmentId.toString()
        logChange(projectId, "EQUIPMENT_ADDED", "Equipment", "Equipment \"$label\" added")
    }

    fun deleteCustomerEquipment(projectId: Int, equipmentId: Int) {
        val eq = getEquipmentById(equipmentId)
        _projects.value = _projects.value.map { p ->
            if (p.id == projectId)
                p.copy(customerEquipment = p.customerEquipment.filter { it != equipmentId })
            else p
        }
        val label = if (eq != null) "${eq.make} ${eq.model}" else equipmentId.toString()
        logChange(projectId, "EQUIPMENT_DELETED", "Equipment", "Equipment \"$label\" removed")
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Seed change log (matches web's seedChangeLog)
    // ═══════════════════════════════════════════════════════════════════

    private fun seedChangeLog(): List<ChangeLogEntry> = listOf(
        ChangeLogEntry(1, 500101, "2025-11-02T09:15:00Z", "PROJECT_CREATED", "Project", "Project \"Highway 50 Expansion\" created", 313),
        ChangeLogEntry(2, 500101, "2025-11-03T14:22:00Z", "COMPANY_ADDED", "Company", "Company \"Walsh Construction\" added as General Contractor", 313),
        ChangeLogEntry(3, 500101, "2025-11-05T10:45:00Z", "OPPORTUNITY_CREATED", "Opportunity", "Opportunity \"D6 Dozer rental for clearing phase\" created", 260),
        ChangeLogEntry(4, 500101, "2025-11-08T16:30:00Z", "EQUIPMENT_ADDED", "Equipment", "Equipment \"Caterpillar 320F\" added", 260),
        ChangeLogEntry(5, 500101, "2025-11-12T08:10:00Z", "NOTE_ADDED", "Note", "Note added", 313),
        ChangeLogEntry(6, 500101, "2025-11-15T11:05:00Z", "PROJECT_UPDATED", "Project", "Project details updated (statusId)", 292),
        ChangeLogEntry(7, 500101, "2025-11-18T13:40:00Z", "ACTIVITY_ADDED", "Activity", "Activity \"Site Visit\" added", 260),
        ChangeLogEntry(8, 500101, "2025-11-22T09:55:00Z", "COMPANY_ADDED", "Company", "Company \"Rosendin Electric\" added as Subcontractor - Electrical", 313),
        ChangeLogEntry(9, 500101, "2025-12-01T15:20:00Z", "OPPORTUNITY_UPDATED", "Opportunity", "Opportunity \"D6 Dozer rental for clearing phase\" updated (stageId, estimateRevenue)", 292),
        ChangeLogEntry(10, 500101, "2025-12-05T10:30:00Z", "EQUIPMENT_DELETED", "Equipment", "Equipment \"Komatsu PC210\" removed", 260),
        ChangeLogEntry(11, 500101, "2025-12-10T14:15:00Z", "COMPANY_REMOVED", "Company", "Company \"Rosendin Electric\" disassociated", 313),
        ChangeLogEntry(12, 500101, "2025-12-15T08:45:00Z", "NOTE_UPDATED", "Note", "Note updated", 292),
        ChangeLogEntry(13, 500102, "2025-10-20T09:00:00Z", "PROJECT_CREATED", "Project", "Project \"Metro Line Extension\" created", 262),
        ChangeLogEntry(14, 500102, "2025-10-25T11:30:00Z", "COMPANY_ADDED", "Company", "Company \"Turner Construction\" added as Subcontractor - Steel", 262),
        ChangeLogEntry(15, 500102, "2025-11-01T14:00:00Z", "OPPORTUNITY_CREATED", "Opportunity", "Opportunity \"Excavator fleet for foundation work\" created", 303),
        ChangeLogEntry(16, 500102, "2025-11-10T16:20:00Z", "ACTIVITY_ADDED", "Activity", "Activity \"Phone Call\" added", 262),
        ChangeLogEntry(17, 500102, "2025-11-20T10:10:00Z", "EQUIPMENT_ADDED", "Equipment", "Equipment \"Volvo EC220E\" added", 303),
        ChangeLogEntry(18, 500102, "2025-12-02T13:45:00Z", "PROJECT_UPDATED", "Project", "Project details updated (description)", 262),
        ChangeLogEntry(19, 500103, "2025-09-15T08:30:00Z", "PROJECT_CREATED", "Project", "Project \"Riverside Commercial Park\" created", 304),
        ChangeLogEntry(20, 500103, "2025-09-20T12:00:00Z", "OPPORTUNITY_CREATED", "Opportunity", "Opportunity \"Paving equipment package\" created", 304),
        ChangeLogEntry(21, 500103, "2025-10-05T09:15:00Z", "COMPANY_ADDED", "Company", "Company \"Curran Contracting\" added as Subcontractor - Paving", 305),
        ChangeLogEntry(22, 500103, "2025-10-15T15:30:00Z", "NOTE_ADDED", "Note", "Note added", 304),
        ChangeLogEntry(23, 500103, "2025-11-01T10:45:00Z", "EQUIPMENT_ADDED", "Equipment", "Equipment \"Case SV340B\" added", 305),
        ChangeLogEntry(24, 500103, "2025-11-20T14:00:00Z", "ACTIVITY_ADDED", "Activity", "Activity \"Email\" added", 304),
        ChangeLogEntry(25, 500104, "2025-10-01T08:00:00Z", "PROJECT_CREATED", "Project", "Project created", 292),
        ChangeLogEntry(26, 500104, "2025-10-10T11:20:00Z", "OPPORTUNITY_CREATED", "Opportunity", "Opportunity \"Generator rental for temp power\" created", 292),
        ChangeLogEntry(27, 500104, "2025-10-18T14:30:00Z", "COMPANY_ADDED", "Company", "Company added as General Contractor", 292),
        ChangeLogEntry(28, 500104, "2025-11-05T09:00:00Z", "PROJECT_UPDATED", "Project", "Project details updated (statusId)", 313),
        ChangeLogEntry(29, 500105, "2025-08-20T10:00:00Z", "PROJECT_CREATED", "Project", "Project created", 305),
        ChangeLogEntry(30, 500105, "2025-09-01T13:15:00Z", "COMPANY_ADDED", "Company", "Company \"Rosendin Electric\" added as Subcontractor - Electrical", 305),
        ChangeLogEntry(31, 500105, "2025-09-15T16:45:00Z", "OPPORTUNITY_CREATED", "Opportunity", "Opportunity \"Boom lift rental\" created", 262),
        ChangeLogEntry(32, 500105, "2025-10-01T08:30:00Z", "EQUIPMENT_ADDED", "Equipment", "Equipment \"JLG 800S\" added", 305),
        ChangeLogEntry(33, 500105, "2025-10-20T11:00:00Z", "ACTIVITY_ADDED", "Activity", "Activity \"Site Inspection\" added", 262),
        ChangeLogEntry(34, 500105, "2025-11-10T14:30:00Z", "NOTE_ADDED", "Note", "Note added", 305),
    )
}
