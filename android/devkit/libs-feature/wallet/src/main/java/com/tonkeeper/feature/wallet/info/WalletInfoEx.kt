package com.tonkeeper.feature.wallet.info

import com.tonkeeper.feature.wallet.key.PublicKey
import org.json.JSONObject

private const val PublicKeyAlias = "pk"
private const val LabelAlias = "label"

fun WalletInfo.toJson(): JSONObject {
    return JSONObject().apply {
        put(PublicKeyAlias, pk)
        put(LabelAlias, label)
    }
}

fun JSONObject.toWalletInfo(): WalletInfo {
    return WalletInfo(
        pk = PublicKey(getString(PublicKeyAlias)),
        label = getString(LabelAlias)
    )
}
