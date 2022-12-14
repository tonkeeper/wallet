package com.tonkeeper.feature.localauth.type

sealed interface SecureType {
    class Passcode(val value: String) : SecureType
    object Biometry : SecureType
}
