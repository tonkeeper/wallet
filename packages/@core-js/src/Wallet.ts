import { EventSourceListener, ServerSentEvents } from './declarations/ServerSentEvents';
import { TronAddresses, WalletCurrency, WalletKind, WalletState } from './WalletTypes';
import { SubscriptionsManager } from './managers/SubscriptionsManager';
import { JettonActivityList } from './Activity/JettonActivityList';
import { BalancesManager } from './managers/BalancesManager';
import { TonActivityList } from './Activity/TonActivityList';
import { ActivityLoader } from './Activity/ActivityLoader';
import { ActivityList } from './Activity/ActivityList';
import { Storage } from './declarations/Storage';
import { Address } from './formatters/Address';
import { Nfts } from './managers/NftsManager';
import { Vault } from './declarations/Vault';
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
  public nfts: Nfts;

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

    this.nfts = new Nfts(addresses.ton, this.tonapi, this.storage);
    // this.balances = new BalancesManager(context);
    // this.tronService = new TronService(context);

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

  private listenTransactions() {
    const address = this.state.data.addresses.ton;
    this.listener = this.sse.listen('/v2/sse/accounts/transactions', {
      accounts: address,
    });
    this.listener.addEventListener('open', () => {
      console.log(
        '[Wallet]: start listen transactions for',
        Address.parse(address).toShort(),
      );
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
