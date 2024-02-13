import { Buffer } from 'buffer';
import { Ton } from '$libs/Ton';
import { wordlist } from '$libs/Ton/mnemonic/wordlist';
import { config } from '$config';

const TonWeb = require('tonweb');

const DEFAULT_VERSION = 'v4R2';

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
    return await Vault.restore(name, phrase, [DEFAULT_VERSION]);
  }

  // Restores the wallet from the mnemonic phrase.
  static async restore(
    name: string,
    phrase: string,
    versions: string[],
    lockupConfig?: any,
  ): Promise<UnlockedVault> {
    //if (!bip39.validateMnemonic(phrase, bip39.DEFAULT_WORDLIST)) {
    // TON uses custom mnemonic format with BIP39 words, but bruteforced so that first byte indicates
    // whether the mnemonic uses password protection or not. To stay compatible, we use TON's checker.
    if (!(await Ton.mnemonic.validateMnemonic(phrase.split(' '), '', wordlist.enMap))) {
      throw new Error('Mnemonic phrase is incorrect');
    }

    const tonKeyPair = await Ton.mnemonic.mnemonicToKeyPair(phrase.split(' '));
    const tonPubkey = tonKeyPair.publicKey;

    const info: VaultInfo = {
      name: name,
      tonPubkey,
      workchain: 0,
    };

    if (lockupConfig) {
      versions = [lockupConfig.wallet_type];
      info.workchain = lockupConfig.workchain;
      info.configPubKey = lockupConfig.config_pubkey;
      info.allowedDestinations = lockupConfig.allowed_destinations;
      console.log('lockup wallet detected');
    }

    info.version = versions[0];

    return new UnlockedVault(info, phrase, versions);
  }

  get name(): string {
    return this.info.name;
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

  public get workchain() {
    return this.info.workchain ?? 0;
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

  // TON public key
  get tonPublicKey(): Uint8Array {
    return this.info.tonPubkey;
  }

  // TON wallet instance.
  get tonWallet(): any {
    const tonweb = new TonWeb(
      new TonWeb.HttpProvider(config.get('tonEndpoint'), {
        apiKey: config.get('tonEndpointAPIKey'),
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
      new TonWeb.HttpProvider(config.get('tonEndpoint'), {
        apiKey: config.get('tonEndpointAPIKey'),
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

export class UnlockedVault extends Vault {
  // Mnemonic phrase string that represents the root for all the keys.
  public mnemonic: string;
  public versions?: string[];

  // Private constructor.
  // Use `Vault.generate` to create a new vault and `Vault.fromJSON` to load one from disk.
  constructor(info: VaultInfo, mnemonic: string, versions?: string[]) {
    super(info);
    this.mnemonic = mnemonic;
    this.versions = versions;
  }

  public setConfig(lockupConfig: any) {
    this.info.version = lockupConfig.wallet_type;
    this.info.workchain = lockupConfig.workchain;
    this.info.configPubKey = lockupConfig.config_pubkey;
    this.info.allowedDestinations = lockupConfig.allowed_destinations;
  }

  // Ton private key. Throws an error if the vault is not unlocked.
  // Check if the vault is locked via `.locked` and unlock via `.unlock()`
  async getTonPrivateKey(): Promise<Uint8Array> {
    const keyPair = await Ton.mnemonic.mnemonicToKeyPair(this.mnemonic.split(' '));
    return keyPair.secretKey;
  }

  async getKeyPair(): Promise<nacl.SignKeyPair> {
    return await Ton.mnemonic.mnemonicToKeyPair(this.mnemonic.split(' '));
  }
}
