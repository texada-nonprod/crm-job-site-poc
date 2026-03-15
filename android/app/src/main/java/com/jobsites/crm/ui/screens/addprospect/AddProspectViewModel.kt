package com.jobsites.crm.ui.screens.addprospect

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.CompanyContact
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.data.repository.CrmRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class ProspectFormState(
    // Company
    val companyName: String = "",
    val phone: String = "",
    val divisionIds: List<String> = emptyList(),
    val roleIds: List<String> = emptyList(),
    // Address
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zip: String = "",
    val country: String = "US",
    // Primary Contact
    val firstName: String = "",
    val lastName: String = "",
    val title: String = "",
    val mobilePhone: String = "",
    val email: String = "",
    // Status
    val error: String? = null,
    val isSaved: Boolean = false
)

@HiltViewModel
class AddProspectViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CrmRepository
) : ViewModel() {

    val projectId: Int = savedStateHandle["projectId"] ?: 0

    private val _form = MutableStateFlow(ProspectFormState())
    val form: StateFlow<ProspectFormState> = _form.asStateFlow()

    fun updateField(update: ProspectFormState.() -> ProspectFormState) {
        _form.value = _form.value.update().copy(error = null)
    }

    fun submit() {
        val f = _form.value

        // Validate
        if (f.companyName.isBlank()) { _form.value = f.copy(error = "Company name is required."); return }
        if (f.phone.isBlank()) { _form.value = f.copy(error = "Phone is required."); return }
        if (f.divisionIds.isEmpty()) { _form.value = f.copy(error = "Select at least one division."); return }
        if (f.roleIds.isEmpty()) { _form.value = f.copy(error = "Select at least one role."); return }
        if (f.street.isBlank()) { _form.value = f.copy(error = "Street is required."); return }
        if (f.city.isBlank()) { _form.value = f.copy(error = "City is required."); return }
        if (f.firstName.isBlank()) { _form.value = f.copy(error = "First name is required."); return }
        if (f.lastName.isBlank()) { _form.value = f.copy(error = "Last name is required."); return }
        if (f.title.isBlank()) { _form.value = f.copy(error = "Title is required."); return }
        if (f.mobilePhone.isBlank()) { _form.value = f.copy(error = "Mobile phone is required."); return }
        if (f.email.isBlank() || !f.email.contains("@")) { _form.value = f.copy(error = "Valid email is required."); return }

        // Generate prospect company ID ($ prefix like web app)
        val existingIds = repository.getAllKnownCompanies().map { it.companyId }
        var prospectNum = existingIds.size + 1
        var newId = "\$PROSPECT-$prospectNum"
        while (newId in existingIds) {
            prospectNum++
            newId = "\$PROSPECT-$prospectNum"
        }

        // Build contact
        val contact = CompanyContact(
            id = 1,
            name = "${f.firstName.trim()} ${f.lastName.trim()}",
            firstName = f.firstName.trim(),
            lastName = f.lastName.trim(),
            title = f.title.trim(),
            phone = f.phone.trim(),
            mobilePhone = f.mobilePhone.trim(),
            email = f.email.trim(),
            address1 = f.street.trim(),
            city = f.city.trim(),
            state = f.state.trim(),
            zipCode = f.zip.trim()
        )

        // Build company
        val company = ProjectCompany(
            companyId = newId,
            companyName = f.companyName.trim(),
            roleIds = f.roleIds,
            roleDescriptions = f.roleIds.map { roleId ->
                com.jobsites.crm.ui.screens.projectdetail.components.ROLE_OPTIONS
                    .find { it.id == roleId }?.label ?: roleId
            },
            companyContacts = listOf(contact),
            divisionIds = f.divisionIds,
            primaryContactIndex = 0
        )

        repository.addProjectCompany(projectId, company)
        _form.value = f.copy(isSaved = true, error = null)
    }
}
