import { QueryClient } from 'react-query';
import { Address } from './Address';
import { Wallet } from './Wallet';
import { TonAPI } from './TonAPI';
import { Vault } from './Vault';

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
  storage: IStorage;
  vault: Vault;
  queryClient: QueryClient;
  tonapi: TonAPI;
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

  private queryClient: QueryClient;
  private storage: IStorage;
  private vault: Vault;
  private tonapi: TonAPI;

  constructor(options: TonkeeperOptions) {
    this.queryClient = options.queryClient;
    this.storage = options.storage;
    this.tonapi = options.tonapi;
    this.vault = options.vault;

    this.permissions = new PermissionsManager();
  }

  public async init(address: string) {
    try {
      if (address) {
        if (Address.isValid(address)) {
          // TODO: move all params to ctx. 
          this.wallet = new Wallet(this.queryClient, this.tonapi, this.vault, {
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

  private prefetch() {
    this.wallet.transactions.prefetch();
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
    this.wallet.transactions.destroy();
    this.wallet = null!;
  }
}
