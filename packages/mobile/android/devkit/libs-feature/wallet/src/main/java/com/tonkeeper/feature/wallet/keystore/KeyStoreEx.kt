package com.tonkeeper.feature.wallet.keystore

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

fun getOrCreateSecretKey(
    provider: String,
    alias: String
): SecretKey {
    val keyStore = KeyStore.getInstance(provider)
    keyStore.load(null)
    return if (keyStore.containsAlias(alias)) {
        keyStore.getKey(alias, null) as SecretKey
    } else {
        val params = createKeyGenParam(alias)
        generateSecretKey(provider, params)
    }
}

fun generateSecretKey(
    provider: String,
    keyGenParameterSpec: KeyGenParameterSpec
): SecretKey {
    val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, provider)
    keyGenerator.init(keyGenParameterSpec)
    return keyGenerator.generateKey()
}

fun createKeyGenParam(alias: String): KeyGenParameterSpec {
    val purposes = KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    return KeyGenParameterSpec.Builder(alias, purposes)
        .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
        .setUserAuthenticationRequired(false)
        .build()
}

fun getCipher(): Cipher {
    return Cipher.getInstance(
        KeyProperties.KEY_ALGORITHM_AES + "/"
                + KeyProperties.BLOCK_MODE_CBC + "/"
                + KeyProperties.ENCRYPTION_PADDING_PKCS7
    )
}