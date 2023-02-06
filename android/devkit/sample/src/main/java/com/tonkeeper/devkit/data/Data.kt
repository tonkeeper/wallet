package com.tonkeeper.devkit.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore

val Context.settingsDataStore: DataStore<Preferences>
        by preferencesDataStore(name = "passcode-v1")

val Context.walletInfoDataStore: DataStore<Preferences>
        by preferencesDataStore(name = "wallet.info-v1")

val Context.walletSecretDataStore: DataStore<Preferences>
        by preferencesDataStore(name = "wallet.secret-v1")
