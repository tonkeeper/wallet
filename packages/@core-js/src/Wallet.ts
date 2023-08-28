import { QueryClient } from 'react-query';
import { Address, AddressFormats } from './formatters/Address';
import { TonAPI } from './TonAPI';
import { Vault } from './Vault';

import { TransactionsManager } from './managers/TransactionsManager';
import { NftsManager } from './managers/NftsManager';
import { EventSourceListener, ServerSentEvents, IStorage } from './Tonkeeper';
import { SubscriptionsManager } from './managers/SubscriptionsManager';
import { JettonsManager } from './managers/JettonsManager';
import { BalancesManager } from './managers/BalancesManager';
import { TronAPI } from './TronAPI';
import { TronService } from './TronService';

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

export class Wallet {
  public identity: WalletIdentity;
  public address: WalletAddress;

  public listener: EventSourceListener | null = null;

  public subscriptions: SubscriptionsManager;
  public transactions: TransactionsManager;
  public balances: BalancesManager;
  public jettons: JettonsManager;
  public nfts: NftsManager;

  public tronService: TronService;

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

    const tonAddresses = Address.parse(walletInfo.address).toAll({
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

    this.transactions = new TransactionsManager(
      this.address.ton.raw,
      this.address.tron?.owner,
      this.tonapi,
      this.tronapi,
      this.queryClient,
    );

    this.balances = new BalancesManager(context);
    this.jettons = new JettonsManager(context);
    this.nfts = new NftsManager(context);

    this.tronService = new TronService(context);

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
    this.listener = this.sse.listen(
      `/v2/sse/accounts/transactions?accounts=${this.address.ton.raw}`,
    );
    this.listener.addEventListener('open', () => {
      console.log('[Wallet]: start listen transactions for', this.address.ton.short);
    });
    this.listener.addEventListener('error', (err) => {
      console.log('[Wallet]: error listen transactions', err);
    });
    this.listener.addEventListener('message', () => {
      console.log('[Wallet]: message receive');
      this.transactions.refetch();
    });
  }

  public destroy() {
    this.listener?.close();
  }
}
