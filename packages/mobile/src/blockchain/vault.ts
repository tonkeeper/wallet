import EncryptedStorage from 'react-native-encrypted-storage';
import { Buffer } from 'buffer';
import { generateSecureRandom } from 'react-native-securerandom';
import scrypt from 'react-native-scrypt';
import BN from 'bn.js';
import { getServerConfig } from '$shared/constants';
import { MainDB } from '$database';
import { debugLog } from '$utils';
import * as SecureStore from 'expo-secure-store';
import { t } from '$translation';
import { Ton } from '$libs/Ton';
import { wordlist } from '$libs/Ton/mnemonic/wordlist';
import { Tonapi } from '$libs/Tonapi';

const { nacl } = require('react-native-tweetnacl');

const TonWeb = require('tonweb');

const DEFAULT_VERSION = 'v4R2';

/*
Usage:

let vault: UnlockedVault = await Vault.generate("vault-0");
let encryptedVault: EncryptedVault = vault.encrypt("my password");
let vault: Vault = encryptedVault.lock(); // stores the keychain item and removes secrets from memory.
let vault:  = vault.unlock(); // triggers faceid to load the secret from the store.
let backup = vault.mnemonic; // returns string
let tonAddress = await vault.getTonAddress();
*/

// Non-secret metadata of the vault necessary to generate addresses and check balances.
export type VaultJSON = {
  // Name for the system keychain item to retrieve secret data
  name: string;

  // Hex-encoded ton public key (ed25519 pubkey)
  tonPubkey: string;

  version?: string;

  workchain?: number;
  configPubKey?: string;
  allowedDestinations?: string;
};

// Non-secret data in a deserialized format.
type VaultInfo = {
  // Name for the system keychain item to retrieve secret data
  name: string;

  // Raw Ton public key (ed25519)
  tonPubkey: Uint8Array;

  version?: string;

  workchain?: number;
  configPubKey?: string; // for lockup wallets
  allowedDestinations?: string; // for lockup wallets
};

// The locked state of the vault contains only public keys and addresses,
// but no secret data.
export class Vault {
  protected info: VaultInfo;
  protected keychainService = 'TKProtected';

  // Private constructor.
  // Use `Vault.generate` to create a new vault and `Vault.fromJSON` to load one from disk.
  constructor(info: VaultInfo) {
    this.info = info;
  }

  // Generates new wallet.
  static async generate(name: string): Promise<UnlockedVault> {
    //const entropy = Buffer.from(await generateSecureRandom(32));
    //const phrase = bip39.entropyToMnemonic(entropy) as string;

    // TON uses the same word list, but bruteforces words so the first byte indicates
    // whether the password is required or not. We use password only for on-device storage,
    // and keep *this* password empty.
    const phrase = (await Ton.mnemonic.generateMnemonic(24)).join(' ');
    return await Vault.restore(name, phrase, DEFAULT_VERSION);
  }

