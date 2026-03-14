package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MailCode(
    val code: String,
    val description: String
)
