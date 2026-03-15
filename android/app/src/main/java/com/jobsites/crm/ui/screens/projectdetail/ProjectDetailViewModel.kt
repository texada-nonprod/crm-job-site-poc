package com.jobsites.crm.ui.screens.projectdetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.Activity
import com.jobsites.crm.data.model.ActivityType
import com.jobsites.crm.data.model.Attachment
import com.jobsites.crm.data.model.Campaign
import com.jobsites.crm.data.model.ChangeLogEntry
import com.jobsites.crm.data.model.CompanyContact
import com.jobsites.crm.data.model.ContactType
import com.jobsites.crm.data.model.CustomerEquipment
import com.jobsites.crm.data.model.Issue
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.data.model.OpportunityStage
import com.jobsites.crm.data.model.OpportunityType
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.data.model.SalesRep
import com.jobsites.crm.data.repository.CrmRepository
import com.jobsites.crm.data.repository.DIVISIONS
import com.jobsites.crm.data.repository.Division
import java.time.Instant
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class ProjectDetailUiState(
    val project: Project? = null,
    val opportunities: List<Opportunity> = emptyList(),
    val equipment: List<CustomerEquipment> = emptyList(),
    val changeLog: List<ChangeLogEntry> = emptyList(),
    val isLoading: Boolean = true
)

