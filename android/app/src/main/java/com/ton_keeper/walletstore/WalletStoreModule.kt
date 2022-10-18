package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.toHex
import com.ton_keeper.walletstore.data.StoreSecureType
import com.ton_keeper.walletstore.walletinfo.toBridgeMap
import com.ton_keeper.walletstore.walletinfo.toBridgeMapArray

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    private val store = WalletStore(context.currentActivity as FragmentActivity)

    @ReactMethod
    fun validate(mnemonic: Array<String>, promise: Promise) {
        val isMnemonicCorrect = Mnemonic.isCorrect(mnemonic)
        if (isMnemonicCorrect) {
            promise.resolve(true)
        } else {
            promise.reject(WalletMnemonicInvalidException())
        }
    }

    @ReactMethod
    fun importWalletWithPasscode(mnemonic: Array<String>, passcode: String, promise: Promise) {
        val isMnemonicCorrect = Mnemonic.isCorrect(mnemonic)
        if (!isMnemonicCorrect) {
            promise.reject(WalletMnemonicInvalidException())
            return
        }

        try {
            val result = store.import(mnemonic, StoreSecureType.Passcode(passcode)).toBridgeMap()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun importWalletWithBiometry(mnemonic: Array<String>, promise: Promise) {
        val isMnemonicCorrect = Mnemonic.isCorrect(mnemonic)
        if (!isMnemonicCorrect) {
            promise.reject(WalletMnemonicInvalidException())
            return
        }

        try {
            val result = store.import(mnemonic, StoreSecureType.Biometry).toBridgeMap()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun listWallets(promise: Promise) {
        try {
            val result = store.getAll().toBridgeMapArray()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun getWallet(pubKey: String, promise: Promise) {
        try {
            val result = store.getByPublicKey(pubKey).toBridgeMap()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun updateWallet(pubKey: String, label: String, promise: Promise) {
        try {
            val result = store.updateLabelByPublicKey(pubKey, label).toBridgeMap()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        try {
            val result = store.exportSecretKey(pubKey, StoreSecureType.Passcode(passcode)).toHex()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun exportWithBiometry(pubKey: String, promise: Promise) {
        try {
            val result = store.exportSecretKey(pubKey, StoreSecureType.Biometry).toHex()
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        try {
            val result = WritableNativeArray()
            val mnemonic = store.backup(pubKey, StoreSecureType.Passcode(passcode))
            mnemonic.forEach { result.pushString(it) }
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun backupWithBiometry(pubKey: String, promise: Promise) {
        try {
            val result = WritableNativeArray()
            val mnemonic = store.backup(pubKey, StoreSecureType.Biometry)
            mnemonic.forEach { result.pushString(it) }
            promise.resolve(result)
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}