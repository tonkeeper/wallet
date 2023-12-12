import { ServerSentEvents } from './declarations/ServerSentEvents';
import { createTronOwnerAddress } from './utils/tronUtils';
import { Storage } from './declarations/Storage';
import { Wallet, WalletNetwork } from './Wallet';
import { Address } from './formatters/Address';
import { Vault } from './declarations/Vault';
import { QueryClient } from 'react-query';
import { TronAPI } from './TronAPI';
import { TonAPI } from './TonAPI';
import { BiometryModule } from './modules/BiometryModule';
import { State } from './utils/State';

type TonkeeperOptions = {
  queryClient: QueryClient;
  sse: ServerSentEvents;
  tronapi: TronAPI;
  storage: Storage;
  tonapi: TonAPI;
  vault: Vault;
};

export type TonkeeperState = {
  notificationsEnabledDuringSetup: Boolean;
  notificationsEnabled: boolean;
  biometryEnabled: boolean;
  newOnboardWasShown: boolean;
};

export class Tonkeeper {
  public wallet!: Wallet;
  public wallets = [];

  public state = new State<TonkeeperState>({
    notificationsEnabledDuringSetup: false,
    notificationsEnabled: false,
    biometryEnabled: false,
    newOnboardWasShown: false,
  });

  public biometry: BiometryModule;

  private sse: ServerSentEvents;
  private storage: Storage;
  private queryClient: QueryClient;
  private tronapi: TronAPI;
  private tonapi: TonAPI;
  private vault: Vault;

  constructor(options: TonkeeperOptions) {
    this.queryClient = options.queryClient;
    this.storage = options.storage;
    this.tronapi = options.tronapi;
    this.tonapi = options.tonapi;
    this.vault = options.vault;
    this.sse = options.sse;

    this.biometry = new BiometryModule();
  }

  // TODO: for temp, rewrite it when ton wallet will it be moved here;
  // init() must be called when app starts
  public async init(
    address: string,
    isTestnet: boolean,
    tronAddress: string,
    // TODO: remove after transition to UQ address format
    bounceable = true,
  ) {
    try {
      const newOnboardWasShown = await this.storage.getItem('newOnboardWasShown');
      const notificationsEnabledDuringSetup = await this.storage.getItem(
        'notificationsEnabledDuringSetup',
      );
      const notificationsEnabled = await this.storage.getItem('isSubscribeNotifications');
      const biometryEnabled = await this.storage.getItem('biometry_enabled');
      this.state.set({
        notificationsEnabledDuringSetup: notificationsEnabledDuringSetup === 'true',
        notificationsEnabled: notificationsEnabled === 'true',
        biometryEnabled: biometryEnabled === 'yes',
        newOnboardWasShown: newOnboardWasShown == 'true',
      });

      this.destroy();
      if (address) {
        if (Address.isValid(address)) {
          this.wallet = new Wallet(
            this.queryClient,
            this.tonapi,
            this.tronapi,
            this.vault,
            this.sse,
            this.storage,
            {
              network: isTestnet ? WalletNetwork.testnet : WalletNetwork.mainnet,
              tronAddress: tronAddress,
              address: address,
              bounceable,
            },
          );

          await this.biometry.init();
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

  public async saveNewOnboardWasShown() {
    if (!this.state.data.newOnboardWasShown) {
      await this.storage.setItem('newOnboardWasShown', 'true');
      this.state.set({ newOnboardWasShown: true });
    }
  }

  public async enableNotifications() {
    await this.storage.setItem('isSubscribeNotifications', 'true');
    this.state.set({ notificationsEnabled: true });
  }

  public async disableNotifications() {
    await this.storage.setItem('isSubscribeNotifications', 'false');
    this.state.set({ notificationsEnabled: false });
  }

  public async enableNotificationsDuringSetup() {
    await this.storage.setItem('notificationsEnabledDuringSetup', 'true');
    this.state.set({ notificationsEnabledDuringSetup: true });
  }

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
    // TODO:
    this.wallet.subscriptions.prefetch();
    this.wallet.balances.prefetch();
    this.wallet.nfts.prefetch();
  }

  public rehydrate() {
    this.wallet.jettonActivityList.rehydrate();
    this.wallet.tonActivityList.rehydrate();
    this.wallet.activityList.rehydrate();
  }

  public async lock() {}

  public async unlock() {}

  public showBalances() {}

  public hideBalances() {}

  public async enableBiometry() {
    await this.storage.setItem('biometry_enabled', 'yes');
    this.state.set({ biometryEnabled: true });
  }

  public async disableBiometry() {
    await this.storage.removeItem('biometry_enabled');
    this.state.set({ biometryEnabled: false });
  }

  public destroy() {
    this.wallet?.destroy();
    this.queryClient.clear();
    this.wallet = null!;
  }
}
