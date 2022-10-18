package com.ton_keeper.walletstore

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.CryptoObject
import androidx.fragment.app.FragmentActivity
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.toHex
import com.ton_keeper.walletstore.walletinfo.PublicKey
import com.ton_keeper.walletstore.walletinfo.WalletInfo
import com.ton_keeper.walletstore.walletinfo.WalletInfoSerializer
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class WalletStore(activity: FragmentActivity) {

    private val prefs = activity.getSharedPreferences(PrefsFileName, Context.MODE_PRIVATE)

    fun import(mnemonic: Array<String>, secure: SecureType): WalletInfo {
        val keys = Mnemonic.toKeyPair(mnemonic)
        val pkHex = keys.publicKey.toHex()

        // todo

        return WalletInfo(pk = pkHex, label = "")
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

    fun getByAddress(address: String): WalletInfo {
        return TODO("Implement when Tonlib will be ready")
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

    fun exportSecretKey(pk: PublicKey, secure: SecureType): ByteArray {
        return TODO()
    }

    fun backup(pk: PublicKey, secure: SecureType): List<String> {
        when (secure) {
            is SecureType.Biometry -> TODO()
            is SecureType.Passcode -> TODO()
        }
    }

    private fun createAuthenticationCallback(
        onSuccess: (CryptoObject) -> Unit = {},
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
                val crypto = result.cryptoObject
                if (crypto == null) onError()
                else onSuccess(crypto)
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onFailure()
            }
        }
    }

    private fun generateSecretKey(keyGenParameterSpec: KeyGenParameterSpec) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {

        } else {
            val keyGenerator = KeyGenerator
                .getInstance(KeyProperties.KEY_ALGORITHM_AES, KeyStoreType)
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
        }
    }

    private fun getSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KeyStoreType)
        keyStore.load(null)
        return keyStore.getKey("KEY_NAME", null) as SecretKey
    }

    private fun getCipher(): Cipher {
        return if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            Cipher.getInstance("AES/CBC/PKCS5Padding")
        } else {
            Cipher.getInstance(
                KeyProperties.KEY_ALGORITHM_AES + "/"
                        + KeyProperties.BLOCK_MODE_CBC + "/"
                        + KeyProperties.ENCRYPTION_PADDING_PKCS7
            )
        }
    }


    private fun createKeyStoreAlias(pk: PublicKey, secure: SecureType): String {
        return when(secure) {
            is SecureType.Biometry -> KeyStoreBiometryAliasPrefix + pk
            is SecureType.Passcode -> KeyStorePasscodeAliasPrefix + pk
        }
    }

    private fun createMnemonicPrefsAlias(pk: PublicKey): String {
        return PrefsMnemonicAliasPrefix + pk
    }

    private fun createInfoPrefsAlias(pk: PublicKey): String {
        return PrefsInfoAliasPrefix + pk
    }

    companion object {
        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStorePasscodeAliasPrefix = "passcode."
        private const val KeyStoreBiometryAliasPrefix = "biometry."

        private const val PrefsFileName = "native-wallet-info.v1"
        private const val PrefsMnemonicAliasPrefix = "mnemonic."
        private const val PrefsInfoAliasPrefix = "info."
    }
}
