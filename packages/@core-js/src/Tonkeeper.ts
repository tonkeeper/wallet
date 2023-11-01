import { ServerSentEvents } from './declarations/ServerSentEvents';
import { createTronOwnerAddress } from './utils/tronUtils';
import { Storage } from './declarations/Storage';
import { Address } from './formatters/Address';
import { StoreWalletInfo } from './WalletTypes';
import { Vault } from './declarations/Vault';
import { State } from './utils/State';
import { TronAPI } from './TronAPI';
import { TonAPI } from './TonAPI';
import { Wallet } from './Wallet';

class PermissionsManager {
  public notifications = true;
  public biometry = true;
}

type TonkeeperOptions = {
  sse: ServerSentEvents;
  tronapi: TronAPI;
  storage: Storage;
  tonapi: TonAPI;
  vault: Vault;
};

type TonkeeperSecurity = {
  hiddenBalances: boolean;
};

export type TonkeeperState = {
  security: TonkeeperSecurity;
};

// public securitySettings: SecuritySettings = {
//   biometryEnabled: false,
//   hiddenBalances: false,
//   locked: false,
// };

export class Tonkeeper {
  private sse: ServerSentEvents;
  private storage: Storage;
  private tronapi: TronAPI;
  private tonapi: TonAPI;
  private vault: Vault;

  public permissions: PermissionsManager;
  public wallets: StoreWalletInfo[] = [];
  public wallet!: Wallet;

  public state = new State<TonkeeperState>({
    security: {
      hiddenBalances: false,
    },
  });

  constructor(options: TonkeeperOptions) {
    this.storage = options.storage;
    this.tronapi = options.tronapi;
    this.tonapi = options.tonapi;
    this.vault = options.vault;
    this.sse = options.sse;

    this.permissions = new PermissionsManager();

    this.state.persist({
      partialize: ({ security }) => ({ security }),
      storage: this.storage,
      key: 'tonkeeper',
    });
  }

  public async init() {
    try {
      this.state.rehydrate();

      const storeWallet = await this.getStoreWallet();

      if (!storeWallet) {
        return;
      }

      // Set wallet
      const addresses = await Address.fromPubkey(storeWallet.currentPubkey, false);

      this.wallets = storeWallet.wallets;

      this.wallet = new Wallet(
        undefined,
        this.tonapi,
        this.tronapi,
        this.vault,
        this.sse,
        this.storage,
        storeWallet.currentWallet,
        addresses,
      );

      await this.wallet.rehydrate();
      this.wallet.preload();
    } catch (err) {
      console.log('fail tonkeeper init', err);
    }
  }

  public tronStrorageKey = 'temp-tron-address';

  public async load() {
    try {
      const tronAddress = await this.storage.getItem(this.tronStrorageKey);
      if (tronAddress) {
        return { tronAddress: JSON.parse(tronAddress) };
      }
      return { tronAddress: null };
    } catch (err) {
      console.error('[tk:load]', err);
      return { tronAddress: null };
    }
  }

  public async logout() {
    this.wallet.destroy();
    this.wallet = undefined!;
    await this.storage.removeItem('current_pubkey');
    await this.storage.removeItem('wallets');
  }

  public async generateTronAddress(tonPrivateKey: Uint8Array) {
    return;
    try {
      const ownerAddress = await createTronOwnerAddress(tonPrivateKey);
      const tronWallet = await this.tronapi.wallet.getWallet(ownerAddress);

      const tronAddress = {
        proxy: tronWallet.address,
        owner: ownerAddress,
      };

      await this.storage.setItem(this.tronStrorageKey, JSON.stringify(tronAddress));

      return tronAddress;
    } catch (err) {
      console.error('[Tonkeeper]', err);
    }
  }

  public toggleBalances() {
    this.state.set(({ security }) => ({
      security: {
        ...security,
        hiddenBalances: !security.hiddenBalances,
      },
    }));
  }

  public lock() {}
  public unlock() {}
  public enableBiometry() {}
  public disableBiometry() {}

  private async getStoreWallet() {
    const currentPubkey = await this.storage.getItem('current_pubkey');
    const walletsJson = await this.storage.getItem('wallets');

    if (walletsJson === null || currentPubkey === null) {
      return null;
    }

    const wallets = JSON.parse(walletsJson) as StoreWalletInfo[];
    const currentWallet = wallets.find((wallet) => wallet.pubkey === currentPubkey);

    if (!currentWallet) {
      return null;
    }

    return {
      currentPubkey,
      currentWallet,
      wallets,
    };
  }

  public destroy() {
    this.wallet?.destroy();
    this.wallet = null!;
  }
}
