package com.jobsites.crm.ui.screens.projectlist

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
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.SortByAlpha
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Badge
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.jobsites.crm.ui.components.EmptyState
import com.jobsites.crm.ui.components.LoadingState
import com.jobsites.crm.ui.screens.projectlist.components.FilterSheet
import com.jobsites.crm.ui.screens.projectlist.components.KpiCard
import com.jobsites.crm.ui.screens.projectlist.components.ProjectCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectListScreen(
    onProjectClick: (Int) -> Unit,
    onCreateClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProjectListViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var showSortMenu by remember { mutableStateOf(false) }
    var showSearch by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Text("Projects", fontWeight = FontWeight.Bold)
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                actions = {
                    // Search toggle
                    IconButton(onClick = { showSearch = !showSearch }) {
                        Icon(Icons.Outlined.Search, "Search")
                    }
                    // Sort menu
                    IconButton(onClick = { showSortMenu = true }) {
                        Icon(Icons.Outlined.SortByAlpha, "Sort")
                    }
                    SortDropdownMenu(
                        expanded = showSortMenu,
                        currentColumn = state.sortColumn,
                        currentDirection = state.sortDirection,
                        onSortChange = { viewModel.onSortChange(it) },
                        onDismiss = { showSortMenu = false }
                    )
                    // Filter button with badge
                    IconButton(onClick = { showFilters = true }) {
                        BadgedBox(
                            badge = {
                                if (state.filters.activeFilterCount > 0) {
                                    Badge(
                                        containerColor = MaterialTheme.colorScheme.primary,
                                        contentColor = MaterialTheme.colorScheme.onPrimary
                                    ) {
                                        Text(state.filters.activeFilterCount.toString())
                                    }
                                }
                            }
                        ) {
                            Icon(Icons.Outlined.FilterList, "Filter")
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreateClick,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Create Project")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search bar (collapsible)
            if (showSearch) {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.onSearchQueryChange(it) },
                    placeholder = { Text("Search projects...") },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Outlined.Search, null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }

            if (state.isLoading) {
                LoadingState()
            } else if (state.projects.isEmpty()) {
                EmptyState(
                    title = "No projects found",
                    subtitle = if (state.searchQuery.isNotBlank() || state.filters.isActive)
                        "Try adjusting your search or filters"
                    else "Tap + to create your first project"
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    // KPI Revenue summary
                    item {
                        KpiCard(
                            wonRevenue = state.wonRevenue,
                            pipelineRevenue = state.pipelineRevenue,
                            wonByType = state.wonRevenueByType,
                            pipelineByType = state.pipelineRevenueByType
                        )
                    }

                    // Count header
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 4.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${state.projects.size} project${if (state.projects.size != 1) "s" else ""}",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Project cards
                    items(
                        items = state.projects,
                        key = { it.id }
                    ) { project ->
                        ProjectCard(
                            project = project,
                            assigneeNames = project.assigneeIds
                                .joinToString(", ") { viewModel.getAssigneeName(it) },
                            wonRevenue = viewModel.getWonRevenue(project),
                            pipelineRevenue = viewModel.getPipelineRevenue(project),
                            onClick = { onProjectClick(project.id) }
                        )
                    }

                    // Bottom spacing for FAB
                    item { Spacer(Modifier.height(72.dp)) }
                }
            }
        }
    }

    // Filter bottom sheet
    if (showFilters) {
        FilterSheet(
            currentFilters = state.filters,
            statuses = listOf("Active", "Planning", "On Hold", "Completed"),
            onApply = { filters ->
                viewModel.onFiltersChange(filters)
                showFilters = false
            },
            onClear = {
                viewModel.clearFilters()
                showFilters = false
            },
            onDismiss = { showFilters = false },
            searchUsers = { viewModel.searchUsers(it) },
            userLabelMap = viewModel.getUserLabelMap()
        )
    }
}

@Composable
private fun SortDropdownMenu(
    expanded: Boolean,
    currentColumn: SortColumn,
    currentDirection: SortDirection,
    onSortChange: (SortColumn) -> Unit,
    onDismiss: () -> Unit
) {
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        SortColumn.entries.forEach { column ->
            val label = when (column) {
                SortColumn.NAME -> "Name"
                SortColumn.STATUS -> "Status"
                SortColumn.WON_REVENUE -> "Won Revenue"
                SortColumn.PIPELINE_REVENUE -> "Pipeline Revenue"
                SortColumn.ASSIGNEE -> "Assignee"
                SortColumn.ADDRESS -> "Address"
            }
            val suffix = if (currentColumn == column) {
                if (currentDirection == SortDirection.ASC) " ↑" else " ↓"
            } else ""

            DropdownMenuItem(
                text = {
                    Text(
                        text = "$label$suffix",
                        fontWeight = if (currentColumn == column) FontWeight.Bold else FontWeight.Normal
                    )
                },
                onClick = {
                    onSortChange(column)
                    onDismiss()
                }
            )
        }
    }
}
