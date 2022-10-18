package com.ton_keeper.walletstore

class WalletMnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid")

class WalletNotFoundException(
    publicKey: String
) : Exception("Wallet with public key not found ($publicKey)")
