package com.tonkeeper.devkit.ui.passcode

import androidx.compose.runtime.MutableState
import androidx.lifecycle.ViewModel
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewModelScope
import com.tonkeeper.feature.localauth.Authenticator
import com.tonkeeper.feature.localauth.AuthenticatorBiometryError
import com.tonkeeper.feature.localauth.result.AuthResult
import kotlinx.coroutines.launch

class PasscodeViewModel : ViewModel() {


    private fun updatePasscodeStatus(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val enabled = authenticator.isPasscodeEnabled()
            state.value = "Enabled: $enabled"
        }
    }

    private fun setupPasscode(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val passcode = "1111"
            authenticator.setupPasscode(passcode)
            state.value = "Success"
        }
    }

    private fun authPasscode(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val passcode = "1311"
            val result = authenticator.authWithPasscode(passcode)
            state.value = when (result) {
                AuthResult.Error -> "Error"
                AuthResult.Failure -> "Failure"
                AuthResult.Success -> "Success"
            }
        }
    }

    private fun updateBiometryStatus(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val enabled = authenticator.isBiometryEnabled()
            state.value = "Enabled: $enabled"
        }
    }

    private fun setupBiometry(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            try {
                authenticator.setupBiometry()
                state.value = "Success"
            } catch (ex: AuthenticatorBiometryError) {
                state.value = "Failure"
            }
        }
    }

    private fun authBiometry(
        authenticator: Authenticator,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val result = authenticator.authWithBiometry()
            state.value = when (result) {
                AuthResult.Error -> "Error"
                AuthResult.Failure -> "Failure"
                AuthResult.Success -> "Success"
            }
        }
    }


}