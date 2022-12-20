package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.lifecycleScope
import com.facebook.react.bridge.*
import com.ton_keeper.data.mnemonicDataStore
import com.ton_keeper.data.settingsDataStore
import com.ton_keeper.data.walletDataStore
import com.tonkeeper.feature.localauth.Authenticator
import com.tonkeeper.feature.localauth.result.AuthResult
import com.tonkeeper.feature.wallet.WalletStorage
import com.tonkeeper.ton.mnemonic.Mnemonic
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
            val isValid = Mnemonic.isCorrect(data)
            promise.resolve(isValid)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }

    @ReactMethod
    fun importWalletWithPasscode(mnemonic: ReadableArray, passcode: String, promise: Promise) {
        activity.lifecycleScope.launch {
            try {
                val data = mnemonic.toArrayList().map { it as String }

                val isValid = Mnemonic.isCorrect(data)
                if (!isValid) {
                    promise.reject(Exception())
                    return@launch
                }

                val isPasscodeExist = authenticator.isPasscodeEnabled()
                if (isPasscodeExist) {
                    when(authenticator.authWithPasscode(passcode)) {
                        AuthResult.Error -> promise.reject(Exception())
                        AuthResult.Failure -> promise.reject(Exception())
                        AuthResult.Success -> {
                            wallet.import(data)
                            promise.resolve(true)
                        }
                    }
                } else {
                    authenticator.setupPasscode(passcode)
                    wallet.import(data)
                    promise.resolve(true)
                }
            } catch (ex: Exception) {
                promise.reject(ex)
            }
        }
    }

    @ReactMethod
    fun importWalletWithBiometry(mnemonic: ReadableArray, promise: Promise) {

    }

    @ReactMethod
    fun listWallets(promise: Promise) {

    }

    @ReactMethod
    fun getWallet(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    fun updateWallet(pubKey: String, label: String, promise: Promise) {

    }

    @ReactMethod
    fun removeWallet(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    fun removeWallets(promise: Promise) {

    }

    @ReactMethod
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {

    }

    @ReactMethod
    fun exportWithBiometry(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {

    }

    @ReactMethod
    fun backupWithBiometry(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    fun currentWalletInfo(promise: Promise) {

    }

    @ReactMethod
    fun setCurrentWallet(pubKey: String, promise: Promise) {

    }

    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}