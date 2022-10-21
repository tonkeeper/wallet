package com.ton_keeper.walletstore.walletinfo

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONObject

private const val PublicKeyAlias = "pubkey"
private const val LabelAlias = "label"

object WalletInfoSerializer {

    fun serializeToString(value: WalletInfo): String {
        return value.toJson().toString()
    }

    fun deserializeFromString(value: String): WalletInfo {
        return JSONObject(value).toWalletInfo()
    }
}

fun List<WalletInfo>.toBridgeMapArray(): ReadableArray {
    val array = WritableNativeArray()
    forEach { array.pushMap(it.toBridgeMap()) }
    return array
}

fun WalletInfo.toBridgeMap(): ReadableMap {
    return WritableNativeMap().apply {
        putString(PublicKeyAlias, pk)
        putString(LabelAlias, label)
    }
}

fun WalletInfo.toJson(): JSONObject {
    return JSONObject().apply {
        put(PublicKeyAlias, pk)
        put(LabelAlias, label)
    }
}

fun JSONObject.toWalletInfo(): WalletInfo {
    return WalletInfo(
        pk = getString(PublicKeyAlias),
        label = getString(LabelAlias)
    )
}
