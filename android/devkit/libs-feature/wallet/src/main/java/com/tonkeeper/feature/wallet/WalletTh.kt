package com.tonkeeper.feature.wallet

class WalletMnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid.")

class WalletNotFoundException(
    publicKey: String
) : Exception("Wallet with public key not found ($publicKey).")

class WalletAlreadyExist(
    publicKey: String
) : Exception("Wallet with public key already exist ($publicKey).")