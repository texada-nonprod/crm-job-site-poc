package com.jobsites.crm.ui.screens.projectdetail.components

import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.net.toUri
import com.jobsites.crm.data.model.Attachment
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

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun NotesSection(
    notes: List<Note>,
    noteTags: List<NoteTag>,
    getUserName: (Int) -> String,
    currentUserId: Int,
    onDelete: (Int) -> Unit,
    onEdit: (Note) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTagIds by remember { mutableStateOf<Set<String>>(emptySet()) }

    val sorted = notes.sortedByDescending { it.createdAt }
    val filtered = sorted.filter { note ->
        val matchesSearch = searchQuery.isBlank() ||
                note.content.lowercase().contains(searchQuery.lowercase())
        val matchesTags = selectedTagIds.isEmpty() ||
                note.tagIds.any { it in selectedTagIds }
        matchesSearch && matchesTags
    }

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        // Search bar (shown when > 3 notes)
        if (notes.size > 3) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search notes…", style = MaterialTheme.typography.bodySmall) },
                leadingIcon = { Icon(Icons.Outlined.Search, null, modifier = Modifier.size(18.dp)) },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Outlined.Close, "Clear", modifier = Modifier.size(16.dp))
                        }
                    }
                },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                textStyle = MaterialTheme.typography.bodySmall,
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                )
            )
        }

        // Tag filter chips
        if (noteTags.isNotEmpty()) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                noteTags.forEach { tag ->
                    val selected = tag.id in selectedTagIds
                    val chipColor = when (tag.color) {
                        "red" -> TagRed
                        "amber" -> TagAmber
                        "sky" -> TagSky
                        else -> TagSlate
                    }
                    FilterChip(
                        selected = selected,
                        onClick = {
                            selectedTagIds = if (selected)
                                selectedTagIds - tag.id
                            else
                                selectedTagIds + tag.id
                        },
                        label = { Text(tag.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = chipColor.copy(alpha = 0.15f),
                            selectedLabelColor = chipColor
                        )
                    )
                }
            }
        }

        // Filtered note list
        if (filtered.isEmpty() && notes.isNotEmpty()) {
            Text(
                text = "No notes match your filters",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        filtered.forEach { note ->
            NoteCard(
                note = note,
                noteTags = noteTags,
                getUserName = getUserName,
                canEdit = note.createdById == currentUserId,
                onEdit = { onEdit(note) },
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
    canEdit: Boolean,
    onEdit: () -> Unit,
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
                            fontSize = 12.sp
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
                    if (canEdit) {
                        IconButton(onClick = onEdit) {
                            Icon(Icons.Outlined.Edit, "Edit",
                                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
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

            // Attachments
            if (note.attachments.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Outlined.AttachFile, null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "${note.attachments.size} attachment${if (note.attachments.size != 1) "s" else ""}",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp
                    )
                }
                Spacer(Modifier.height(2.dp))
                note.attachments.forEach { att ->
                    AttachmentFileRow(attachment = att)
                }
            }

            Spacer(Modifier.height(4.dp))

            // Created by + date
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = getUserName(note.createdById),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp
                )
                Text(
                    text = createdStr,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp
                )
                note.lastModifiedAt?.let {
                    Text(
                        text = "(edited)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        fontSize = 12.sp
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
                        Text(
                            text = "${formatTimestamp(mod.modifiedAt)}  ${getUserName(mod.modifiedById)} — ${mod.summary}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AttachmentFileRow(attachment: Attachment) {
    val context = LocalContext.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                try {
                    val uri = attachment.fileUrl.toUri()
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, attachment.fileType)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(intent)
                } catch (_: Exception) {
                    Toast
                        .makeText(context, "No app to open this file", Toast.LENGTH_SHORT)
                        .show()
                }
            }
            .padding(vertical = 2.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (attachment.fileType.startsWith("image"))
                Icons.Outlined.Image else Icons.Outlined.Description,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f),
            modifier = Modifier.size(16.dp)
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = attachment.fileName,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
            fontSize = 13.sp
        )
        if (attachment.fileSize > 0) {
            Spacer(Modifier.width(6.dp))
            Text(
                text = formatFileSize(attachment.fileSize),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp
            )
        }
    }
}

private fun formatTimestamp(isoStr: String): String = runCatching {
    Instant.parse(isoStr)
        .atZone(ZoneId.systemDefault())
        .format(timestampFmt)
}.getOrDefault(isoStr)
