package com.jobsites.crm.ui.screens.projectlist

import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.Filters
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.data.model.User
import com.jobsites.crm.data.repository.CrmRepository
import com.jobsites.crm.ui.components.DropdownOption
import com.jobsites.crm.data.repository.RevenueByType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

enum class SortColumn {
    NAME, STATUS, WON_REVENUE, PIPELINE_REVENUE, ASSIGNEE, ADDRESS
}

enum class SortDirection { ASC, DESC }

data class ProjectListUiState(
    val projects: List<Project> = emptyList(),
    val searchQuery: String = "",
    val sortColumn: SortColumn = SortColumn.STATUS,
    val sortDirection: SortDirection = SortDirection.ASC,
    val filters: Filters = Filters(hideCompleted = true),
    val wonRevenue: Double = 0.0,
    val pipelineRevenue: Double = 0.0,
    val wonRevenueByType: List<RevenueByType> = emptyList(),
    val pipelineRevenueByType: List<RevenueByType> = emptyList(),
    val isLoading: Boolean = false
)

@HiltViewModel
class ProjectListViewModel @Inject constructor(
    private val repository: CrmRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProjectListUiState(isLoading = true))
    val uiState: StateFlow<ProjectListUiState> = _uiState.asStateFlow()

    // Status sort priority: Active=1, Planning=2, On Hold=3, Completed=99
    private val statusOrder = mapOf(
        "Active" to 1, "Planning" to 2, "On Hold" to 3, "Completed" to 99
    )

    init {
        refresh()
    }

    fun refresh() {
        val filtered = repository.getFilteredProjects()
        val searched = applySearch(filtered, _uiState.value.searchQuery)
        val sorted = applySort(searched, _uiState.value.sortColumn, _uiState.value.sortDirection)

        _uiState.value = _uiState.value.copy(
            projects = sorted,
            filters = repository.filters.value,
            wonRevenue = repository.getWonRevenue(),
            pipelineRevenue = repository.getPipelineRevenue(),
            wonRevenueByType = repository.getWonRevenueByType(),
            pipelineRevenueByType = repository.getPipelineRevenueByType(),
            isLoading = false
        )
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        recompute()
    }

    fun onSortChange(column: SortColumn) {
        val current = _uiState.value
        val newDirection = if (current.sortColumn == column) {
            if (current.sortDirection == SortDirection.ASC) SortDirection.DESC else SortDirection.ASC
        } else {
            SortDirection.ASC
        }
        _uiState.value = current.copy(sortColumn = column, sortDirection = newDirection)
        recompute()
    }

    fun onFiltersChange(filters: Filters) {
        repository.setFilters(filters)
        _uiState.value = _uiState.value.copy(filters = filters)
        recompute()
    }

    fun clearFilters() {
        val cleared = Filters(hideCompleted = true)
        repository.setFilters(cleared)
        _uiState.value = _uiState.value.copy(filters = cleared)
        recompute()
    }

    // ── Helpers ──────────────────────────────────────────────────────

    // TODO: In production, this should call the user search API endpoint
    suspend fun searchUsers(query: String): List<DropdownOption> =
        repository.searchUsers(query).map {
            DropdownOption(it.id.toString(), "${it.lastName}, ${it.firstName}")
        }

    fun getUserLabelMap(): Map<String, String> =
        repository.users.value.associate { it.id.toString() to "${it.lastName}, ${it.firstName}" }

    fun getAssigneeName(id: Int): String = repository.getUserName(id)
    fun getWonRevenue(project: Project): Double = repository.calculateProjectWonRevenue(project)
    fun getPipelineRevenue(project: Project): Double = repository.calculateProjectPipelineRevenue(project)
    fun getTotalRevenue(project: Project): Double = repository.calculateProjectRevenue(project)

    private fun recompute() {
        val filtered = repository.getFilteredProjects()
        val searched = applySearch(filtered, _uiState.value.searchQuery)
        val sorted = applySort(searched, _uiState.value.sortColumn, _uiState.value.sortDirection)
        _uiState.value = _uiState.value.copy(
            projects = sorted,
            wonRevenue = repository.getWonRevenue(),
            pipelineRevenue = repository.getPipelineRevenue(),
            wonRevenueByType = repository.getWonRevenueByType(),
            pipelineRevenueByType = repository.getPipelineRevenueByType()
        )
    }

    private fun applySearch(projects: List<Project>, query: String): List<Project> {
        if (query.isBlank()) return projects
        val lower = query.lowercase()
        return projects.filter { it.name.lowercase().contains(lower) }
    }

    private fun applySort(
        projects: List<Project>,
        column: SortColumn,
        direction: SortDirection
    ): List<Project> {
        val comparator: Comparator<Project> = when (column) {
            SortColumn.NAME -> compareBy { it.name.lowercase() }
            SortColumn.STATUS -> compareBy { statusOrder[it.statusId] ?: 50 }
            SortColumn.WON_REVENUE -> compareBy { repository.calculateProjectWonRevenue(it) }
            SortColumn.PIPELINE_REVENUE -> compareBy { repository.calculateProjectPipelineRevenue(it) }
            SortColumn.ASSIGNEE -> compareBy {
                it.assigneeIds.firstOrNull()?.let { id -> repository.getUserName(id) } ?: ""
            }
            SortColumn.ADDRESS -> compareBy { "${it.address.city}, ${it.address.state}".lowercase() }
        }
        return if (direction == SortDirection.DESC) {
            projects.sortedWith(comparator.reversed())
        } else {
            projects.sortedWith(comparator)
        }
    }
}
