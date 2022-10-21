package com.ton_keeper.walletstore.walletinfo

typealias PublicKey = String

data class WalletInfo(
    val pk: PublicKey,
    val label: String
)
