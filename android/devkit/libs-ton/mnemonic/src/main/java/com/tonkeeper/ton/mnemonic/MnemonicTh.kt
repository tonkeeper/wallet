package com.tonkeeper.ton.mnemonic

class MnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid.")

class MnemonicEmptyException
    : IllegalStateException("Words list is empty.")
