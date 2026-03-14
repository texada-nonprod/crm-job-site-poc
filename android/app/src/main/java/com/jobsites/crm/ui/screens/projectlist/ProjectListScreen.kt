package com.jobsites.crm.ui.screens.projectlist

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

/**
 * Stub — will be implemented in Steps 30-36.
 */
@Composable
fun ProjectListScreen(
    onProjectClick: (Int) -> Unit,
    onCreateClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Project List — Placeholder")
    }
}
