package com.ton_keeper.walletstore

sealed interface SecureType {
    data class Passcode(val value: String) : SecureType
    object Biometry : SecureType
}
