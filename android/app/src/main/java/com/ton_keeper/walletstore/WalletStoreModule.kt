package com.ton_keeper.walletstore

import android.util.Log
import com.facebook.react.bridge.*

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    @ReactMethod
    fun validate(mnemonic: ReadableArray, promise: Promise) {
        Log.d(ModuleName, "Correct:")
    }

    @ReactMethod
    fun importWalletWithPasscode(mnemonic: ReadableArray, passcode: String, promise: Promise) {

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