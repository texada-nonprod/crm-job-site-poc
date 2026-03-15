package com.jobsites.crm.ui.screens.projectdetail.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.CompanyContact
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.ui.theme.RevenuePipeline
import com.jobsites.crm.ui.theme.RevenueWon
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private val currencyFmt = NumberFormat.getCurrencyInstance(Locale.US).apply { maximumFractionDigits = 0 }
private val dateFmt = DateTimeFormatter.ofPattern("MMM d, yyyy")

@Composable
fun ProjectInfoCard(
    project: Project,
    wonRevenue: Double,
    pipelineRevenue: Double,
    ownerCompanyName: String?,
    ownerContacts: List<CompanyContact> = emptyList(),
    lookupLabel: (String, String) -> String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            SectionTitle("Project Details")

            // Address
            val address = buildString {
                if (project.address.street.isNotBlank()) appendLine(project.address.street)
                val cityState = listOfNotNull(
                    project.address.city.takeIf { it.isNotBlank() },
                    project.address.state.takeIf { it.isNotBlank() }
                ).joinToString(", ")
                if (cityState.isNotBlank()) append(cityState)
                if (project.address.zipCode.isNotBlank()) append(" ${project.address.zipCode}")
            }.trim()
            if (address.isNotBlank()) {
                InfoRow("Address", address)
            }

            // Description
            if (project.description.isNotBlank()) {
                InfoRow("Description", project.description)
            }

            // Owner + contacts
            if (ownerCompanyName != null) {
                InfoRow("Owner", ownerCompanyName)
                if (ownerContacts.isNotEmpty()) {
                    Spacer(Modifier.height(2.dp))
                    ownerContacts.forEach { contact ->
                        OwnerContactRow(contact)
                    }
                    Spacer(Modifier.height(2.dp))
                }
            }

            // Valuation
            project.valuation?.let {
                InfoRow("Valuation", currencyFmt.format(it))
            }

            // Lookup fields
            project.primaryStageId?.let {
                InfoRow("Primary Stage", lookupLabel("primaryStage", it))
            }
            project.primaryProjectTypeId?.let {
                InfoRow("Project Type", lookupLabel("primaryProjectType", it))
            }
            project.ownershipTypeId?.let {
                InfoRow("Ownership", lookupLabel("ownershipType", it))
            }

            // Dates
            project.bidDate?.let { InfoRow("Bid Date", formatDate(it)) }
            project.targetStartDate?.let { InfoRow("Target Start", formatDate(it)) }
            project.targetCompletionDate?.let { InfoRow("Target Completion", formatDate(it)) }

            // Revenue summary
            if (wonRevenue > 0 || pipelineRevenue > 0) {
                Spacer(Modifier.height(8.dp))
                HorizontalDivider()
                Spacer(Modifier.height(8.dp))
                SectionTitle("Revenue")
                if (pipelineRevenue > 0) {
                    InfoRow("Pipeline", currencyFmt.format(pipelineRevenue), valueColor = RevenuePipeline)
                }
                if (wonRevenue > 0) {
                    InfoRow("Won", currencyFmt.format(wonRevenue), valueColor = RevenueWon)
                }
            }
        }
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(bottom = 6.dp)
    )
}

@Composable
private fun InfoRow(
    label: String,
    value: String,
    valueColor: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(0.4f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Medium,
            color = valueColor,
            modifier = Modifier.weight(0.6f)
        )
    }
}

@Composable
private fun OwnerContactRow(contact: CompanyContact) {
    val context = LocalContext.current
    val phone = contact.mobilePhone ?: contact.businessPhone ?: contact.phone

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 12.dp, bottom = 4.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Name + title column
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = contact.name,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium
                )
                contact.title?.takeIf { it.isNotBlank() }?.let {
                    Text(
                        text = " — $it",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }
            // Phone + Email inline
            Row(
                modifier = Modifier.padding(top = 2.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (phone.isNotBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone")))
                        }
                    ) {
                        Icon(
                            Icons.Outlined.Phone, null,
                            modifier = Modifier.size(13.dp),
                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                        )
                        Spacer(Modifier.width(3.dp))
                        Text(
                            text = phone,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 11.sp
                        )
                    }
                }
                if (contact.email.isNotBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:${contact.email}")))
                        }
                    ) {
                        Icon(
                            Icons.Outlined.Email, null,
                            modifier = Modifier.size(13.dp),
                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                        )
                        Spacer(Modifier.width(3.dp))
                        Text(
                            text = contact.email,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }
    }
}

private fun formatDate(dateStr: String): String = runCatching {
    LocalDate.parse(dateStr.take(10)).format(dateFmt)
}.getOrDefault(dateStr)
