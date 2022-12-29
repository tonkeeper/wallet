package com.tonkeeper.feature.wallet.info

import com.tonkeeper.feature.wallet.key.PublicKey

interface WalletInfoRepository {

    suspend fun save(pk: PublicKey): WalletInfo

    suspend fun update(pk: PublicKey, info: WalletInfo)

    suspend fun get(pk: PublicKey): WalletInfo

    suspend fun all(): List<WalletInfo>

    suspend fun remove(pk: PublicKey)

    suspend fun clear()
}
