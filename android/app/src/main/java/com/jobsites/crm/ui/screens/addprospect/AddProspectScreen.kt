package com.jobsites.crm.ui.screens.addprospect

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.jobsites.crm.data.repository.DIVISIONS
import com.jobsites.crm.ui.screens.projectdetail.components.ROLE_OPTIONS

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AddProspectScreen(
    projectId: Int,
    onBack: () -> Unit,
    onSaved: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AddProspectViewModel = hiltViewModel()
) {
    val form by viewModel.form.collectAsState()

    LaunchedEffect(form.isSaved) {
        if (form.isSaved) onSaved()
    }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text("Add Prospect", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.Close, "Close")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // ── Section 1: Company Information ──
            item {
                SectionHeader("Company Information")
            }
            item {
                OutlinedTextField(
                    value = form.companyName,
                    onValueChange = { v -> viewModel.updateField { copy(companyName = v) } },
                    label = { Text("Company Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                OutlinedTextField(
                    value = form.phone,
                    onValueChange = { v -> viewModel.updateField { copy(phone = v) } },
                    label = { Text("Phone *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                Text(
                    text = "Division(s) *",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    DIVISIONS.forEach { div ->
                        val selected = div.code in form.divisionIds
                        FilterChip(
                            selected = selected,
                            onClick = {
                                viewModel.updateField {
                                    copy(divisionIds = if (selected) divisionIds - div.code else divisionIds + div.code)
                                }
                            },
                            label = { Text("${div.code} — ${div.name}") }
                        )
                    }
                }
            }
            item {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Role(s) *",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    ROLE_OPTIONS.forEach { role ->
                        val selected = role.id in form.roleIds
                        FilterChip(
                            selected = selected,
                            onClick = {
                                viewModel.updateField {
                                    copy(roleIds = if (selected) roleIds - role.id else roleIds + role.id)
                                }
                            },
                            label = { Text(role.label) }
                        )
                    }
                }
            }

            // ── Section 2: Address ──
            item {
                Spacer(Modifier.height(8.dp))
                SectionHeader("Address")
            }
            item {
                OutlinedTextField(
                    value = form.street,
                    onValueChange = { v -> viewModel.updateField { copy(street = v) } },
                    label = { Text("Street *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                Row(Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = form.city,
                        onValueChange = { v -> viewModel.updateField { copy(city = v) } },
                        label = { Text("City *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(8.dp))
                    OutlinedTextField(
                        value = form.state,
                        onValueChange = { v -> viewModel.updateField { copy(state = v) } },
                        label = { Text("State") },
                        singleLine = true,
                        modifier = Modifier.weight(0.6f)
                    )
                }
            }
            item {
                Row(Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = form.zip,
                        onValueChange = { v -> viewModel.updateField { copy(zip = v) } },
                        label = { Text("ZIP Code") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(8.dp))
                    OutlinedTextField(
                        value = form.country,
                        onValueChange = { v -> viewModel.updateField { copy(country = v) } },
                        label = { Text("Country") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // ── Section 3: Primary Contact ──
            item {
                Spacer(Modifier.height(8.dp))
                SectionHeader("Primary Contact")
            }
            item {
                Row(Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = form.firstName,
                        onValueChange = { v -> viewModel.updateField { copy(firstName = v) } },
                        label = { Text("First Name *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(8.dp))
                    OutlinedTextField(
                        value = form.lastName,
                        onValueChange = { v -> viewModel.updateField { copy(lastName = v) } },
                        label = { Text("Last Name *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            item {
                OutlinedTextField(
                    value = form.title,
                    onValueChange = { v -> viewModel.updateField { copy(title = v) } },
                    label = { Text("Title *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                OutlinedTextField(
                    value = form.mobilePhone,
                    onValueChange = { v -> viewModel.updateField { copy(mobilePhone = v) } },
                    label = { Text("Mobile Phone *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                OutlinedTextField(
                    value = form.email,
                    onValueChange = { v -> viewModel.updateField { copy(email = v) } },
                    label = { Text("Email *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Error
            if (form.error != null) {
                item {
                    Text(
                        text = form.error!!,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(start = 4.dp)
                    )
                }
            }

            // Submit
            item {
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = { viewModel.submit() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Save Prospect")
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Column {
        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
        Spacer(Modifier.height(8.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
    }
}
