import { ServerSentEvents } from './declarations/ServerSentEvents';
import { createTronOwnerAddress } from './utils/tronUtils';
import { Storage } from './declarations/Storage';
import { Wallet, WalletNetwork } from './Wallet';
import { Address } from './formatters/Address';
import { Vault } from './declarations/Vault';
import { QueryClient } from 'react-query';
import { TronAPI } from './TronAPI';
import { TonAPI } from './TonAPI';
import { BatteryAPI } from './BatteryAPI';
import { signProofForTonkeeper } from './utils/tonProof';

class PermissionsManager {
  public notifications = true;
  public biometry = true;
}

type TonkeeperOptions = {
  queryClient: QueryClient;
  sse: ServerSentEvents;
  tronapi: TronAPI;
  storage: Storage;
  tonapi: TonAPI;
  batteryapi: BatteryAPI;
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
  private queryClient: QueryClient;
  private tronapi: TronAPI;
  private tonapi: TonAPI;
  private batteryapi: BatteryAPI;
  private vault: Vault;

  constructor(options: TonkeeperOptions) {
    this.queryClient = options.queryClient;
    this.storage = options.storage;
    this.tronapi = options.tronapi;
    this.tonapi = options.tonapi;
    this.batteryapi = options.batteryapi;
    this.vault = options.vault;
    this.sse = options.sse;

    this.permissions = new PermissionsManager();
  }

  // TODO: for temp, rewrite it when ton wallet will it be moved here;
  // init() must be called when app starts
  public async init(
    address: string,
    isTestnet: boolean,
    tronAddress: string,
    tonProof: string,
    walletStateInit: string,
    // TODO: remove after transition to UQ address format
    bounceable = true,
  ) {
    try {
      this.destroy();
      if (address) {
        if (Address.isValid(address)) {
          this.wallet = new Wallet(
            this.queryClient,
            this.tonapi,
            this.tronapi,
            this.batteryapi,
            this.vault,
            this.sse,
            this.storage,
            {
              network: isTestnet ? WalletNetwork.testnet : WalletNetwork.mainnet,
              tronAddress: tronAddress,
              address: address,
              bounceable,
              tonProof,
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

  public tronStorageKey = 'temp-tron-address';
  public tonProofStorageKey = 'temp-ton-proof';

  public async load() {
    try {
      const tonProof = await this.storage.getItem(this.tonProofStorageKey);
      const tronAddress = await this.storage.getItem(this.tronStorageKey);
      if (tronAddress) {
        return { tronAddress: JSON.parse(tronAddress), tonProof };
      }
      return { tronAddress: null, tonProof };
    } catch (err) {
      console.error('[tk:load]', err);
      return { tronAddress: null, tonProof: null };
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

      await this.storage.setItem(this.tronStorageKey, JSON.stringify(tronAddress));

      return tronAddress;
    } catch (err) {
      console.error('[Tonkeeper]', err);
    }
  }

  public async obtainProofToken(tonPrivateKey: Uint8Array) {
    try {
      const { payload } = await this.tonapi.tonconnect.getTonConnectPayload();
      const proof = await signProofForTonkeeper(
        this.wallet.address.ton.raw,
        tonPrivateKey,
        payload,
        this.wallet.identity.stateInit,
      );
      const { token } = await this.tonapi.wallet.tonConnectProof(proof);

      await this.storage.setItem(this.tonProofStorageKey, JSON.stringify(token));
      return token;
    } catch (err) {
      console.error('[Tonkeeper]', err);
    }
  }

  // Update all data,
  // Invoke in background after hide splash screen
  private preload() {
    this.wallet.activityList.preload();
    // TODO:
    this.wallet.subscriptions.prefetch();
    this.wallet.balances.prefetch();
    this.wallet.nfts.prefetch();
    this.wallet.battery.getBalance();
  }

  public rehydrate() {
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

    // this.notifyUI();
  }

  private async updateSecuritySettings() {
    // this.notifyUI();
    return this.storage.set('securitySettings', this.securitySettings);
  }

  public destroy() {
    this.wallet?.destroy();
    this.queryClient.clear();
    this.wallet = null!;
  }
}
