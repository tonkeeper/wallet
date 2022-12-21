package com.tonkeeper.devkit.ui.passcode

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AuthNode(modifier: Modifier = Modifier) {
    val passcodeStatus = remember { mutableStateOf("?") }
    val passcodeSetup = remember { mutableStateOf("?") }
    val passcodeAuth = remember { mutableStateOf("?") }

    val biometryStatus = remember { mutableStateOf("?") }
    val biometrySetup = remember { mutableStateOf("?") }
    val biometryAuth = remember { mutableStateOf("?") }
}

@Composable
private fun Content(
    onPasscodeStatusClick: () -> Unit,
    onPasscodeSetupClick: () -> Unit,
    onPasscodeAuthClick: () -> Unit,
    onBiometryStatusClick: () -> Unit,
    onBiometrySetupClick: () -> Unit,
    onBiometryAuthClick: () -> Unit,
    passcodeStatusResult: String,
    passcodeSetupResult: String,
    passcodeAuthResult: String,
    biometryStatusResult: String,
    biometrySetupResult: String,
    biometryAuthResult: String,
) {
    Column(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
            .systemBarsPadding()
    ) {
        Text(
            text = "Passcode",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(16.dp))
        PasscodeStatus(onClick = onPasscodeStatusClick, result = passcodeStatusResult)
        Spacer(modifier = Modifier.height(8.dp))
        PasscodeSetup(onClick = onPasscodeSetupClick, result = passcodeSetupResult)
        Spacer(modifier = Modifier.height(8.dp))
        PasscodeAuth(onClick = onPasscodeAuthClick, result = passcodeAuthResult)
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Biometry",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(16.dp))
        BiometryStatus(onClick = onBiometryStatusClick, result = biometryStatusResult)
        Spacer(modifier = Modifier.height(8.dp))
        BiometrySetup(onClick = onBiometrySetupClick, result = biometrySetupResult)
        Spacer(modifier = Modifier.height(8.dp))
        BiometryAuth(onClick = onBiometryAuthClick, result = biometryAuthResult)
    }
}

@Composable
private fun PasscodeStatus(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "State",
        result = result
    )
}

@Composable
private fun PasscodeSetup(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "Setup",
        result = result
    )
}

@Composable
private fun PasscodeAuth(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "Auth",
        result = result
    )
}

@Composable
private fun BiometryStatus(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "State",
        result = result
    )
}

@Composable
private fun BiometrySetup(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "Setup",
        result = result
    )
}

@Composable
private fun BiometryAuth(
    onClick: () -> Unit,
    result: String
) {
    ButtonWithResult(
        onClick = onClick,
        text = "Auth",
        result = result
    )
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
