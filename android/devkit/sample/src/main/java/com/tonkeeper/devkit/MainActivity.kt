package com.tonkeeper.devkit

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.lifecycle.lifecycleScope
import com.tonkeeper.feature.localauth.AuthResult
import com.tonkeeper.feature.localauth.Authenticator
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setEdgeToEdge()

        val authenticator = Authenticator(
            context = this,
            config = Authenticator.Config(),
            datastore = settingsDataStore
        )

        val passcodeStatus = mutableStateOf("?")
        val passcodeSetup = mutableStateOf("?")
        val passcodeAuth = mutableStateOf("?")

        setContent {
            MaterialTheme(
                colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
            ) {
                Home(
                    onPasscodeStatusClick = { updatePasscodeStatus(authenticator, passcodeStatus) },
                    onPasscodeSetupClick = { setupPasscode(authenticator, passcodeSetup) },
                    onPasscodeAuthClick = { authPasscode(authenticator, passcodeAuth) },
                    onBiometryStatusClick = {},
                    onBiometrySetupClick = {},
                    onBiometryAuthClick = {},
                    passcodeStatusResult = passcodeStatus.value,
                    passcodeSetupResult = passcodeSetup.value,
                    passcodeAuthResult = passcodeAuth.value
                )
            }
        }
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    private fun updatePasscodeStatus(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        lifecycleScope.launch {
            val enabled = authenticator.isPasscodeEnabled()
            state.value = "Enabled: $enabled"
        }
    }

    private fun setupPasscode(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        lifecycleScope.launch {
            val passcode = "1111"
            authenticator.setupPasscode(passcode)
            state.value = "Success"
        }
    }

    private fun authPasscode(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        lifecycleScope.launch {
            val passcode = "1311"
            val result = authenticator.authWithPasscode(passcode)
            state.value = when (result) {
                AuthResult.Error -> "Error"
                AuthResult.Failure -> "Failure"
                AuthResult.Success -> "Success"
            }
        }
    }

    @Composable
    private fun Home(
        onPasscodeStatusClick: () -> Unit,
        onPasscodeSetupClick: () -> Unit,
        onPasscodeAuthClick: () -> Unit,
        onBiometryStatusClick: () -> Unit,
        onBiometrySetupClick: () -> Unit,
        onBiometryAuthClick: () -> Unit,
        passcodeStatusResult: String,
        passcodeSetupResult: String,
        passcodeAuthResult: String,
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
            BiometryStatus(onClick = {}, result = "None")
            Spacer(modifier = Modifier.height(8.dp))
            BiometrySetup(onClick = {}, result = "None")
            Spacer(modifier = Modifier.height(8.dp))
            BiometryAuth(onClick = {}, result = "None")
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
}