  // Restores the wallet from the mnemonic phrase.
  static async restore(
    name: string,
    phrase: string,
    version?: string,
    config?: any,
  ): Promise<UnlockedVault> {
    //if (!bip39.validateMnemonic(phrase, bip39.DEFAULT_WORDLIST)) {
    // TON uses custom mnemonic format with BIP39 words, but bruteforced so that first byte indicates
    // whether the mnemonic uses password protection or not. To stay compatible, we use TON's checker.
    if (!(await Ton.mnemonic.validateMnemonic(phrase.split(' '), '', wordlist.enMap))) {
      throw new Error('Mnemonic phrase is incorrect');
    }

    const tonPubkey = (await Ton.mnemonic.mnemonicToKeyPair(phrase.split(' '))).publicKey;
    const info: VaultInfo = {
      name: name,
      tonPubkey,
      workchain: 0,
    };

    if (config) {
      version = config.wallet_type;
      info.workchain = config.workchain;
      info.configPubKey = config.config_pubkey;
      info.allowedDestinations = config.allowed_destinations;
      console.log('lockup wallet detected');
    } else {
      if (!version) {
        try {
          const provider = new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
            apiKey: getServerConfig('tonEndpointAPIKey'),
          });
          const ton = new TonWeb(provider);

          let hasBalance: { balance: BN; version: string }[] = [];
          for (let WalletClass of ton.wallet.list) {
            const wallet = new WalletClass(ton.provider, {
              publicKey: info.tonPubkey,
              wc: 0,
            });
            const walletAddress = (await wallet.getAddress()).toString(true, true, true);
            const walletInfo = await Tonapi.getWalletInfo(walletAddress);
            const walletBalance = new BN(walletInfo.balance);
            if (walletBalance.gt(new BN(0))) {
              hasBalance.push({ balance: walletBalance, version: wallet.getName() });
            }
          }

          if (hasBalance.length > 0) {
            hasBalance.sort((a, b) => {
              return a.balance.cmp(b.balance);
            });
            version = hasBalance[hasBalance.length - 1].version;
          } else {
            version = DEFAULT_VERSION;
          }
          console.log('version detected', version);
        } catch (e) {
          throw new Error('Failed to get addresses balances');
        }
      } else {
        console.log('version passed', version);
      }
    }

    info.version = version;

    return new UnlockedVault(info, phrase);
  }

   // Returns true if the device has a passcode/biometric protection.
  // If it does not, app asks user to encrypt the wallet with a password.
  static async isDeviceProtected(): Promise<boolean> {
    return await EncryptedStorage.isDeviceProtected();
  }

  get keychainItemName(): string {
    return this.info.name;
  }

  get name(): string {
    return this.info.name;
  }

  // Returns true if the vault is currently locked.
  get locked(): boolean {
    return true;
  }

  // Instantiates a vault in a locked state from the non-secret metadata.
  static fromJSON(json: VaultJSON): Vault {
    const tonPubkey = Uint8Array.from(Buffer.from(json.tonPubkey, 'hex'));
    return new Vault({
      name: json.name,
      tonPubkey: tonPubkey,
      version: json.version || 'v3R2', // fallback for old versions
      workchain: json.workchain,
      configPubKey: json.configPubKey,
      allowedDestinations: json.allowedDestinations,
    });
  }

  setVersion(version: string) {
    this.info.version = version;
  }

  getVersion() {
    return this.info.version;
  }

  getWalletId() {
    if (this.info.version) {
      const wallet = this.tonWalletByVersion(this.info.version);
      return wallet?.options?.walletId ?? null;
    }

    return null;
  }

  isMasterChain() {
    return this.info.workchain === -1;
  }

  getLockupConfig() {
    return {
      wallet_type: this.info.version,
      workchain: this.info.workchain,
      config_pubkey: this.info.configPubKey,
      allowed_destinations: this.info.allowedDestinations,
    };
  }

  // Encodes non-secret metadata into a JSON object for storage on disk.
  toJSON(): VaultJSON {
    return {
      name: this.info.name,
      tonPubkey: Buffer.from(this.info.tonPubkey).toString('hex'),
      workchain: this.info.workchain,
      version: this.info.version,
      configPubKey: this.info.configPubKey,
      allowedDestinations: this.info.allowedDestinations,
    };
  }

  async clean() {
    const isNewFlow = await MainDB.isNewSecurityFlow();
    if (isNewFlow) {
      await SecureStore.deleteItemAsync(this.keychainItemName);
    } else {
      await EncryptedStorage.removeItem(this.keychainItemName);
    }
  }

  async cleanBiometry() {
    await SecureStore.deleteItemAsync('biometry_' + this.keychainItemName, {
      keychainService: this.keychainService,
    });
  }

  // Attemps to unlock the vault's secret data and returns the new vault state.
  async unlock(): Promise<UnlockedVault | EncryptedVault> {
    const isNewFlow = await MainDB.isNewSecurityFlow();

    let jsonstr: any;
    if (isNewFlow) {
      try {
        const storedKeychainService = await MainDB.getKeychainService();
        if (storedKeychainService) {
          this.keychainService = storedKeychainService;
        }

        jsonstr = await SecureStore.getItemAsync('biometry_' + this.keychainItemName, {
          keychainService: this.keychainService,
        });
      } catch {
        throw new Error(t('access_confirmation_update_biometry'));
      }
    } else {
      jsonstr = await EncryptedStorage.getItem(this.keychainItemName);
    }

    if (jsonstr == null) {
      debugLog(
        'EncryptedStorage.getItem is empty.',
        'Item name: ',
        this.keychainItemName,
      );
      throw new Error('Failed to unlock the vault');
    }

    const state: EncryptedSecret | DecryptedSecret = JSON.parse(jsonstr);
    if (state.kind === 'decrypted') {
      return new UnlockedVault(this.info, state.mnemonic);
    } else {
      return new EncryptedVault(this.info, state);
    }
  }

  async getEncrypted(): Promise<EncryptedVault> {
    const jsonstr = await SecureStore.getItemAsync(this.keychainItemName);
    if (jsonstr == null) {
      throw new Error('Failed to unlock the vault');
    }

    const state: EncryptedSecret = JSON.parse(jsonstr);
    return new EncryptedVault(this.info, state);
  }

  // TON public key
  get tonPublicKey(): Uint8Array {
    return this.info.tonPubkey;
  }

  // TON wallet instance.
  get tonWallet(): any {
    const tonweb = new TonWeb(
      new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
        apiKey: getServerConfig('tonEndpointAPIKey'),
      }),
    );

    if (this.info.version && this.info.version.substr(0, 6) === 'lockup') {
      return new tonweb.lockupWallet.all[this.info.version](tonweb.provider, {
        publicKey: this.tonPublicKey,
        wc: this.info.workchain ?? 0,
        config: {
          wallet_type: this.info.version,
          config_public_key: this.info.configPubKey,
          allowed_destinations: this.info.allowedDestinations,
        },
      });
    }

    return new tonweb.wallet.all[this.info.version ?? DEFAULT_VERSION](tonweb.provider, {
      publicKey: this.tonPublicKey,
      wc: 0,
    });
  }

  tonWalletByVersion(version: string) {
    const tonweb = new TonWeb(
      new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
        apiKey: getServerConfig('tonEndpointAPIKey'),
      }),
    );

    return new tonweb.wallet.all[version](tonweb.provider, {
      publicKey: this.tonPublicKey,
      wc: 0,
    });
  }

  // TON address corresponding to the public key
  // To convert into a human-readable form use
  // Address.toString(isUserFriendly,isUrlSafe,isBounceable,isTestOnly).
  async getRawTonAddress(): Promise<any> {
    return await this.tonWallet.getAddress();
  }

  // Returns an encoded address with userfriendly + urlsafe + bounceable + isTestOnly attributes.
  async getTonAddress(isTestnet: boolean = false): Promise<string> {
    return (await this.tonWallet.getAddress()).toString(true, true, true, !!isTestnet);
  }

  async getTonAddressByWalletVersion(
    tonweb: any,
    version: string,
    isTestnet: boolean = false,
  ) {
    const wallet = new tonweb.wallet.all[version](tonweb.provider, {
      publicKey: this.tonPublicKey,
      wc: 0,
    });
    const address = await wallet.getAddress();
    return address.toString(true, true, true, !!isTestnet);
  }
}

