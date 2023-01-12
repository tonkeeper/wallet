package com.ton_keeper.bridge

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.tonkeeper.feature.wallet.info.WalletInfo

private const val PublicKeyAlias = "pubkey"
private const val LabelAlias = "label"

fun List<WalletInfo>.toBridgeMapArray(): ReadableArray {
    val array = WritableNativeArray()
    forEach { array.pushMap(it.toBridgeMap()) }
    return array
}

fun WalletInfo.toBridgeMap(): ReadableMap {
    return WritableNativeMap().apply {
        putString(PublicKeyAlias, pk.value)
        putString(LabelAlias, label)
    }
}