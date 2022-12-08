package com.tonkeeper.feature.localauth

import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import kotlin.coroutines.resume

class Authenticator(
    private val activity: FragmentActivity,
    private val config: Config,
    private val datastore: DataStore<Preferences>
) {

    private val biometric = BiometricManager.from(activity)
    private val executor = ContextCompat.getMainExecutor(activity)

    suspend fun authWithPasscode(passcode: String): AuthResult {
        val prefs = datastore.data.first()
        val saved = prefs[stringPreferencesKey(config.passcodeAlias)] ?: return AuthResult.Error

        val decoded = decrypt(saved)
        return if (decoded == passcode) AuthResult.Success else AuthResult.Failure
    }

    suspend fun authWithBiometry() = suspendCancellableCoroutine { continuation ->
        val info = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric login for my app")
            .setSubtitle("Log in using your biometric credential")
            .setAllowedAuthenticators(BIOMETRIC_STRONG)
            .setNegativeButtonText("Cancel")
            .build()

        val callback = object : BiometricPrompt.AuthenticationCallback() {

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                if (continuation.isCancelled) return
                continuation.resume(AuthResult.Success)
            }

            override fun onAuthenticationFailed() {
                if (continuation.isCancelled) return
                continuation.resume(AuthResult.Failure)
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                if (continuation.isCancelled) return
                continuation.resume(AuthResult.Error)
            }
        }

        val biometricPrompt = BiometricPrompt(activity, executor, callback)
        biometricPrompt.authenticate(info)

        continuation.invokeOnCancellation {
            biometricPrompt.cancelAuthentication()
        }
    }

    suspend fun isPasscodeEnabled(): Boolean {
        val prefs = datastore.data.first()
        return prefs.contains(stringPreferencesKey(config.passcodeAlias))
    }

    suspend fun isBiometryEnabled(): Boolean {
        val prefs = datastore.data.first()
        val enabled = prefs.contains(booleanPreferencesKey(config.biometryAlias))
        return isBiometryAvailable() && enabled
    }

    suspend fun setupPasscode(value: String) {
        val encoded = encrypt(value)
        datastore.edit {
            it[stringPreferencesKey(config.passcodeAlias)] = encoded
        }
    }

    suspend fun setupBiometry() {
        if (isBiometryAvailable().not()) throw AuthenticatorBiometryError()
        datastore.edit {
            it[booleanPreferencesKey(config.biometryAlias)] = true
        }
    }

    private suspend fun encrypt(value: String): String {
        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeystoreAlias)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)

        saveCipherIv(cipher.iv)

        val encrypted = cipher.doFinal(value.toByteArray())
        return Base64.encodeToString(encrypted, Base64.DEFAULT)
    }

    private suspend fun decrypt(base64: String): String {
        val encoded = Base64.decode(base64, Base64.DEFAULT)

        val cipher = getCipher()
        val iv = loadCipherIv()

        val secretKey = getOrCreateSecretKey(KeyStoreType, KeystoreAlias)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, iv)
        return String(cipher.doFinal(encoded))
    }

    private suspend fun saveCipherIv(bytes: ByteArray) {
        val encoded = Base64.encodeToString(bytes, Base64.DEFAULT)
        datastore.edit {
            it[stringPreferencesKey(DefaultPasscodeIvAlias)] = encoded
        }
    }

    private suspend fun loadCipherIv(): IvParameterSpec {
        val prefs = datastore.data.first()
        val encoded = prefs[stringPreferencesKey(DefaultPasscodeIvAlias)]
        val bytes = Base64.decode(encoded, Base64.DEFAULT)
        return IvParameterSpec(bytes)
    }

    private fun isBiometryAvailable(): Boolean {
        return biometric.canAuthenticate(BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS
    }

    data class Config(
        val fileName: String = DefaultFileName,
        val passcodeAlias: String = DefaultPasscodeAlias,
        val biometryAlias: String = DefaultBiometryAlias,
    )

    companion object {
        private const val DefaultFileName = "localauth"
        private const val DefaultPasscodeAlias = "passcode"
        private const val DefaultPasscodeIvAlias = "passcode-iv"
        private const val DefaultBiometryAlias = "biometry"

        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeystoreAlias = "passcodekey"
    }
}
