package com.tonkeeper.feature.wallet.selection

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.tonkeeper.feature.wallet.WalletEmptyException
import com.tonkeeper.feature.wallet.key.PublicKey
import kotlinx.coroutines.flow.first

class DataStoreWalletSelectionRepository(
    private val dataStore: DataStore<Preferences>
): WalletSelectionRepository {

    override suspend fun current(): PublicKey {
        val prefs = dataStore.data.first()
        val key = stringPreferencesKey(DefaultWalletAlias)
        val pk = prefs[key] ?: throw WalletEmptyException()
        return PublicKey(pk)
    }

    override suspend fun select(pk: PublicKey) {
        val key = stringPreferencesKey(DefaultWalletAlias)
        dataStore.edit { it[key] = pk.value }
    }

    companion object {
        private const val DefaultWalletAlias = "wallet.current"
    }
}
