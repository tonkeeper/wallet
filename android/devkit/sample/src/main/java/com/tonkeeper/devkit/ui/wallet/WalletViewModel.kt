package com.tonkeeper.devkit.ui.wallet

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tonkeeper.devkit.data.mnemonicDataStore
import com.tonkeeper.devkit.data.walletDataStore
import com.tonkeeper.feature.wallet.WalletStorage
import com.tonkeeper.feature.wallet.key.PublicKey
import kotlinx.coroutines.launch

class WalletViewModel(
    mnemonicDataStore: DataStore<Preferences>,
    walletDataStore: DataStore<Preferences>,
) : ViewModel() {

    val importUi = mutableStateOf("?")
    val walletsUi = mutableStateOf("?")
    val mnemonicUi = mutableStateOf("?")

    private val storage = WalletStorage(
        mnemonicDataStore = mnemonicDataStore,
        walletDataStore = walletDataStore
    )

    fun import() {
        try {
            viewModelScope.launch {
                storage.import(Words)
                importUi.value = "Success"
            }
        } catch (ex: Exception) {
            importUi.value = "Error: ${ex.message}"
        }
    }

    fun showWallets() {
        viewModelScope.launch {
            val wallets = storage.wallets()
            walletsUi.value = wallets.joinToString()
        }
    }

    fun showMnemonic() {
        viewModelScope.launch {
            val wallets = storage.backup(PubKey)
            mnemonicUi.value = wallets.joinToString()
        }
    }

    companion object {
        private val Words = listOf(
            "defy", "leopard", "dutch", "exclude", "tortoise", "also", "hen", "resource", "large",
            "stereo", "remain", "brother", "original", "curve", "media", "valid", "summer",
            "impose", "expand", "rebel", "six", "loyal", "hungry", "shoe"
        )

        private val PubKey = PublicKey(
            value = "2671942773bc7da30afd4a7dd32fdd156f4472ac3cbecde2459175c3c77d4e8c"
        )
    }
}