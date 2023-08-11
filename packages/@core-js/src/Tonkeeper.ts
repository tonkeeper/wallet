import EventSource, { EventType } from 'react-native-sse';
import { QueryClient } from 'react-query';
import { Address } from './Address';
import { Wallet } from './Wallet';
import { TonAPI } from './TonAPI';
import { Vault } from './Vault';

export type ServerSentEventsOptions = {
  baseUrl: () => string;
  token: () => string;
};

export type SSEListener = EventSource<EventType>;
export declare class SSEManager {
  constructor(options: ServerSentEventsOptions);
  listen(url: string): SSEListener;
}

interface IStorage {
  setItem(key: string, value: string): Promise<any>;
  getItem(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

class PermissionsManager {
  public notifications = true;
  public biometry = true;
}

type TonkeeperOptions = {
  sse: SSEManager;
  queryClient: QueryClient;
  storage: IStorage;
  tonapi: TonAPI;
  vault: Vault;
};

type SecuritySettings = {
  biometryEnabled: boolean;
  hiddenBalances: boolean;
  locked: boolean;
};

export class Tonkeeper {
  public permissions: PermissionsManager;
  public wallet!: Wallet;
  public wallets = [];

  public securitySettings: SecuritySettings = {
    biometryEnabled: false,
    hiddenBalances: false,
    locked: false,
  };

  private sse: SSEManager;
  private queryClient: QueryClient;
  private storage: IStorage;
  private vault: Vault;
  private tonapi: TonAPI;

  constructor(options: TonkeeperOptions) {
    this.queryClient = options.queryClient;
    this.storage = options.storage;
    this.tonapi = options.tonapi;
    this.vault = options.vault;
    this.sse = options.sse;

    this.permissions = new PermissionsManager();
  }

  public async init(address: string) {
    try {
      this.destroy();
      if (address) {
        if (Address.isValid(address)) {
          this.wallet = new Wallet(this.queryClient, this.tonapi, this.vault, this.sse, {
            address: address,
          });

          this.prefetch();
        }
      }
    } catch (err) {
      console.log(err);
    }

    //Load data from storage
    // const info = await this.storage.load('tonkeeper');
    // if (info) {
    //   this.locked = info.locked;
    //   //
    //   //
    // }
    // const locked = await this.storage.getItem('locked');
    // this.securitySettings.biometryEnabled =
    //   (await this.storage.getItem('biometry_enabled')) === 'yes';
    // if (locked === null || Boolean(locked) === true) {
    //   this.securitySettings.locked = true;
    //   // await this.wallet.getPrivateKey();
    // }
  }

  // Load cache data for start app, 
  // Invoke on start app and block ui on spalsh screen
  private async preload() {
    await this.wallet.subscriptions.preload();
    await this.wallet.transactions.preload();
    await this.wallet.balance.preload();
    await this.wallet.jettons.preload();
    await this.wallet.nfts.preload();
    return true;
  }

  // Update all data, 
  // Invoke in background after hide splash screen
  private prefetch() {
    this.wallet.subscriptions.prefetch();
    this.wallet.transactions.prefetch();
    this.wallet.balance.prefetch();
    this.wallet.jettons.prefetch();
    this.wallet.nfts.prefetch();
  }

  public async lock() {
    this.securitySettings.locked = true;
    return this.updateSecuritySettings();
  }

  public async unlock() {
    this.securitySettings.locked = false;
    return this.updateSecuritySettings();
  }

  public showBalances() {
    this.securitySettings.hiddenBalances = false;
    return this.updateSecuritySettings();
  }

  public hideBalances() {
    this.securitySettings.hiddenBalances = true;
    return this.updateSecuritySettings();
  }

  public enableBiometry() {
    this.securitySettings.biometryEnabled = false;
    // this.enableBiometry()
  }

  public disableBiometry() {
    this.securitySettings.biometryEnabled = false;
    for (let wallet of this.wallets) {
      // this.vault.removeBiometry(wallet.pubkey);
    }

    // this.notifyUI();
  }

  private async updateSecuritySettings() {
    // this.notifyUI();
    return this.storage.set('securitySettings', this.securitySettings);
  }

  public destroy() {
    this.wallet?.destroy();
    this.wallet = null!;
  }
}
