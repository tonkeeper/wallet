package com.tonkeeper.feature.localauth

sealed interface SecureType {
    class Passcode(val value: String) : SecureType
    object Biometry : SecureType
}
