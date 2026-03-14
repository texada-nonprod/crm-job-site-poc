package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val email: String? = null
) {
    val fullName: String get() = "$firstName $lastName"
}
