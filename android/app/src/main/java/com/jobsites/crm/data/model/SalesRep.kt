package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SalesRep(
    @SerialName("salesrepid")
    val salesRepId: Int,
    @SerialName("firstname")
    val firstName: String,
    @SerialName("lastname")
    val lastName: String,
    val email: String? = null
) {
    val fullName: String get() = "$firstName $lastName"
}
