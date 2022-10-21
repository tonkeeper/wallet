package com.ton_keeper.walletstore.mnemonic

object MnemonicSerializer {

    fun serializeToString(value: List<String>): String {
        return value.joinToString(separator = ".")
    }

    fun deserializeFromString(value: String): List<String> {
        return value.split(".")
    }
}
