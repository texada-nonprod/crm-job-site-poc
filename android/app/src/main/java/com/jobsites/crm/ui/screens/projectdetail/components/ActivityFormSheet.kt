// TODO: In production, this prototype ModalBottomSheet form will be replaced by
// navigating to the existing CRM Activity create/edit record screen (e.g. via
// deep link or API intent). All field mappings here mirror the production form.
package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.Activity
import com.jobsites.crm.data.model.ActivityType
import com.jobsites.crm.data.model.Campaign
import com.jobsites.crm.data.model.Issue
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.data.model.SalesRep
import com.jobsites.crm.ui.components.DatePickerField
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption
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
    val issueId: Int?,
    val previousRelatedActivityId: Int? = null,
    val followUp: FollowUpData? = null
)

data class FollowUpData(
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
    projectCompanies: List<ProjectCompany>,
    onDismiss: () -> Unit,
    onSave: (ActivityFormData) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val isEdit = editingActivity != null

    // ── Main activity form state ──────────────────────────────────
    var salesRepId by remember { mutableStateOf(editingActivity?.salesRepId?.toString() ?: currentUserId.toString()) }
    var typeId by remember { mutableStateOf(editingActivity?.typeId ?: "") }
    var date by remember { mutableStateOf(editingActivity?.date?.take(10) ?: LocalDate.now().toString()) }
    var description by remember { mutableStateOf(editingActivity?.description ?: "") }
    var notes by remember { mutableStateOf(editingActivity?.notes ?: "") }
    var campaignId by remember { mutableStateOf(editingActivity?.campaignId?.toString() ?: "") }
    var customerId by remember { mutableStateOf(editingActivity?.customerId ?: "") }
    var contactName by remember { mutableStateOf(editingActivity?.contactName ?: "") }
    var issueId by remember { mutableStateOf(editingActivity?.issueId?.toString() ?: "") }
    var notCustomerRelated by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    // ── Derived status ────────────────────────────────────────────
    val isCompleted by remember(date) {
        derivedStateOf {
            runCatching {
                LocalDate.parse(date.take(10)).isBefore(LocalDate.now())
            }.getOrDefault(false)
        }
    }
    val statusLabel = if (isCompleted) "Completed" else "Outstanding"

    // ── Follow-up state ───────────────────────────────────────────
    var includeFollowUp by remember { mutableStateOf(false) }
    var fuSalesRepId by remember { mutableStateOf(currentUserId.toString()) }
    var fuTypeId by remember { mutableStateOf("") }
    var fuDate by remember { mutableStateOf("") }
    var fuDescription by remember { mutableStateOf("") }
    var fuNotes by remember { mutableStateOf("") }
    var fuCampaignId by remember { mutableStateOf("") }
    var fuCustomerId by remember { mutableStateOf("") }
    var fuContactName by remember { mutableStateOf("") }
    var fuIssueId by remember { mutableStateOf("") }
    var fuNotCustomerRelated by remember { mutableStateOf(false) }

    // ── Dropdown options ──────────────────────────────────────────
    val repOptions = salesReps.map { DropdownOption(it.salesRepId.toString(), it.fullName) }
    val typeOptions = activityTypes.map { DropdownOption(it.id, it.label) }
    val campaignOptions = listOf(DropdownOption("", "None")) +
        campaigns.map { DropdownOption(it.id.toString(), it.label) }

    // Company options from project companies
    val companyOptions = listOf(DropdownOption("", "None")) +
        projectCompanies.map { DropdownOption(it.companyId, it.companyName) }

    // Contact options dependent on selected company
    val contactOptions by remember(customerId) {
        derivedStateOf {
            val company = projectCompanies.find { it.companyId == customerId }
            val contacts = company?.companyContacts ?: emptyList()
            listOf(DropdownOption("", "None")) +
                contacts.map { c ->
                    val name = "${c.firstName ?: ""} ${c.lastName ?: ""}".trim().ifBlank { c.name }
                    DropdownOption(name, name)
                }
        }
    }

    // Follow-up contact options
    val fuContactOptions by remember(fuCustomerId) {
        derivedStateOf {
            val company = projectCompanies.find { it.companyId == fuCustomerId }
            val contacts = company?.companyContacts ?: emptyList()
            listOf(DropdownOption("", "None")) +
                contacts.map { c ->
                    val name = "${c.firstName ?: ""} ${c.lastName ?: ""}".trim().ifBlank { c.name }
                    DropdownOption(name, name)
                }
        }
    }

    // Filter issues by selected customer
    val filteredIssues = if (customerId.isNotBlank()) {
        issues.filter { it.customerId == customerId }
    } else issues
    val issueOptions = listOf(DropdownOption("", "None")) +
        filteredIssues.map { DropdownOption(it.id.toString(), it.label) }

    val fuFilteredIssues = if (fuCustomerId.isNotBlank()) {
        issues.filter { it.customerId == fuCustomerId }
    } else issues
    val fuIssueOptions = listOf(DropdownOption("", "None")) +
        fuFilteredIssues.map { DropdownOption(it.id.toString(), it.label) }

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
            // ── Header + Status Badge ─────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isEdit) "Edit Activity" else "Add Activity",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                if (date.isNotBlank()) {
                    StatusBadge(statusLabel)
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Sales Rep ─────────────────────────────────────────
            DropdownField(
                label = "Sales Rep *",
                options = repOptions,
                selectedKey = salesRepId,
                onSelect = { salesRepId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // ── Activity Type ─────────────────────────────────────
            DropdownField(
                label = "Activity Type *",
                options = typeOptions,
                selectedKey = typeId,
                onSelect = { typeId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // ── Date ──────────────────────────────────────────────
            DatePickerField(
                label = "Date *",
                value = date.ifBlank { null },
                onValueChange = { date = it ?: "" },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // ── Not Customer Related toggle ───────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Not customer related",
                    style = MaterialTheme.typography.bodyMedium
                )
                Switch(
                    checked = notCustomerRelated,
                    onCheckedChange = {
                        notCustomerRelated = it
                        if (it) {
                            customerId = ""
                            contactName = ""
                        }
                    }
                )
            }

            // ── Company + Contact (hidden when not customer related) ──
            AnimatedVisibility(visible = !notCustomerRelated) {
                Column {
                    Spacer(Modifier.height(12.dp))

                    // Company
                    DropdownField(
                        label = "Company",
                        options = companyOptions,
                        selectedKey = customerId,
                        onSelect = { newId ->
                            if (newId != customerId) {
                                customerId = newId
                                contactName = "" // reset contact when company changes
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(Modifier.height(12.dp))

                    // Contact (enabled only when company is selected)
                    DropdownField(
                        label = if (customerId.isBlank()) "Contact (select company first)" else "Contact",
                        options = if (customerId.isBlank()) listOf(DropdownOption("", "None")) else contactOptions,
                        selectedKey = contactName,
                        onSelect = { if (customerId.isNotBlank()) contactName = it },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // ── Description ───────────────────────────────────────
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

            // ── Notes ─────────────────────────────────────────────
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes *") },
                minLines = 3,
                maxLines = 6,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // ── Campaign ──────────────────────────────────────────
            DropdownField(
                label = "Campaign",
                options = campaignOptions,
                selectedKey = campaignId,
                onSelect = { campaignId = it },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // ── Issue ─────────────────────────────────────────────
            DropdownField(
                label = "Issue",
                options = issueOptions,
                selectedKey = issueId,
                onSelect = { issueId = it },
                modifier = Modifier.fillMaxWidth()
            )

            // ── Follow-up section (only for completed activities, create mode) ──
            if (isCompleted && !isEdit) {
                Spacer(Modifier.height(16.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                Spacer(Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = includeFollowUp,
                        onCheckedChange = {
                            includeFollowUp = it
                            if (it) {
                                // Pre-fill follow-up from main activity
                                fuSalesRepId = salesRepId
                                fuTypeId = typeId
                                fuCustomerId = customerId
                                fuContactName = contactName
                            }
                        }
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "Create follow-up activity",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }

                AnimatedVisibility(visible = includeFollowUp) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Follow-Up Activity",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold
                            )
                            StatusBadge("Outstanding")
                        }

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Sales Rep
                        DropdownField(
                            label = "Sales Rep *",
                            options = repOptions,
                            selectedKey = fuSalesRepId,
                            onSelect = { fuSalesRepId = it },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Activity Type
                        DropdownField(
                            label = "Activity Type *",
                            options = typeOptions,
                            selectedKey = fuTypeId,
                            onSelect = { fuTypeId = it },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Date (must be future)
                        DatePickerField(
                            label = "Date * (must be future)",
                            value = fuDate.ifBlank { null },
                            onValueChange = { fuDate = it ?: "" },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Not Customer Related toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Not customer related",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Switch(
                                checked = fuNotCustomerRelated,
                                onCheckedChange = {
                                    fuNotCustomerRelated = it
                                    if (it) {
                                        fuCustomerId = ""
                                        fuContactName = ""
                                    }
                                }
                            )
                        }

                        AnimatedVisibility(visible = !fuNotCustomerRelated) {
                            Column {
                                Spacer(Modifier.height(12.dp))

                                DropdownField(
                                    label = "Company",
                                    options = companyOptions,
                                    selectedKey = fuCustomerId,
                                    onSelect = { newId ->
                                        if (newId != fuCustomerId) {
                                            fuCustomerId = newId
                                            fuContactName = ""
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(Modifier.height(12.dp))

                                DropdownField(
                                    label = if (fuCustomerId.isBlank()) "Contact (select company first)" else "Contact",
                                    options = if (fuCustomerId.isBlank()) listOf(DropdownOption("", "None")) else fuContactOptions,
                                    selectedKey = fuContactName,
                                    onSelect = { if (fuCustomerId.isNotBlank()) fuContactName = it },
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Description
                        OutlinedTextField(
                            value = fuDescription,
                            onValueChange = { fuDescription = it },
                            label = { Text("Description *") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Notes
                        OutlinedTextField(
                            value = fuNotes,
                            onValueChange = { fuNotes = it },
                            label = { Text("Notes *") },
                            minLines = 2,
                            maxLines = 4,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Campaign
                        DropdownField(
                            label = "Campaign",
                            options = campaignOptions,
                            selectedKey = fuCampaignId,
                            onSelect = { fuCampaignId = it },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(12.dp))

                        // Follow-up Issue
                        DropdownField(
                            label = "Issue",
                            options = fuIssueOptions,
                            selectedKey = fuIssueId,
                            onSelect = { fuIssueId = it },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // ── Validation error ──────────────────────────────────
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

            // ── Save button ───────────────────────────────────────
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

                    // Validate follow-up if included
                    var followUpData: FollowUpData? = null
                    if (includeFollowUp && isCompleted && !isEdit) {
                        val fuRepId = fuSalesRepId.toIntOrNull()
                        when {
                            fuRepId == null -> { error = "Follow-up: Please select a sales rep."; return@Button }
                            fuTypeId.isBlank() -> { error = "Follow-up: Please select an activity type."; return@Button }
                            fuDate.isBlank() -> { error = "Follow-up: Please select a date."; return@Button }
                            fuDescription.isBlank() -> { error = "Follow-up: Please enter a description."; return@Button }
                            fuNotes.isBlank() -> { error = "Follow-up: Please enter notes."; return@Button }
                        }
                        // Validate follow-up date is in the future
                        val fuIsFuture = runCatching {
                            !LocalDate.parse(fuDate.take(10)).isBefore(LocalDate.now())
                        }.getOrDefault(false)
                        if (!fuIsFuture) {
                            error = "Follow-up: Date must be in the future."
                            return@Button
                        }
                        followUpData = FollowUpData(
                            salesRepId = fuRepId!!,
                            typeId = fuTypeId,
                            date = fuDate,
                            description = fuDescription.trim(),
                            contactName = fuContactName,
                            notes = fuNotes.trim(),
                            campaignId = fuCampaignId.toIntOrNull(),
                            customerId = fuCustomerId.ifBlank { null },
                            issueId = fuIssueId.toIntOrNull()
                        )
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
                            customerId = if (notCustomerRelated) null else customerId.ifBlank { null },
                            issueId = issueId.toIntOrNull(),
                            followUp = followUpData
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isEdit) "Save" else if (includeFollowUp && isCompleted) "Add Activity + Follow-Up" else "Add Activity")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun StatusBadge(label: String) {
    val isCompleted = label == "Completed"
    val bgColor = if (isCompleted)
        MaterialTheme.colorScheme.tertiary.copy(alpha = 0.15f)
    else
        MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f)
    val textColor = if (isCompleted)
        MaterialTheme.colorScheme.tertiary
    else
        MaterialTheme.colorScheme.secondary

    Text(
        text = label,
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    )
}
