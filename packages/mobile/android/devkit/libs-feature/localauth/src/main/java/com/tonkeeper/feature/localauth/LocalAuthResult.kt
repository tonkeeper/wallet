package com.tonkeeper.feature.localauth

sealed interface LocalAuthResult {
    object Success : LocalAuthResult
    object Failure : LocalAuthResult
    object Error: LocalAuthResult
}
