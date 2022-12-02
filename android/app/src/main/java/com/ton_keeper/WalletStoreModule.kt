package com.ton_keeper

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class WalletStoreModule(
    context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {


    override fun getName(): String = ModuleName

    companion object {
        private const val ModuleName = "WalletStore"
    }
}