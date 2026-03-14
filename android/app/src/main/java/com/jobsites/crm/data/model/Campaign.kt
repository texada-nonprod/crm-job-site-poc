package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Campaign(
    val id: Int,
    val label: String
)
