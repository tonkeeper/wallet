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
import { Toast } from '@tonkeeper/uikit';

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
  lockScreenEnabled: boolean;
}

export interface MigrationState {
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
    lockScreenEnabled: false,
  });

  public migrationStore = new State<MigrationState>({
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
      version: 1,
      onUpdate: (_, prevData) => ({
        ...prevData,
        wallets: prevData?.wallets.filter((wallet) => wallet.version) ?? [],
      }),
    });

    this.migrationStore.persist({
      storage: this.storage,
      key: 'migrationStore',
    });
  }

  public get wallet(): Wallet {
    const wallet = this.wallets.get(this.walletsStore.data.selectedIdentifier)!;

    if (!wallet && this.walletsStore.data.wallets.length) {
      return this.wallets.get(this.walletsStore.data.wallets[0].identifier)!;
    }

    return wallet;
  }

  public get walletForUnlock() {
    if (this.wallet && !this.wallet.isWatchOnly && !this.wallet.isExternal) {
      return this.wallet;
    }

    return Array.from(this.wallets.values()).find(
      (wallet) => !wallet.isWatchOnly && !wallet.isExternal,
    )!;
  }

  public get biometryEnabled() {
    return this.walletsStore.data.biometryEnabled;
  }

  public get lockScreenEnabled() {
    return this.walletsStore.data.lockScreenEnabled;
  }

  public async init() {
    try {
      await Promise.all([
        this.walletsStore.rehydrate(),
        this.tonPrice.rehydrate(),
        this.migrationStore.rehydrate(),
        this.biometry.detectTypes(),
      ]);

      // @ts-ignore moved to migrationStore, may be set on some clients. So we need to migrate it
      if (this.walletsStore.data.isMigrated) {
        this.setMigrated();
      }

      this.tonPrice.load();

      if (!this.migrationStore.data.isMigrated) {
        this.migrationData = await this.getMigrationData();
      }

      await Promise.all(
        this.walletsStore.data.wallets.map((walletConfig) =>
          // It's safer to throw one instance instead of all in case of error
          this.createWalletInstance(walletConfig).catch((e) => Toast.fail(e.message)),
        ),
      );

      if (!this.wallet && this.walletsStore.data.wallets.length) {
        return await this.switchWallet(this.walletsStore.data.wallets[0].identifier);
      }

      this.emitChangeWallet();
    } catch (err) {
      console.log('TK:init', err);
      Toast.fail(err.message);
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

  private getLedgerWalletNames(name: string, walletsInfo: any[]) {
    const regex = new RegExp(`${name} (\\d+)`);
    let lastNumber = [...this.wallets.values()].reduce((maxNumber, wallet) => {
      const match = wallet.config.name.match(regex);
      return match ? Math.max(maxNumber, Number(match[1])) : maxNumber;
    }, 0);

    if (
      lastNumber === 0 &&
      [...this.wallets.values()].map((wallet) => wallet.config.name).includes(name)
    ) {
      lastNumber = 1;
    }

    if (walletsInfo.length === 1 && lastNumber === 0) {
      return [`${name}`];
    }

    return walletsInfo.map((_, index) => `${name} ${lastNumber + index + 1}`);
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

    await this.walletsStore.setAsync(({ wallets }) => ({
      wallets: [...wallets, ...sortedWallets],
    }));
    const walletsInstances = await Promise.all(
      sortedWallets.map((wallet) => this.createWalletInstance(wallet)),
    );
    walletsInstances.map((instance) =>
      instance.tonProof.obtainProof(keyPair).then(() => instance.battery.load()),
    );

    await this.setWallet(walletsInstances[0]);

    return walletsInstances.map((item) => item.identifier);
  }

  public async getLedgerWalletsInfo(
    accounts: { index: number; pubkey: string; address: string }[],
    deviceId: string,
  ) {
    const version = WalletContractVersion.v4R2;

    const addedDeviceAccountIndexes = this.walletsStore.data.wallets
      .filter((wallet) => deviceId === wallet.ledger?.deviceId)
      .map((wallet) => wallet.ledger!.accountIndex);

    const accountsBalances = await Promise.all(
      accounts.map((account) => this.tonapi.mainnet.accounts.getAccount(account.address)),
    );

    const accountsJettons = await Promise.all(
      accounts.map((account) =>
        this.tonapi.mainnet.accounts.getAccountJettonsBalances({
          accountId: account.address,
        }),
      ),
    );

    return accounts.map(
      (account, index): ImportWalletInfo => ({
        pubkey: account.pubkey,
        version,
        address: account.address,
        balance: accountsBalances[index].balance,
        tokens: accountsJettons[index].balances.length > 0,
        accountIndex: account.index,
        isAdded: addedDeviceAccountIndexes.includes(account.index),
      }),
    );
  }

  public async getWalletsInfo(pubkey: string, isTestnet: boolean) {
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

    const wallets = accounts
      .map(
        (account, index): ImportWalletInfo => ({
          pubkey,
          version: versionByAddress[account.address],
          address: account.address,
          balance: account.balance,
          tokens: accountsJettons[index].balances.length > 0,
        }),
      )
      .filter((item) => !!item.version);

    if (!wallets.some((wallet) => wallet.version === DEFAULT_WALLET_VERSION)) {
      wallets.push({
        pubkey,
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

  public async getWalletsInfoByMnemonic(mnemonic: string, isTestnet: boolean) {
    const keyPair = await Mnemonic.mnemonicToKeyPair(mnemonic.split(' '));

    const pubkey = Buffer.from(keyPair.publicKey).toString('hex');

    return await this.getWalletsInfo(pubkey, isTestnet);
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

    if (!version) {
      throw new Error('Unknown contract');
    }

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

    await this.walletsStore.setAsync(({ wallets }) => ({
      wallets: [...wallets, config],
    }));
    const wallet = await this.createWalletInstance(config);
    await this.setWallet(wallet);

    return [wallet.identifier];
  }

  public async addLedgerWallets(
    walletsInfo: ImportWalletInfo[],
    deviceId: string,
    deviceModel: string,
  ) {
    const walletNames = this.getLedgerWalletNames(deviceModel, walletsInfo);

    const ledgerWallets: WalletConfig[] = walletsInfo.map((walletInfo, index) => {
      const workchain = Number(walletInfo.address.split(':')[0]);

      const identifier = uuidv4();

      return {
        ...DEFAULT_WALLET_STYLE_CONFIG,
        name: walletNames[index],
        identifier,
        network: WalletNetwork.mainnet,
        type: WalletType.Ledger,
        pubkey: walletInfo.pubkey,
        workchain,
        version: walletInfo.version,
        ledger: {
          deviceId,
          deviceModel,
          accountIndex: walletInfo.accountIndex!,
        },
      };
    });

    await this.walletsStore.setAsync(({ wallets }) => ({
      wallets: [...wallets, ...ledgerWallets],
    }));
    const walletsInstances = await Promise.all(
      ledgerWallets.map((wallet) => this.createWalletInstance(wallet)),
    );

    await this.setWallet(walletsInstances[0]);

    return walletsInstances.map((item) => item.identifier);
  }

  public async addSignerWallet(
    pubkey: string,
    name?: string,
    versions: WalletContractVersion[] = [DEFAULT_WALLET_VERSION],
    isSignerDeeplink = false,
  ) {
    const addresses = await Address.fromPubkey(pubkey, false);

    if (!addresses) {
      throw new Error("Can't parse pubkey");
    }

    const newWallets: WalletConfig[] = [];

    for (const version of versions) {
      const rawAddress = addresses[version].raw;

      const workchain = Number(rawAddress.split(':')[0]);

      const identifier = uuidv4();

      const walletName = name ?? this.getNewWalletName();

      newWallets.push({
        ...DEFAULT_WALLET_STYLE_CONFIG,
        name: versions.length > 1 ? `${walletName} ${version}` : walletName,
        identifier,
        network: WalletNetwork.mainnet,
        type: isSignerDeeplink ? WalletType.SignerDeeplink : WalletType.Signer,
        pubkey,
        workchain,
        version,
      });
    }

    const versionsOrder = Object.values(WalletContractVersion);

    const sortedWallets = newWallets.sort((a, b) => {
      const indexA = versionsOrder.indexOf(a.version);
      const indexB = versionsOrder.indexOf(b.version);
      return indexA - indexB;
    });

    await this.walletsStore.setAsync(({ wallets }) => ({
      wallets: [...wallets, ...sortedWallets],
    }));
    const walletsInstances = await Promise.all(
      sortedWallets.map((wallet) => this.createWalletInstance(wallet)),
    );

    await this.setWallet(walletsInstances[0]);

    return walletsInstances.map((item) => item.identifier);
  }

  public async removeWallet(identifier: string) {
    try {
      const nextWallet =
        this.wallets.get(
          Array.from(this.wallets.keys()).find((item) => item !== identifier) ?? '',
        ) ?? null;

      await this.walletsStore.setAsync(({ wallets }) => ({
        wallets: wallets.filter((w) => w.identifier !== identifier),
        selectedIdentifier: nextWallet?.identifier ?? '',
      }));
      const wallet = this.wallets.get(identifier);
      wallet?.notifications.unsubscribe().catch(null);
      wallet?.destroy();
      this.wallets.delete(identifier);

      if (this.wallets.size === 0) {
        await this.walletsStore.setAsync({ biometryEnabled: false });
        this.vault.destroy();
      }

      this.emitChangeWallet();
    } catch (e) {
      console.log('removeWallet error', e);
    }
  }

  public async removeAllWallets() {
    await this.walletsStore.setAsync({
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
      addresses,
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
            const multipleName = this.wallet.isLedger
              ? `${config.name} ${wallet.name.match(/\d+$/)?.[0]}`
              : `${config.name} ${wallet.version}`;

            return {
              ...wallet,
              ...config,
              name: identifiers.length > 1 ? multipleName : config.name ?? wallet.name,
            };
          }
          return wallet;
        },
      );

      await this.walletsStore.setAsync({ wallets: updatedWallets });

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

  public async switchWallet(identifier: string) {
    const wallet = this.wallets.get(identifier);
    await this.setWallet(wallet!);
  }

  private async setWallet(wallet: Wallet | null) {
    await this.walletsStore.setAsync({ selectedIdentifier: wallet?.identifier ?? '' });
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
    this.migrationStore.set({ isMigrated: true });
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

    await this.walletsStore.setAsync({ biometryEnabled: true });
  }

  public async disableBiometry() {
    try {
      await this.vault.removeBiometry();
    } catch {}

    await this.walletsStore.setAsync({ biometryEnabled: false });
  }

  public async enableLock() {
    await this.walletsStore.setAsync({ lockScreenEnabled: true });
  }

  public async disableLock() {
    await this.walletsStore.setAsync({ lockScreenEnabled: false });
  }
}
