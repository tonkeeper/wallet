package com.tonkeeper.feature.wallet.info

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.tonkeeper.feature.wallet.WalletNotFoundException
import com.tonkeeper.feature.wallet.key.PublicKey
import kotlinx.coroutines.flow.first

class DataStoreWalletInfoRepository(
    private val datastore: DataStore<Preferences>
) : WalletInfoRepository {

    override suspend fun save(pk: PublicKey): WalletInfo {
        val info = WalletInfo(pk)
        val json = WalletInfoSerializer.serializeToString(info)
        val key = info.pk.getInfoKey()
        datastore.edit { it[key] = json }
        return info
    }

    override suspend fun update(pk: PublicKey, info: WalletInfo) {
        val prefs = datastore.data.first()
        val key = pk.getInfoKey()
        if (prefs.contains(key).not()) throw WalletNotFoundException(pk.value)

        datastore.edit {
            it[key] = WalletInfoSerializer.serializeToString(info)
        }
    }

    override suspend fun get(pk: PublicKey): WalletInfo {
        val prefs = datastore.data.first()
        val key = pk.getInfoKey()
        val json = prefs[key] ?: throw WalletNotFoundException(pk.value)
        return WalletInfoSerializer.deserializeFromString(json)
    }

    override suspend fun all(): List<WalletInfo> {
        val prefs = datastore.data.first()
        return prefs.asMap().toList()
            .filter { (key, _) -> key.name.startsWith(DefaultInfoAliasPrefix) }
            .mapNotNull { (_, value) -> value as? String }
            .map { WalletInfoSerializer.deserializeFromString(it) }
    }

    override suspend fun remove(pk: PublicKey) {
        val prefs = datastore.data.first()
        val key = pk.getInfoKey()
        if (prefs.contains(key).not()) throw WalletNotFoundException(pk.value)

        datastore.edit { it.remove(key) }
    }

    override suspend fun clear() {
        datastore.edit { it.clear() }
    }

    private fun PublicKey.getInfoKey(): Preferences.Key<String> {
        return stringPreferencesKey(getInfoAlias())
    }

    private fun PublicKey.getInfoAlias(): String {
        return DefaultInfoAliasPrefix + this.value
    }

    companion object {
        private const val DefaultInfoAliasPrefix = "info."
    }
}
