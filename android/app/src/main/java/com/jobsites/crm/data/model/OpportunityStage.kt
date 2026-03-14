package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OpportunityStage(
    @SerialName("stageid")
    val stageId: Int,
    @SerialName("stagename")
    val stageName: String,
    @SerialName("languageid")
    val languageId: Int = 1,
    @SerialName("phaseid")
    val phaseId: Int,
    @SerialName("displayorder")
    val displayOrder: Int,
    @SerialName("psopportunitydisplayorder")
    val psOpportunityDisplayOrder: Int = 0,
    @SerialName("DisplayStageName")
    val displayStageName: String = "",
    val phase: String = "",
    @SerialName("marketingprobability")
    val marketingProbability: Int? = null,
    @SerialName("salesprobability")
    val salesProbability: Int? = null,
    @SerialName("oppitemtypeid")
    val oppItemTypeId: Int = 0,
    @SerialName("readonlyind")
    val readOnlyInd: Int = 0
)
