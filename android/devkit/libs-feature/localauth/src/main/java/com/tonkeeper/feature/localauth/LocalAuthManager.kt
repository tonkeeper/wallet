package com.tonkeeper.feature.localauth

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.tonkeeper.feature.localauth.biometry.BiometryRepository
import com.tonkeeper.feature.localauth.passcode.PasscodeRepository
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class LocalAuthManager(
    private val activity: FragmentActivity,
    private val passcodeRepository: PasscodeRepository,
    private val biometryRepository: BiometryRepository,
) {

    private val biometric = BiometricManager.from(activity)
    private val executor = ContextCompat.getMainExecutor(activity)

    suspend fun isPasscodeEnabled(): Boolean {
        return passcodeRepository.isSaved()
    }

    suspend fun setupPasscode(value: String) {
        passcodeRepository.save(value)
    }

    suspend fun authWithPasscode(passcode: String): LocalAuthResult {
        return when (passcodeRepository.compare(passcode)) {
            true -> LocalAuthResult.Success
            false -> LocalAuthResult.Failure
            null -> LocalAuthResult.Error
        }
    }

    suspend fun isBiometryEnabled(): Boolean {
        return isBiometryAvailable() && biometryRepository.isEnabled()
    }

    suspend fun setupBiometry() {
        if (isBiometryAvailable().not()) throw AuthenticatorBiometryError()
        biometryRepository.enable()
    }

    suspend fun authWithBiometry() = suspendCancellableCoroutine { continuation ->
        val info = createBiometryPromptInfo()
        val callback = createAuthenticationCallback(continuation)
        val biometricPrompt = BiometricPrompt(activity, executor, callback)

        biometricPrompt.authenticate(info)

        continuation.invokeOnCancellation {
            biometricPrompt.cancelAuthentication()
        }
    }

    private fun isBiometryAvailable(): Boolean {
        return biometric.canAuthenticate(BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS
    }

    private fun createAuthenticationCallback(
        continuation: CancellableContinuation<LocalAuthResult>
    ): BiometricPrompt.AuthenticationCallback {
        return object : BiometricPrompt.AuthenticationCallback() {

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                if (continuation.isCancelled) return
                continuation.resume(LocalAuthResult.Success)
            }

            override fun onAuthenticationFailed() {
                if (continuation.isCancelled) return
                continuation.resume(LocalAuthResult.Failure)
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                if (continuation.isCancelled) return
                continuation.resume(LocalAuthResult.Error)
            }
        }
    }

    private fun createBiometryPromptInfo(): BiometricPrompt.PromptInfo {
        return BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric authentication")
            .setSubtitle("Verify your identity for operation")
            .setAllowedAuthenticators(BIOMETRIC_STRONG)
            .setNegativeButtonText("Cancel")
            .build()
    }
}
