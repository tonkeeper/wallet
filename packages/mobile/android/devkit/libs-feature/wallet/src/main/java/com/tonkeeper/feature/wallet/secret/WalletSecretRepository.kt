package com.tonkeeper.feature.wallet.secret

import com.tonkeeper.feature.wallet.key.PublicKey

interface WalletSecretRepository {

    suspend fun save(mnemonic: List<String>): PublicKey

    suspend fun getMnemonic(pk: PublicKey): List<String>

    suspend fun getSecretKey(pk: PublicKey): ByteArray

    suspend fun remove(pk: PublicKey)

    suspend fun clear()
}