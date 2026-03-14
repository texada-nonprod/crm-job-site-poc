package com.jobsites.crm.data.model

/**
 * UI-only filter state (not serializable — not stored in JSON).
 * Mirrors the web app's Filters interface.
 */
data class Filters(
    val assigneeIds: List<String> = emptyList(),
    val divisions: List<String> = emptyList(),
    val generalContractor: String = "",
    val statuses: List<String> = emptyList(),
    val hideCompleted: Boolean = false
) {
    val isActive: Boolean
        get() = assigneeIds.isNotEmpty() ||
                divisions.isNotEmpty() ||
                generalContractor.isNotEmpty() ||
                statuses.isNotEmpty() ||
                hideCompleted

    val activeFilterCount: Int
        get() = listOf(
            assigneeIds.isNotEmpty(),
            divisions.isNotEmpty(),
            generalContractor.isNotEmpty(),
            statuses.isNotEmpty(),
            hideCompleted
        ).count { it }
}