export class EncryptedVault extends Vault {
  private state: EncryptedSecret;

  // Private constructor.
  // Use `Vault.generate` to create a new vault and `Vault.fromJSON` to load one from disk.
  constructor(info: VaultInfo, state: EncryptedSecret) {
    super(info);
    this.state = state;
  }

  // Returns true if the vault is currently locked.
  get locked(): boolean {
    return false;
  }

  // Saves the secret data to the system keychain and returns locked vault instance w/o secret data.
  async lock(): Promise<Vault> {
    let jsonstr = JSON.stringify(this.state);
    await SecureStore.setItemAsync(this.keychainItemName, jsonstr);

    return new Vault(this.info);
  }
  // Returns true if the vault is unlocked, but encrypted.
  get needsDecrypt(): boolean {
    return true;
  }

  // Attempts to decrypt the vault and returns `true` if succeeded.
  async decrypt(password: string): Promise<UnlockedVault> {
    if (this.state.kind === 'encrypted-scrypt-tweetnacl') {
      const salt = Buffer.from(this.state.salt, 'hex');
      const { N, r, p } = this.state;
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
      const ct = Buffer.from(this.state.ct, 'hex');
      const pt: Uint8Array = nacl.secretbox.open(
        ct,
        Uint8Array.from(nonce),
        Uint8Array.from(enckey),
      );
      const phrase = Utf8ArrayToString(pt);
      return new UnlockedVault(this.info, phrase);
    } else {
      throw new Error('Unsupported encryption format ' + this.state.kind);
    }
  }
}

