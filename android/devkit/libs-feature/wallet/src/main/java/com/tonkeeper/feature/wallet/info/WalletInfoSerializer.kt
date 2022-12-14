package com.tonkeeper.feature.wallet.info

import org.json.JSONObject

object WalletInfoSerializer {

    fun serializeToString(value: WalletInfo): String {
        return value.toJson().toString()
    }

    fun deserializeFromString(value: String): WalletInfo {
        return JSONObject(value).toWalletInfo()
    }
}