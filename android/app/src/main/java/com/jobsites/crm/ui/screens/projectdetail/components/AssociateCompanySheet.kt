package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
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
import com.jobsites.crm.data.model.ProjectCompany

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AssociateCompanySheet(
    allCompanies: List<ProjectCompany>,
    existingCompanyIds: List<String>,
    onDismiss: () -> Unit,
    onSave: (company: ProjectCompany, roleIds: List<String>) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var searchQuery by remember { mutableStateOf("") }
    var selectedCompany by remember { mutableStateOf<ProjectCompany?>(null) }
    var selectedRoles by remember { mutableStateOf<List<String>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }

    // Filter companies — exclude already-associated ones; min 2 chars
    val filtered = if (searchQuery.length >= 2) {
        allCompanies.filter { company ->
            company.companyId !in existingCompanyIds &&
                    company.companyName.contains(searchQuery, ignoreCase = true)
        }
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
                text = "Associate Company",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Search field
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it
                    if (selectedCompany != null && !it.equals(selectedCompany!!.companyName, ignoreCase = true)) {
                        selectedCompany = null
                    }
                    error = null
                },
                label = { Text("Search Company *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            // Search results
            if (selectedCompany == null && filtered.isNotEmpty()) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 200.dp)
                        .padding(top = 4.dp)
                ) {
                    items(filtered.take(20)) { company ->
                        Text(
                            text = company.companyName,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedCompany = company
                                    searchQuery = company.companyName
                                    error = null
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp)
                        )
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                    }
                }
            }

            if (selectedCompany != null) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "✓ ${selectedCompany!!.companyName}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(Modifier.height(16.dp))

            // Role selection
            Text(
                text = "Role(s) *",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                ROLE_OPTIONS.forEach { role ->
                    val selected = role.id in selectedRoles
                    FilterChip(
                        selected = selected,
                        onClick = {
                            selectedRoles = if (selected)
                                selectedRoles - role.id
                            else
                                selectedRoles + role.id
                            error = null
                        },
                        label = { Text(role.label) }
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
                    if (selectedCompany == null) {
                        error = "Please select a company."; return@Button
                    }
                    if (selectedRoles.isEmpty()) {
                        error = "Please select at least one role."; return@Button
                    }
                    onSave(selectedCompany!!, selectedRoles)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Associate Company")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
