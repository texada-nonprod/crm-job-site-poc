package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Issue(
    val id: Int,
    val customerId: String,
    val label: String
)
