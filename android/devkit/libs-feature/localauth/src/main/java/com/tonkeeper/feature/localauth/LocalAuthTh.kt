package com.tonkeeper.feature.localauth

class AuthenticatorPasscodeInvalid
    : IllegalStateException("Passcode is invalid.")

class AuthenticatorPasscodeError
    : IllegalStateException("Passcode auth ended with exception.")

class AuthenticatorBiometryInvalid
    : IllegalStateException("Biometry is invalid.")

class AuthenticatorBiometryError
    : IllegalStateException("Biometry auth ended with exception.")