package com.ton_keeper.walletstore.passcode

import android.content.Context
import android.util.Base64
import androidx.fragment.app.FragmentActivity
import com.ton_keeper.walletstore.WalletInvalidAuth
import com.ton_keeper.walletstore.WalletSaveException
import com.ton_keeper.walletstore.keystore.getCipher
import com.ton_keeper.walletstore.keystore.getOrCreateSecretKey
import javax.crypto.Cipher

class PasscodeManager(activity: FragmentActivity) {

    private val prefs = activity.getSharedPreferences(PrefsFileName, Context.MODE_PRIVATE)

    fun validate(passcode: String): Boolean {
        val saved = decryptPasscode()
        return passcode == saved
    }

    fun update(passcode: String) {
        encryptPasscode(passcode)
    }

    fun isPasscodeExist(): Boolean {
        return prefs.contains(PrefsPasscodeAlias)
    }

    private fun encryptPasscode(passcode: String) {
        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)

        val encrypted = cipher.doFinal(passcode.toByteArray())
        val encoded = Base64.encodeToString(encrypted, Base64.DEFAULT)

        val result = prefs.edit().putString(PrefsPasscodeAlias, encoded).commit()
        if (!result) throw WalletSaveException()
    }

    private fun decryptPasscode(): String {
        if (prefs.contains(PrefsPasscodeAlias).not()) throw WalletInvalidAuth()

        val encoded = prefs.getString(PrefsPasscodeAlias, null) ?: throw WalletInvalidAuth()
        val encrypted = Base64.decode(encoded, Base64.DEFAULT)

        val cipher = getCipher()
        val secretKey = getOrCreateSecretKey(KeyStoreType, KeyStoreAlias)
        cipher.init(Cipher.DECRYPT_MODE, secretKey)

        return String(cipher.doFinal(encrypted))
    }

    companion object {
        private const val KeyStoreType = "AndroidKeyStore"
        private const val KeyStoreAlias = "PasscodeKey"

        private const val PrefsFileName = "native-wallet-passcode"
        private const val PrefsPasscodeAlias = "passcode"
    }
}
