package com.ton_keeper.walletstore

import android.content.Context
import android.os.Build
import android.security.KeyPairGeneratorSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.CryptoObject
import androidx.fragment.app.FragmentActivity
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.toHex
import com.ton_keeper.walletstore.walletinfo.PublicKey
import com.ton_keeper.walletstore.walletinfo.WalletInfo
import com.ton_keeper.walletstore.walletinfo.WalletInfoSerializer
import java.lang.ref.WeakReference
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.SecureRandom
import java.util.*
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import javax.security.auth.x500.X500Principal
import kotlin.math.abs

class WalletStore(activity: FragmentActivity) {

    private val activity = WeakReference(activity)
    private val prefs = activity.getSharedPreferences(PrefsFileName, Context.MODE_PRIVATE)

    fun import(mnemonic: Array<String>, secure: SecureType, onResult: (WalletInfo) -> Unit) {
        val keys = Mnemonic.toKeyPair(mnemonic)
        val pkHex = keys.publicKey.toHex()

        when (secure) {
            is SecureType.Biometry -> {
                encryptMnemonicWithBiometry(mnemonic) {
                    onResult(WalletInfo(pk = pkHex, label = ""))
                }
            }
            is SecureType.Passcode -> {
                encryptMnemonicWithPasscode(mnemonic) {
                    onResult(WalletInfo(pk = pkHex, label = ""))
                }
            }
        }
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

    fun exportSecretKey(pk: PublicKey, secure: SecureType, onResult: (ByteArray) -> Unit) {
        when (secure) {
            is SecureType.Biometry -> decryptMnemonicWithBiometry {
                val keys = Mnemonic.toKeyPair(it)
                onResult(keys.secretKey)
            }
            is SecureType.Passcode -> decryptMnemonicWithPasscode {
                val keys = Mnemonic.toKeyPair(it)
                onResult(keys.secretKey)
            }
        }
    }

    fun backup(pk: PublicKey, secure: SecureType, onResult: (List<String>) -> Unit) {
        when (secure) {
            is SecureType.Biometry ->
                decryptMnemonicWithBiometry { onResult(it.toList()) }
            is SecureType.Passcode ->
                decryptMnemonicWithPasscode { onResult(it.toList()) }
        }
    }

    private fun encryptMnemonicWithBiometry(mnemonic: Array<String>, onResult: () -> Unit) {
        val context = activity.get() ?: throw NullPointerException("Activity is null")

        val prompt = BiometricPrompt(
            context,
            createAuthenticationCallback(
                onSuccess = {

                }
            )
        )
        prompt.authenticate(createAuthenticationPromptInfo())
    }

    private fun decryptMnemonicWithBiometry(onResult: (Array<String>) -> Unit) {
        val context = activity.get() ?: throw NullPointerException("Activity is null")

    }

    private fun encryptMnemonicWithPasscode(mnemonic: Array<String>, onResult: () -> Unit) {

    }

    private fun decryptMnemonicWithPasscode(onResult: (Array<String>) -> Unit) {

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

    private fun createAuthenticationPromptInfo(): BiometricPrompt.PromptInfo {
        return BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric login for my app")
            .setSubtitle("Log in using your biometric credential")
            .setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG
                        or BiometricManager.Authenticators.DEVICE_CREDENTIAL
            )
            .build()
    }

    private fun generateKeyFromPasscode(passcode: String) {
        val random = SecureRandom()
        val salt = ByteArray(256)
        random.nextBytes(salt)

        val pbKeySpec = PBEKeySpec(passcode.toCharArray(), salt, 10000, 256)
        val secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")
        val keyBytes = secretKeyFactory.generateSecret(pbKeySpec).encoded
        val keySpec = SecretKeySpec(keyBytes, "AES")

        val ivRandom = SecureRandom()
        val iv = ByteArray(16)
        ivRandom.nextBytes(iv)
        val ivSpec = IvParameterSpec(iv)

        val cipher = getCipher()
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec)
        // val encrypted = cipher.doFinal(dataToEncrypt)
    }

    private fun generateSecretKey(keyGenParameterSpec: KeyGenParameterSpec) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            val start: Calendar = GregorianCalendar()
            val end: Calendar = GregorianCalendar()
            end.add(Calendar.YEAR, 30)

            val alias = "alias"
            val spec = KeyPairGeneratorSpec.Builder(activity.get()!!)
                .setAlias(alias)
                .setSubject(X500Principal("CN=$alias"))
                .setSerialNumber(BigInteger.valueOf(abs(alias.hashCode()).toLong()))
                .setStartDate(start.time)
                .setEndDate(end.time)
                .build()

            val keyGenerator = KeyPairGenerator.getInstance("RSA", KeyStoreType)
            keyGenerator.initialize(spec)
            val kp = keyGenerator.generateKeyPair()
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
        return when (secure) {
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

        private const val PrefsFileName = "native-wallet-info"
        private const val PrefsMnemonicAliasPrefix = "mnemonic."
        private const val PrefsInfoAliasPrefix = "info."
    }
}
