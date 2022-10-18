package com.ton_keeper.walletstore.data

import android.content.Context
import com.ton_keeper.walletstore.walletinfo.WalletInfo

class WalletInfoStorage(context: Context) {

    fun save(mnemonic: Array<String>) {

    }

    fun get(publicKey: String): WalletInfo {
        return TODO()
    }

    fun all(): List<WalletInfo> {
        return TODO()
    }
}
