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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.ExpandLess
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.ui.components.EmptyState
import com.jobsites.crm.ui.components.LoadingState
import com.jobsites.crm.ui.components.StatusBadge
import com.jobsites.crm.ui.screens.projectdetail.components.ActivitySection
import com.jobsites.crm.ui.screens.projectdetail.components.AddContactSheet
import com.jobsites.crm.ui.screens.projectdetail.components.AssociateCompanySheet
import com.jobsites.crm.ui.screens.projectdetail.components.AssociateEquipmentSheet
import com.jobsites.crm.ui.screens.projectdetail.components.CompanySection
import com.jobsites.crm.ui.screens.projectdetail.components.CreateEquipmentSheet
import com.jobsites.crm.ui.screens.projectdetail.components.EquipmentSection
import com.jobsites.crm.ui.screens.projectdetail.components.NoteFormSheet
import com.jobsites.crm.ui.screens.projectdetail.components.NotesSection
import com.jobsites.crm.ui.screens.projectdetail.components.OpportunityFormSheet
import com.jobsites.crm.ui.screens.projectdetail.components.OpportunitySection
import com.jobsites.crm.ui.screens.projectdetail.components.ProjectInfoCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    projectId: Int,
    onBack: () -> Unit,
    onEditClick: (Int) -> Unit,
    onAddProspect: (Int) -> Unit = {},
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

    // ── Bottom sheet / dialog state ───────────────────────────────
    var showNoteSheet by remember { mutableStateOf(false) }
    var editingNote by remember { mutableStateOf<Note?>(null) }
    var showOpportunitySheet by remember { mutableStateOf(false) }
    var editingOpportunity by remember { mutableStateOf<Opportunity?>(null) }
    var showAddCompanySheet by remember { mutableStateOf(false) }
    var showAddEquipmentSheet by remember { mutableStateOf(false) }
    var showCreateEquipmentSheet by remember { mutableStateOf(false) }
    var addContactCompanyName by remember { mutableStateOf<String?>(null) }
    var showEquipmentMenu by remember { mutableStateOf(false) }
    var showCompanyMenu by remember { mutableStateOf(false) }

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
                        val ownerCompany = project.projectOwner.companyId
                            .takeIf { it.isNotBlank() }
                            ?.let { viewModel.getCompanyById(it) }
                        val ownerName = ownerCompany?.companyName
                            ?: project.projectOwner.companyId.takeIf { it.isNotBlank() }
                        val ownerContacts = ownerCompany?.let { company ->
                            val ids = project.projectOwner.contactIds
                            if (ids.isNotEmpty()) {
                                company.companyContacts.filter { it.id in ids }
                            } else {
                                company.companyContacts
                            }
                        } ?: emptyList()
                        ProjectInfoCard(
                            project = project,
                            wonRevenue = viewModel.getProjectWonRevenue(),
                            pipelineRevenue = viewModel.getProjectPipelineRevenue(),
                            ownerCompanyName = ownerName,
                            ownerContacts = ownerContacts,
                            lookupLabel = { type, id -> viewModel.getLookupLabel(type, id) }
                        )
                    }

                    // ── Opportunities ────────────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Opportunities",
                            count = project.associatedOpportunities.size,
                            initiallyExpanded = true,
                            onAdd = { showOpportunitySheet = true }
                        ) {
                            if (project.associatedOpportunities.isEmpty()) {
                                EmptyState(title = "No opportunities", subtitle = "")
                            } else {
                                OpportunitySection(
                                    associatedOpportunities = project.associatedOpportunities,
                                    fullOpportunities = state.opportunities,
                                    getStageName = { viewModel.getStageName(it) },
                                    getTypeName = { viewModel.getTypeName(it) },
                                    getSalesRepName = { viewModel.getSalesRepName(it) },
                                    onEdit = { oppId ->
                                        editingOpportunity = viewModel.getOpportunityById(oppId)
                                    }
                                )
                            }
                        }
                    }

                    // ── Companies / Contacts ────────────────────────
                    item {
                        CollapsibleSection(
                            title = "Companies & Contacts",
                            count = project.projectCompanies.size,
                            initiallyExpanded = true,
                            onAdd = { showCompanyMenu = true }
                        ) {
                            if (project.projectCompanies.isEmpty()) {
                                EmptyState(title = "No companies", subtitle = "")
                            } else {
                                CompanySection(
                                    companies = project.projectCompanies,
                                    onAddContact = { companyName ->
                                        addContactCompanyName = companyName
                                    }
                                )
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
                            count = state.equipment.size,
                            onAdd = { showEquipmentMenu = true }
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
                            count = project.notes.size,
                            onAdd = { showNoteSheet = true }
                        ) {
                            if (project.notes.isEmpty()) {
                                EmptyState(title = "No notes", subtitle = "")
                            } else {
                                NotesSection(
                                    notes = project.notes,
                                    noteTags = noteTags,
                                    getUserName = { viewModel.getUserName(it) },
                                    currentUserId = viewModel.getCurrentUserId(),
                                    onDelete = { viewModel.deleteNote(it) },
                                    onEdit = { editingNote = it }
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

    // ── Note form bottom sheet ────────────────────────────────────
    if (showNoteSheet || editingNote != null) {
        NoteFormSheet(
            noteTags = noteTags,
            editingNote = editingNote,
            onDismiss = {
                showNoteSheet = false
                editingNote = null
            },
            onSave = { content, tagIds ->
                if (editingNote != null) {
                    viewModel.updateNote(editingNote!!.id, content, tagIds)
                } else {
                    viewModel.addNote(content, tagIds)
                }
                showNoteSheet = false
                editingNote = null
            }
        )
    }

    // ── Opportunity form bottom sheet ─────────────────────────────
    if (showOpportunitySheet || editingOpportunity != null) {
        OpportunityFormSheet(
            divisions = viewModel.getDivisions(),
            opportunityTypes = viewModel.getOpportunityTypes(),
            opportunityStages = viewModel.getOpportunityStages(),
            editingOpportunity = editingOpportunity,
            onDismiss = {
                showOpportunitySheet = false
                editingOpportunity = null
            },
            onSave = { data ->
                if (editingOpportunity != null) {
                    viewModel.updateOpportunity(
                        oppId = editingOpportunity!!.id,
                        description = data.description,
                        revenue = data.revenue,
                        divisionId = data.divisionId,
                        typeId = data.typeId,
                        stageId = data.stageId,
                        estMonth = data.estMonth,
                        estYear = data.estYear
                    )
                } else {
                    viewModel.createOpportunity(
                        description = data.description,
                        revenue = data.revenue,
                        divisionId = data.divisionId,
                        typeId = data.typeId,
                        stageId = data.stageId
                    )
                }
                showOpportunitySheet = false
                editingOpportunity = null
            }
        )
    }

    // ── Company menu dialog ─────────────────────────────────────────
    if (showCompanyMenu) {
        AlertDialog(
            onDismissRequest = { showCompanyMenu = false },
            title = { Text("Add Company") },
            text = { Text("Choose how to add a company to this project.") },
            confirmButton = {
                TextButton(onClick = {
                    showCompanyMenu = false
                    onAddProspect(viewModel.getProjectId())
                }) { Text("New Prospect") }
            },
            dismissButton = {
                TextButton(onClick = {
                    showCompanyMenu = false
                    showAddCompanySheet = true
                }) { Text("Associate Existing") }
            }
        )
    }

    // ── Associate Company bottom sheet ───────────────────────────────
    if (showAddCompanySheet) {
        AssociateCompanySheet(
            allCompanies = viewModel.getAllKnownCompanies(),
            existingCompanyIds = project?.projectCompanies?.map { it.companyId } ?: emptyList(),
            onDismiss = { showAddCompanySheet = false },
            onSave = { company, roleIds ->
                viewModel.associateCompany(company, roleIds)
                showAddCompanySheet = false
            }
        )
    }

    // ── Add Contact bottom sheet ────────────────────────────────────
    if (addContactCompanyName != null) {
        AddContactSheet(
            companyName = addContactCompanyName!!,
            contactTypes = viewModel.getContactTypes(),
            onDismiss = { addContactCompanyName = null },
            onSave = { contact ->
                viewModel.addContactToCompany(addContactCompanyName!!, contact)
                addContactCompanyName = null
            }
        )
    }

    // ── Equipment menu dialog ───────────────────────────────────────
    if (showEquipmentMenu) {
        AlertDialog(
            onDismissRequest = { showEquipmentMenu = false },
            title = { Text("Add Equipment") },
            text = { Text("Choose how to add equipment to this project.") },
            confirmButton = {
                TextButton(onClick = {
                    showEquipmentMenu = false
                    showCreateEquipmentSheet = true
                }) { Text("Create New") }
            },
            dismissButton = {
                TextButton(onClick = {
                    showEquipmentMenu = false
                    showAddEquipmentSheet = true
                }) { Text("From Company Fleet") }
            }
        )
    }

    // ── Associate Equipment bottom sheet ─────────────────────────────
    if (showAddEquipmentSheet) {
        AssociateEquipmentSheet(
            projectCompanies = project?.projectCompanies ?: emptyList(),
            getCompanyEquipment = { viewModel.getCompanyEquipment(it) },
            existingEquipmentIds = project?.customerEquipment ?: emptyList(),
            getEquipmentProjectAssignment = { viewModel.getEquipmentProjectAssignment(it) },
            onDismiss = { showAddEquipmentSheet = false },
            onSave = { equipmentId ->
                viewModel.addEquipment(equipmentId)
                showAddEquipmentSheet = false
            }
        )
    }

    // ── Create Equipment bottom sheet ────────────────────────────────
    if (showCreateEquipmentSheet) {
        CreateEquipmentSheet(
            projectCompanies = project?.projectCompanies ?: emptyList(),
            onDismiss = { showCreateEquipmentSheet = false },
            onSave = { data ->
                viewModel.createEquipment(
                    companyId = data.companyId,
                    equipmentType = data.equipmentType,
                    make = data.make,
                    model = data.model,
                    serialNumber = data.serialNumber,
                    year = data.year,
                    ownershipStatus = data.ownershipStatus,
                    smu = data.smu
                )
                showCreateEquipmentSheet = false
            }
        )
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
    onAdd: (() -> Unit)? = null,
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
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (onAdd != null) {
                    IconButton(
                        onClick = { onAdd() },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Outlined.Add, "Add",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(Modifier.width(4.dp))
                }
                Icon(
                    imageVector = if (expanded) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
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
