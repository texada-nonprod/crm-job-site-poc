// TODO: In production, this prototype ModalBottomSheet form will be replaced by
// navigating to the existing CRM Contact create/edit record screen within the
// company context (e.g. via deep link or API intent). This prototype form is a
// stand-in for adding contacts to a company on a project.
package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.CompanyContact
import com.jobsites.crm.data.model.ContactType
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddContactSheet(
    companyName: String,
    contactTypes: List<ContactType>,
    onDismiss: () -> Unit,
    onSave: (CompanyContact) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var contactTypeCode by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    val typeOptions = listOf(DropdownOption("", "None")) +
            contactTypes.map { DropdownOption(it.code, it.description) }

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
                text = "Add Contact",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = companyName,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it; error = null },
                label = { Text("First Name *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it; error = null },
                label = { Text("Last Name *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = title,
                onValueChange = { title = it; error = null },
                label = { Text("Title *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it; error = null },
                label = { Text("Phone *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it; error = null },
                label = { Text("Email *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            DropdownField(
                label = "Contact Type",
                options = typeOptions,
                selectedKey = contactTypeCode,
                onSelect = { contactTypeCode = it },
                modifier = Modifier.fillMaxWidth()
            )

            // Error
            if (error != null) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = error!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    if (firstName.isBlank()) { error = "First name is required."; return@Button }
                    if (lastName.isBlank()) { error = "Last name is required."; return@Button }
                    if (title.isBlank()) { error = "Title is required."; return@Button }
                    if (phone.isBlank()) { error = "Phone is required."; return@Button }
                    if (email.isBlank() || !email.contains("@")) {
                        error = "Valid email is required."; return@Button
                    }

                    val typeDesc = contactTypes.find { it.code == contactTypeCode }?.description

                    onSave(
                        CompanyContact(
                            id = 0,
                            name = "${firstName.trim()} ${lastName.trim()}",
                            firstName = firstName.trim(),
                            lastName = lastName.trim(),
                            title = title.trim(),
                            phone = phone.trim(),
                            mobilePhone = phone.trim(),
                            email = email.trim(),
                            typeCode = contactTypeCode.ifBlank { null },
                            typeDescription = typeDesc
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Add Contact")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
