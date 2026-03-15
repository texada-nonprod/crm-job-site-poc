package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.CustomerEquipment
import com.jobsites.crm.data.model.ProjectCompany
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssociateEquipmentSheet(
    projectCompanies: List<ProjectCompany>,
    getCompanyEquipment: (String) -> List<CustomerEquipment>,
    existingEquipmentIds: List<Int>,
    getEquipmentProjectAssignment: (Int) -> Pair<Int, String>?,
    onDismiss: () -> Unit,
    onSave: (Int) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var selectedCompanyId by remember { mutableStateOf("") }
    var selectedEquipmentId by remember { mutableStateOf<Int?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    val companyOptions = projectCompanies.map {
        DropdownOption(it.companyId, it.companyName)
    }

    val companyEquipment = if (selectedCompanyId.isNotBlank()) {
        getCompanyEquipment(selectedCompanyId)
    } else emptyList()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .navigationBarsPadding()
        ) {
            Text(
                text = "Add from Company Fleet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Step 1: Pick company
            DropdownField(
                label = "Company *",
                options = companyOptions,
                selectedKey = selectedCompanyId,
                onSelect = {
                    selectedCompanyId = it
                    selectedEquipmentId = null
                    error = null
                },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Step 2: Pick equipment
            if (selectedCompanyId.isNotBlank()) {
                if (companyEquipment.isEmpty()) {
                    Text(
                        text = "No equipment found for this company.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                } else {
                    Text(
                        text = "Select Equipment",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.height(8.dp))

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 300.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        items(companyEquipment) { eq ->
                            val isOnThisProject = eq.id in existingEquipmentIds
                            val otherProject = if (!isOnThisProject) {
                                getEquipmentProjectAssignment(eq.id)
                            } else null
                            val isSelected = selectedEquipmentId == eq.id

                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable(enabled = !isOnThisProject) {
                                        selectedEquipmentId = eq.id
                                        error = null
                                    },
                                colors = CardDefaults.cardColors(
                                    containerColor = when {
                                        isSelected -> MaterialTheme.colorScheme.primaryContainer
                                        isOnThisProject -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                        else -> MaterialTheme.colorScheme.surface
                                    }
                                ),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "${eq.make} ${eq.model}",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontWeight = FontWeight.SemiBold,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Text(
                                            text = eq.ownershipStatus.replaceFirstChar { it.uppercase() },
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 10.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(
                                            text = eq.equipmentType,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontSize = 10.sp
                                        )
                                        eq.year?.let {
                                            Text(
                                                text = it.toString(),
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                fontSize = 10.sp
                                            )
                                        }
                                        eq.serialNumber?.let {
                                            if (it.isNotBlank()) {
                                                Text(
                                                    text = "S/N: $it",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    fontSize = 10.sp
                                                )
                                            }
                                        }
                                    }
                                    if (isOnThisProject) {
                                        Text(
                                            text = "Already on this project",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontSize = 10.sp
                                        )
                                    } else if (otherProject != null) {
                                        Text(
                                            text = "On project: ${otherProject.second}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f),
                                            fontSize = 10.sp
                                        )
                                    }
                                }
                            }
                        }
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
                    if (selectedEquipmentId == null) {
                        error = "Please select equipment."; return@Button
                    }
                    onSave(selectedEquipmentId!!)
                },
                enabled = selectedEquipmentId != null,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Add Equipment")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
