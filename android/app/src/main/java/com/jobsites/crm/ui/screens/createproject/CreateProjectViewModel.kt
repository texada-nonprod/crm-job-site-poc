package com.jobsites.crm.ui.screens.createproject

import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.Address
import com.jobsites.crm.data.model.LookupOption
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.data.model.ProjectOwner
import com.jobsites.crm.data.model.User
import com.jobsites.crm.data.repository.CrmRepository
import com.jobsites.crm.ui.screens.shared.FormValidationError
import com.jobsites.crm.ui.screens.shared.ProjectFormState
import com.jobsites.crm.ui.screens.shared.validateProjectForm
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class CreateProjectUiState(
    val form: ProjectFormState = ProjectFormState(),
    val users: List<User> = emptyList(),
    val primaryStages: List<LookupOption> = emptyList(),
    val primaryProjectTypes: List<LookupOption> = emptyList(),
    val ownershipTypes: List<LookupOption> = emptyList(),
    val error: String? = null,
    val createdProjectId: Int? = null
)

@HiltViewModel
class CreateProjectViewModel @Inject constructor(
    private val repository: CrmRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CreateProjectUiState())
    val uiState: StateFlow<CreateProjectUiState> = _uiState.asStateFlow()

    init {
        val lookups = repository.lookups.value
        _uiState.value = _uiState.value.copy(
            users = repository.users.value,
            primaryStages = lookups.primaryStages,
            primaryProjectTypes = lookups.primaryProjectTypes,
            ownershipTypes = lookups.ownershipTypes
        )
    }

    fun onFormChange(form: ProjectFormState) {
        _uiState.value = _uiState.value.copy(form = form, error = null)
    }

    fun submit(): Int? {
        val form = _uiState.value.form
        val validationError: FormValidationError? = validateProjectForm(form, requireName = true)
        if (validationError != null) {
            _uiState.value = _uiState.value.copy(error = validationError.message)
            return null
        }

        val valuation = form.valuation.replace(",", "").toDoubleOrNull()?.toLong()

        val project = Project(
            id = 0, // will be assigned by repository
            name = form.name.trim(),
            description = form.description.trim(),
            statusId = form.statusId,
            assigneeIds = form.assigneeIds.mapNotNull { it.toIntOrNull() },
            projectOwner = ProjectOwner(),
            address = Address(
                street = form.street.trim(),
                city = form.city.trim(),
                state = form.state.trim(),
                zipCode = form.zipCode.trim(),
                country = form.country.trim()
            ),
            valuation = valuation,
            ownershipTypeId = form.ownershipTypeId.takeIf { it.isNotBlank() },
            primaryStageId = form.primaryStageId.takeIf { it.isNotBlank() },
            primaryProjectTypeId = form.primaryProjectTypeId.takeIf { it.isNotBlank() },
            bidDate = form.bidDate,
            targetStartDate = form.targetStartDate,
            targetCompletionDate = form.targetCompletionDate
        )

        repository.createProject(project)

        // The new project gets the next available ID
        val newId = repository.projects.value.maxOfOrNull { it.id } ?: 0
        _uiState.value = _uiState.value.copy(createdProjectId = newId)
        return newId
    }
}
