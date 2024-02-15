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
import { DEFAULT_WALLET_STYLE_CONFIG } from './constants';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import * as LocalAuthentication from 'expo-local-authentication';
import { detectBiometryType } from '$utils';

type TonkeeperOptions = {
  storage: Storage;
  vault: Vault;
};

export interface MultiWalletMigrationData {
  pubkey: string;
  keychainItemName: string;
  biometry: {
    enabled: boolean;
    type: LocalAuthentication.AuthenticationType | null;
  };
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

  private vault: Vault;

  private storage: Storage;

  public walletsStore = new State<WalletsStoreState>({
    wallets: [],
    selectedIdentifier: '',
    biometryEnabled: false,
    isMigrated: false,
  });

  constructor(options: TonkeeperOptions) {
    this.storage = options.storage;
    this.vault = options.vault;
    this.tonapi = {
      mainnet: createTonApiInstance(),
      testnet: createTonApiInstance(true),
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

  public async init() {
    try {
      await Promise.all([this.walletsStore.rehydrate(), this.tonPrice.rehydrate()]);

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
      let biometry: MultiWalletMigrationData['biometry'] = { enabled: false, type: null };

      try {
        biometry.enabled = (await this.storage.getItem('biometry_enabled')) === 'yes';
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        biometry.type = detectBiometryType(types);
      } catch {}

      if (!data) {
        return null;
      }

      const json = JSON.parse(data);

      return {
        pubkey: json.vault.tonPubkey,
        keychainItemName: json.vault.name,
        biometry,
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

  public async enableBiometry(passcode: string) {
    await this.vault.setupBiometry(passcode);

    this.walletsStore.set({ biometryEnabled: true });
  }

  public async disableBiometry() {
    await this.vault.removeBiometry();

    this.walletsStore.set({ biometryEnabled: false });
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

  public async importWallet(
    mnemonic: string,
    passcode: string,
    versions: WalletContractVersion[],
    walletConfig: Pick<
      WalletConfig,
      'network' | 'workchain' | 'configPubKey' | 'allowedDestinations'
    >,
  ): Promise<string[]> {
    console.log('importWallet');
    const newWallets: WalletConfig[] = [];

    let keyPair: nacl.SignKeyPair;
    for (const version of versions) {
      const identifier = uuidv4();

      console.log('vault.import start');
      keyPair = await this.vault.import(identifier, mnemonic, passcode);
      console.log('vault.import end');

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
    console.log('wallets added to walletsStore');
    const walletsInstances = await Promise.all(
      sortedWallets.map((wallet) => this.createWalletInstance(wallet)),
    );
    walletsInstances.map((instance) => instance.tonProof.obtainProof(keyPair));
    console.log('obtainProof done');

    this.setWallet(walletsInstances[0]);

    console.log('setWallet done');

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

    if (!wallets.some((wallet) => wallet.version === WalletContractVersion.v4R2)) {
      wallets.push({
        version: WalletContractVersion.v4R2,
        address: addresses.v4R2.raw,
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

  public async addWatchOnlyWallet(address: string) {
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
      name: this.getNewWalletName(),
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
    console.log('createWalletInstance start');
    const addresses = await Address.fromPubkey(
      walletConfig.pubkey,
      walletConfig.network === WalletNetwork.testnet,
      walletConfig.version === WalletContractVersion.LockupV1 ? walletConfig : undefined,
    );

    console.log('got addresses');

    const wallet = new Wallet(walletConfig, addresses!, this.storage, this.tonPrice);

    console.log('wallet instance created');

    await wallet.rehydrate();

    console.log('rehydrate done');
    wallet.preload();
    console.log('preload started');

    this.wallets.set(wallet.identifier, wallet);

    console.log('createWalletInstance end');

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
    await Promise.all(
      identifiers.map(async (identifier) => {
        const wallet = this.wallets.get(identifier);
        if (wallet) {
          await wallet.notifications.subscribe();
        }
      }),
    );
  }

  // TODO: should parse given address for isTestnet flag
  public getWalletByAddress(address: string) {
    return Array.from(this.wallets.values()).find(
      (wallet) => !wallet.isTestnet && Address.compare(wallet.address.ton.raw, address),
    );
  }

  public setMigrated() {
    console.log('migrated');
    this.walletsStore.set({ isMigrated: true });
  }
}
