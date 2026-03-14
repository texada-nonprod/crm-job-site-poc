package com.jobsites.crm.ui.screens.projectdetail

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

/**
 * Stub — will be implemented in Steps 37-45.
 */
@Composable
fun ProjectDetailScreen(
    projectId: Int,
    onBack: () -> Unit,
    onEditClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Project Detail #$projectId — Placeholder")
    }
}
