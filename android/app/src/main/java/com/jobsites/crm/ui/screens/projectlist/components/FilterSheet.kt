package com.jobsites.crm.ui.screens.projectlist.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.Filters
import com.jobsites.crm.data.model.User
import com.jobsites.crm.data.repository.DIVISIONS
import com.jobsites.crm.ui.components.DropdownOption
import com.jobsites.crm.ui.components.MultiSelectField

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterSheet(
    currentFilters: Filters,
    users: List<User>,
    statuses: List<String>,
    onApply: (Filters) -> Unit,
    onClear: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    var filters by remember { mutableStateOf(currentFilters) }

    val userOptions = remember(users) {
        users.sortedBy { it.lastName }
            .map { DropdownOption(it.id.toString(), "${it.lastName}, ${it.firstName}") }
    }
    val divisionOptions = remember {
        DIVISIONS.map { DropdownOption(it.code, "${it.code} - ${it.name}") }
    }
    val statusOptions = remember(statuses) {
        statuses.map { DropdownOption(it, it) }
    }

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Filters",
                    style = MaterialTheme.typography.titleLarge
                )
                if (filters.isActive) {
                    TextButton(onClick = {
                        val cleared = Filters(hideCompleted = true)
                        filters = cleared
                        onClear()
                    }) {
                        Text("Clear All")
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Assignee
            MultiSelectField(
                label = "Assignee",
                options = userOptions,
                selectedKeys = filters.assigneeIds,
                onSelectionChange = { filters = filters.copy(assigneeIds = it) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Division
            MultiSelectField(
                label = "Division",
                options = divisionOptions,
                selectedKeys = filters.divisions,
                onSelectionChange = { filters = filters.copy(divisions = it) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // Status
            MultiSelectField(
                label = "Status",
                options = statusOptions,
                selectedKeys = filters.statuses,
                onSelectionChange = { filters = filters.copy(statuses = it) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            // General Contractor
            OutlinedTextField(
                value = filters.generalContractor,
                onValueChange = { filters = filters.copy(generalContractor = it) },
                label = { Text("General Contractor") },
                placeholder = { Text("Search GC name...") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(16.dp))

            // Hide Completed toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Hide Completed",
                    style = MaterialTheme.typography.bodyLarge
                )
                Switch(
                    checked = filters.hideCompleted,
                    onCheckedChange = { filters = filters.copy(hideCompleted = it) }
                )
            }

            Spacer(Modifier.height(24.dp))

            // Apply
            TextButton(
                onClick = { onApply(filters) },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Done", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}
