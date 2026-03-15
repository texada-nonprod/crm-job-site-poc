package com.jobsites.crm.ui.screens.projectdetail.components

import android.Manifest
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Photo
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import androidx.core.content.FileProvider
import com.jobsites.crm.data.model.Attachment
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.NoteTag
import com.jobsites.crm.ui.theme.TagAmber
import com.jobsites.crm.ui.theme.TagRed
import com.jobsites.crm.ui.theme.TagSky
import com.jobsites.crm.ui.theme.TagSlate
import java.io.File
import java.time.Instant

private const val MAX_FILE_SIZE = 5L * 1024 * 1024 // 5 MB
private const val MAX_FILES = 10

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NoteFormSheet(
    noteTags: List<NoteTag>,
    editingNote: Note? = null,
    onDismiss: () -> Unit,
    onSave: (content: String, tagIds: List<String>, attachments: List<Attachment>) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val context = LocalContext.current
    var content by remember { mutableStateOf(editingNote?.content ?: "") }
    var selectedTagIds by remember { mutableStateOf(editingNote?.tagIds ?: emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var attachments by remember { mutableStateOf(editingNote?.attachments ?: emptyList()) }
    var attachmentError by remember { mutableStateOf<String?>(null) }

    // Camera URI for TakePicture contract
    var cameraUri by remember { mutableStateOf<Uri?>(null) }

    fun addAttachmentFromUri(uri: Uri) {
        attachmentError = null
        if (attachments.size >= MAX_FILES) {
            attachmentError = "Maximum $MAX_FILES files allowed."
            return
        }
        val att = createAttachmentFromUri(context, uri)
        if (att == null) {
            attachmentError = "Could not read file."
            return
        }
        if (att.fileSize > MAX_FILE_SIZE) {
            attachmentError = "${att.fileName} exceeds 5 MB limit."
            return
        }
        attachments = attachments + att
    }

    // ── Launchers ──────────────────────────────────────────────────

    val documentPickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri -> uri?.let { addAttachmentFromUri(it) } }

    val galleryPickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri -> uri?.let { addAttachmentFromUri(it) } }

    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            cameraUri?.let { addAttachmentFromUri(it) }
        }
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            val uri = createCameraUri(context)
            cameraUri = uri
            cameraLauncher.launch(uri)
        } else {
            Toast.makeText(context, "Camera permission is required", Toast.LENGTH_SHORT).show()
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = if (editingNote != null) "Edit Note" else "Add Note",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Content field
            OutlinedTextField(
                value = content,
                onValueChange = {
                    content = it
                    error = null
                },
                label = { Text("Content *") },
                minLines = 4,
                maxLines = 8,
                modifier = Modifier.fillMaxWidth(),
                isError = error != null
            )
            if (error != null) {
                Text(
                    text = error!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                )
            }

            Spacer(Modifier.height(16.dp))

            // Tags
            Text(
                text = "Tags",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                noteTags.forEach { tag ->
                    val selected = tag.id in selectedTagIds
                    val tagColor = when (tag.color) {
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
                            selectedContainerColor = tagColor.copy(alpha = 0.15f),
                            selectedLabelColor = tagColor
                        )
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Attachments ─────────────────────────────────────────
            Text(
                text = "Attachments",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            // Source buttons
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { documentPickerLauncher.launch(arrayOf("*/*")) },
                    enabled = attachments.size < MAX_FILES
                ) {
                    Icon(Icons.Outlined.AttachFile, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("File", fontSize = 13.sp)
                }
                OutlinedButton(
                    onClick = {
                        galleryPickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },
                    enabled = attachments.size < MAX_FILES
                ) {
                    Icon(Icons.Outlined.Photo, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Gallery", fontSize = 13.sp)
                }
                OutlinedButton(
                    onClick = {
                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                    },
                    enabled = attachments.size < MAX_FILES
                ) {
                    Icon(Icons.Outlined.CameraAlt, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Camera", fontSize = 13.sp)
                }
            }

            // Error
            if (attachmentError != null) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = attachmentError!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            // File count
            if (attachments.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "${attachments.size}/$MAX_FILES files",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(4.dp))

                // Attachment list
                attachments.forEachIndexed { index, att ->
                    AttachmentRow(
                        attachment = att,
                        onRemove = {
                            attachments = attachments.toMutableList().also { it.removeAt(index) }
                            attachmentError = null
                        }
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Save button
            Button(
                onClick = {
                    if (content.isBlank()) {
                        error = "Please enter note content."
                        return@Button
                    }
                    onSave(content.trim(), selectedTagIds, attachments)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (editingNote != null) "Save" else "Add Note")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun AttachmentRow(
    attachment: Attachment,
    onRemove: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (attachment.fileType.startsWith("image"))
                Icons.Outlined.Image else Icons.Outlined.Description,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(20.dp)
        )
        Spacer(Modifier.width(8.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = attachment.fileName,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = formatFileSize(attachment.fileSize),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 10.sp
            )
        }
        IconButton(onClick = onRemove, modifier = Modifier.size(28.dp)) {
            Icon(
                Icons.Outlined.Close, "Remove",
                tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════
//  Helpers
// ═════════════════════════════════════════════════════════════════════

private fun createCameraUri(context: Context): Uri {
    val dir = File(context.cacheDir, "camera_photos").also { it.mkdirs() }
    val file = File(dir, "photo_${System.currentTimeMillis()}.jpg")
    return FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        file
    )
}

private fun createAttachmentFromUri(context: Context, uri: Uri): Attachment? {
    val resolver = context.contentResolver
    var fileName = "file"
    var fileSize = 0L

    resolver.query(uri, null, null, null, null)?.use { cursor ->
        val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
        if (cursor.moveToFirst()) {
            if (nameIdx >= 0) fileName = cursor.getString(nameIdx) ?: "file"
            if (sizeIdx >= 0) fileSize = cursor.getLong(sizeIdx)
        }
    }

    val mimeType = resolver.getType(uri) ?: "application/octet-stream"

    return Attachment(
        id = 0,
        fileName = fileName,
        fileUrl = uri.toString(),
        fileType = mimeType,
        fileSize = fileSize,
        uploadedAt = Instant.now().toString()
    )
}

internal fun formatFileSize(bytes: Long): String = when {
    bytes < 1024 -> "$bytes B"
    bytes < 1024 * 1024 -> "%.1f KB".format(bytes / 1024.0)
    else -> "%.1f MB".format(bytes / (1024.0 * 1024.0))
}
