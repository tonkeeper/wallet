import { Wallet } from './Wallet';
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
};

type SecuritySettings = {
  biometryEnabled: boolean;
  hiddenBalances: boolean;
  locked: boolean;
};

export class Tonkeeper {
  public permissions: PermissionsManager;
  public wallet: Wallet;
  public wallets = [];

  public securitySettings: SecuritySettings = {
    biometryEnabled: false,
    hiddenBalances: false,
    locked: false,
  };

  private storage: IStorage;
  private vault: Vault;

  constructor(options: TonkeeperOptions) {
    this.vault = options.vault;
    this.wallet = new Wallet(options.vault);
    this.permissions = new PermissionsManager();
    this.storage = options.storage;
  }

  public async init() {
    //Load data from storage
    // const info = await this.storage.load('tonkeeper');
    // if (info) {
    //   this.locked = info.locked;
    //   //
    //   //
    // }
    const locked = await this.storage.getItem('locked');
    this.securitySettings.biometryEnabled =
      (await this.storage.getItem('biometry_enabled')) === 'yes';
    if (locked === null || Boolean(locked) === true) {
      this.securitySettings.locked = true;
      // await this.wallet.getPrivateKey();
    }
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
}
