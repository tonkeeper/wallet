import { EventSourceListener, ServerSentEvents } from './declarations/ServerSentEvents';
import { WalletCurrency, WalletKind, WalletState } from './WalletTypes';
import { SubscriptionsManager } from './managers/SubscriptionsManager';
import { JettonActivityList } from './Activity/JettonActivityList';
import { BalancesManager } from './managers/BalancesManager';
import { TonActivityList } from './Activity/TonActivityList';
import { ActivityLoader } from './Activity/ActivityLoader';
import { ActivityList } from './Activity/ActivityList';
import { NftsManager } from './managers/NftsManager';
import { Storage } from './declarations/Storage';
import { Vault } from './declarations/Vault';
import { TronService } from './TronService';
import { State } from './utils/State';
import { TronAPI } from './TronAPI';
import { TonAPI } from './TonAPI';

type TonkeeperAPI = any; // TODO:

export class Wallet {
  public listener: EventSourceListener | null = null;

  public state: State<WalletState>;

  public subscriptions: SubscriptionsManager;
  public jettonActivityList: JettonActivityList;
  public tonActivityList: TonActivityList;
  public activityLoader: ActivityLoader;
  public activityList: ActivityList;
  // public tronService: TronService;
  // public balances: BalancesManager;
  public nfts: NftsManager;

  constructor(
    private tonkeeperApi: TonkeeperAPI,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
    private vault: Vault,
    private sse: ServerSentEvents,
    private storage: Storage,
    walletInfo: any,
  ) {
    const addresses = {
      ton: walletInfo.address,
      tron: null,
    };

    this.state = new State<WalletState>({
      currency: WalletCurrency.USD,
      network: walletInfo.network,
      kind: WalletKind.Regular,
      wallets: [],
      addresses,
    });

    this.activityLoader = new ActivityLoader(addresses, this.tonapi, this.tronapi);
    this.jettonActivityList = new JettonActivityList(this.activityLoader, this.storage);
    this.tonActivityList = new TonActivityList(this.activityLoader, this.storage);
    this.activityList = new ActivityList(this.activityLoader, this.storage);


    // this.balances = new BalancesManager(context);
    // this.tronService = new TronService(context);
    
    // this.nfts.getLoaded
    this.nfts = new NftsManager();

    this.subscriptions = new SubscriptionsManager(
      addresses.ton,
      this.tonkeeperApi,
      this.storage,
    );

    this.listenTransactions();
  }

  public async getTonPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }

  public async getTronPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }

  // For migrate
  public async setTronAddress(addresses: TronAddresses) {
    this.address.tron = addresses;
  }

  private listenTransactions() {
    this.listener = this.sse.listen('/v2/sse/accounts/transactions', {
      accounts: this.address.ton.raw,
    });
    this.listener.addEventListener('open', () => {
      console.log('[Wallet]: start listen transactions for', this.address.ton.short);
    });
    this.listener.addEventListener('error', (err) => {
      console.log('[Wallet]: error listen transactions', err);
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
