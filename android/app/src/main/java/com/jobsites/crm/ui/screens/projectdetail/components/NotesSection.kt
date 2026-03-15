package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.History
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.NoteTag
import com.jobsites.crm.ui.theme.TagAmber
import com.jobsites.crm.ui.theme.TagRed
import com.jobsites.crm.ui.theme.TagSky
import com.jobsites.crm.ui.theme.TagSlate
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val timestampFmt = DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a")

@Composable
fun NotesSection(
    notes: List<Note>,
    noteTags: List<NoteTag>,
    getUserName: (Int) -> String,
    onDelete: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        notes.sortedByDescending { it.createdAt }.forEach { note ->
            NoteCard(
                note = note,
                noteTags = noteTags,
                getUserName = getUserName,
                onDelete = { onDelete(note.id) }
            )
        }
    }
}

@Composable
private fun NoteCard(
    note: Note,
    noteTags: List<NoteTag>,
    getUserName: (Int) -> String,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showHistory by remember { mutableStateOf(false) }
    val createdStr = formatTimestamp(note.createdAt)
    val tags = note.tagIds.mapNotNull { id -> noteTags.find { it.id == id } }

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header: tags + actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tags
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
                    tags.forEach { tag ->
                        val color = when (tag.color) {
                            "red" -> TagRed
                            "amber" -> TagAmber
                            "sky" -> TagSky
                            else -> TagSlate
                        }
                        Text(
                            text = tag.label,
                            style = MaterialTheme.typography.labelSmall,
                            color = color,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 10.sp
                        )
                    }
                }
                // Actions
                Row {
                    if (!note.modificationHistory.isNullOrEmpty()) {
                        IconButton(onClick = { showHistory = !showHistory }) {
                            Icon(Icons.Outlined.History, "History",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
                        }
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Outlined.Delete, "Delete",
                            tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f))
                    }
                }
            }

            // Content
            Text(
                text = note.content,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 6,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(Modifier.height(4.dp))

            // Created by + date
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = getUserName(note.createdById),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp
                )
                Text(
                    text = createdStr,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp
                )
                note.lastModifiedAt?.let {
                    Text(
                        text = "(edited)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        fontSize = 10.sp
                    )
                }
            }

            // Modification history (expandable)
            AnimatedVisibility(visible = showHistory) {
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Edit History",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    note.modificationHistory?.sortedByDescending { it.modifiedAt }?.forEach { mod ->
                        Spacer(Modifier.height(4.dp))
                        Row {
                            Text(
                                text = formatTimestamp(mod.modifiedAt),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 10.sp
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = getUserName(mod.modifiedById),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 10.sp
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = mod.summary,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun formatTimestamp(isoStr: String): String = runCatching {
    Instant.parse(isoStr)
        .atZone(ZoneId.systemDefault())
        .format(timestampFmt)
}.getOrDefault(isoStr)
