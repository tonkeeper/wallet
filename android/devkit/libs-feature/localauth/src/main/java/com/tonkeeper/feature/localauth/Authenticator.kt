package com.tonkeeper.feature.localauth

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first

class Authenticator(
    private val config: Config,
    private val datastore: DataStore<Preferences>
) {

    suspend fun authWithPasscode(passcode: String) {
        val prefs = datastore.data.first()
        val saved = prefs[stringPreferencesKey(config.passcodeAlias)]
    }

    suspend fun authWithBiometry() {

    }

    suspend fun isPasscodeEnabled(): Boolean {
        val prefs = datastore.data.first()
        return prefs.contains(stringPreferencesKey(config.passcodeAlias))
    }

    suspend fun isBiometryEnabled(): Boolean {
        return TODO()
    }

    suspend fun setupPasscode(value: String) {
        datastore.edit {
            it[stringPreferencesKey(config.passcodeAlias)] = value
        }
    }

    suspend fun setupBiometry() {

    }

    data class Config(
        val fileName: String = DefaultFileName,
        val passcodeAlias: String = DefaultPasscodeAlias,
        val keystoreAlias: String = DefaultKeystoreAlias
    )

    companion object {
        private const val DefaultFileName = "localauth"
        private const val DefaultPasscodeAlias = "passcode"
        private const val DefaultBiometryAlias = "biometry"
        private const val DefaultKeystoreAlias = "passcodekey"
    }
}
