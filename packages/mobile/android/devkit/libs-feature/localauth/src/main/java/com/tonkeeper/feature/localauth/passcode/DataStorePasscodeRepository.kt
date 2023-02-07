package com.tonkeeper.feature.localauth.passcode

import android.util.Base64
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.tonkeeper.feature.localauth.keystore.getCipher
import com.tonkeeper.feature.localauth.keystore.getOrCreateSecretKey
import kotlinx.coroutines.flow.first
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec

class DataStorePasscodeRepository(
    private val datastore: DataStore<Preferences>
) : PasscodeRepository {

    override suspend fun isSaved(): Boolean {
        val prefs = datastore.data.first()
        return prefs.contains(PasscodeKey)
    }

    override suspend fun save(passcode: String) {
        val encoded = encrypt(passcode)
        datastore.edit { it[PasscodeKey] = encoded }
    }

    override suspend fun compare(passcode: String): Boolean? {
        val prefs = datastore.data.first()
        val saved = prefs[PasscodeKey] ?: return null
        val decoded = decrypt(saved)
        return decoded == passcode
    }

    override suspend fun clear() {
        datastore.edit {
            it.remove(PasscodeKey)
        }
    }

    private suspend fun encrypt(value: String): String {
        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)

        saveCipherIv(cipher.iv)

        val encrypted = cipher.doFinal(value.toByteArray())
        return Base64.encodeToString(encrypted, Base64.DEFAULT)
    }

    private suspend fun decrypt(base64: String): String {
        val encoded = Base64.decode(base64, Base64.DEFAULT)

        val cipher = getCipher()
        val iv = loadCipherIv()

        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, iv)
        return String(cipher.doFinal(encoded))
    }

    private suspend fun saveCipherIv(bytes: ByteArray) {
        val encoded = Base64.encodeToString(bytes, Base64.DEFAULT)
        datastore.edit { it[PasscodeIvKey] = encoded }
    }

    private suspend fun loadCipherIv(): IvParameterSpec {
        val prefs = datastore.data.first()
        val encoded = prefs[PasscodeIvKey]
        val bytes = Base64.decode(encoded, Base64.DEFAULT)
        return IvParameterSpec(bytes)
    }

    companion object {
        private const val DefaultPasscodeAlias = "passcode.encrypted"
        private const val DefaultPasscodeIvAlias = "passcode.iv"

        private val PasscodeKey = stringPreferencesKey(DefaultPasscodeAlias)
        private val PasscodeIvKey = stringPreferencesKey(DefaultPasscodeIvAlias)

        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "PasscodeKey"
    }
}