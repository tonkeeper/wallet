package com.tonkeeper.feature.wallet

import android.util.Base64
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.tonkeeper.feature.wallet.info.WalletInfo
import com.tonkeeper.feature.wallet.info.WalletInfoSerializer
import com.tonkeeper.feature.wallet.info.toWalletInfo
import com.tonkeeper.feature.wallet.key.PublicKey
import com.tonkeeper.feature.wallet.keystore.getCipher
import com.tonkeeper.feature.wallet.keystore.getOrCreateSecretKey
import com.tonkeeper.ton.crypto.toHex
import com.tonkeeper.ton.mnemonic.Mnemonic
import com.tonkeeper.ton.mnemonic.MnemonicSerializer
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.first
import org.json.JSONObject
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec

class WalletStorage(
    private val mnemonicDataStore: DataStore<Preferences>,
    private val walletDataStore: DataStore<Preferences>
) {

    suspend fun import(mnemonic: List<String>): Unit = coroutineScope {
        val isCorrect = Mnemonic.isCorrect(mnemonic)
        if (!isCorrect) throw WalletMnemonicInvalidException()

        val keys = Mnemonic.toKeyPair(mnemonic)
        val pk = PublicKey(keys.publicKey.toHex())
        val serialized = MnemonicSerializer.serializeToString(mnemonic)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        val iv = loadCipherIv()
        if (iv != null) {
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, iv)
        } else {
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            saveCipherIv(cipher.iv)
        }

        val encrypted = cipher.doFinal(serialized.toByteArray())
        val encoded = Base64.encodeToString(encrypted, Base64.DEFAULT)

        val mnemonicStoreKey = stringPreferencesKey(getMnemonicAlias(pk))
        val walletStoreKey = stringPreferencesKey(getMnemonicAlias(pk))
        val saveMnemonic = async { mnemonicDataStore.edit { it[mnemonicStoreKey] = encoded } }
        val saveInfo = async { walletDataStore.edit { it[walletStoreKey] = encoded } }

        saveMnemonic.await()
        saveInfo.await()
    }

    suspend fun update(pk: PublicKey, label: String) {
        val prefs = walletDataStore.data.first()
        val key = stringPreferencesKey(getInfoAlias(pk))
        val json = prefs[key] ?: throw WalletNotFoundException(pk.value)

        val info = JSONObject(json).toWalletInfo()
        val new = info.copy(label = label)

        walletDataStore.edit {
            it[key] = WalletInfoSerializer.serializeToString(new)
        }
    }

    suspend fun remove(pk: PublicKey) = coroutineScope {
        val mnemonicKey = stringPreferencesKey(getMnemonicAlias(pk))
        val walletKey = stringPreferencesKey(getInfoAlias(pk))

        val mnemonicRemove = async { mnemonicDataStore.edit { it.remove(mnemonicKey) } }
        val infoRemove = async { walletDataStore.edit { it.remove(walletKey) } }

        mnemonicRemove.await()
        infoRemove.await()
    }

    suspend fun export(pk: PublicKey): ByteArray {
        val mnemonic = backup(pk)
        val kp = Mnemonic.toKeyPair(mnemonic)
        return kp.secretKey
    }

    suspend fun backup(pk: PublicKey): List<String> {
        val prefs = mnemonicDataStore.data.first()
        val key = stringPreferencesKey(getMnemonicAlias(pk))
        val encoded = prefs[key] ?: throw WalletNotFoundException(pk.value)
        val encrypted = Base64.decode(encoded, Base64.DEFAULT)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        val iv = loadCipherIv()

        cipher.init(Cipher.DECRYPT_MODE, secretKey, iv)
        val raw = cipher.doFinal(encrypted)
        val serialized = String(raw)
        return MnemonicSerializer.deserializeFromString(serialized)
    }

    suspend fun wallet(pk: PublicKey): WalletInfo {
        val prefs = walletDataStore.data.first()
        val key = stringPreferencesKey(getInfoAlias(pk))
        val json = prefs[key] ?: throw WalletNotFoundException(pk.value)

        return WalletInfoSerializer.deserializeFromString(json)
    }

    suspend fun wallets(): List<WalletInfo> {
        val prefs = walletDataStore.data.first()
        return prefs.asMap().toList()
            .mapNotNull { (_, value) -> value as? String }
            .map { WalletInfoSerializer.deserializeFromString(it) }
    }

    suspend fun clear() = coroutineScope {
        val mnemonicClear = async { mnemonicDataStore.edit { it.clear() } }
        val walletClear = async { walletDataStore.edit { it.clear() } }
        mnemonicClear.await()
        walletClear.await()
    }

    private suspend fun saveCipherIv(bytes: ByteArray) {
        val encoded = Base64.encodeToString(bytes, Base64.DEFAULT)
        mnemonicDataStore.edit {
            it[stringPreferencesKey(DefaultMnemonicIvAlias)] = encoded
        }
    }

    private suspend fun loadCipherIv(): IvParameterSpec? {
        val prefs = mnemonicDataStore.data.first()
        val encoded = prefs[stringPreferencesKey(DefaultMnemonicIvAlias)] ?: return null

        val bytes = Base64.decode(encoded, Base64.DEFAULT)
        return IvParameterSpec(bytes)
    }

    private fun getMnemonicAlias(pk: PublicKey): String {
        return DefaultMnemonicAliasPrefix + pk.value
    }

    private fun getInfoAlias(pk: PublicKey): String {
        return DefaultInfoAliasPrefix + pk.value
    }

    companion object {
        private const val DefaultMnemonicAliasPrefix = "menmonic."
        private const val DefaultMnemonicIvAlias = "mnemonic-iv"

        private const val DefaultInfoAliasPrefix = "info."

        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "mnemonickey"
    }
}
