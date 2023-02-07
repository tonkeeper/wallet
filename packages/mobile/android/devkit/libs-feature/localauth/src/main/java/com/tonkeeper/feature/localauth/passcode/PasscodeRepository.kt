package com.tonkeeper.feature.localauth.passcode

interface PasscodeRepository {

    suspend fun isSaved(): Boolean

    suspend fun save(passcode: String)

    suspend fun compare(passcode: String): Boolean?

    suspend fun clear()
}
