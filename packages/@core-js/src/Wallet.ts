import { EventSourceListener, ServerSentEvents } from './declarations/ServerSentEvents';
import { WalletCurrency } from './utils/AmountFormatter/FiatCurrencyConfig';
import { SubscriptionsManager } from './managers/SubscriptionsManager';
import { JettonActivityList } from './Activity/JettonActivityList';
import { TonActivityList } from './Activity/TonActivityList';
import { ActivityLoader } from './Activity/ActivityLoader';
import { JettonsManager } from './managers/JettonsManager';
import { PricesManager } from './managers/PricesManager';
import { ActivityList } from './Activity/ActivityList';
import { TonBalance } from './managers/TonBalance';
import { Storage } from './declarations/Storage';
import { Address } from './formatters/Address';
import { Vault } from './declarations/Vault';
import { State } from './utils/State';
import { TronAPI } from './TronAPI';
import { TonAPI } from './TonAPI';

import {
  StoreWalletInfo,
  TonWalletState,
  TronAddresses,
  WalletContractVersion,
  WalletKind,
  WalletNetwork,
} from './WalletTypes';
import { NetworkState, NetworkStatus } from './managers/NetworkState';
import { delay } from './utils/network';

type TonkeeperAPI = any; // TODO:

export type WalletState = {
  currency: WalletCurrency;
  network: WalletNetwork;
  ton: TonWalletState;
  kind: WalletKind;
  pubkey: string;
};

export class Wallet {
  public listener: EventSourceListener | null = null;

  public state: State<WalletState>;

  // public expiringDomains: ExpiringDomains;
  // public subscriptions: SubscriptionsManager;
  public jettonActivityList: JettonActivityList;
  public tonActivityList: TonActivityList;
  public activityLoader: ActivityLoader;
  public activityList: ActivityList;
  public jettons: JettonsManager;
  public tonBalance: TonBalance;
  public prices: PricesManager;
  public network: NetworkState;
  // public nfts: Nfts;

  constructor(
    private tonkeeperApi: TonkeeperAPI,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
    private vault: Vault,
    private sse: ServerSentEvents,
    private storage: Storage,
    storeWallet: StoreWalletInfo,
    addresses: any,
  ) {
    // TODO: set version from store
    const tonRawAddress = addresses['v4R2'].raw;
    const tonAddress = { 
      friendly: addresses['v4R2'].friendly,
      raw: addresses['v4R2'].raw,
      version: WalletContractVersion.v4R2,
    };

    this.state = new State<WalletState>({
      pubkey: storeWallet.pubkey,
      currency: storeWallet.currency,
      network: storeWallet.network,
      kind: storeWallet.kind,
      ton: {
        address: tonAddress,
        allAddresses: addresses,
      },
    });

    // this.expiringDomains = new ExpiringDomains(addresses.ton, this.tonapi, this.storage);

    this.activityLoader = new ActivityLoader(tonRawAddress, this.tonapi, this.tronapi);
    this.jettonActivityList = new JettonActivityList(this.activityLoader, this.storage);
    this.tonActivityList = new TonActivityList(this.activityLoader, this.storage);
    this.activityList = new ActivityList(this.activityLoader, this.storage);
    this.jettons = new JettonsManager(
      tonAddress.raw,
      storeWallet.currency,
      this.tonapi,
      this.storage,
    );
    this.prices = new PricesManager(storeWallet.currency, this.tonapi, this.storage);

    this.network = new NetworkState(this.storage);
    // this.nfts = new Nfts(addresses.ton, this.tonapi, this.storage);

    this.tonBalance = new TonBalance(addresses, this.tonapi, this.storage);
    // this.tronService = new TronService(context);

    // this.subscriptions = new SubscriptionsManager(
    //   addresses.ton,
    //   this.tonkeeperApi,
    //   this.storage,
    // );

    this.listenTransactions();
  }

  public async preload() {
    // this.rates.state.load();
    this.network.setStatus(NetworkStatus.Updating);
    this.jettons.load();
    this.prices.preload();
    this.tonBalance.preload();
    await delay(1000);
    this.network.setStatus(NetworkStatus.Online);
  }

  public async rehydrate() {
    try {
      // this.wallet.expiringDomains.rehydrate();
      await this.jettons.rehydrate();
      await this.tonBalance.state.rehydrate();
      await this.prices.state.rehydrate();

      this.jettonActivityList.rehydrate();
      this.tonActivityList.rehydrate();
      this.activityList.rehydrate();
      
      
    } catch (err) {
      console.log('error rehydrate wallet', err);
    }
  }

  public setCurrency(currency: WalletCurrency) {
    this.state.set({ currency });
    this.persistState();
  }

  public switchVersion(version: WalletContractVersion) {
    const address = this.state.data.ton.allAddresses[version];
    this.state.set((state) => ({
      ton: {
        ...state.ton,
        address,
      },
    }));
    this.persistState();
  }

  private async persistState() {
    const state = this.state.data;
    const wallet: StoreWalletInfo = {
      pubkey: state.pubkey,
      currency: state.currency,
      network: state.network,
      kind: state.kind,
    };

    this.storage.setItem('wallets', JSON.stringify([wallet]));
  }

  public async getTonPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }

  public async createTron(tronAddresses: TronAddresses) {
    // this.state.set((state) => ({
    //   addresses: {
    //     ...state.addresses,
    //     tronAddresses,
    //   },
    // }));
    // try {
    //   const ownerAddress = await createTronOwnerAddress(tonPrivateKey);
    //   const tronWallet = await this.tronapi.wallet.getWallet(ownerAddress);
    //   const tronAddress = {
    //     proxy: tronWallet.address,
    //     owner: ownerAddress,
    //   };
    //   await this.storage.setItem(this.tronStrorageKey, JSON.stringify(tronAddress));
    //   return tronAddress;
    // } catch (err) {
    //   console.error('[Tonkeeper]', err);
    // }
  }

  private hasListenError = false;
  private listenTransactions() {
    const address = this.state.data.ton.address.friendly;
    this.listener = this.sse.listen('/v2/sse/accounts/transactions', {
      accounts: address,
    });
    this.listener.addEventListener('open', () => {
      console.log('[Wallet]: start listen transactions for', Address.toShort(address));

      if (this.hasListenError) {
        this.network.setStatus(NetworkStatus.Online);
        this.hasListenError = false;
      }
    });
    this.listener.addEventListener('error', (err) => {
      console.log('[Wallet]: error listen transactions', err);
      this.network.setStatus(NetworkStatus.Connecting);
      this.hasListenError = true;
    });
    this.listener.addEventListener('message', () => {
      console.log('[Wallet]: message receive');
      this.activityList.reload();
    });
  }

  public destroy() {
    this.listener?.close();
  }
}
