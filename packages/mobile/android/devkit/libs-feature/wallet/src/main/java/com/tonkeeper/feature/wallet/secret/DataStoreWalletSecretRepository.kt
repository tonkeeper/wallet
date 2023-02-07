package com.tonkeeper.feature.wallet.secret

import android.util.Base64
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.tonkeeper.feature.wallet.WalletAlreadyExist
import com.tonkeeper.feature.wallet.WalletNotFoundException
import com.tonkeeper.feature.wallet.key.PublicKey
import com.tonkeeper.feature.wallet.keystore.getCipher
import com.tonkeeper.feature.wallet.keystore.getOrCreateSecretKey
import com.tonkeeper.ton.crypto.toHex
import com.tonkeeper.ton.mnemonic.Mnemonic
import com.tonkeeper.ton.mnemonic.MnemonicSerializer
import kotlinx.coroutines.flow.first
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec

class DataStoreWalletSecretRepository(
    private val datastore: DataStore<Preferences>
) : WalletSecretRepository {

    override suspend fun save(mnemonic: List<String>): PublicKey {
        val keys = Mnemonic.toKeyPair(mnemonic)
        val pk = PublicKey(keys.publicKey.toHex())
        val serialized = MnemonicSerializer.serializeToString(mnemonic)

        val prefs = datastore.data.first()
        val key = pk.getMnemonicKey()
        if (prefs.contains(key)) throw WalletAlreadyExist(pk.value)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        saveCipherIv(pk, cipher.iv)

        val encrypted = cipher.doFinal(serialized.toByteArray())
        val encoded = Base64.encodeToString(encrypted, Base64.DEFAULT)

        datastore.edit { it[key] = encoded }

        return pk
    }

    override suspend fun getMnemonic(pk: PublicKey): List<String> {
        val prefs = datastore.data.first()
        val key = pk.getMnemonicKey()
        val encoded = prefs[key] ?: throw WalletNotFoundException(pk.value)
        val encrypted = Base64.decode(encoded, Base64.DEFAULT)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        val iv = loadCipherIv(pk)

        cipher.init(Cipher.DECRYPT_MODE, secretKey, iv)
        val raw = cipher.doFinal(encrypted)
        val serialized = String(raw)
        return MnemonicSerializer.deserializeFromString(serialized)
    }

    override suspend fun getSecretKey(pk: PublicKey): ByteArray {
        val mnemonic = getMnemonic(pk)
        val kp = Mnemonic.toKeyPair(mnemonic)
        return kp.secretKey
    }

    override suspend fun remove(pk: PublicKey) {
        val mnemonicKey = pk.getMnemonicKey()
        val mnemonicIvKey = pk.getMnemonicIvKey()

        datastore.edit {
            it.remove(mnemonicKey)
            it.remove(mnemonicIvKey)
        }
    }

    override suspend fun clear() {
        datastore.edit {
            it.clear()
        }
    }

    private suspend fun saveCipherIv(pk: PublicKey, bytes: ByteArray) {
        val encoded = Base64.encodeToString(bytes, Base64.DEFAULT)
        val key = pk.getMnemonicIvKey()
        datastore.edit { it[key] = encoded }
    }

    private suspend fun loadCipherIv(pk: PublicKey): IvParameterSpec? {
        val prefs = datastore.data.first()
        val key = pk.getMnemonicIvKey()
        val encoded = prefs[key] ?: return null

        val bytes = Base64.decode(encoded, Base64.DEFAULT)
        return IvParameterSpec(bytes)
    }

    private fun PublicKey.getMnemonicKey(): Preferences.Key<String> {
        return stringPreferencesKey(getMnemonicAlias())
    }

    private fun PublicKey.getMnemonicIvKey(): Preferences.Key<String> {
        return stringPreferencesKey(getMnemonicIvAlias())
    }

    private fun PublicKey.getMnemonicAlias(): String {
        return DefaultMnemonicAliasPrefix + this.value
    }

    private fun PublicKey.getMnemonicIvAlias(): String {
        return DefaultMnemonicIvAliasPrefix + this.value
    }

    companion object {
        private const val DefaultMnemonicAliasPrefix = "mnemonic."
        private const val DefaultMnemonicIvAliasPrefix = "mnemonic-iv."

        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "MnemonicKey"
    }
}
