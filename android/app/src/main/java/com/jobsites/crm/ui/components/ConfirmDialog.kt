package com.jobsites.crm.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun ConfirmDialog(
    title: String,
    message: String,
    confirmLabel: String = "Confirm",
    dismissLabel: String = "Cancel",
    isDestructive: Boolean = false,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    AlertDialog(
        modifier = modifier,
        onDismissRequest = onDismiss,
        title = { Text(text = title) },
        text = { Text(text = message) },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(
                    text = confirmLabel,
                    color = if (isDestructive)
                        MaterialTheme.colorScheme.error
                    else
                        MaterialTheme.colorScheme.primary
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(text = dismissLabel)
            }
        }
    )
}
