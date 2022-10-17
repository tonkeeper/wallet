package com.ton_keeper.walletstore

typealias PublicKey = String
typealias SecretKey = String

data class WalletInfo(
    val pk: PublicKey,
    val label: String
)
