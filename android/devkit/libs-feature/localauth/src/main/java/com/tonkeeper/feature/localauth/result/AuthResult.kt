package com.tonkeeper.feature.localauth.result

sealed interface AuthResult {
    object Success : AuthResult
    object Failure : AuthResult
    object Error: AuthResult
}
