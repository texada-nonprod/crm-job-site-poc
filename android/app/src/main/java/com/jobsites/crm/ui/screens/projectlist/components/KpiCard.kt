package com.jobsites.crm.ui.screens.projectlist.components

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
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.repository.RevenueByType
import com.jobsites.crm.ui.theme.RevenuePipeline
import com.jobsites.crm.ui.theme.RevenueWon
import java.text.NumberFormat
import java.util.Locale

private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US).apply {
    maximumFractionDigits = 0
}

@Composable
fun KpiCard(
    wonRevenue: Double,
    pipelineRevenue: Double,
    wonByType: List<RevenueByType>,
    pipelineByType: List<RevenueByType>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // Pipeline column
            RevenueColumn(
                label = "Pipeline",
                total = pipelineRevenue,
                byType = pipelineByType,
                icon = { Icon(Icons.AutoMirrored.Outlined.TrendingUp, null, tint = RevenuePipeline, modifier = Modifier.size(18.dp)) },
                accentColor = RevenuePipeline,
                modifier = Modifier.weight(1f)
            )

            Spacer(Modifier.width(12.dp))

            // Won column
            RevenueColumn(
                label = "Won",
                total = wonRevenue,
                byType = wonByType,
                icon = { Icon(Icons.Outlined.EmojiEvents, null, tint = RevenueWon, modifier = Modifier.size(18.dp)) },
                accentColor = RevenueWon,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun RevenueColumn(
    label: String,
    total: Double,
    byType: List<RevenueByType>,
    icon: @Composable () -> Unit,
    accentColor: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            icon()
            Spacer(Modifier.width(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Spacer(Modifier.height(2.dp))
        Text(
            text = currencyFormat.format(total),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = accentColor,
            fontSize = 18.sp
        )
        if (byType.isNotEmpty()) {
            Spacer(Modifier.height(4.dp))
            byType.forEach { item ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = item.typeName,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = currencyFormat.format(item.revenue),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
