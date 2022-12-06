package com.tonkeeper.feature.localauth

class Authenticator(private val config: Config) {

    suspend fun authWithPasscode(passcode: String) {

    }

    suspend fun authWithBiometry() {

    }

    suspend fun isPasscodeEnabled(): Boolean {
        return TODO()
    }

    suspend fun isBiometryEnabled(): Boolean {
        return TODO()
    }

    suspend fun setupPasscode(value: String) {

    }

    suspend fun setupBiometry() {

    }

    data class Config(
        val fileName: String = DefaultFileName,
        val passcodeAlias: String = DefaultPasscodeAlias,
        val keystoreAlias: String = DefaultKeystoreAlias
    )

    companion object {
        private const val DefaultFileName = "localauth"
        private const val DefaultPasscodeAlias = "passcode"
        private const val DefaultBiometryAlias = "biometry"
        private const val DefaultKeystoreAlias = "passcodekey"
    }
}
