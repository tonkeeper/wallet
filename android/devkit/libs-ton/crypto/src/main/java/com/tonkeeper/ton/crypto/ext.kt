package com.tonkeeper.ton.crypto

fun ByteArray.toHex(): String {
    return joinToString(separator = "") { "%02x".format(it) }
}
