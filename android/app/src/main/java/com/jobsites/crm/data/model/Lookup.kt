package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LookupOption(
    val id: String,
    val label: String,
    val displayOrder: Int
)

@Serializable
data class LookupsData(
    val primaryStages: List<LookupOption> = emptyList(),
    val primaryProjectTypes: List<LookupOption> = emptyList(),
    val ownershipTypes: List<LookupOption> = emptyList(),
    val uomTypes: List<LookupOption> = emptyList()
)
