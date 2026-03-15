package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.AssociatedOpportunity
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.ui.components.StatusBadge
import com.jobsites.crm.ui.theme.RevenuePipeline
import com.jobsites.crm.ui.theme.RevenueWon
import java.text.NumberFormat
import java.util.Locale

private val currencyFmt = NumberFormat.getCurrencyInstance(Locale.US).apply { maximumFractionDigits = 0 }

@Composable
fun OpportunitySection(
    associatedOpportunities: List<AssociatedOpportunity>,
    fullOpportunities: List<Opportunity>,
    getStageName: (Int) -> String,
    getTypeName: (Int) -> String,
    getSalesRepName: (Int) -> String,
    onEdit: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        associatedOpportunities.forEachIndexed { index, ao ->
            val fullOpp = fullOpportunities.find { it.id == ao.id }
            OpportunityCard(
                ao = ao,
                fullOpp = fullOpp,
                getStageName = getStageName,
                getTypeName = getTypeName,
                getSalesRepName = getSalesRepName,
                onClick = { onEdit(ao.id) }
            )
            if (index < associatedOpportunities.lastIndex) {
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun OpportunityCard(
    ao: AssociatedOpportunity,
    fullOpp: Opportunity?,
    getStageName: (Int) -> String,
    getTypeName: (Int) -> String,
    getSalesRepName: (Int) -> String,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val isWon = ao.stageId == 16
    val revenueColor = if (isWon) RevenueWon else RevenuePipeline

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Row 1: Description + Revenue
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ao.description.ifBlank { "Opportunity #${ao.id}" },
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = currencyFmt.format(ao.revenue),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = revenueColor,
                    fontSize = 14.sp
                )
            }

            Spacer(Modifier.height(4.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            Spacer(Modifier.height(4.dp))

            // Row 2: Stage + Type
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                DetailChip("Stage", getStageName(ao.stageId))
                if (fullOpp != null) {
                    DetailChip("Type", getTypeName(fullOpp.typeId))
                } else {
                    DetailChip("Type", ao.type)
                }
            }

            // Row 3: Sales Rep + Est Close
            if (fullOpp != null) {
                Spacer(Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DetailChip("Rep", getSalesRepName(fullOpp.salesRepId))
                    val estClose = buildEstClose(fullOpp.estimateDeliveryMonth, fullOpp.estimateDeliveryYear)
                    if (estClose.isNotBlank()) {
                        DetailChip("Est. Close", estClose)
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailChip(label: String, value: String) {
    Row {
        Text(
            text = "$label: ",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

private fun buildEstClose(month: Int?, year: Int?): String {
    if (month == null || year == null) return ""
    val monthNames = listOf("", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    val monthName = monthNames.getOrElse(month) { "" }
    return if (monthName.isNotBlank()) "$monthName $year" else "$year"
}
