package com.tonkeeper.ton.mnemonic

class MnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid.")

class MnemonicEmptyException
    : NullPointerException("Words list is empty.")
