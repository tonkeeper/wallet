package com.tonkeeper.feature.localauth

sealed interface AuthResult {
    object Success : AuthResult
    object Failure : AuthResult
    object Error: AuthResult
}
