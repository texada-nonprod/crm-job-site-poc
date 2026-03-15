package com.jobsites.crm.ui.screens.shared

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.LookupOption
import com.jobsites.crm.data.model.User
import com.jobsites.crm.ui.components.DatePickerField
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption
import com.jobsites.crm.ui.components.MultiSelectField

/**
 * Shared mutable state for the project form, used by both Create and Edit.
 */
data class ProjectFormState(
    val name: String = "",
    val description: String = "",
    val statusId: String = "Active",
    val assigneeIds: List<String> = emptyList(),
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    val country: String = "",
    val valuation: String = "",
    val ownershipTypeId: String = "",
    val primaryStageId: String = "",
    val primaryProjectTypeId: String = "",
    val bidDate: String? = null,
    val targetStartDate: String? = null,
    val targetCompletionDate: String? = null,
)

data class FormValidationError(val message: String)

fun validateProjectForm(form: ProjectFormState, requireName: Boolean = true): FormValidationError? {
    if (requireName && form.name.isBlank()) return FormValidationError("Please enter a project name.")
    if (form.assigneeIds.isEmpty()) return FormValidationError("Please select at least one assignee.")
    return null
}

/**
 * Reusable form fields composable shared by Create and Edit screens.
 */
@Composable
fun ProjectFormFields(
    form: ProjectFormState,
    onFormChange: (ProjectFormState) -> Unit,
    users: List<User>,
    primaryStages: List<LookupOption>,
    primaryProjectTypes: List<LookupOption>,
    ownershipTypes: List<LookupOption>,
    showNameField: Boolean = true,
    showStatusField: Boolean = true,
    modifier: Modifier = Modifier
) {
    val statusOptions = listOf(
        DropdownOption("Active", "Active"),
        DropdownOption("Planning", "Planning"),
        DropdownOption("On Hold", "On Hold"),
        DropdownOption("Completed", "Completed"),
    )
    val userOptions = users.sortedBy { it.lastName }
        .map { DropdownOption(it.id.toString(), "${it.lastName}, ${it.firstName}") }
    val stageOptions = listOf(DropdownOption("", "None")) +
            primaryStages.map { DropdownOption(it.id, it.label) }
    val typeOptions = listOf(DropdownOption("", "None")) +
            primaryProjectTypes.map { DropdownOption(it.id, it.label) }
    val ownerOptions = listOf(DropdownOption("", "None")) +
            ownershipTypes.map { DropdownOption(it.id, it.label) }

    Column(modifier = modifier) {
        // ── Basic Information ────────────────────────────────────────
        SectionHeader("Basic Information")

        if (showNameField) {
            OutlinedTextField(
                value = form.name,
                onValueChange = { onFormChange(form.copy(name = it)) },
                label = { Text("Project Name *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
        }

        if (showStatusField) {
            DropdownField(
                label = "Status",
                options = statusOptions,
                selectedKey = form.statusId,
                onSelect = { onFormChange(form.copy(statusId = it)) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
        }

        MultiSelectField(
            label = "Assignee(s) *",
            options = userOptions,
            selectedKeys = form.assigneeIds,
            onSelectionChange = { onFormChange(form.copy(assigneeIds = it)) },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Location ────────────────────────────────────────────────
        SectionHeader("Location")

        OutlinedTextField(
            value = form.street,
            onValueChange = { onFormChange(form.copy(street = it)) },
            label = { Text("Street") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))
        Row(Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = form.city,
                onValueChange = { onFormChange(form.copy(city = it)) },
                label = { Text("City") },
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
            Spacer(Modifier.width(8.dp))
            OutlinedTextField(
                value = form.state,
                onValueChange = { onFormChange(form.copy(state = it)) },
                label = { Text("State") },
                singleLine = true,
                modifier = Modifier.weight(0.5f)
            )
        }
        Spacer(Modifier.height(8.dp))
        Row(Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = form.zipCode,
                onValueChange = { onFormChange(form.copy(zipCode = it)) },
                label = { Text("Zip Code") },
                singleLine = true,
                modifier = Modifier.weight(0.5f)
            )
            Spacer(Modifier.width(8.dp))
            OutlinedTextField(
                value = form.country,
                onValueChange = { onFormChange(form.copy(country = it)) },
                label = { Text("Country") },
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(16.dp))

        // ── Description ─────────────────────────────────────────────
        SectionHeader("Description")

        OutlinedTextField(
            value = form.description,
            onValueChange = { onFormChange(form.copy(description = it)) },
            label = { Text("Description") },
            minLines = 3,
            maxLines = 5,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Project Details ─────────────────────────────────────────
        SectionHeader("Project Details")

        OutlinedTextField(
            value = form.valuation,
            onValueChange = { onFormChange(form.copy(valuation = it)) },
            label = { Text("Valuation (\$)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Ownership Type",
            options = ownerOptions,
            selectedKey = form.ownershipTypeId,
            onSelect = { onFormChange(form.copy(ownershipTypeId = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Primary Stage",
            options = stageOptions,
            selectedKey = form.primaryStageId,
            onSelect = { onFormChange(form.copy(primaryStageId = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Project Type",
            options = typeOptions,
            selectedKey = form.primaryProjectTypeId,
            onSelect = { onFormChange(form.copy(primaryProjectTypeId = it)) },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Dates ───────────────────────────────────────────────────
        SectionHeader("Dates")

        DatePickerField(
            label = "Bid Date",
            value = form.bidDate,
            onValueChange = { onFormChange(form.copy(bidDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DatePickerField(
            label = "Target Start Date",
            value = form.targetStartDate,
            onValueChange = { onFormChange(form.copy(targetStartDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DatePickerField(
            label = "Target Completion Date",
            value = form.targetCompletionDate,
            onValueChange = { onFormChange(form.copy(targetCompletionDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.fillMaxWidth()
    )
    Spacer(Modifier.height(8.dp))
}
