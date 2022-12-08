package com.tonkeeper.feature.wallet

class WalletStorage(private val config: Config) {

    suspend fun import() {

    }

    suspend fun update() {

    }

    suspend fun remove() {

    }

    suspend fun export() {

    }

    suspend fun backup() {

    }

    suspend fun wallet() {

    }

    suspend fun wallets() {

    }

    suspend fun clear() {

    }

    class Config(
        val fileName: String = DefaultFileName,
    )

    companion object {
        private const val DefaultFileName = "walletstorage"
    }
}
