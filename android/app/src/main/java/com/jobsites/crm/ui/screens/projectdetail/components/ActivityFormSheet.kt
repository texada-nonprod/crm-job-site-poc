package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.Activity
import com.jobsites.crm.data.model.ActivityType
import com.jobsites.crm.data.model.Campaign
import com.jobsites.crm.data.model.Issue
import com.jobsites.crm.data.model.SalesRep
import com.jobsites.crm.ui.components.DatePickerField
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption
import java.time.Instant
import java.time.LocalDate

data class ActivityFormData(
    val salesRepId: Int,
    val typeId: String,
    val date: String,
    val description: String,
    val contactName: String,
    val notes: String,
    val campaignId: Int?,
    val customerId: String?,
    val issueId: Int?
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActivityFormSheet(
    editingActivity: Activity? = null,
    currentUserId: Int,
    salesReps: List<SalesRep>,
    activityTypes: List<ActivityType>,
    campaigns: List<Campaign>,
    issues: List<Issue>,
    contactNames: List<String>,
    onDismiss: () -> Unit,
    onSave: (ActivityFormData) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val isEdit = editingActivity != null

    var salesRepId by remember { mutableStateOf(editingActivity?.salesRepId?.toString() ?: currentUserId.toString()) }
    var typeId by remember { mutableStateOf(editingActivity?.typeId ?: "") }
    var date by remember { mutableStateOf(editingActivity?.date?.take(10) ?: LocalDate.now().toString()) }
    var description by remember { mutableStateOf(editingActivity?.description ?: "") }
    var contactName by remember { mutableStateOf(editingActivity?.contactName ?: "") }
    var notes by remember { mutableStateOf(editingActivity?.notes ?: "") }
    var campaignId by remember { mutableStateOf(editingActivity?.campaignId?.toString() ?: "") }
    var customerId by remember { mutableStateOf(editingActivity?.customerId ?: "") }
    var issueId by remember { mutableStateOf(editingActivity?.issueId?.toString() ?: "") }
    var error by remember { mutableStateOf<String?>(null) }

    val repOptions = salesReps.map { DropdownOption(it.salesRepId.toString(), it.fullName) }
    val typeOptions = activityTypes.map { DropdownOption(it.id, it.label) }
    val campaignOptions = listOf(DropdownOption("", "None")) +
        campaigns.map { DropdownOption(it.id.toString(), it.label) }
    val contactOptions = listOf(DropdownOption("", "None")) +
        contactNames.map { DropdownOption(it, it) }

    // Filter issues by selected customer
    val filteredIssues = if (customerId.isNotBlank()) {
        issues.filter { it.customerId == customerId }
    } else issues
    val issueOptions = listOf(DropdownOption("", "None")) +
        filteredIssues.map { DropdownOption(it.id.toString(), it.label) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = if (isEdit) "Edit Activity" else "Add Activity",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Sales Rep
            DropdownField(
                label = "Sales Rep *",
                options = repOptions,
                selectedKey = salesRepId,
                onSelect = { salesRepId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Activity Type
            DropdownField(
                label = "Activity Type *",
                options = typeOptions,
                selectedKey = typeId,
                onSelect = { typeId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Date
            DatePickerField(
                label = "Date *",
                value = date.ifBlank { null },
                onValueChange = { date = it ?: "" },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Contact
            DropdownField(
                label = "Contact",
                options = contactOptions,
                selectedKey = contactName,
                onSelect = { contactName = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = {
                    description = it
                    error = null
                },
                label = { Text("Description *") },
                modifier = Modifier.fillMaxWidth(),
                isError = error != null
            )

            Spacer(Modifier.height(12.dp))

            // Notes
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes *") },
                minLines = 3,
                maxLines = 6,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Campaign
            DropdownField(
                label = "Campaign",
                options = campaignOptions,
                selectedKey = campaignId,
                onSelect = { campaignId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Issue
            DropdownField(
                label = "Issue",
                options = issueOptions,
                selectedKey = issueId,
                onSelect = { issueId = it },
                modifier = Modifier.fillMaxWidth()
            )

            // Validation error
            if (error != null) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = error!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }

            Spacer(Modifier.height(24.dp))

            // Save button
            Button(
                onClick = {
                    val repId = salesRepId.toIntOrNull()
                    when {
                        repId == null -> { error = "Please select a sales rep."; return@Button }
                        typeId.isBlank() -> { error = "Please select an activity type."; return@Button }
                        date.isBlank() -> { error = "Please select a date."; return@Button }
                        description.isBlank() -> { error = "Please enter a description."; return@Button }
                        notes.isBlank() -> { error = "Please enter notes."; return@Button }
                    }
                    onSave(
                        ActivityFormData(
                            salesRepId = repId!!,
                            typeId = typeId,
                            date = date,
                            description = description.trim(),
                            contactName = contactName,
                            notes = notes.trim(),
                            campaignId = campaignId.toIntOrNull(),
                            customerId = customerId.ifBlank { null },
                            issueId = issueId.toIntOrNull()
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isEdit) "Save" else "Add Activity")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
