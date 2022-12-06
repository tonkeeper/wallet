package com.tonkeeper.ton.mnemonic

import com.tonkeeper.ton.crypto.toHex
import org.junit.Assert
import org.junit.Test

class MnemonicUnitTest {

    @Test
    fun mnemonic_isCorrect() {
        val result = Mnemonic.isCorrect(WordsCorrect_One)
        Assert.assertEquals(true, result)
    }

    @Test
    fun mnemonic_isIncorrect() {
        val result = Mnemonic.isCorrect(WordsIncorrect)
        Assert.assertEquals(false, result)
    }

    @Test
    fun mnemonic_isEmpty() {
        Assert.assertThrows(MnemonicEmptyException::class.java) {
            Mnemonic.isCorrect(WordsEmpty)
        }
    }

    @Test
    fun mnemonic_pubKeyOne() {
        val result = Mnemonic.toKeyPair(WordsCorrect_One)
        Assert.assertEquals(PubKey_One, result.publicKey.toHex())
    }

    @Test
    fun mnemonic_pubKeyTwo() {
        val result = Mnemonic.toKeyPair(WordsCorrect_Two)
        Assert.assertEquals(PubKey_Two, result.publicKey.toHex())
    }

    companion object {
        private val WordsEmpty = emptyList<String>()
        private val WordsIncorrect = Wordlist.take(24)

        private val WordsCorrect_One = arrayListOf(
            "defy", "leopard", "dutch", "exclude", "tortoise", "also", "hen", "resource", "large",
            "stereo", "remain", "brother", "original", "curve", "media", "valid", "summer",
            "impose", "expand", "rebel", "six", "loyal", "hungry", "shoe"
        )
        private const val PubKey_One =
            "2671942773bc7da30afd4a7dd32fdd156f4472ac3cbecde2459175c3c77d4e8c"

        private val WordsCorrect_Two = arrayListOf(
            "siege", "wasp", "pencil", "awake", "rotate", "swear", "wedding", "oblige", "region",
            "thunder", "pilot", "child", "rice", "huge", "tongue", "jump", "deal", "cram",
            "conduct", "notice", "exchange", "excite", "fog", "isolate"
        )
        private const val PubKey_Two =
            "a4a571929f1dfbe1f697d13764b96a1a168014c131d65d5c546371a5a00fd54c"
    }
}