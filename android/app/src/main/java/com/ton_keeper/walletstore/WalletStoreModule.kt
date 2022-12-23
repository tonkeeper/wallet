package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.*
import com.ton_keeper.bridge.toBridgeMap
import com.ton_keeper.bridge.toBridgeMapArray
import com.ton_keeper.data.mnemonicDataStore
import com.ton_keeper.data.settingsDataStore
import com.ton_keeper.data.walletDataStore
import com.tonkeeper.feature.localauth.*
import com.tonkeeper.feature.localauth.result.AuthResult
import com.tonkeeper.feature.wallet.WalletStoreManager
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

    private val localAuthManager by lazy {
        LocalAuthManager(
            activity = activity,
            config = LocalAuthManager.Config(),
            datastore = activity.settingsDataStore
        )
    }

    private val walletStoreManager by lazy {
        WalletStoreManager(
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

                if (localAuthManager.isPasscodeEnabled()) {
                    localPasscodeAuth(passcode)
                } else {
                    localAuthManager.setupPasscode(passcode)
                }

                walletStoreManager.import(data)
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

                if (localAuthManager.isBiometryEnabled()) {
                    localBiometryAuth()
                } else {
                    localAuthManager.setupBiometry()
                }

                walletStoreManager.import(data)
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
                val data = walletStoreManager.wallets()
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
                val data = walletStoreManager.wallet(PublicKey(pubKey))
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
                val data = walletStoreManager.update(PublicKey(pubKey), label)
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
                walletStoreManager.remove(PublicKey(pubKey))
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
                walletStoreManager.clear()
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
                if (localAuthManager.isPasscodeEnabled().not())
                    throw AuthenticatorPasscodeError()

                localPasscodeAuth(passcode)

                val data = walletStoreManager.export(PublicKey(pubKey))
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
                if (localAuthManager.isBiometryEnabled().not())
                    throw AuthenticatorBiometryError()

                localBiometryAuth()

                val data = walletStoreManager.export(PublicKey(pubKey))
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
                if (localAuthManager.isPasscodeEnabled().not())
                    throw AuthenticatorPasscodeError()

                localPasscodeAuth(passcode)

                val data = walletStoreManager.backup(PublicKey(pubKey))
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
                if (localAuthManager.isBiometryEnabled().not())
                    throw AuthenticatorBiometryError()

                localBiometryAuth()

                val data = walletStoreManager.backup(PublicKey(pubKey))
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
        when (localAuthManager.authWithBiometry()) {
            AuthResult.Error -> throw AuthenticatorPasscodeError()
            AuthResult.Failure -> throw AuthenticatorPasscodeInvalid()
            AuthResult.Success -> {
                // do nothing
            }
        }
    }

    @Throws
    private suspend fun localPasscodeAuth(passcode: String) {
        when (localAuthManager.authWithPasscode(passcode)) {
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