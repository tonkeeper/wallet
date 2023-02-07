package com.tonkeeper.devkit.ui.passcode

import androidx.compose.runtime.MutableState
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tonkeeper.feature.localauth.AuthenticatorBiometryError
import com.tonkeeper.feature.localauth.LocalAuthManager
import com.tonkeeper.feature.localauth.LocalAuthResult
import kotlinx.coroutines.launch

class PasscodeViewModel : ViewModel() {

    private fun updatePasscodeStatus(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val enabled = localAuthManager.isPasscodeEnabled()
            state.value = "Enabled: $enabled"
        }
    }

    private fun setupPasscode(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val passcode = "1111"
            localAuthManager.setupPasscode(passcode)
            state.value = "Success"
        }
    }

    private fun authPasscode(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val passcode = "1311"
            val result = localAuthManager.authWithPasscode(passcode)
            state.value = when (result) {
                LocalAuthResult.Error -> "Error"
                LocalAuthResult.Failure -> "Failure"
                LocalAuthResult.Success -> "Success"
            }
        }
    }

    private fun updateBiometryStatus(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val enabled = localAuthManager.isBiometryEnabled()
            state.value = "Enabled: $enabled"
        }
    }

    private fun setupBiometry(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            try {
                localAuthManager.setupBiometry()
                state.value = "Success"
            } catch (ex: AuthenticatorBiometryError) {
                state.value = "Failure"
            }
        }
    }

    private fun authBiometry(
        localAuthManager: LocalAuthManager,
        state: MutableState<String>
    ) {
        viewModelScope.launch {
            val result = localAuthManager.authWithBiometry()
            state.value = when (result) {
                LocalAuthResult.Error -> "Error"
                LocalAuthResult.Failure -> "Failure"
                LocalAuthResult.Success -> "Success"
            }
        }
    }


}