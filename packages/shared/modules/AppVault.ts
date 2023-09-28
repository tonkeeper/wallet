import { PasscodeController, Storage, Vault } from '@tonkeeper/core';
import { generateSecureRandom } from 'react-native-securerandom';
import * as SecureStore from 'expo-secure-store';
import scrypt from 'react-native-scrypt';
import nacl from 'tweetnacl';

export class AppVault implements Vault {
  constructor(private storage: Storage, private passcodeController: PasscodeController) {}
  protected keychainService = 'TKProtected';

  public async saveWithPasscode(pubkey: string, words: string[], passcode: string) {
    let jsonstr = JSON.stringify(ScryptBox.encrypt(passcode, words));
    await SecureStore.setItemAsync(pubkey, jsonstr);
    return true;
  }

  public async exportWithPasscode() {
    return new Promise<string>((resolve, reject) => {
      this.passcodeController.show({
        onPressBiometry: () => {}, // this.exportWithBiometry,
        onEnter: async (passcode) => {
          const jsonstr = await SecureStore.getItemAsync('mainnet_default');
          if (jsonstr) {
            const privateKey = await ScryptBox.decrypt(passcode, JSON.parse(jsonstr));
            resolve(privateKey);
          }
        },
      });
    });
  }

  public async saveWithBiometry(pubkey: string, words: string[]) {
    let jsonstr = JSON.stringify({
      kind: 'decrypted',
      mnemonic: words.join(' '),
    });

    const keychainService = `TKProtected${Math.random()}`;
    await this.storage.setItem('keychainService', keychainService);
    await SecureStore.setItemAsync(`biometry_${pubkey}`, jsonstr, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      keychainService: this.keychainService,
      requireAuthentication: true,
    });

    return true;
  }

  public async exportWithBiometry() {
    try {
      const storedKeychainService = await this.storage.getItem('keychainService');
      console.log({ storedKeychainService });
      if (storedKeychainService) {
        this.keychainService = storedKeychainService;
      }

      const jsonstr = await SecureStore.getItemAsync('biometry_mainnet_default', {
        keychainService: this.keychainService,
      });

      if (jsonstr) {
        return JSON.parse(jsonstr).mnemonic;
      } else {
        // throw new Error('Failed to unlock the vault');
      }
    } catch (err) {
      // throw new Error(t('access_confirmation_update_biometry'));
      throw new Error('Error');
    }
  }

  public async removeBiometry(pubkey: string) {
    await SecureStore.deleteItemAsync(`biometry_${pubkey}`, {
      keychainService: this.keychainService,
    });
    return true;
  }

  public async removePasscode(pubkey: string) {
    await SecureStore.deleteItemAsync(pubkey);
    return true;
  }
}

const ScryptBox = {
  async encrypt(passcode: string, words: string[]) {
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
      Uint8Array.from(Buffer.from(words.join(' '), 'utf8')),
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
      const pt: Uint8Array | null = nacl.secretbox.open(
        ct,
        Uint8Array.from(nonce),
        Uint8Array.from(enckey),
      );

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
