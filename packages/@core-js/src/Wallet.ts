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
import { BatteryAPI } from './BatteryAPI';
import { BatteryManager } from './managers/BatteryManager';

export enum WalletNetwork {
  mainnet = -239,
  testnet = -3,
}

export enum WalletKind {
  Regular = 'Regular',
  Lockup = 'Lockup',
  WatchOnly = 'WatchOnly',
}

export type WalletIdentity = {
  network: WalletNetwork;
  kind: WalletKind;
  stateInit: string;
  tonProof: string;
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
  batteryapi: BatteryAPI;
};

export class Wallet {
  public identity: WalletIdentity;
  public address: WalletAddress;

  public listener: EventSourceListener | null = null;

  public subscriptions: SubscriptionsManager;
  public balances: BalancesManager;
  public battery: BatteryManager;

  public nfts: NftsManager;

  public activityLoader: ActivityLoader;
  public jettonActivityList: JettonActivityList;
  public tonActivityList: TonActivityList;
  public activityList: ActivityList;

  public tronService: TronService;

  constructor(
    private queryClient: QueryClient,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
    private batteryapi: BatteryAPI,
    private vault: Vault,
    private sse: ServerSentEvents,
    private storage: IStorage,
    walletInfo: any,
  ) {
    this.identity = {
      kind: WalletKind.Regular,
      network: walletInfo.network,
      stateInit: walletInfo.stateInit,
      tonProof: walletInfo.tonProof,
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
      batteryapi: this.batteryapi,
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
    this.battery = new BatteryManager(context, this.identity);

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

  public async setTonProof(tonProof: string) {
    this.identity.tonProof = tonProof;
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
