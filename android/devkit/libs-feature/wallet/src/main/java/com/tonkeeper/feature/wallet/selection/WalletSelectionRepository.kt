package com.tonkeeper.feature.wallet.selection

import com.tonkeeper.feature.wallet.key.PublicKey

interface WalletSelectionRepository {

    suspend fun current(): PublicKey

    suspend fun select(pk: PublicKey)
}
