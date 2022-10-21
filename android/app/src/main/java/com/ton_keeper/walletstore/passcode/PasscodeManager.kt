package com.ton_keeper.walletstore.passcode

import android.content.Context
import android.security.keystore.KeyProperties
import androidx.fragment.app.FragmentActivity
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

class PasscodeManager(activity: FragmentActivity) {

    private val prefs = activity.getSharedPreferences(PrefsFileName, Context.MODE_PRIVATE)

    fun validate(passcode: String): Boolean {
        // todo
        return true
    }

    fun update(passcode: String) {

    }

    private fun getCipherFromPasscode(passcode: String): Cipher {
        val random = SecureRandom()
        val salt = ByteArray(256)
        random.nextBytes(salt)

        val pbKeySpec = PBEKeySpec(passcode.toCharArray(), salt, 10000, 256)
        val secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")
        val key = secretKeyFactory.generateSecret(pbKeySpec)
        val keySpec = SecretKeySpec(key.encoded, "AES")

        val ivRandom = SecureRandom()
        val iv = ByteArray(16)
        ivRandom.nextBytes(iv)
        val ivSpec = IvParameterSpec(iv)

        val cipher = getCipher()
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec)
        return cipher
    }

    private fun getCipher(): Cipher {
        return Cipher.getInstance(
            KeyProperties.KEY_ALGORITHM_AES + "/"
                    + KeyProperties.BLOCK_MODE_CBC + "/"
                    + KeyProperties.ENCRYPTION_PADDING_PKCS7
        )
    }

    companion object {
        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "PasscodeKey"

        private const val PrefsFileName = "native-wallet-passcode"
        private const val PrefsPasscodeSaltAlias = "passcode.salt"
        private const val PrefsPasscodeIvAlias = "passcode.iv"
    }
}