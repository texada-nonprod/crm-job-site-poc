package com.jobsites.crm.ui.screens.projectdetail

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.ExpandLess
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.jobsites.crm.ui.components.EmptyState
import com.jobsites.crm.ui.components.LoadingState
import com.jobsites.crm.ui.components.StatusBadge
import com.jobsites.crm.ui.screens.projectdetail.components.ActivitySection
import com.jobsites.crm.ui.screens.projectdetail.components.CompanySection
import com.jobsites.crm.ui.screens.projectdetail.components.EquipmentSection
import com.jobsites.crm.ui.screens.projectdetail.components.NotesSection
import com.jobsites.crm.ui.screens.projectdetail.components.OpportunitySection
import com.jobsites.crm.ui.screens.projectdetail.components.ProjectInfoCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    projectId: Int,
    onBack: () -> Unit,
    onEditClick: (Int) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProjectDetailViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val project = state.project
    val noteTags by remember { mutableStateOf(listOf(
        com.jobsites.crm.data.model.NoteTag("SAFETY", "Safety", 1, "red"),
        com.jobsites.crm.data.model.NoteTag("SECURITY", "Security", 2, "amber"),
        com.jobsites.crm.data.model.NoteTag("COMPLIANCE", "Compliance", 3, "sky"),
        com.jobsites.crm.data.model.NoteTag("GENERAL", "General", 4, "slate"),
    )) }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = project?.name ?: "Project",
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                        if (project != null) {
                            Spacer(Modifier.width(8.dp))
                            StatusBadge(statusId = project.statusId)
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    if (project != null) {
                        IconButton(onClick = { onEditClick(project.id) }) {
                            Icon(Icons.Outlined.Edit, "Edit")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        when {
            state.isLoading -> LoadingState(Modifier.padding(padding))
            project == null -> EmptyState(
                title = "Project not found",
                modifier = Modifier.padding(padding)
            )
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // ── Project Info ─────────────────────────────────
                    item {
                        val ownerName = project.projectOwner.companyId.takeIf { it.isNotBlank() }?.let {
                            viewModel.getCompanyById(it)?.companyName ?: it
                        }
                        ProjectInfoCard(
                            project = project,
                            wonRevenue = viewModel.getProjectWonRevenue(),
                            pipelineRevenue = viewModel.getProjectPipelineRevenue(),
                            ownerCompanyName = ownerName,
                            lookupLabel = { type, id -> viewModel.getLookupLabel(type, id) }
                        )
                    }

                    // ── Opportunities ────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Opportunities",
                            count = project.associatedOpportunities.size,
                            initiallyExpanded = true
                        ) {
                            if (project.associatedOpportunities.isEmpty()) {
                                EmptyState(title = "No opportunities", subtitle = "")
                            } else {
                                OpportunitySection(
                                    associatedOpportunities = project.associatedOpportunities,
                                    fullOpportunities = state.opportunities,
                                    getStageName = { viewModel.getStageName(it) },
                                    getTypeName = { viewModel.getTypeName(it) },
                                    getSalesRepName = { viewModel.getSalesRepName(it) }
                                )
                            }
                        }
                    }

                    // ── Companies / Contacts ────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Companies & Contacts",
                            count = project.projectCompanies.size,
                            initiallyExpanded = true
                        ) {
                            if (project.projectCompanies.isEmpty()) {
                                EmptyState(title = "No companies", subtitle = "")
                            } else {
                                CompanySection(companies = project.projectCompanies)
                            }
                        }
                    }

                    // ── Activities ───────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Activities",
                            count = project.activities.size
                        ) {
                            if (project.activities.isEmpty()) {
                                EmptyState(title = "No activities", subtitle = "")
                            } else {
                                ActivitySection(
                                    activities = project.activities,
                                    getSalesRepName = { viewModel.getSalesRepName(it) },
                                    onDelete = { viewModel.deleteActivity(it) }
                                )
                            }
                        }
                    }

                    // ── Equipment ────────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Equipment",
                            count = state.equipment.size
                        ) {
                            if (state.equipment.isEmpty()) {
                                EmptyState(title = "No equipment", subtitle = "")
                            } else {
                                EquipmentSection(
                                    equipment = state.equipment,
                                    onDelete = { viewModel.deleteEquipment(it) }
                                )
                            }
                        }
                    }

                    // ── Notes ────────────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Notes",
                            count = project.notes.size
                        ) {
                            if (project.notes.isEmpty()) {
                                EmptyState(title = "No notes", subtitle = "")
                            } else {
                                NotesSection(
                                    notes = project.notes,
                                    noteTags = noteTags,
                                    getUserName = { viewModel.getUserName(it) },
                                    onDelete = { viewModel.deleteNote(it) }
                                )
                            }
                        }
                    }

                    // ── Change Log ───────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Change Log",
                            count = state.changeLog.size
                        ) {
                            if (state.changeLog.isEmpty()) {
                                EmptyState(title = "No changes logged", subtitle = "")
                            } else {
                                ChangeLogSection(
                                    entries = state.changeLog,
                                    getUserName = { viewModel.getUserName(it) }
                                )
                            }
                        }
                    }

                    // Bottom spacing
                    item { Spacer(Modifier.height(16.dp)) }
                }
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════
//  Collapsible Section wrapper
// ═════════════════════════════════════════════════════════════════════

@Composable
private fun CollapsibleSection(
    title: String,
    count: Int,
    initiallyExpanded: Boolean = false,
    content: @Composable () -> Unit
) {
    var expanded by remember { mutableStateOf(initiallyExpanded) }

    Column(modifier = Modifier.padding(top = 8.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(vertical = 8.dp, horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    text = "($count)",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Icon(
                imageVector = if (expanded) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,
                contentDescription = if (expanded) "Collapse" else "Expand",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        AnimatedVisibility(visible = expanded) {
            content()
        }
    }
}

// ═════════════════════════════════════════════════════════════════════
//  Inline Change Log section
// ═════════════════════════════════════════════════════════════════════

@Composable
private fun ChangeLogSection(
    entries: List<com.jobsites.crm.data.model.ChangeLogEntry>,
    getUserName: (Int) -> String
) {
    val timestampFmt = java.time.format.DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a")

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        entries.take(20).forEach { entry ->
            val dateStr = runCatching {
                java.time.Instant.parse(entry.timestamp)
                    .atZone(java.time.ZoneId.systemDefault())
                    .format(timestampFmt)
            }.getOrDefault(entry.timestamp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = dateStr,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.width(120.dp)
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = entry.summary,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${entry.category} · ${getUserName(entry.changedById)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
