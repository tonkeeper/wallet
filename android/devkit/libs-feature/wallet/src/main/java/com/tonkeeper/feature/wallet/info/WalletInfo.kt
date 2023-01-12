package com.tonkeeper.feature.wallet.info

import com.tonkeeper.feature.wallet.key.PublicKey

data class WalletInfo(
    val pk: PublicKey,
    val label: String = "",
)
