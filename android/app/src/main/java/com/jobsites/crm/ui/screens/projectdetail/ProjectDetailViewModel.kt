package com.jobsites.crm.ui.screens.projectdetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.Activity
import com.jobsites.crm.data.model.ChangeLogEntry
import com.jobsites.crm.data.model.CustomerEquipment
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.data.repository.CrmRepository
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
}
