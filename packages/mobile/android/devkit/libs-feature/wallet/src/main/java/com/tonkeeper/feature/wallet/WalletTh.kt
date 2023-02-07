package com.tonkeeper.feature.wallet

class WalletMnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid.")

class WalletEmptyException
    : Exception("Can not perform an operation because wallet is empty.")

class WalletNotFoundException(
    publicKey: String
) : Exception("Wallet with public key not found (pk: $publicKey).")

class WalletAlreadyExist(
    publicKey: String
) : Exception("Wallet with public key already exist (pk: $publicKey).")