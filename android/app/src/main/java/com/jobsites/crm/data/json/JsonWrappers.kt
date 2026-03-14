package com.jobsites.crm.data.json

import kotlinx.serialization.Serializable

/**
 * Generic wrapper for JSON files that use the {"content":[...]} structure.
 *
 * Used by: Project.json, Opportunity.json, SalesReps.json, Users.json,
 *          OpportunityStages.json, OpportunityTypes.json, ActivityTypes.json,
 *          Campaigns.json, Issues.json
 *
 * Files that are direct arrays (no wrapper): CompanyEquipment.json, ContactTypes.json
 * Files with custom structure: Lookups.json (uses LookupsData directly)
 */
@Serializable
data class ContentWrapper<T>(
    val content: List<T>
)
