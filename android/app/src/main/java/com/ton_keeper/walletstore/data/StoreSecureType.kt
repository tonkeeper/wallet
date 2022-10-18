package com.ton_keeper.walletstore.data

sealed interface StoreSecureType {
    data class Passcode(val value: String) : StoreSecureType
    object Biometry : StoreSecureType
}
