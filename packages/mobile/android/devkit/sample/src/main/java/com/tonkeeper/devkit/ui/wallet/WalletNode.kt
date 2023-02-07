package com.tonkeeper.devkit.ui.wallet

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tonkeeper.devkit.data.walletSecretDataStore
import com.tonkeeper.devkit.data.walletInfoDataStore

@Composable
fun WalletNode(
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    WalletNodeInternal(
        modifier = modifier,
        vm = viewModel(initializer = {
            WalletViewModel(
                secretDataStore = context.walletSecretDataStore,
                infoDataStore = context.walletInfoDataStore
            )
        })
    )
}

@Composable
private fun WalletNodeInternal(
    modifier: Modifier = Modifier,
    vm: WalletViewModel = viewModel()
) {
    val importResult by vm.importUi
    val walletsResult by vm.walletsUi
    val mnemonicResult by vm.mnemonicUi
    Column(
        modifier = modifier
            .padding(horizontal = 16.dp)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
    ) {
        ButtonWithResult(
            onClick = { vm.import() },
            text = "Import",
            result = importResult
        )
        Spacer(modifier = Modifier.height(16.dp))
        ButtonWithResult(
            onClick = { vm.showWallets() },
            text = "Wallets",
            result = walletsResult
        )
        Spacer(modifier = Modifier.height(16.dp))
        ButtonWithResult(
            onClick = { vm.showMnemonic() },
            text = "Mnemonic",
            result = mnemonicResult
        )
    }
}

@Composable
private fun ButtonWithResult(
    onClick: () -> Unit,
    text: String,
    result: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Button(onClick = onClick) {
            Text(text = text)
        }
        Spacer(modifier = Modifier.weight(1F))
        Text(text = result, color = MaterialTheme.colorScheme.onBackground)
    }
}
