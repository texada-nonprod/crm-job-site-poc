package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonPrimitive

@Serializable
data class Product(
    val partCategoryId: Int = 0,
    val rentDurationTypeId: Int = 0,
    val isPrimary: Boolean = false,
    val quantity: Int = 0,
    val id: Int,
    val rentDuration: Int = 0,
    val familyId: Int = 0,
    val age: Int = 0,
    val hours: Int = 0,
    val unitPrice: Double = 0.0,
    val description: String = "",
    val makeId: String = "",
    val baseModelId: String = "",
    val stockNumber: String = "",
    val serialNumber: String = "",
    val quoteId: Int = 0,
    val quoteStatusId: Int = 0,
    val typeCodeId: Int = 0,
    val equipmentStatusId: String = ""
)

@Serializable
data class ProductGroup(
    val statusId: Int,
    val id: Int,
    val order: Int,
    val products: List<Product> = emptyList()
)

@Serializable
data class Opportunity(
    val id: Int,
    val estimateDeliveryMonth: Int? = null,
    val isUrgent: Boolean = false,
    val typeId: Int,
    val probabilityOfClosingId: JsonPrimitive? = null,
    val estimateDeliveryYear: Int? = null,
    val stageId: Int,
    val phaseId: Int,
    val stageIdEnteredAt: Int = 0,
    @SerialName("jobSiteId")
    val projectId: Int = 0,
    val salesRepId: Int,
    val ownerUserId: Int,
    val originatorUserId: Int,
    val sourceId: Int = 0,
    val campaignId: Int = 0,
    val classificationId: String = "",
    val cmCaseId: String = "",
    val estimateRevenue: Double = 0.0,
    val enterDate: String = "",
    val changeDate: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val customerAddress: String = "",
    val customerCity: String = "",
    val customerZipCode: String = "",
    val customerState: String = "",
    val principalWorkCodeId: String = "",
    val externalReferenceNumber: String = "",
    val branchId: Int = 0,
    val olgaOpportunityId: String = "",
    val contactName: String = "",
    val contactPhone: String = "",
    val contactEmail: String = "",
    val description: String = "",
    val industryCodeId: String = "",
    val workOrderId: String = "",
    val customerCountry: String = "",
    val divisionId: String = "",
    @SerialName("PSETypeId")
    val pseTypeId: Int = 0,
    val additionalSourceIds: List<Int> = emptyList(),
    val productGroups: List<ProductGroup>? = null
)
