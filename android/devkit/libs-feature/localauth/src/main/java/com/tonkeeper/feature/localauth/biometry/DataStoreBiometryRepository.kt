package com.tonkeeper.feature.localauth.biometry

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import kotlinx.coroutines.flow.first

class DataStoreBiometryRepository(
    private val datastore: DataStore<Preferences>
) : BiometryRepository {

    override suspend fun isEnabled(): Boolean {
        val prefs = datastore.data.first()
        return prefs.contains(BiometryKey)
    }

    override suspend fun enable() {
        datastore.edit { it[BiometryKey] = true }
    }

    override suspend fun disable() {
        datastore.edit { it.remove(BiometryKey) }
    }

    companion object {
        private const val DefaultBiometryAlias = "biometry.enable"
        private val BiometryKey = booleanPreferencesKey(DefaultBiometryAlias)
    }
}