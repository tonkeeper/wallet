package com.ton_keeper.walletstore

import com.facebook.react.bridge.*
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.crypto.Wordlist
import com.ton_keeper.crypto.toHex

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    @ReactMethod
    fun validate(mnemonic: Array<String>, promise: Promise) {
        val isMnemonicCorrect = Mnemonic.isCorrect(mnemonic)
        promise.resolve(isMnemonicCorrect)
    }

    @ReactMethod
    fun importWallet(mnemonic: Array<String>, passcode: String, promise: Promise) {
        // todo
        val result = WalletInfo("testPubKey", "testLabel").toMap()
        promise.resolve(result)
    }

    @ReactMethod
    fun listWallets(promise: Promise) {
        // todo
        val wallet = WalletInfo("testPubKey", "testLabel").toMap()
        val result = WritableNativeArray()
        result.pushMap(wallet)
        promise.resolve(result)
    }

    @ReactMethod
    fun getWallet(pubKey: String, promise: Promise) {
        // todo
        val result = WalletInfo("testPubKey", "testLabel").toMap()
        promise.resolve(result)
    }

    @ReactMethod
    fun updateWallet(pubKey: String, label: String, promise: Promise) {
        // todo
        val result = WalletInfo("testPubKey", "testLabel").toMap()
        promise.resolve(result)
    }

    @ReactMethod
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        // todo
        val result = ByteArray(256) { it.toByte() }.toHex()
        promise.resolve(result)
    }

    @ReactMethod
    fun exportWithBiometry(pubKey: String, promise: Promise) {
        // todo
        val result = ByteArray(256) { it.toByte() }.toHex()
        promise.resolve(result)
    }

    @ReactMethod
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {
        // todo
        val result = WritableNativeArray()
        Wordlist.take(24).forEach { result.pushString(it) }
        promise.resolve(result)
    }

    @ReactMethod
    fun backupWithBiometry(pubKey: String, promise: Promise) {
        // todo
        val result = WritableNativeArray()
        Wordlist.take(24).forEach { result.pushString(it) }
        promise.resolve(result)
    }

    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}