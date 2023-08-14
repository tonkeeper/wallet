import { QueryClient } from 'react-query';
import { Address, AddressFormats } from './formatters/Address';
import { TonAPI } from './TonAPI';
import { Vault } from './Vault';

import { TransactionsManager } from './managers/TransactionsManager';
import { NftsManager } from './managers/NftsManager';
import { SSEListener, SSEManager } from './Tonkeeper';
import { SubscriptionsManager } from './managers/SubscriptionsManager';
import { JettonsManager } from './managers/JettonsManager';
import { BalanceManager } from './managers/BalanceManager';

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

export type WalletContext = {
  accountId: string;
  queryClient: QueryClient;
  sse: SSEManager;
  tonapi: TonAPI;
};

export class Wallet {
  public identity: WalletIdentity;
  public address: AddressFormats;

  public listener: SSEListener | null = null;

  public subscriptions: SubscriptionsManager;
  public transactions: TransactionsManager;
  public balance: BalanceManager;
  public jettons: JettonsManager;
  public nfts: NftsManager;

  constructor(
    private queryClient: QueryClient,
    private tonapi: TonAPI,
    private vault: Vault,
    private sse: SSEManager,
    walletInfo: any,
  ) {

    this.identity = {
      kind: WalletKind.Regular,
      network: walletInfo.network,
    }

    this.address = Address.parse(walletInfo.address).toAll({
      testOnly: walletInfo.network === WalletNetwork.testnet
    });
    
    const context: WalletContext = {
      accountId: this.address.raw,
      queryClient: this.queryClient,
      tonapi: this.tonapi,
      sse: this.sse,
    };

    this.subscriptions = new SubscriptionsManager(context);
    this.transactions = new TransactionsManager(context);
    this.balance = new BalanceManager(context);
    this.jettons = new JettonsManager(context);
    this.nfts = new NftsManager(context);

    this.listenTransactions();
  }

  public async create({ name, passcode }: { passcode: string; name?: string }) {}

  public async import(options: { passcode: string; words: string; name: string }) {}

  public async getPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }

  private listenTransactions() {
    this.listener = this.sse.listen(
      `/v2/sse/accounts/transactions?accounts=${this.address.raw}`,
    );
    this.listener.addEventListener('open', () => {
      console.log('[Wallet]: start listen transactions for', this.address.short);
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
