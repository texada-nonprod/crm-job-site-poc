package com.jobsites.crm.data.model

data class ChangeLogEntry(
    val id: Int,
    val projectId: Int,
    val timestamp: String,
    val action: String,
    val category: String,  // "Project", "Opportunity", "Company", "Activity", "Note", "Equipment"
    val summary: String,
    val changedById: Int,
    val details: Map<String, String>? = null
)
