import { QueryClient } from 'react-query';
import { Address, AddressFormats } from './formatters/Address';
import { TonAPI } from './TonAPI';
import { Vault } from './declarations/Vault';

import { ActivityList } from './Activity/ActivityList';
import { NftsManager } from './managers/NftsManager';
import { EventSourceListener, ServerSentEvents, IStorage } from './Tonkeeper';
import { SubscriptionsManager } from './managers/SubscriptionsManager';

import { BalancesManager } from './managers/BalancesManager';
import { TronAPI } from './TronAPI';
import { TronService } from './TronService';
import { ActivityLoader } from './Activity/ActivityLoader';
import { TonActivityList } from './Activity/TonActivityList';
import { JettonActivityList } from './Activity/JettonActivityList';
import { State } from './utils/State';

export enum WalletNetwork {
  mainnet = -239,
  testnet = -3,
}

export enum WalletKind {
  Regular = 'Regular',
  Lockup = 'Lockup',
  WatchOnly = 'WatchOnly',
}

type WalletIdentity = {
  network: WalletNetwork;
  kind: WalletKind;
  // id: string;
};

enum Currency {
  USD = 'USD',
}

enum WalletContractVersion {
  v4R1 = 'v3R2',
  v3R2 = 'v3R2',
  v4R2 = 'v4R2',
  NA = 'NA',
}

type WalletInfo = {
  identity: Pick<WalletIdentity, 'network' | 'kind'>;
  currency: Currency;
  label: string;
};

type TronAddresses = {
  proxy: string;
  owner: string;
};

type RawAddress = string;

export type WalletAddresses = {
  tron?: TronAddresses;
  ton: RawAddress;
};

export type WalletAddress = {
  tron?: TronAddresses;
  ton: AddressFormats;
};

export type WalletContext = {
  address: WalletAddress;
  queryClient: QueryClient;
  sse: ServerSentEvents;
  tonapi: TonAPI;
  tronapi: TronAPI;
};

export type WalletState = {
  lastBackupTimestamp: null | number;
  isFinishedSetup: boolean;
};

export class Wallet {
  public identity: WalletIdentity;
  public address: WalletAddress;

  public listener: EventSourceListener | null = null;

  public subscriptions: SubscriptionsManager;
  public balances: BalancesManager;

  public nfts: NftsManager;

  public activityLoader: ActivityLoader;
  public jettonActivityList: JettonActivityList;
  public tonActivityList: TonActivityList;
  public activityList: ActivityList;

  public tronService: TronService;

  public state = new State<WalletState>({
    lastBackupTimestamp: null,
    isFinishedSetup: false,
  });

  constructor(
    private queryClient: QueryClient,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
    private vault: Vault,
    private sse: ServerSentEvents,
    private storage: IStorage,
    walletInfo: any,
  ) {
    this.identity = {
      kind: WalletKind.Regular,
      network: walletInfo.network,
    };

    const tonAddresses = Address.parse(walletInfo.address, {
      bounceable: walletInfo.bounceable,
    }).toAll({
      testOnly: walletInfo.network === WalletNetwork.testnet,
    });

    this.address = {
      tron: walletInfo.tronAddress,
      ton: tonAddresses,
    };

    // TODO: rewrite
    const context: WalletContext = {
      queryClient: this.queryClient,
      address: this.address,
      tronapi: this.tronapi,
      tonapi: this.tonapi,
      sse: this.sse,
    };

    this.subscriptions = new SubscriptionsManager(context);

    const addresses = {
      ton: this.address.ton.raw,
      tron: this.address.tron,
    };

    this.activityLoader = new ActivityLoader(addresses, this.tonapi, this.tronapi);
    this.jettonActivityList = new JettonActivityList(this.activityLoader, this.storage);
    this.tonActivityList = new TonActivityList(this.activityLoader, this.storage);
    this.activityList = new ActivityList(this.activityLoader, this.storage);

    this.balances = new BalancesManager(context);
    this.nfts = new NftsManager(context);
    this.tronService = new TronService(context);

    this.rehydrateLastBackupTimestamp();
    this.rehydrateIsFinishedSetup();
    this.listenTransactions();
  }

  public async finishSetup() {
    await this.storage.setItem('isFinishedSetup', 'true');
    this.state.set({ isFinishedSetup: true });
  }

  public async rehydrateIsFinishedSetup() {
    const isFinishedSetup = await this.storage.getItem('isFinishedSetup');
    if (isFinishedSetup === 'true') {
      this.state.set({ isFinishedSetup: true });
    }
  }

  public async saveLastBackupTimestamp() {
    const timestamp = +new Date();
    await this.storage.setItem('lastBackupTimestamp', `${timestamp}`);
    this.state.set({ lastBackupTimestamp: timestamp });
  }

  public async rehydrateLastBackupTimestamp() {
    const timestamp = await this.storage.getItem('lastBackupTimestamp');

    if (timestamp !== null) {
      this.state.set({ lastBackupTimestamp: Number(timestamp) });
    }
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

  public async logout() {
    await this.storage.removeItem('lastBackupTimestamp');
    await this.storage.removeItem('isFinishedSetup');
  }
}
