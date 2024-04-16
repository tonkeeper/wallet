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
    const encryptedString = JSON.stringify(encrypted);

    // Calculate the number of chunks required (2048 bytes per chunk)
    const chunkSize = 2048;
    let index = 0;

    // While loop to break down the string into chunks and save each one
    while (index < encryptedString.length) {
      const chunk = encryptedString.substring(
        index,
        Math.min(index + chunkSize, encryptedString.length),
      );
      await SecureStore.setItemAsync(
        `${this.walletsKey}_chunk_${index / chunkSize}`,
        chunk,
      );
      index += chunkSize;
    }

    // Save an additional item that records the number of chunks
    await SecureStore.setItemAsync(
      `${this.walletsKey}_chunks`,
      String(Math.ceil(encryptedString.length / chunkSize)),
    );
  }

  public async verifyPasscode(passcode: string) {
    await this.getDecryptedVaultState(passcode);
  }

  public async import(identifier: string, mnemonic: string, passcode: string) {
    try {
      if (Object.keys(this.decryptedVaultState).length === 0) {
        this.decryptedVaultState = await this.getDecryptedVaultState(passcode);
      }
    } catch {}
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
      const chunksCountStr = await SecureStore.getItemAsync(`${this.walletsKey}_chunks`);
      if (chunksCountStr !== null) {
        const chunksCount = parseInt(chunksCountStr, 10);
        for (let i = 0; i < chunksCount; i++) {
          await SecureStore.deleteItemAsync(`${this.walletsKey}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${this.walletsKey}_chunks`);
      }
      await SecureStore.deleteItemAsync(this.biometryKey, {
        keychainService: this.keychainService,
      });
    } catch {}
  }

  private async getDecryptedVaultState(passcode: string) {
    // First, get the number of chunks to expect
    const chunksCountStr = await SecureStore.getItemAsync(`${this.walletsKey}_chunks`);

    if (!chunksCountStr) {
      throw new Error('Vault is empty or corrupt.');
    }

    const chunksCount = parseInt(chunksCountStr, 10);
    let encryptedString = '';

    // Loop through all chunks, concatenating them into a single string
    for (let i = 0; i < chunksCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${this.walletsKey}_chunk_${i}`);
      if (chunk) {
        encryptedString += chunk;
      } else {
        throw new Error(`Missing chunk ${i}`);
      }
    }

    const encrypted = JSON.parse(encryptedString);
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

  public async exportPasscodeWithBiometry() {
    const passcode = await SecureStore.getItemAsync(this.biometryKey, {
      keychainService: this.keychainService,
    });

    if (!passcode) {
      throw new Error('Biometry data is not found');
    }

    return passcode;
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
