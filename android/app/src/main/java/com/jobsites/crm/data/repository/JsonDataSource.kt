package com.jobsites.crm.data.repository

import android.content.Context
import com.jobsites.crm.data.json.ContentWrapper
import com.jobsites.crm.data.model.ActivityType
import com.jobsites.crm.data.model.Campaign
import com.jobsites.crm.data.model.ContactType
import com.jobsites.crm.data.model.CustomerEquipment
import com.jobsites.crm.data.model.Issue
import com.jobsites.crm.data.model.LookupsData
import com.jobsites.crm.data.model.MailCode
import com.jobsites.crm.data.model.Opportunity
import com.jobsites.crm.data.model.OpportunityStage
import com.jobsites.crm.data.model.OpportunityType
import com.jobsites.crm.data.model.Project
import com.jobsites.crm.data.model.SalesRep
import com.jobsites.crm.data.model.User
import kotlinx.serialization.json.Json

/**
 * Reads and deserializes all JSON asset files.
 *
 * JSON patterns in assets:
 *   {"content":[...]}  — Project, Opportunity, SalesReps, Users,
 *                         OpportunityStages, OpportunityTypes,
 *                         ActivityTypes, Campaigns, Issues
 *   Direct array [...]  — CompanyEquipment, ContactTypes, MailCodes
 *   Custom object {...}  — Lookups (LookupsData)
 */
class JsonDataSource(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    // ── Helper: read raw text from assets ────────────────────────────

    private fun readAsset(fileName: String): String =
        context.assets.open(fileName).bufferedReader().use { it.readText() }

    // ── Content-wrapped files: {"content":[...]} ─────────────────────

    fun loadProjects(): List<Project> =
        json.decodeFromString<ContentWrapper<Project>>(readAsset("Project.json")).content

    fun loadOpportunities(): List<Opportunity> =
        json.decodeFromString<ContentWrapper<Opportunity>>(readAsset("Opportunity.json")).content

    fun loadSalesReps(): List<SalesRep> =
        json.decodeFromString<ContentWrapper<SalesRep>>(readAsset("SalesReps.json")).content

    fun loadUsers(): List<User> =
        json.decodeFromString<ContentWrapper<User>>(readAsset("Users.json")).content

    fun loadOpportunityStages(): List<OpportunityStage> =
        json.decodeFromString<ContentWrapper<OpportunityStage>>(readAsset("OpportunityStages.json")).content

    fun loadOpportunityTypes(): List<OpportunityType> =
        json.decodeFromString<ContentWrapper<OpportunityType>>(readAsset("OpportunityTypes.json")).content

    fun loadActivityTypes(): List<ActivityType> =
        json.decodeFromString<ContentWrapper<ActivityType>>(readAsset("ActivityTypes.json")).content

    fun loadCampaigns(): List<Campaign> =
        json.decodeFromString<ContentWrapper<Campaign>>(readAsset("Campaigns.json")).content

    fun loadIssues(): List<Issue> =
        json.decodeFromString<ContentWrapper<Issue>>(readAsset("Issues.json")).content

    // ── Direct array files: [...] ────────────────────────────────────

    fun loadCompanyEquipment(): List<CustomerEquipment> =
        json.decodeFromString<List<CustomerEquipment>>(readAsset("CompanyEquipment.json"))

    fun loadContactTypes(): List<ContactType> =
        json.decodeFromString<List<ContactType>>(readAsset("ContactTypes.json"))

    fun loadMailCodes(): List<MailCode> =
        json.decodeFromString<List<MailCode>>(readAsset("MailCodes.json"))

    // ── Custom structure files ───────────────────────────────────────

    fun loadLookups(): LookupsData =
        json.decodeFromString<LookupsData>(readAsset("Lookups.json"))
}
