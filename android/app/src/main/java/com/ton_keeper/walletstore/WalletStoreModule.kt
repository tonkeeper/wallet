package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.toHex
import com.ton_keeper.walletstore.walletinfo.toBridgeMap
import com.ton_keeper.walletstore.walletinfo.toBridgeMapArray

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    private val store: WalletStore
        get() = WalletStore(reactApplicationContext.currentActivity as FragmentActivity)

    @ReactMethod
    fun validate(mnemonic: ReadableArray, promise: Promise) {
        val data = mnemonic.toArrayList().map { it as String }
        val isMnemonicCorrect = Mnemonic.isCorrect(data)
        if (isMnemonicCorrect) {
            promise.resolve(true)
        } else {
            promise.reject(WalletMnemonicInvalidException())
        }
    }

    @ReactMethod
    fun importWalletWithPasscode(mnemonic: ReadableArray, passcode: String, promise: Promise) {
        val data = mnemonic.toArrayList().map { it as String }

        val isMnemonicCorrect = Mnemonic.isCorrect(data)
        if (!isMnemonicCorrect) {
            promise.reject(WalletMnemonicInvalidException())
            return
        }

        try {
            store.import(
                mnemonic = data,
                secure = SecureType.Passcode(passcode),
                onResult = { promise.resolve(it.toBridgeMap()) }
            )
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun importWalletWithBiometry(mnemonic: ReadableArray, promise: Promise) {
        val data = mnemonic.toArrayList().map { it as String }

        val isMnemonicCorrect = Mnemonic.isCorrect(data)
        if (!isMnemonicCorrect) {
            promise.reject(WalletMnemonicInvalidException())
            return
        }

        try {
            store.import(
                mnemonic = data,
                secure = SecureType.Biometry,
                onResult = { promise.resolve(it.toBridgeMap()) }
            )
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
    fun getWalletByAddress(pubKey: String, promise: Promise) {
        promise.reject(NotImplementedError("Wallet by address not implemented!"))
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
    fun removeWallet(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        try {
            store.exportSecretKey(
                pk = pubKey,
                secure = SecureType.Passcode(passcode),
                onResult = { promise.resolve(it.toHex()) }
            )
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun exportWithBiometry(pubKey: String, promise: Promise) {
        try {
            store.exportSecretKey(
                pk = pubKey,
                secure = SecureType.Biometry,
                onResult = { promise.resolve(it.toHex()) }
            )
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        try {
            store.backup(pubKey, SecureType.Passcode(passcode)) { mnemonic ->
                val result = WritableNativeArray()
                mnemonic.forEach { result.pushString(it) }
                promise.resolve(result)
            }
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
    }

    @ReactMethod
    fun backupWithBiometry(pubKey: String, promise: Promise) {
        try {
            store.backup(pubKey, SecureType.Biometry) { mnemonic ->
                val result = WritableNativeArray()
                mnemonic.forEach { result.pushString(it) }
                promise.resolve(result)
            }
        } catch (ex: Exception) {
            promise.resolve(ex)
        }
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