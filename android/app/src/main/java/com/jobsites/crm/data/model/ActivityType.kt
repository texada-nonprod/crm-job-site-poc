package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ActivityType(
    val id: String,
    val label: String
)