@HiltViewModel
class ProjectDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CrmRepository
) : ViewModel() {

    private val projectId: Int = savedStateHandle["projectId"] ?: 0

    private val _uiState = MutableStateFlow(ProjectDetailUiState())
    val uiState: StateFlow<ProjectDetailUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        val project = repository.projects.value.find { it.id == projectId }
        val oppIds = project?.associatedOpportunities?.map { it.id } ?: emptyList()
        val opportunities = repository.opportunities.value.filter { it.id in oppIds }
        val equipment = project?.customerEquipment
            ?.mapNotNull { id -> repository.getEquipmentById(id) }
            ?: emptyList()
        val changeLog = repository.getChangeLog(projectId).sortedByDescending { it.timestamp }

        _uiState.value = ProjectDetailUiState(
            project = project,
            opportunities = opportunities,
            equipment = equipment,
            changeLog = changeLog,
            isLoading = false
        )
    }

    // ── Name resolution helpers ─────────────────────────────────────

    fun getUserName(id: Int): String = repository.getUserName(id)
    fun getSalesRepName(id: Int): String = repository.getSalesRepName(id)
    fun getStageName(id: Int): String = repository.getStageName(id)
    fun getTypeName(typeId: Int): String = repository.getTypeName(typeId)
    fun getLookupLabel(type: String, id: String): String = repository.getLookupLabel(type, id)
    fun getCompanyById(companyId: String): ProjectCompany? = repository.getCompanyById(companyId)
    fun getCompanyNameById(companyId: String): String =
        repository.getCompanyById(companyId)?.companyName ?: companyId

    // ── Revenue helpers ─────────────────────────────────────────────

    fun getProjectRevenue(): Double =
        _uiState.value.project?.let { repository.calculateProjectRevenue(it) } ?: 0.0

    fun getProjectWonRevenue(): Double =
        _uiState.value.project?.let { repository.calculateProjectWonRevenue(it) } ?: 0.0

    fun getProjectPipelineRevenue(): Double =
        _uiState.value.project?.let { repository.calculateProjectPipelineRevenue(it) } ?: 0.0

    // ── Equipment helpers ───────────────────────────────────────────

    fun getEquipmentById(id: Int): CustomerEquipment? = repository.getEquipmentById(id)

    // ── CRUD operations ─────────────────────────────────────────────

    fun deleteActivity(activityId: Int) {
        repository.deleteActivity(projectId, activityId)
        refresh()
    }

    // ── Activity CRUD ───────────────────────────────────────────────

    fun getSalesReps(): List<SalesRep> = repository.salesReps.value

    fun getActivityTypes(): List<ActivityType> = repository.activityTypes.value

    fun getCampaigns(): List<Campaign> = repository.campaigns.value

    fun getIssues(): List<Issue> = repository.issues.value

    fun getProjectContactNames(): List<String> {
        val project = _uiState.value.project ?: return emptyList()
        return project.projectCompanies.flatMap { company ->
            company.companyContacts.map { "${it.firstName} ${it.lastName}".trim() }
        }.distinct().sorted()
    }

    fun addActivity(
        salesRepId: Int,
        typeId: String,
        date: String,
        description: String,
        contactName: String,
        notes: String,
        campaignId: Int?,
        customerId: String?,
        issueId: Int?
    ) {
        val isPast = runCatching {
            java.time.LocalDate.parse(date.take(10)).isBefore(java.time.LocalDate.now())
        }.getOrDefault(false)
        val activity = Activity(
            id = 0,
            statusId = if (isPast) 2 else 1,
            salesRepId = salesRepId,
            typeId = typeId,
            date = "${date.take(10)}T00:00:00.000Z",
            description = description,
            contactName = contactName,
            notes = notes,
            campaignId = campaignId,
            customerId = customerId,
            issueId = issueId
        )
        repository.addActivity(projectId, activity)
        refresh()
    }

    fun updateActivity(
        activityId: Int,
        salesRepId: Int,
        typeId: String,
        date: String,
        description: String,
        contactName: String,
        notes: String,
        campaignId: Int?,
        customerId: String?,
        issueId: Int?
    ) {
        val isPast = runCatching {
            java.time.LocalDate.parse(date.take(10)).isBefore(java.time.LocalDate.now())
        }.getOrDefault(false)
        repository.updateActivity(projectId, activityId) { existing ->
            existing.copy(
                salesRepId = salesRepId,
                typeId = typeId,
                date = "${date.take(10)}T00:00:00.000Z",
                statusId = if (isPast) 2 else 1,
                description = description,
                contactName = contactName,
                notes = notes,
                campaignId = campaignId,
                customerId = customerId,
                issueId = issueId
            )
        }
        refresh()
    }

    fun deleteNote(noteId: Int) {
        repository.deleteNote(projectId, noteId)
        refresh()
    }

    fun deleteEquipment(equipmentId: Int) {
        repository.deleteCustomerEquipment(projectId, equipmentId)
        refresh()
    }

    fun removeCompany(companyName: String) {
        repository.removeProjectCompany(projectId, companyName)
        refresh()
    }

    // ── Note CRUD ─────────────────────────────────────────────────

    fun addNote(content: String, tagIds: List<String>, attachments: List<Attachment> = emptyList()) {
        val note = Note(
            id = 0,
            content = content,
            createdAt = "",
            createdById = 0,
            tagIds = tagIds,
            attachments = attachments
        )
        repository.addNote(projectId, note)
        refresh()
    }

    fun updateNote(noteId: Int, content: String, tagIds: List<String>, attachments: List<Attachment> = emptyList()) {
        repository.updateNote(projectId, noteId) { existing ->
            existing.copy(content = content, tagIds = tagIds, attachments = attachments)
        }
        refresh()
    }

    // ── Opportunity CRUD ──────────────────────────────────────────

    fun getDivisions(): List<Division> = DIVISIONS

    fun getOpportunityStages(): List<OpportunityStage> =
        repository.opportunityStages.value

    fun getOpportunityTypes(): List<OpportunityType> =
        repository.opportunityTypes.value

    fun getOpportunityById(id: Int): Opportunity? =
        repository.opportunities.value.find { it.id == id }

    fun createOpportunity(
        description: String,
        revenue: Double,
        divisionId: String,
        typeId: Int,
        stageId: Int
    ) {
        val now = Instant.now().toString()
        val stages = repository.opportunityStages.value
        val stage = stages.find { it.stageId == stageId }
        val newId = (repository.opportunities.value.maxOfOrNull { it.id } ?: 0) + 1
        val currentUser = repository.currentUserId.value
        val firstRep = repository.salesReps.value.firstOrNull()?.salesRepId ?: currentUser

        val opp = Opportunity(
            id = newId,
            description = description,
            estimateRevenue = revenue,
            divisionId = divisionId,
            typeId = typeId,
            stageId = stageId,
            phaseId = stage?.phaseId ?: 1,
            projectId = projectId,
            salesRepId = firstRep,
            ownerUserId = currentUser,
            originatorUserId = currentUser,
            enterDate = now,
            changeDate = now
        )
        repository.createNewOpportunity(opp)
        refresh()
    }

    fun updateOpportunity(
        oppId: Int,
        description: String,
        revenue: Double,
        divisionId: String,
        typeId: Int,
        stageId: Int,
        estMonth: Int?,
        estYear: Int?
    ) {
        val stages = repository.opportunityStages.value
        val stage = stages.find { it.stageId == stageId }
        repository.updateOpportunity(oppId) { existing ->
            existing.copy(
                description = description,
                estimateRevenue = revenue,
                divisionId = divisionId,
                typeId = typeId,
                stageId = stageId,
                phaseId = stage?.phaseId ?: existing.phaseId,
                estimateDeliveryMonth = estMonth,
                estimateDeliveryYear = estYear,
                changeDate = Instant.now().toString()
            )
        }
        refresh()
    }

    // ── Company CRUD ────────────────────────────────────────────────

    fun getAllKnownCompanies(): List<ProjectCompany> =
        repository.getAllKnownCompanies()

    fun associateCompany(company: ProjectCompany, roleIds: List<String>) {
        val roleDescriptions = roleIds.map { roleId ->
            com.jobsites.crm.ui.screens.projectdetail.components.ROLE_OPTIONS
                .find { it.id == roleId }?.label ?: roleId
        }
        val updated = company.copy(
            roleIds = roleIds,
            roleDescriptions = roleDescriptions,
            roleId = roleIds.firstOrNull() ?: "",
            roleDescription = roleDescriptions.firstOrNull() ?: ""
        )
        repository.addProjectCompany(projectId, updated)
        refresh()
    }

    fun addContactToCompany(companyName: String, contact: CompanyContact) {
        val project = _uiState.value.project ?: return
        val company = project.projectCompanies.find { it.companyName == companyName } ?: return
        val maxId = company.companyContacts.maxOfOrNull { it.id } ?: 0
        val newContact = contact.copy(id = maxId + 1)
        val updatedCompany = company.copy(
            companyContacts = company.companyContacts + newContact
        )
        repository.updateProjectCompany(projectId, companyName, updatedCompany)
        refresh()
    }

    fun getContactTypes(): List<ContactType> =
        repository.contactTypes.value

    fun getProjectId(): Int = projectId

    fun getCurrentUserId(): Int = repository.currentUserId.value

    // ── Equipment CRUD ──────────────────────────────────────────────

    fun getCompanyEquipment(companyId: String): List<CustomerEquipment> =
        repository.getCompanyEquipment(companyId)

    fun addEquipment(equipmentId: Int) {
        repository.addCustomerEquipment(projectId, equipmentId)
        refresh()
    }

    fun getEquipmentProjectAssignment(equipmentId: Int): Pair<Int, String>? =
        repository.getEquipmentProjectAssignment(equipmentId, excludeProjectId = projectId)

    fun createEquipment(
        companyId: String,
        equipmentType: String,
        make: String,
        model: String,
        serialNumber: String,
        year: Int,
        ownershipStatus: String,
        smu: Int?
    ) {
        val newId = (repository.masterEquipment.value.maxOfOrNull { it.id } ?: 0) + 1
        val equipment = CustomerEquipment(
            id = newId,
            companyId = companyId,
            equipmentType = equipmentType,
            make = make,
            model = model,
            year = year,
            serialNumber = serialNumber,
            smu = smu,
            ownershipStatus = ownershipStatus
        )
        repository.addEquipmentToMaster(equipment)
        repository.addCustomerEquipment(projectId, newId)
        refresh()
    }
}
