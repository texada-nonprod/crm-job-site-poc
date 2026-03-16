package com.jobsites.crm.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.jobsites.crm.data.model.Filters
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** Single DataStore instance for filter preferences. */
val Context.filterDataStore: DataStore<Preferences> by preferencesDataStore(name = "filter_prefs")

private object FilterKeys {
    val ASSIGNEE_IDS = stringSetPreferencesKey("filter_assignee_ids")
    val DIVISIONS = stringSetPreferencesKey("filter_divisions")
    val STATUSES = stringSetPreferencesKey("filter_statuses")
    val GENERAL_CONTRACTOR = stringPreferencesKey("filter_general_contractor")
    val HIDE_COMPLETED = booleanPreferencesKey("filter_hide_completed")
    val OPP_SHOW_OPEN_ONLY = booleanPreferencesKey("opp_show_open_only")
    val OPP_SHOW_MINE_ONLY = booleanPreferencesKey("opp_show_mine_only")
}

/** Persist current [Filters] to DataStore. */
suspend fun DataStore<Preferences>.saveFilters(filters: Filters) {
    edit { prefs ->
        prefs[FilterKeys.ASSIGNEE_IDS] = filters.assigneeIds.toSet()
        prefs[FilterKeys.DIVISIONS] = filters.divisions.toSet()
        prefs[FilterKeys.STATUSES] = filters.statuses.toSet()
        prefs[FilterKeys.GENERAL_CONTRACTOR] = filters.generalContractor
        prefs[FilterKeys.HIDE_COMPLETED] = filters.hideCompleted
        prefs[FilterKeys.OPP_SHOW_OPEN_ONLY] = filters.oppShowOpenOnly
        prefs[FilterKeys.OPP_SHOW_MINE_ONLY] = filters.oppShowMineOnly
    }
}

/** Observe saved [Filters] as a [Flow]. */
fun DataStore<Preferences>.filtersFlow(): Flow<Filters> = data.map { prefs ->
    Filters(
        assigneeIds = prefs[FilterKeys.ASSIGNEE_IDS]?.toList() ?: emptyList(),
        divisions = prefs[FilterKeys.DIVISIONS]?.toList() ?: emptyList(),
        statuses = prefs[FilterKeys.STATUSES]?.toList() ?: emptyList(),
        generalContractor = prefs[FilterKeys.GENERAL_CONTRACTOR] ?: "",
        hideCompleted = prefs[FilterKeys.HIDE_COMPLETED] ?: true,
        oppShowOpenOnly = prefs[FilterKeys.OPP_SHOW_OPEN_ONLY] ?: false,
        oppShowMineOnly = prefs[FilterKeys.OPP_SHOW_MINE_ONLY] ?: false
    )
}
