package com.ton_keeper.walletstore

class WalletMnemonicInvalidException
    : Exception("Mnemonic of wallet is invalid")

class WalletNotFoundException(
    publicKey: String
) : Exception("Wallet with public key not found ($publicKey)")

class WalletSaveException(
    publicKey: String = ""
): Exception("Saving of wallet went wrong ($publicKey)")

class WalletInvalidAuth
    : Exception("Passcode or Biometry invalid")
