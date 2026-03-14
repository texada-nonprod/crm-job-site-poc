package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OpportunityType(
    @SerialName("opptypeid")
    val oppTypeId: Int,
    @SerialName("opptypecode")
    val oppTypeCode: String,
    @SerialName("opptypedesc")
    val oppTypeDesc: String,
    @SerialName("displayorder")
    val displayOrder: Int,
    @SerialName("multiproductitemind")
    val multiProductItemInd: Int = 0,
    @SerialName("allprimaryproductitemind")
    val allPrimaryProductItemInd: Int = 0,
    @SerialName("languageid")
    val languageId: Int = 1
)
