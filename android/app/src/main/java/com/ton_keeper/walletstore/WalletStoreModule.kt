package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.*
import com.ton_keeper.bridge.toBridgeMap
import com.ton_keeper.bridge.toBridgeMapArray
import com.ton_keeper.data.mnemonicDataStore
import com.ton_keeper.data.settingsDataStore
import com.ton_keeper.data.walletDataStore
import com.tonkeeper.feature.localauth.Authenticator
import com.tonkeeper.feature.localauth.AuthenticatorBiometryError
import com.tonkeeper.feature.localauth.AuthenticatorPasscodeError
import com.tonkeeper.feature.localauth.AuthenticatorPasscodeInvalid
import com.tonkeeper.feature.localauth.result.AuthResult
import com.tonkeeper.feature.wallet.WalletStorage
import com.tonkeeper.feature.wallet.key.PublicKey
import com.tonkeeper.ton.crypto.toHex
import com.tonkeeper.ton.mnemonic.Mnemonic
import com.tonkeeper.ton.mnemonic.MnemonicInvalidException
import kotlinx.coroutines.launch

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    private val activity by lazy {
        context.currentActivity as FragmentActivity
    }

    private val authenticator by lazy {
        Authenticator(
            activity = activity,
            config = Authenticator.Config(),
            datastore = activity.settingsDataStore
        )
    }

    private val wallet by lazy {
        WalletStorage(
            mnemonicDataStore = activity.mnemonicDataStore,
            walletDataStore = activity.walletDataStore
        )
    }

    @ReactMethod
    fun validate(mnemonic: ReadableArray, promise: Promise) {
        try {
            val data = mnemonic.toArrayList().map { it as String }
            checkMnemonic(data)
            promise.resolve(true)
        } catch (ex: MnemonicInvalidException) {
            promise.resolve(false)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }

    @ReactMethod
    fun importWalletWithPasscode(mnemonic: ReadableArray, passcode: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = mnemonic.toArrayList().map { it as String }

                checkMnemonic(data)

                if (authenticator.isPasscodeEnabled()) {
                    localPasscodeAuth(passcode)
                } else {
                    authenticator.setupPasscode(passcode)
                }

                wallet.import(data)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun importWalletWithBiometry(mnemonic: ReadableArray, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = mnemonic.toArrayList().map { it as String }
                checkMnemonic(data)

                if (authenticator.isBiometryEnabled()) {
                    localBiometryAuth()
                } else {
                    authenticator.setupBiometry()
                }

                wallet.import(data)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun listWallets(promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = wallet.wallets()
                val array = data.toBridgeMapArray()
                promise.resolve(array)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun getWallet(pubKey: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = wallet.wallet(PublicKey(pubKey))
                val map = data.toBridgeMap()
                promise.resolve(map)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun updateWallet(pubKey: String, label: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = wallet.update(PublicKey(pubKey), label)
                val map = data.toBridgeMap()
                promise.resolve(map)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun removeWallet(pubKey: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                wallet.remove(PublicKey(pubKey))
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun removeWallets(promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                wallet.clear()
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                if (authenticator.isPasscodeEnabled().not())
                    throw AuthenticatorPasscodeError()

                localPasscodeAuth(passcode)

                val data = wallet.export(PublicKey(pubKey))
                val hex = data.toHex()
                promise.resolve(hex)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun exportWithBiometry(pubKey: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                if (authenticator.isBiometryEnabled().not())
                    throw AuthenticatorBiometryError()

                localBiometryAuth()

                val data = wallet.export(PublicKey(pubKey))
                val hex = data.toHex()
                promise.resolve(hex)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                if (authenticator.isPasscodeEnabled().not())
                    throw AuthenticatorPasscodeError()

                localPasscodeAuth(passcode)

                val data = wallet.backup(PublicKey(pubKey))
                val result = WritableNativeArray()
                data.forEach { result.pushString(it) }
                promise.resolve(result)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun backupWithBiometry(pubKey: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                if (authenticator.isBiometryEnabled().not())
                    throw AuthenticatorBiometryError()

                localBiometryAuth()

                val data = wallet.backup(PublicKey(pubKey))
                val result = WritableNativeArray()
                data.forEach { result.pushString(it) }
                promise.resolve(result)
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun currentWalletInfo(promise: Promise) {
        activity.lifecycleScope.launch {
            try {

            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun setCurrentWallet(pubKey: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {

            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @Throws(MnemonicInvalidException::class)
    private fun checkMnemonic(value: List<String>): Boolean {
        val isValid = Mnemonic.isCorrect(value)
        if (!isValid) throw MnemonicInvalidException()
        return true
    }

    @Throws
    private suspend fun localBiometryAuth() {
        when (authenticator.authWithBiometry()) {
            AuthResult.Error -> throw AuthenticatorPasscodeError()
            AuthResult.Failure -> throw AuthenticatorPasscodeInvalid()
            AuthResult.Success -> {
                // do nothing
            }
        }
    }

    @Throws
    private suspend fun localPasscodeAuth(passcode: String) {
        when (authenticator.authWithPasscode(passcode)) {
            AuthResult.Error -> throw AuthenticatorPasscodeError()
            AuthResult.Failure -> throw AuthenticatorPasscodeInvalid()
            AuthResult.Success -> {
                // do nothing
            }
        }
    }

    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}