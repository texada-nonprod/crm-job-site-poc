package com.jobsites.crm.ui.screens.editproject

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

/**
 * Stub — will be implemented in Steps 49-50.
 */
@Composable
fun EditProjectScreen(
    projectId: Int,
    onBack: () -> Unit,
    onSaved: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Edit Project #$projectId — Placeholder")
    }
}
