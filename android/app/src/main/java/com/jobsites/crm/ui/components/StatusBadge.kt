package com.jobsites.crm.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.ui.theme.*

/**
 * Maps a project statusId to a colored chip.
 * Matches the web app's StatusBadge component colors.
 */
@Composable
fun StatusBadge(
    statusId: String,
    modifier: Modifier = Modifier
) {
    val (bg, fg) = when (statusId) {
        "Active" -> StatusActiveBg to StatusActive
        "Planning" -> StatusPlanningBg to StatusPlanning
        "On Hold" -> StatusOnHoldBg to StatusOnHold
        "Completed" -> StatusCompletedBg to StatusCompleted
        else -> Color(0xFFF1F5F9) to Color(0xFF64748B) // slate fallback
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = statusId,
            color = fg,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.labelSmall
        )
    }
}
