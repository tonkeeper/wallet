package com.ton_keeper.crypto

fun ByteArray.toHex(): String {
    return joinToString(separator = "") { "%02x".format(it) }
}
