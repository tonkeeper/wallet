import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { Wallet } from '$wallet/Wallet';
import { Address } from '@tonkeeper/core/src/formatters/Address';
import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { TonPriceManager } from './managers/TonPriceManager';
import { State } from '@tonkeeper/core/src/utils/State';
import {
  ImportWalletInfo,
  WalletConfig,
  WalletContractVersion,
  WalletNetwork,
  WalletStyleConfig,
  WalletType,
} from './WalletTypes';
import { createTonApiInstance } from './utils';
import { Vault } from '@tonkeeper/core';
import { v4 as uuidv4 } from 'uuid';
import { Mnemonic } from '@tonkeeper/core/src/utils/mnemonic';
import { DEFAULT_WALLET_STYLE_CONFIG, DEFAULT_WALLET_VERSION } from './constants';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import { AccountsStream } from './streaming';
import { InteractionManager } from 'react-native';
import { Biometry } from './Biometry';

type TonkeeperOptions = {
  storage: Storage;
  vault: Vault;
};

export interface MultiWalletMigrationData {
  pubkey: string;
  keychainItemName: string;
  biometryEnabled: boolean;
  lockupConfig?: {
    wallet_type: WalletContractVersion.LockupV1;
    workchain: number;
    config_pubkey: string;
    allowed_destinations: string[];
  };
}

export interface WalletsStoreState {
  wallets: WalletConfig[];
  selectedIdentifier: string;
  biometryEnabled: boolean;
  lockEnabled: boolean;
  isMigrated: boolean;
}

export class Tonkeeper {
  public wallets: Map<string, Wallet> = new Map();
  public tonPrice: TonPriceManager;

  public migrationData: MultiWalletMigrationData | null = null;

  public walletSubscribers = new Set<(wallet: Wallet) => void>();

  private tonapi: {
    mainnet: TonAPI;
    testnet: TonAPI;
  };

  private accountsStream: {
    mainnet: AccountsStream;
    testnet: AccountsStream;
  };

  private vault: Vault;

  private storage: Storage;

  public biometry: Biometry;

  public walletsStore = new State<WalletsStoreState>({
    wallets: [],
    selectedIdentifier: '',
    biometryEnabled: false,
    lockEnabled: true,
    isMigrated: false,
  });

  constructor(options: TonkeeperOptions) {
    this.storage = options.storage;
    this.vault = options.vault;
    this.biometry = new Biometry();
    this.tonapi = {
      mainnet: createTonApiInstance(),
      testnet: createTonApiInstance(true),
    };
    this.accountsStream = {
      mainnet: new AccountsStream(false),
      testnet: new AccountsStream(true),
    };

    this.tonPrice = new TonPriceManager(this.tonapi.mainnet, this.storage);

    this.walletsStore.persist({
      storage: this.storage,
      key: 'walletsStore',
    });
  }

  public get wallet() {
    return this.wallets.get(this.walletsStore.data.selectedIdentifier)!;
  }

  public get walletForUnlock() {
    return Array.from(this.wallets.values()).find((wallet) => !wallet.isWatchOnly)!;
  }

  public get biometryEnabled() {
    return this.walletsStore.data.biometryEnabled;
  }

  public get lockEnabled() {
    return this.walletsStore.data.lockEnabled;
  }

  public async init() {
    try {
      await Promise.all([
        this.walletsStore.rehydrate(),
        this.tonPrice.rehydrate(),
        this.biometry.detectTypes(),
      ]);

      this.tonPrice.load();

      if (!this.walletsStore.data.isMigrated) {
        this.migrationData = await this.getMigrationData();
      }

      await Promise.all(
        this.walletsStore.data.wallets.map((walletConfig) =>
          this.createWalletInstance(walletConfig),
        ),
      );

      this.emitChangeWallet();
    } catch (err) {
      console.log('TK:init', err);
    }
  }

  private async getMigrationData(): Promise<MultiWalletMigrationData | null> {
    const keychainName = 'mainnet_default';

    try {
      const data = await this.storage.getItem(`${keychainName}_wallet`);

      if (!data) {
        return null;
      }

      let biometryEnabled = false;
      try {
        biometryEnabled = (await this.storage.getItem('biometry_enabled')) === 'yes';
      } catch {}

      const json = JSON.parse(data);

      return {
        pubkey: json.vault.tonPubkey,
        keychainItemName: json.vault.name,
        biometryEnabled,
        lockupConfig:
          json.vault.version === WalletContractVersion.LockupV1
            ? {
                wallet_type: WalletContractVersion.LockupV1,
                workchain: json.vault.workchain ?? 0,
                config_pubkey: json.vault.configPubKey,
                allowed_destinations: json.vault.allowedDestinations,
              }
            : undefined,
      };
    } catch {
      return null;
    }
  }

  private getNewWalletName() {
    const regex = new RegExp(`${DEFAULT_WALLET_STYLE_CONFIG.name} (\\d+)`);
    const lastNumber = [...this.wallets.values()].reduce((maxNumber, wallet) => {
      const match = wallet.config.name.match(regex);
      return match ? Math.max(maxNumber, Number(match[1])) : maxNumber;
    }, 1);

    return this.wallets.size > 0
      ? `${DEFAULT_WALLET_STYLE_CONFIG.name} ${lastNumber + 1}`
      : DEFAULT_WALLET_STYLE_CONFIG.name;
  }