export class UnlockedVault extends Vault {
  // Mnemonic phrase string that represents the root for all the keys.
  public mnemonic: string;

  // Private constructor.
  // Use `Vault.generate` to create a new vault and `Vault.fromJSON` to load one from disk.
  constructor(info: VaultInfo, mnemonic: string) {
    super(info);
    this.mnemonic = mnemonic;
  }

  // Returns true if the vault is currently locked.
  get locked(): boolean {
    return false;
  }

  async updateKeychainService() {
    this.keychainService = `TKProtected${Math.random()}`;
    await MainDB.setKeychainService(this.keychainService);
  }

  // Saves the secret data to the system keychain and returns locked vault instance w/o secret data.
  async lock(): Promise<Vault> {
    await this.saveBiometry();
    return new Vault(this.info);
  }

  async saveBiometry() {
    let jsonstr = JSON.stringify({
      kind: 'decrypted',
      mnemonic: this.mnemonic,
    });
    await this.updateKeychainService();
    await SecureStore.setItemAsync('biometry_' + this.keychainItemName, jsonstr, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      keychainService: this.keychainService,
      requireAuthentication: true,
    });
  }

  // Returns true if the vault is unlocked, but encrypted.
  get needsDecrypt(): boolean {
    return false;
  }

  // Encrypts the vault
  async encrypt(password: string): Promise<EncryptedVault> {
    // default parameters
    const N = 16384; // 16K*128*8 = 16 Mb of memory
    const r = 8;
    const p = 1;

    const salt = Buffer.from(await generateSecureRandom(32));
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
    const ct: Uint8Array = nacl.secretbox(
      Uint8Array.from(Buffer.from(this.mnemonic, 'utf8')),
      Uint8Array.from(nonce),
      Uint8Array.from(enckey),
    );

    return new EncryptedVault(this.info, {
      kind: 'encrypted-scrypt-tweetnacl',
      N: N, // scrypt "cost" parameter
      r: r, // scrypt "block size" parameter
      p: p, // scrypt "parallelization" parameter
      salt: salt.toString('hex'), // hex-encoded nonce/salt
      ct: Buffer.from(ct).toString('hex'), // hex-encoded ciphertext
    });
  }

  // Ton private key. Throws an error if the vault is not unlocked.
  // Check if the vault is locked via `.locked` and unlock via `.unlock()`
  async getTonPrivateKey(): Promise<Uint8Array> {
    const keyPair = await Ton.mnemonic.mnemonicToKeyPair(this.mnemonic.split(' '));
    return keyPair.secretKey;
  }

  public setConfig(config: any) {
    this.info.version = config.wallet_type;
    this.info.workchain = config.workchain;
    this.info.configPubKey = config.config_pubkey;
    this.info.allowedDestinations = config.allowed_destinations;
  }
}

// encrypted vault is used when the user sets an in-app password
// for additional security, e.g. when the device passcode is not set.
export type EncryptedSecret = {
  kind: 'encrypted-scrypt-tweetnacl';
  N: number; // scrypt "cost" parameter
  r: number; // scrypt "block size" parameter
  p: number; // scrypt "parallelization" parameter
  salt: string; // hex-encoded nonce/salt
  ct: string; // hex-encoded ciphertext
};

// unencrypted vault is stored within a secure keystore
// under protection of the device passcode/touchid/faceid.
export type DecryptedSecret = {
  kind: 'decrypted';
  mnemonic: string; // 12-word space-separated phrase per BIP39
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
