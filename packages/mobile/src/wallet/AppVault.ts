import { Vault } from '@tonkeeper/core';
import { Mnemonic } from '@tonkeeper/core/src/utils/mnemonic';
import { Buffer } from 'buffer';
import { generateSecureRandom } from 'react-native-securerandom';
import scrypt from 'react-native-scrypt';
import * as SecureStore from 'expo-secure-store';

const { nacl } = require('react-native-tweetnacl');

interface DecryptedData {
  identifier: string;
  mnemonic: string;
}

type VaultState = Record<DecryptedData['identifier'], DecryptedData>;

export class AppVault implements Vault {
  constructor() {}
  protected keychainService = 'TKProtected';
  protected walletsKey = 'wallets';
  protected biometryKey = 'biometry_passcode';

  private decryptedVaultState: VaultState = {};

  private async saveVaultState(passcode: string) {
    const state = JSON.stringify(this.decryptedVaultState);

    const encrypted = await ScryptBox.encrypt(passcode, state);

    await SecureStore.setItemAsync(this.walletsKey, JSON.stringify(encrypted));
  }

  public async verifyPasscode(passcode: string) {
    await this.getDecryptedVaultState(passcode);
  }

  public async import(identifier: string, mnemonic: string, passcode: string) {
    /** check passcode */
    if (Object.keys(this.decryptedVaultState).length > 0) {
      await this.verifyPasscode(passcode);
    }

    if (!(await Mnemonic.validateMnemonic(mnemonic.split(' ')))) {
      throw new Error('Mnemonic phrase is incorrect');
    }

    const keyPair = await Mnemonic.mnemonicToKeyPair(mnemonic.split(' '));

    this.decryptedVaultState[identifier] = { identifier, mnemonic };

    await this.saveVaultState(passcode);

    return keyPair;
  }

  public async remove(identifier: string, passcode: string) {
    delete this.decryptedVaultState[identifier];

    await this.saveVaultState(passcode);
  }

  public async destroy() {
    try {
      this.decryptedVaultState = {};
      await SecureStore.deleteItemAsync(this.walletsKey);
      await SecureStore.deleteItemAsync(this.biometryKey, {
        keychainService: this.keychainService,
      });
    } catch {}
  }

  private async getDecryptedVaultState(passcode: string) {
    const encryptedJson = await SecureStore.getItemAsync(this.walletsKey);

    if (!encryptedJson) {
      throw new Error('Vault is empty');
    }

    const encrypted = JSON.parse(encryptedJson);
    const stateJson = await ScryptBox.decrypt(passcode, encrypted);

    return JSON.parse(stateJson) as VaultState;
  }

  public async exportWithPasscode(identifier: string, passcode: string) {
    this.decryptedVaultState = await this.getDecryptedVaultState(passcode);

    const data = this.decryptedVaultState[identifier];

    if (!data) {
      throw new Error(`Mnemonic doesn't exist, identifier: ${identifier}`);
    }

    return data.mnemonic;
  }

  public async changePasscode(passcode: string, newPasscode: string) {
    this.decryptedVaultState = await this.getDecryptedVaultState(passcode);

    await this.saveVaultState(newPasscode);
  }

  public async exportWithBiometry(identifier: string) {
    const passcode = await SecureStore.getItemAsync(this.biometryKey, {
      keychainService: this.keychainService,
    });

    if (!passcode) {
      throw new Error('Biometry data is not found');
    }

    return this.exportWithPasscode(identifier, passcode);
  }

  public async setupBiometry(passcode: string) {
    await SecureStore.setItemAsync(this.biometryKey, passcode, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      keychainService: this.keychainService,
      requireAuthentication: true,
    });
  }

  public async removeBiometry() {
    await SecureStore.deleteItemAsync(this.biometryKey, {
      keychainService: this.keychainService,
    });
  }
}

export const ScryptBox = {
  async encrypt(passcode: string, value: string) {
    // default parameters
    const N = 16384; // 16K*128*8 = 16 Mb of memory
    const r = 8;
    const p = 1;

    const salt = Buffer.from(await generateSecureRandom(32));
    const enckey = await scrypt(
      Buffer.from(passcode, 'utf8'),
      salt,
      N,
      r,
      p,
      32,
      'buffer',
    );
    const nonce = salt.slice(0, 24);
    const ct: Uint8Array = nacl.secretbox(
      Uint8Array.from(Buffer.from(value, 'utf8')),
      Uint8Array.from(nonce),
      Uint8Array.from(enckey),
    );

    return {
      kind: 'encrypted-scrypt-tweetnacl',
      N: N, // scrypt "cost" parameter
      r: r, // scrypt "block size" parameter
      p: p, // scrypt "parallelization" parameter
      salt: salt.toString('hex'), // hex-encoded nonce/salt
      ct: Buffer.from(ct).toString('hex'), // hex-encoded ciphertext
    };
  },
  // Attempts to decrypt the vault and returns `true` if succeeded.
  async decrypt(password: string, state: any): Promise<string> {
    if (state.kind === 'encrypted-scrypt-tweetnacl') {
      const salt = Buffer.from(state.salt, 'hex');
      const { N, r, p } = state;
      const enckey = await scrypt(
        Buffer.from(password, 'utf8'),
        salt,
        N,
        r,
        p,
        32,
        'buffer',
      );
      const nonce = salt.slice(0, 24);
      const ct = Buffer.from(state.ct, 'hex');
      const pt = nacl.secretbox.open(ct, Uint8Array.from(nonce), Uint8Array.from(enckey));
      if (pt) {
        const phrase = Utf8ArrayToString(pt);
        return phrase;
      } else {
        throw new Error('Invald Passcode');
      }
    } else {
      throw new Error('Unsupported encryption format ' + state.kind);
    }
  },
};

function Utf8ArrayToString(array: Uint8Array): string {
  let out = '';
  let len = array.length;
  let i = 0;
  let c: any = null;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        let char = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        let a = array[i++];
        let b = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((a & 0x3f) << 6) | ((b & 0x3f) << 0),
        );
        break;
    }
  }
  return out;
}

export const vault = new AppVault();