  public async createWallet(passcode: string) {
    const mnemonic = (await Mnemonic.generateMnemonic(24)).join(' ');
    return await this.importWallet(mnemonic, passcode, [DEFAULT_WALLET_VERSION], {
      workchain: 0,
      network: WalletNetwork.mainnet,
    });
  }

  public async importWallet(
    mnemonic: string,
    passcode: string,
    versions: WalletContractVersion[],
    walletConfig: Pick<
      WalletConfig,
      'network' | 'workchain' | 'configPubKey' | 'allowedDestinations'
    >,
  ): Promise<string[]> {
    const newWallets: WalletConfig[] = [];

    let keyPair: nacl.SignKeyPair;
    for (const version of versions) {
      const identifier = uuidv4();

      keyPair = await this.vault.import(identifier, mnemonic, passcode);

      newWallets.push({
        ...DEFAULT_WALLET_STYLE_CONFIG,
        ...walletConfig,
        name:
          versions.length > 1
            ? `${this.getNewWalletName()} ${version}`
            : this.getNewWalletName(),
        version,
        type: WalletType.Regular,
        pubkey: Buffer.from(keyPair.publicKey).toString('hex'),
        identifier,
      });
    }
    const versionsOrder = Object.values(WalletContractVersion);

    const sortedWallets = newWallets.sort((a, b) => {
      const indexA = versionsOrder.indexOf(a.version);
      const indexB = versionsOrder.indexOf(b.version);
      return indexA - indexB;
    });

    this.walletsStore.set(({ wallets }) => ({ wallets: [...wallets, ...sortedWallets] }));
    const walletsInstances = await Promise.all(
      sortedWallets.map((wallet) => this.createWalletInstance(wallet)),
    );
    walletsInstances.map((instance) => instance.tonProof.obtainProof(keyPair));

    this.setWallet(walletsInstances[0]);

    return walletsInstances.map((item) => item.identifier);
  }

  public async getWalletsInfo(mnemonic: string, isTestnet: boolean) {
    const keyPair = await Mnemonic.mnemonicToKeyPair(mnemonic.split(' '));

    const pubkey = Buffer.from(keyPair.publicKey).toString('hex');

    const tonapi = isTestnet ? this.tonapi.testnet : this.tonapi.mainnet;

    const [{ accounts }, addresses] = await Promise.all([
      tonapi.pubkeys.getWalletsByPublicKey(pubkey),
      Address.fromPubkey(pubkey, isTestnet),
    ]);

    if (!addresses) {
      throw new Error("Can't parse pubkey");
    }

    const accountsJettons = await Promise.all(
      accounts.map((account) =>
        tonapi.accounts.getAccountJettonsBalances({ accountId: account.address }),
      ),
    );

    const versionByAddress = Object.keys(addresses).reduce(
      (acc, version) => ({ ...acc, [addresses[version].raw]: version }),
      {},
    );

    const wallets = accounts.map(
      (account, index): ImportWalletInfo => ({
        version: versionByAddress[account.address],
        address: account.address,
        balance: account.balance,
        tokens: accountsJettons[index].balances.length > 0,
      }),
    );

    if (!wallets.some((wallet) => wallet.version === DEFAULT_WALLET_VERSION)) {
      wallets.push({
        version: DEFAULT_WALLET_VERSION,
        address: addresses[DEFAULT_WALLET_VERSION].raw,
        balance: 0,
        tokens: false,
      });
    }

    const versions = Object.values(WalletContractVersion);

    return wallets.sort((a, b) => {
      const indexA = versions.indexOf(a.version);
      const indexB = versions.indexOf(b.version);
      return indexA - indexB;
    });
  }

  public async addWatchOnlyWallet(address: string, name?: string) {
    const rawAddress = Address.parse(address).toRaw();
    const { public_key: pubkey } = await this.tonapi.mainnet.accounts.getAccountPublicKey(
      rawAddress,
    );

    const addresses = await Address.fromPubkey(pubkey, false);

    if (!addresses) {
      throw new Error("Can't parse pubkey");
    }

    const versionByAddress = Object.keys(addresses).reduce(
      (acc, version) => ({ ...acc, [addresses[version].raw]: version }),
      {},
    );

    const workchain = Number(rawAddress.split(':')[0]);

    const version = versionByAddress[rawAddress] as WalletContractVersion;

    const config: WalletConfig = {
      ...DEFAULT_WALLET_STYLE_CONFIG,
      name: name ?? this.getNewWalletName(),
      identifier: uuidv4(),
      network: WalletNetwork.mainnet,
      type: WalletType.WatchOnly,
      pubkey,
      workchain,
      version,
    };

    this.walletsStore.set(({ wallets }) => ({ wallets: [...wallets, config] }));
    const wallet = await this.createWalletInstance(config);
    this.setWallet(wallet);

    return [wallet.identifier];
  }

