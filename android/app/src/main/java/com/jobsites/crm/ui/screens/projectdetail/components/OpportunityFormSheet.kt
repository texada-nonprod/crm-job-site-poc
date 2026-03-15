package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.data.model.OpportunityStage
import com.jobsites.crm.data.model.OpportunityType
import com.jobsites.crm.data.repository.Division
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption

/**
 * ModalBottomSheet for creating or editing an opportunity.
 *
 * Create mode: Description, Revenue, Division, Type, Stage.
 * Edit mode: same fields + Est. Close Month / Year.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OpportunityFormSheet(
    divisions: List<Division>,
    opportunityTypes: List<OpportunityType>,
    opportunityStages: List<OpportunityStage>,
    editingOpportunity: Opportunity? = null,
    onDismiss: () -> Unit,
    onSave: (OpportunityFormData) -> Unit
) {
    val isEdit = editingOpportunity != null
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var description by remember { mutableStateOf(editingOpportunity?.description ?: "") }
    var revenue by remember {
        mutableStateOf(
            if (editingOpportunity != null && editingOpportunity.estimateRevenue > 0)
                editingOpportunity.estimateRevenue.toLong().toString()
            else ""
        )
    }
    var divisionId by remember { mutableStateOf(editingOpportunity?.divisionId ?: "") }
    var typeId by remember { mutableStateOf(editingOpportunity?.typeId?.toString() ?: "") }
    var stageId by remember { mutableStateOf(editingOpportunity?.stageId?.toString() ?: "") }
    var estMonth by remember {
        mutableStateOf(editingOpportunity?.estimateDeliveryMonth?.toString() ?: "")
    }
    var estYear by remember {
        mutableStateOf(editingOpportunity?.estimateDeliveryYear?.toString() ?: "")
    }
    var error by remember { mutableStateOf<String?>(null) }

    // Build dropdown options
    val divisionOptions = divisions.map { DropdownOption(it.code, "${it.code} — ${it.name}") }
    val typeOptions = opportunityTypes
        .sortedBy { it.displayOrder }
        .map { DropdownOption(it.oppTypeId.toString(), it.oppTypeDesc) }
    // For creation only allow Lead + Outstanding phases (1, 2); for editing allow all
    val stageOptions = opportunityStages
        .filter { if (isEdit) true else it.phaseId == 1 || it.phaseId == 2 }
        .sortedBy { it.displayOrder }
        .map { DropdownOption(it.stageId.toString(), it.stageName) }

    val monthOptions = listOf(DropdownOption("", "None")) +
            (1..12).map { m ->
                val names = listOf("", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
                DropdownOption(m.toString(), names[m])
            }
    val currentYear = java.time.Year.now().value
    val yearOptions = listOf(DropdownOption("", "None")) +
            (currentYear..(currentYear + 7)).map { y ->
                DropdownOption(y.toString(), y.toString())
            }

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
                text = if (isEdit) "Edit Opportunity" else "Add Opportunity",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = { description = it; error = null },
                label = { Text("Description *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Revenue
            OutlinedTextField(
                value = revenue,
                onValueChange = { revenue = it; error = null },
                label = { Text("Estimated Revenue (\$) *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Division
            DropdownField(
                label = "Division *",
                options = divisionOptions,
                selectedKey = divisionId,
                onSelect = { divisionId = it; error = null },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Type
            DropdownField(
                label = "Type *",
                options = typeOptions,
                selectedKey = typeId,
                onSelect = { typeId = it; error = null },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Stage
            DropdownField(
                label = "Stage *",
                options = stageOptions,
                selectedKey = stageId,
                onSelect = { stageId = it; error = null },
                modifier = Modifier.fillMaxWidth()
            )

            // Edit-only fields: Est Close Month / Year
            if (isEdit) {
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "Estimated Close",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth()) {
                    DropdownField(
                        label = "Month",
                        options = monthOptions,
                        selectedKey = estMonth,
                        onSelect = { estMonth = it },
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(8.dp))
                    DropdownField(
                        label = "Year",
                        options = yearOptions,
                        selectedKey = estYear,
                        onSelect = { estYear = it },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Error
            if (error != null) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = error!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    // Validate
                    if (description.isBlank()) {
                        error = "Please enter a description."; return@Button
                    }
                    val rev = revenue.replace(",", "").toDoubleOrNull()
                    if (rev == null || rev <= 0) {
                        error = "Please enter a valid revenue amount."; return@Button
                    }
                    if (divisionId.isBlank()) {
                        error = "Please select a division."; return@Button
                    }
                    if (typeId.isBlank()) {
                        error = "Please select a type."; return@Button
                    }
                    if (stageId.isBlank()) {
                        error = "Please select a stage."; return@Button
                    }

                    onSave(
                        OpportunityFormData(
                            description = description.trim(),
                            revenue = rev,
                            divisionId = divisionId,
                            typeId = typeId.toInt(),
                            stageId = stageId.toInt(),
                            estMonth = estMonth.toIntOrNull(),
                            estYear = estYear.toIntOrNull()
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isEdit) "Save" else "Add Opportunity")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

data class OpportunityFormData(
    val description: String,
    val revenue: Double,
    val divisionId: String,
    val typeId: Int,
    val stageId: Int,
    val estMonth: Int? = null,
    val estYear: Int? = null
)
