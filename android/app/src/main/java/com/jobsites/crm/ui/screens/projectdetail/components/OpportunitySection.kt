package com.jobsites.crm.ui.screens.projectdetail.components

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.AssociatedOpportunity
import com.jobsites.crm.data.model.Opportunity
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
    getStagePhaseId: (Int) -> Int?,
    getTypeName: (Int) -> String,
    getSalesRepName: (Int) -> String,
    currentUserId: Int,
    initialShowOpenOnly: Boolean = false,
    initialShowMineOnly: Boolean = false,
    onFilterChange: (showOpenOnly: Boolean, showMineOnly: Boolean) -> Unit = { _, _ -> },
    onEdit: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var showOpenOnly by remember { mutableStateOf(initialShowOpenOnly) }
    var showMineOnly by remember { mutableStateOf(initialShowMineOnly) }

    // Apply toggle filters first
    val toggled = associatedOpportunities.filter { ao ->
        val fullOpp = fullOpportunities.find { it.id == ao.id }
        val matchesOpen = if (showOpenOnly) {
            val phaseId = getStagePhaseId(ao.stageId)
            phaseId == 1 || phaseId == 2
        } else true
        val matchesMine = if (showMineOnly) {
            fullOpp?.salesRepId == currentUserId
        } else true
        matchesOpen && matchesMine
    }

    // Then apply search
    val filtered = if (searchQuery.isBlank()) toggled else {
        val q = searchQuery.lowercase()
        toggled.filter { ao ->
            val fullOpp = fullOpportunities.find { it.id == ao.id }
            ao.description.lowercase().contains(q) ||
            ao.type.lowercase().contains(q) ||
            getStageName(ao.stageId).lowercase().contains(q) ||
            (fullOpp?.customerName?.lowercase()?.contains(q) == true) ||
            (fullOpp?.let { getSalesRepName(it.salesRepId).lowercase().contains(q) } == true) ||
            (fullOpp?.let { getTypeName(it.typeId).lowercase().contains(q) } == true)
        }
    }

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        // Filter toggles
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = showOpenOnly,
                onClick = {
                    showOpenOnly = !showOpenOnly
                    onFilterChange(showOpenOnly, showMineOnly)
                },
                label = { Text("Open Only") }
            )
            FilterChip(
                selected = showMineOnly,
                onClick = {
                    showMineOnly = !showMineOnly
                    onFilterChange(showOpenOnly, showMineOnly)
                },
                label = { Text("My Opportunities") }
            )
        }

        // Search bar
        if (associatedOpportunities.size > 3) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search opportunities…", style = MaterialTheme.typography.bodySmall) },
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

        if (filtered.isEmpty() && (searchQuery.isNotBlank() || showOpenOnly || showMineOnly)) {
            Text(
                text = if (searchQuery.isNotBlank()) "No opportunities match \"$searchQuery\""
                       else "No opportunities match current filters",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        filtered.forEachIndexed { index, ao ->
            val fullOpp = fullOpportunities.find { it.id == ao.id }
            OpportunityCard(
                ao = ao,
                fullOpp = fullOpp,
                getStageName = getStageName,
                getTypeName = getTypeName,
                getSalesRepName = getSalesRepName,
                onClick = { onEdit(ao.id) }
            )
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
                    fontSize = 16.sp
                )
            }

            Spacer(Modifier.height(4.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            Spacer(Modifier.height(4.dp))

            // Row 2: Company (if available)
            if (fullOpp != null && fullOpp.customerName.isNotBlank()) {
                Text(
                    text = fullOpp.customerName,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(2.dp))
            }

            // Row 3: Stage + Type
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
