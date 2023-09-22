import { ServerSentEvents } from './declarations/ServerSentEvents';
import { createTronOwnerAddress } from './utils/tronUtils';
import { Storage } from './declarations/Storage';
import { Address } from './formatters/Address';
import { WalletNetwork } from './WalletTypes';
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

export type TonkeeperState = {
  hiddenBalances: boolean;
};

export class Tonkeeper {
  public permissions: PermissionsManager;
  public wallet!: Wallet;
  public wallets = [];

  // public securitySettings: SecuritySettings = {
  //   biometryEnabled: false,
  //   hiddenBalances: false,
  //   locked: false,
  // };

  public state = new State<TonkeeperState>({
    hiddenBalances: false,
  });

  private sse: ServerSentEvents;
  private storage: Storage;
  private tronapi: TronAPI;
  private tonapi: TonAPI;
  private vault: Vault;

  constructor(options: TonkeeperOptions) {
    this.storage = options.storage;
    this.tronapi = options.tronapi;
    this.tonapi = options.tonapi;
    this.vault = options.vault;
    this.sse = options.sse;

    this.permissions = new PermissionsManager();

    this.state.persist({
      partialize: ({ hiddenBalances }) => ({ hiddenBalances }),
      storage: this.storage,
      key: 'tonkeeper',
    });
  }

  // TODO: for temp, rewrite it when ton wallet will it be moved here;
  // init() must be called when app starts
  public async init(address: string, isTestnet: boolean, tronAddress: string) {
    try {
      this.destroy();
      if (address) {
        if (Address.isValid(address)) {
          this.wallet = new Wallet(
            undefined,
            this.tonapi,
            this.tronapi,
            this.vault,
            this.sse,
            this.storage,
            {
              network: isTestnet ? WalletNetwork.testnet : WalletNetwork.mainnet,
              tronAddress: tronAddress,
              address: address,
            },
          );

          this.rehydrate();
          this.preload();
        }
      }
    } catch (err) {
      console.log(err);
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

  // Update all data,
  // Invoke in background after hide splash screen
  private preload() {
    this.wallet.activityList.preload();
    this.wallet.expiringDomains.preload();
    // TODO:
    this.wallet.subscriptions.prefetch();
  }

  public rehydrate() {
    this.state.rehydrate();
    this.wallet.expiringDomains.rehydrate();
    this.wallet.jettonActivityList.rehydrate();
    this.wallet.tonActivityList.rehydrate();
    this.wallet.activityList.rehydrate();
  }

  public toggleBalances() {
    this.state.set(({ hiddenBalances }) => ({
      hiddenBalances: !hiddenBalances,
    }));
  }

  public lock() {}
  public unlock() {}
  public enableBiometry() {}
  public disableBiometry() {}

  public destroy() {
    this.wallet?.destroy();
    this.wallet = null!;
  }
}
