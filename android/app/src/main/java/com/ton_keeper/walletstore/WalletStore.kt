package com.ton_keeper.walletstore

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.fragment.app.FragmentActivity
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.toHex
import com.ton_keeper.walletstore.mnemonic.MnemonicSerializer
import com.ton_keeper.walletstore.passcode.PasscodeManager
import com.ton_keeper.walletstore.walletinfo.PublicKey
import com.ton_keeper.walletstore.walletinfo.WalletInfo
import com.ton_keeper.walletstore.walletinfo.WalletInfoSerializer
import java.lang.ref.WeakReference
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class WalletStore(activity: FragmentActivity) {

    private val activity = WeakReference(activity)
    private val prefs = activity.getSharedPreferences(PrefsFileName, Context.MODE_PRIVATE)
    private val passcode = PasscodeManager(activity)

    fun import(mnemonic: List<String>, secure: SecureType, onResult: (WalletInfo) -> Unit) {
        val keys = Mnemonic.toKeyPair(mnemonic.toTypedArray())
        val pkHex = keys.publicKey.toHex()

        authenticate(
            secure = secure,
            onAccess = {
                encryptMnemonic(mnemonic, pkHex)
                onResult(WalletInfo(pk = pkHex, label = ""))
            },
            onFailure = { throw WalletInvalidAuth() }
        )
    }

    fun getAll(): List<WalletInfo> {
        val keys = prefs.all.keys.filter { it.startsWith(PrefsInfoAliasPrefix) }
        return keys
            .mapNotNull { prefs.getString(it, null) }
            .map { WalletInfoSerializer.deserializeFromString(it) }
    }

    fun getByPublicKey(pk: PublicKey): WalletInfo {
        val key = createInfoPrefsAlias(pk)
        if (prefs.contains(key).not()) throw WalletNotFoundException(pk)

        val jsonStr = prefs.getString(key, null) ?: throw WalletNotFoundException(pk)
        return WalletInfoSerializer.deserializeFromString(jsonStr)
    }

    fun updateLabelByPublicKey(pk: PublicKey, label: String): WalletInfo {
        val key = createInfoPrefsAlias(pk)
        if (prefs.contains(key).not()) throw WalletNotFoundException(pk)

        val jsonStr = prefs.getString(key, null) ?: throw WalletNotFoundException(pk)
        val wallet = WalletInfoSerializer.deserializeFromString(jsonStr)

        val updated = wallet.copy(label = label)
        val updatedJsonStr = WalletInfoSerializer.serializeToString(updated)
        val result = prefs.edit().putString(key, updatedJsonStr).commit()
        if (!result) throw WalletSaveException(pk)

        return updated
    }

    fun exportSecretKey(pk: PublicKey, secure: SecureType, onResult: (ByteArray) -> Unit) {
        authenticate(
            secure = secure,
            onAccess = {
                val mnemonic = decryptMnemonic(pk)
                val keys = Mnemonic.toKeyPair(mnemonic.toTypedArray())
                onResult(keys.secretKey)
            },
            onFailure = { throw WalletInvalidAuth() }
        )
    }

    fun backup(pk: PublicKey, secure: SecureType, onResult: (List<String>) -> Unit) {
        authenticate(
            secure = secure,
            onAccess = {
                val mnemonic = decryptMnemonic(pk)
                onResult(mnemonic)
            },
            onFailure = { throw WalletInvalidAuth() }
        )
    }

    private fun authenticate(secure: SecureType, onAccess: () -> Unit, onFailure: () -> Unit) {
        when (secure) {
            is SecureType.Biometry -> {
                val context = activity.get() ?: throw NullPointerException("Activity is null")

                val prompt = BiometricPrompt(
                    context,
                    createAuthenticationCallback(
                        onSuccess = onAccess,
                        onFailure = onFailure,
                        onError = onFailure
                    )
                )

                prompt.authenticate(createAuthenticationPromptInfo())
            }

            is SecureType.Passcode -> passcode.validate(secure.value)
        }
    }

    private fun encryptMnemonic(mnemonic: List<String>, pk: PublicKey) {
        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey()
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)

        val mnemonicStr = MnemonicSerializer.serializeToString(mnemonic)
        val encrypted = cipher.doFinal(mnemonicStr.toByteArray())
        val encoded = Base64.encodeToString(encrypted, Base64.DEFAULT)

        val key = createMnemonicPrefsAlias(pk)
        val result = prefs.edit().putString(key, encoded).commit()
        if (!result) throw WalletSaveException(pk)
    }

    private fun decryptMnemonic(pk: PublicKey): List<String> {
        val key = createMnemonicPrefsAlias(pk)
        if (prefs.contains(key).not()) throw WalletNotFoundException(pk)

        val encoded = prefs.getString(key, null) ?: throw WalletNotFoundException(pk)
        val encrypted = Base64.decode(encoded, Base64.DEFAULT)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey()
        cipher.init(Cipher.DECRYPT_MODE, secretKey)

        val mnemonicStr = String(cipher.doFinal(encrypted))
        return MnemonicSerializer.deserializeFromString(mnemonicStr)
    }

    private fun createAuthenticationCallback(
        onSuccess: () -> Unit = {},
        onFailure: () -> Unit = {},
        onError: () -> Unit = {}
    ): BiometricPrompt.AuthenticationCallback {
        return object : BiometricPrompt.AuthenticationCallback() {

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError()
            }

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onFailure()
            }
        }
    }

    private fun createAuthenticationPromptInfo(): BiometricPrompt.PromptInfo {
        return BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric login for my app")
            .setSubtitle("Log in using your biometric credential")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build()
    }

    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KeyStoreType)
        keyStore.load(null)
        return if (keyStore.containsAlias(KeyStoreAlias)) {
            keyStore.getKey(KeyStoreAlias, null) as SecretKey
        } else {
            val params = createKeyGenParam()
            generateSecretKey(params)
        }
    }

    private fun generateSecretKey(keyGenParameterSpec: KeyGenParameterSpec): SecretKey {
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KeyStoreType)
        keyGenerator.init(keyGenParameterSpec)
        return keyGenerator.generateKey()
    }

    private fun createKeyGenParam(): KeyGenParameterSpec {
        val purposes = KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        return KeyGenParameterSpec.Builder(KeyStoreAlias, purposes)
            .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
            .setUserAuthenticationRequired(false)
            .build()
    }

    private fun getCipher(): Cipher {
        return Cipher.getInstance(
            KeyProperties.KEY_ALGORITHM_AES + "/"
                    + KeyProperties.BLOCK_MODE_CBC + "/"
                    + KeyProperties.ENCRYPTION_PADDING_PKCS7
        )
    }

    private fun createMnemonicPrefsAlias(pk: PublicKey): String {
        return PrefsMnemonicAliasPrefix + pk
    }

    private fun createInfoPrefsAlias(pk: PublicKey): String {
        return PrefsInfoAliasPrefix + pk
    }

    companion object {
        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "WalletKey"

        private const val PrefsFileName = "native-wallet-info"
        private const val PrefsMnemonicAliasPrefix = "mnemonic."
        private const val PrefsInfoAliasPrefix = "info."
    }
}
