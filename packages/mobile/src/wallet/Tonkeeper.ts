import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { Wallet } from '$wallet/Wallet';
import { Address, AddressFormats } from '@tonkeeper/core/src/formatters/Address';
import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { TonPriceManager } from './managers/TonPriceManager';
import { State } from '@tonkeeper/core/src/utils/State';
import {
  ImportWalletInfo,
  WalletConfig,
  WalletContractVersion,
  WalletNetwork,
  WalletType,
} from './WalletTypes';
import { createTonApiInstance } from './utils';
import { Vault } from '@tonkeeper/core';
import BigNumber from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';
import { WalletColor } from '@tonkeeper/uikit';
import { Mnemonic } from '@tonkeeper/core/src/utils/mnemonic';

class PermissionsManager {
  public notifications = true;
  public biometry = true;
}

type TonkeeperOptions = {
  storage: Storage;
  vault: Vault;
};

export interface WalletsStoreState {
  wallets: WalletConfig[];
  selectedIdentifier: string;
  biometryEnabled: boolean;
}

export class Tonkeeper {
  public permissions: PermissionsManager;
  public wallets: Map<string, Wallet> = new Map();
  public tonPrice: TonPriceManager;

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
  });

  constructor(options: TonkeeperOptions) {
    this.storage = options.storage;
    this.vault = options.vault;
    this.tonapi = {
      mainnet: createTonApiInstance(),
      testnet: createTonApiInstance(true),
    };

    this.permissions = new PermissionsManager();
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

  public async init() {
    try {
      await Promise.all([this.walletsStore.rehydrate(), this.tonPrice.rehydrate()]);

      this.tonPrice.load();

      await this.migrate();

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

  private async migrate() {
    const keychainName = 'mainnet_default';

    const data = await this.storage.getItem(`${keychainName}_wallet`);
    const isTestnet = !!(await this.storage.getItem('is_testnet'));

    if (!data) {
      return null;
    }

    try {
      const json = JSON.parse(data);

      const walletConfig: WalletConfig = {
        identifier: uuidv4(),
        type: WalletType.Regular,
        name: 'Wallet',
        color: WalletColor.SteelGray,
        workchain: json.vault.workchain,
        pubkey: json.vault.tonPubkey,
        configPubKey: json.vault.configPubKey,
        network: isTestnet ? WalletNetwork.testnet : WalletNetwork.mainnet,
        version: json.vault.version,
      };

      this.walletsStore.set(({ wallets }) => ({
        wallets: [...wallets, walletConfig],
        selectedIdentifier: walletConfig.identifier,
      }));

      // MULTIWALLET TODO
      // this.storage.removeItem(`${keychainName}_wallet`);
    } catch {}
  }

  public tronStorageKey = 'temp-tron-address';

  public async load() {
    try {
      const tronAddress = await this.storage.getItem(this.tronStorageKey);
      return {
        tronAddress: tronAddress ? JSON.parse(tronAddress) : null,
      };
    } catch (err) {
      console.error('[tk:load]', err);
      return { tronAddress: null, tonProof: null };
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

  public async importWallet(
    mnemonic: string,
    passcode: string,
    versions: WalletContractVersion[],
    walletConfig: Pick<
      WalletConfig,
      'network' | 'workchain' | 'configPubKey' | 'allowedDestinations'
    >,
  ) {
    const newWallets: WalletConfig[] = [];
    for (const version of versions) {
      const identifier = uuidv4();

      const pubkey = await this.vault.import(identifier, mnemonic, passcode);

      newWallets.push({
        ...walletConfig,
        name: versions.length > 1 ? `Wallet ${version}` : 'Wallet',
        version,
        color: WalletColor.SteelGray,
        type: WalletType.Regular,
        pubkey,
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

    this.setWallet(walletsInstances[0]);
  }

  public async getWalletsInfo(mnemonic: string, isTestnet: boolean) {
    const keyPair = await Mnemonic.mnemonicToKeyPair(mnemonic.split(' '));

    const pubkey = Buffer.from(keyPair.publicKey).toString('hex');

    const tonapi = isTestnet ? this.tonapi.testnet : this.tonapi.mainnet;

    const [{ accounts }, addresses] = await Promise.all([
      tonapi.pubkeys.getWalletsByPublicKey(pubkey),
      Address.fromPubkey(pubkey, false),
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

    const workchain = Number(address.split(':')[0]);

    let version = WalletContractVersion.v4R2;

    const hasBalance: { balance: BigNumber; version: WalletContractVersion }[] = [];

    for (const currentVersion of Object.keys(addresses)) {
      const currentAddress = addresses[currentVersion] as AddressFormats;
      const walletInfo = await this.tonapi.mainnet.accounts.getAccount(
        currentAddress.raw,
      );
      const walletBalance = new BigNumber(walletInfo.balance);

      if (walletBalance.isGreaterThan(0)) {
        hasBalance.push({
          balance: walletBalance,
          version: currentVersion as WalletContractVersion,
        });
      }
    }

    if (hasBalance.length > 0) {
      const maxBalanceAccount = hasBalance.reduce((prev, current) => {
        return prev.balance.isGreaterThan(current.balance) ? prev : current;
      });

      version = maxBalanceAccount.version;
    }

    const config: WalletConfig = {
      identifier: uuidv4(),
      network: WalletNetwork.mainnet,
      type: WalletType.WatchOnly,
      pubkey,
      workchain,
      version,
      name: 'Wallet',
      color: WalletColor.SteelGray,
    };

    this.walletsStore.set(({ wallets }) => ({ wallets: [...wallets, config] }));
    const wallet = await this.createWalletInstance(config);
    this.setWallet(wallet);
  }

  public async removeWallet(identifier: string) {
    try {
      const wallet =
        this.wallets.get(
          Array.from(this.wallets.keys()).find((item) => item !== identifier) ?? '',
        ) ?? null;

      this.walletsStore.set(({ wallets }) => ({
        wallets: wallets.filter((w) => w.identifier !== identifier),
        selectedIdentifier: wallet?.identifier ?? '',
      }));
      this.wallets.delete(identifier);

      if (this.wallets.size === 0) {
        this.walletsStore.set({ biometryEnabled: false });
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
    this.wallets.clear();
    this.emitChangeWallet();
  }

  private async createWalletInstance(walletConfig: WalletConfig) {
    const addresses = await Address.fromPubkey(walletConfig.pubkey, false);

    const wallet = new Wallet(walletConfig, addresses!, this.storage, this.tonPrice);

    await wallet.rehydrate();
    wallet.preload();

    const existedWallet = this.wallets.get(wallet.identifier);

    if (existedWallet) {
      existedWallet.destroy();
    }

    this.wallets.set(wallet.identifier, wallet);

    return wallet;
  }

  public async updateWallet(
    config: Pick<Partial<WalletConfig>, 'name' | 'color'>,
    allVersions?: boolean,
  ) {
    try {
      if (!this.wallet) {
        return;
      }

      const identifiers = allVersions
        ? this.walletsStore.data.wallets
            .filter((item) => item.pubkey === this.wallet.pubkey)
            .map((item) => item.identifier)
        : [this.wallet.identifier];

      const updatedWallets = this.walletsStore.data.wallets.map(
        (wallet): WalletConfig => {
          if (identifiers.includes(wallet.identifier)) {
            return {
              ...wallet,
              ...config,
              name: allVersions
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

  public setWallet(wallet: Wallet | null) {
    this.walletsStore.set({ selectedIdentifier: wallet?.identifier ?? '' });
    this.emitChangeWallet();
  }

  public destroy() {
    try {
      this.wallet?.destroy();
      // MULTIWALLET TODO
      // this.queryClient.clear();
      // this.setWallet(null);

      this.emitChangeWallet();
    } catch {}
  }
}
