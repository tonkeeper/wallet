package com.tonkeeper.feature.wallet

import com.tonkeeper.feature.wallet.info.*
import com.tonkeeper.feature.wallet.key.PublicKey
import com.tonkeeper.feature.wallet.secret.WalletSecretRepository
import com.tonkeeper.ton.crypto.toHex
import com.tonkeeper.ton.mnemonic.Mnemonic
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

class WalletStoreManager(
    private val walletSecretRepository: WalletSecretRepository,
    private val walletInfoRepository: WalletInfoRepository
) {

    suspend fun import(mnemonic: List<String>): WalletInfo {
        val isCorrect = Mnemonic.isCorrect(mnemonic)
        if (!isCorrect) throw WalletMnemonicInvalidException()

        val pk = walletSecretRepository.save(mnemonic)
        return walletInfoRepository.save(pk)
    }

    suspend fun update(pk: PublicKey, label: String): WalletInfo {
        val info = WalletInfo(pk, label)
        walletInfoRepository.update(pk, info)
        return info
    }

    suspend fun remove(pk: PublicKey) {
        walletSecretRepository.remove(pk)
        walletInfoRepository.remove(pk)
    }

    suspend fun getSecretKeyHex(pk: PublicKey): String {
        return walletSecretRepository.getSecretKey(pk).toHex()
    }

    suspend fun getMnemonic(pk: PublicKey): List<String> {
        return walletSecretRepository.getMnemonic(pk)
    }

    suspend fun wallet(pk: PublicKey): WalletInfo {
        return walletInfoRepository.get(pk)
    }

    suspend fun wallets(): List<WalletInfo> {
        return walletInfoRepository.all()
    }

    suspend fun clear(): Unit = coroutineScope {
        val secretClear = async { walletSecretRepository.clear() }
        val infoClear = async { walletInfoRepository.clear() }
        secretClear.await()
        infoClear.await()
    }
}
