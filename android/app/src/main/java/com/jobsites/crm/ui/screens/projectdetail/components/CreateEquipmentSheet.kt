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
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption

data class NewEquipmentData(
    val companyId: String,
    val equipmentType: String,
    val make: String,
    val model: String,
    val serialNumber: String,
    val year: Int,
    val ownershipStatus: String,
    val smu: Int?
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEquipmentSheet(
    projectCompanies: List<ProjectCompany>,
    onDismiss: () -> Unit,
    onSave: (NewEquipmentData) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var companyId by remember { mutableStateOf("") }
    var equipmentType by remember { mutableStateOf("") }
    var make by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var serialNumber by remember { mutableStateOf("") }
    var year by remember { mutableStateOf("") }
    var ownershipIndex by remember { mutableIntStateOf(0) } // 0 = Owned, 1 = Rented
    var smu by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    val companyOptions = projectCompanies.map {
        DropdownOption(it.companyId, it.companyName)
    }

    val ownershipOptions = listOf("Owned", "Rented")

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
                text = "Create Equipment",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Company
            DropdownField(
                label = "Company *",
                options = companyOptions,
                selectedKey = companyId,
                onSelect = { companyId = it; error = null },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Equipment Type
            OutlinedTextField(
                value = equipmentType,
                onValueChange = { equipmentType = it; error = null },
                label = { Text("Equipment Type *") },
                placeholder = { Text("e.g. Excavator, Boom Lift") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Make + Model side by side
            Row(Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = make,
                    onValueChange = { make = it; error = null },
                    label = { Text("Make *") },
                    placeholder = { Text("e.g. Caterpillar") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(
                    value = model,
                    onValueChange = { model = it; error = null },
                    label = { Text("Model *") },
                    placeholder = { Text("e.g. 320F") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(Modifier.height(8.dp))

            // Serial Number
            OutlinedTextField(
                value = serialNumber,
                onValueChange = { serialNumber = it; error = null },
                label = { Text("Serial Number *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            // Year + SMU side by side
            Row(Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = year,
                    onValueChange = { year = it; error = null },
                    label = { Text("Year *") },
                    placeholder = { Text("e.g. 2024") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(
                    value = smu,
                    onValueChange = { smu = it; error = null },
                    label = { Text("SMU") },
                    placeholder = { Text("Hours") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(Modifier.height(12.dp))

            // Ownership toggle
            Text(
                text = "Ownership *",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                ownershipOptions.forEachIndexed { index, option ->
                    SegmentedButton(
                        shape = SegmentedButtonDefaults.itemShape(
                            index = index,
                            count = ownershipOptions.size
                        ),
                        onClick = { ownershipIndex = index },
                        selected = index == ownershipIndex
                    ) {
                        Text(option)
                    }
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
                    if (companyId.isBlank()) { error = "Please select a company."; return@Button }
                    if (equipmentType.isBlank()) { error = "Equipment type is required."; return@Button }
                    if (make.isBlank()) { error = "Make is required."; return@Button }
                    if (model.isBlank()) { error = "Model is required."; return@Button }
                    if (serialNumber.isBlank()) { error = "Serial number is required."; return@Button }
                    val yearInt = year.toIntOrNull()
                    if (yearInt == null || year.length != 4) { error = "Please enter a valid 4-digit year."; return@Button }

                    onSave(
                        NewEquipmentData(
                            companyId = companyId,
                            equipmentType = equipmentType.trim(),
                            make = make.trim(),
                            model = model.trim(),
                            serialNumber = serialNumber.trim(),
                            year = yearInt,
                            ownershipStatus = ownershipOptions[ownershipIndex].lowercase(),
                            smu = smu.toIntOrNull()
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Create Equipment")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
