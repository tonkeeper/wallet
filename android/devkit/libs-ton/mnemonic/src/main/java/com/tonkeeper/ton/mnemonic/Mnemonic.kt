package com.tonkeeper.ton.mnemonic

import com.tonkeeper.ton.crypto.Nacl
import com.tonkeeper.ton.crypto.PBKDF2SHA512
import java.security.InvalidKeyException
import java.security.NoSuchAlgorithmException
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.math.floor

object Mnemonic {

    private const val TonDefaultSeed = "TON default seed"
    private const val TonSeedVersion = "TON seed version"
    private const val TonFastSeedVersion = "TON fast seed version"
    private const val PbkdfIterationsCount = 100000
    private const val PbkdfKeyLen = 64
    private const val MacAlgorithm = "HmacSHA512"

    fun toKeyPair(mnemonic: List<String>): Nacl.Signature.KeyPair {
        if (mnemonic.isEmpty()) throw MnemonicEmptyException()

        val normalized = normalize(mnemonic)
        val seed = toSeed(normalized)
        val sliced = seed.sliceArray(0 until 32)
        return Nacl.Signature.keyPair_fromSeed(sliced)
    }

    fun isCorrect(mnemonic: List<String>): Boolean {
        if (mnemonic.isEmpty()) throw MnemonicEmptyException()

        val normalized = normalize(mnemonic)
        normalized.forEach { if (Wordlist.contains(it).not()) return false }

        val entropy = toEntropy(normalized)
        return isBasicSeed(entropy)
    }

    private fun normalize(mnemonic: List<String>): List<String> {
        return mnemonic.map { it.lowercase() }
    }

    private fun toSeed(mnemonic: List<String>): ByteArray {
        val entropy = toEntropy(mnemonic)
        val salt = TonDefaultSeed.toByteArray()
        return pbkdf2Sha512(entropy, salt, PbkdfIterationsCount)
    }

    private fun toEntropy(mnemonic: List<String>): ByteArray {
        val key = mnemonic.joinToString(separator = " ").toByteArray()
        return hmacSha512(key, ByteArray(0)) ?: ByteArray(0)
    }

    private fun isBasicSeed(key: ByteArray): Boolean {
        val salt = TonSeedVersion.toByteArray()
        val iterations = floor(PbkdfIterationsCount / 256.0).toInt()
        val seed = pbkdf2Sha512(key, salt, iterations)
        return seed[0] == 0.toByte()
    }

    private fun isPasswordSeed(key: ByteArray): Boolean {
        val salt = TonFastSeedVersion.toByteArray()
        val iterations = 1
        val seed = pbkdf2Sha512(key, salt, iterations)
        return seed[0] == 1.toByte()
    }

    private fun pbkdf2Sha512(key: ByteArray, salt: ByteArray, iterations: Int): ByteArray {
        return PBKDF2SHA512.derive(key, salt, iterations, PbkdfKeyLen)
    }

    @Throws(NoSuchAlgorithmException::class, InvalidKeyException::class)
    private fun hmacSha512(key: ByteArray, input: ByteArray): ByteArray? {
        val ctx = Mac.getInstance(MacAlgorithm)
        ctx.init(SecretKeySpec(key, MacAlgorithm))
        ctx.update(input)
        return ctx.doFinal()
    }
}