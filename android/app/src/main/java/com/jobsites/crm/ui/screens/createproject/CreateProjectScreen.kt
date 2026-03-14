package com.jobsites.crm.ui.screens.createproject

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

/**
 * Stub — will be implemented in Steps 46-48.
 */
@Composable
fun CreateProjectScreen(
    onBack: () -> Unit,
    onCreated: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Create Project — Placeholder")
    }
}
