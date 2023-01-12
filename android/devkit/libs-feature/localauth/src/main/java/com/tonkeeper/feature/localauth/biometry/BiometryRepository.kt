package com.tonkeeper.feature.localauth.biometry

interface BiometryRepository {

    suspend fun isEnabled(): Boolean

    suspend fun enable()

    suspend fun disable()
}
