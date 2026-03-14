package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ContactType(
    val code: String,
    val description: String
)
