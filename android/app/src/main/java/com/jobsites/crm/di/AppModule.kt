package com.jobsites.crm.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import com.jobsites.crm.data.network.NominatimService
import com.jobsites.crm.data.repository.JsonDataSource
import com.jobsites.crm.data.repository.filterDataStore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideJsonDataSource(@ApplicationContext context: Context): JsonDataSource =
        JsonDataSource(context)

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient()

    @Provides
    @Singleton
    fun provideNominatimService(client: OkHttpClient): NominatimService =
        NominatimService(client)

    @Provides
    @Singleton
    fun provideFilterDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        context.filterDataStore
}