  public async removeWallet(identifier: string) {
    try {
      const nextWallet =
        this.wallets.get(
          Array.from(this.wallets.keys()).find((item) => item !== identifier) ?? '',
        ) ?? null;

      this.walletsStore.set(({ wallets }) => ({
        wallets: wallets.filter((w) => w.identifier !== identifier),
        selectedIdentifier: nextWallet?.identifier ?? '',
      }));
      const wallet = this.wallets.get(identifier);
      wallet?.notifications.unsubscribe().catch(null);
      wallet?.destroy();
      this.wallets.delete(identifier);

      if (this.wallets.size === 0) {
        this.walletsStore.set({ biometryEnabled: false });
        this.vault.destroy();
      }

      this.emitChangeWallet();
    } catch (e) {
      console.log('removeWallet error', e);
    }
  }

  public async removeAllWallets() {
    this.walletsStore.set({
      wallets: [],
      selectedIdentifier: '',
      biometryEnabled: false,
    });
    this.wallets.forEach((wallet) => {
      wallet.notifications.unsubscribe().catch(null);
      wallet.destroy();
    });
    this.wallets.clear();
    this.vault.destroy();
    this.emitChangeWallet();
  }

  private async createWalletInstance(walletConfig: WalletConfig) {
    const addresses = await Address.fromPubkey(
      walletConfig.pubkey,
      walletConfig.network === WalletNetwork.testnet,
      walletConfig.version === WalletContractVersion.LockupV1 ? walletConfig : undefined,
    );

    const accountStream =
      walletConfig.network === WalletNetwork.testnet
        ? this.accountsStream.testnet
        : this.accountsStream.mainnet;

    const wallet = new Wallet(
      walletConfig,
      addresses!,
      this.storage,
      this.tonPrice,
      accountStream,
    );

    await wallet.rehydrate();

    InteractionManager.runAfterInteractions(() => {
      wallet.preload();
    });

    this.wallets.set(wallet.identifier, wallet);

    return wallet;
  }

  public async updateWallet(
    config: Partial<WalletStyleConfig>,
    passedIdentifiers?: string[],
  ) {
    try {
      if (!this.wallet) {
        return;
      }

      const identifiers = passedIdentifiers ?? [this.wallet.identifier];

      const updatedWallets = this.walletsStore.data.wallets.map(
        (wallet): WalletConfig => {
          if (identifiers.includes(wallet.identifier)) {
            return {
              ...wallet,
              ...config,
              name:
                identifiers.length > 1
                  ? `${config.name} ${wallet.version}`
                  : config.name ?? wallet.name,
            };
          }
          return wallet;
        },
      );

      this.walletsStore.set({ wallets: updatedWallets });

      identifiers.forEach((identifier) => {
        const currentConfig = updatedWallets.find(
          (item) => item.identifier === identifier,
        );
        const wallet = this.wallets.get(identifier);
        if (wallet && currentConfig) {
          wallet.setConfig(currentConfig);
        }
      });

      this.emitChangeWallet();
    } catch {}
  }

  public onChangeWallet(subscriber: (wallet: Wallet) => void) {
    this.walletSubscribers.add(subscriber);
    return () => {
      this.walletSubscribers.delete(subscriber);
    };
  }

  private emitChangeWallet() {
    this.walletSubscribers.forEach((subscriber) => subscriber(this.wallet));
  }

  public switchWallet(identifier: string) {
    const wallet = this.wallets.get(identifier);
    this.setWallet(wallet!);
  }

  private setWallet(wallet: Wallet | null) {
    this.walletsStore.set({ selectedIdentifier: wallet?.identifier ?? '' });
    this.emitChangeWallet();
  }

  public async enableNotificationsForAll(identifiers: string[]) {
    for (const identifier of identifiers) {
      const wallet = this.wallets.get(identifier)!;
      await wallet.notifications.subscribe();
    }
  }

  public getWalletByAddress(address: string) {
    const isTestnet = Address.isTestnet(address);
    return Array.from(this.wallets.values()).find(
      (wallet) =>
        wallet.isTestnet === isTestnet &&
        Address.compare(wallet.address.ton.raw, address),
    );
  }

  public setMigrated() {
    console.log('migrated');
    this.walletsStore.set({ isMigrated: true });
  }

  public saveLastBackupTimestampAll(identifiers: string[], dismissSetup = false) {
    identifiers.forEach((identifier) => {
      const wallet = this.wallets.get(identifier);
      wallet?.saveLastBackupTimestamp();
      if (dismissSetup) {
        wallet?.dismissSetup();
      }
    });
  }

  public async enableBiometry(passcode: string) {
    await this.vault.setupBiometry(passcode);

    this.walletsStore.set({ biometryEnabled: true });
  }

  public async disableBiometry() {
    try {
      await this.vault.removeBiometry();
    } catch {}

    this.walletsStore.set({ biometryEnabled: false });
  }

  public async enableLock() {
    this.walletsStore.set({ lockEnabled: true });
  }

  public async disableLock() {
    this.walletsStore.set({ lockEnabled: false });
  }
}
