import { ServerSentEvents } from './declarations/ServerSentEvents';
import { createTronOwnerAddress } from './utils/tronUtils';
import { Storage } from './declarations/Storage';
import { Address } from './formatters/Address';
import { WalletNetwork } from './WalletTypes';
import { Vault } from './declarations/Vault';
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
    this.wallet.expiringDomains.rehydrate();
    this.wallet.jettonActivityList.rehydrate();
    this.wallet.tonActivityList.rehydrate();
    this.wallet.activityList.rehydrate();
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
  }

  private async updateSecuritySettings() {
    return this.storage.set('securitySettings', this.securitySettings);
  }

  public destroy() {
    this.wallet?.destroy();
    this.wallet = null!;
  }
}
