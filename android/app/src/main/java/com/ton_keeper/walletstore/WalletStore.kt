package com.ton_keeper.walletstore

import androidx.fragment.app.FragmentActivity
import com.ton_keeper.crypto.Mnemonic
import com.ton_keeper.walletstore.data.StoreSecureType
import com.ton_keeper.walletstore.walletinfo.PublicKey
import com.ton_keeper.walletstore.walletinfo.WalletInfo

class WalletStore(activity: FragmentActivity) {

    fun import(mnemonic: Array<String>, secure: StoreSecureType): WalletInfo {
        val keys = Mnemonic.toKeyPair(mnemonic)
        return TODO()
    }

    fun getAll(): List<WalletInfo> {
        return TODO()
    }

    fun getByPublicKey(pk: PublicKey): WalletInfo {
        return TODO()
    }

    fun getByAddress(address: String): WalletInfo {
        return TODO()
    }

    fun updateLabelByPublicKey(pk: PublicKey, label: String): WalletInfo {
        return TODO()
    }

    fun exportSecretKey(pk: PublicKey, secure: StoreSecureType): ByteArray {
        return TODO()
    }

    fun backup(pk: PublicKey, secure: StoreSecureType): List<String> {
        return TODO()
    }
}
