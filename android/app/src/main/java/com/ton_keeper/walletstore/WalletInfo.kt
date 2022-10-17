package com.ton_keeper.walletstore

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap

typealias PublicKey = String
typealias SecretKey = String

data class WalletInfo(
    val pk: PublicKey,
    val label: String
)

fun WalletInfo.toMap(): ReadableMap {
    return WritableNativeMap().apply {
        putString("pubkey", pk)
        putString("label", label)
    }
}
