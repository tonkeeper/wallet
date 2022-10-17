package com.ton_keeper.walletstore

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.ton_keeper.crypto.Mnemonic

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    @ReactMethod
    fun validate(mnemonic: Array<String>, promise: Promise) {
        val isMnemonicCorrect = Mnemonic.isCorrect(mnemonic)
        promise.resolve(isMnemonicCorrect)
    }

    @ReactMethod
    // return WalletInfo
    fun importWallet(mnemonic: Array<String>, passcode: String, promise: Promise) {

    }

    @ReactMethod
    // return List<WalletInfo>
    fun listWallets(promise: Promise) {

    }

    @ReactMethod
    // return WalletInfo
    fun getWallet(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    // return WalletInfo
    fun updateWallet(pubKey: String, label: String, promise: Promise) {

    }

    @ReactMethod
    // return SecretKey
    fun exportWithPasscode(pubKey: String, passcode: String, promise: Promise) {

    }

    @ReactMethod
    // return SecretKey
    fun exportWithBiometry(pubKey: String, promise: Promise) {

    }

    @ReactMethod
    // return Mnemonic
    fun backupWithPasscode(pubKey: String, passcode: String, promise: Promise) {

    }

    @ReactMethod
    // return Mnemonic
    fun backupWithBiometry(pubKey: String, promise: Promise) {

    }

    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}