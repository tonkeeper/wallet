import { QueryClient } from 'react-query';
import { Address, AddressFormats } from './Address';
import { TonAPI } from './TonAPI';
import { Vault } from './Vault';

import { TransactionsManager } from './managers/TransactionsManager';
import { NftsManager } from './managers/NftsManager';
import { SSEListener, SSEManager } from './Tonkeeper';

enum Network {
  mainnet = -239,
  testnet = -3,
}

enum WalletKind {
  Regular,
  Lockup,
  WatchOnly,
}

type WalletIdentity = {
  network: Network;
  kind: WalletKind;
  id: () => string;
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
  public identity: WalletIdentity | null = null;
  public address: AddressFormats;

  public listener: SSEListener | null = null;

  public transactions: TransactionsManager;
  public nfts: NftsManager;

  constructor(
    private queryClient: QueryClient,
    private tonapi: TonAPI,
    private vault: Vault,
    private sse: SSEManager,
    walletInfo: any,
  ) {
    this.address = Address(walletInfo.address).toAll();
    const context: WalletContext = {
      accountId: this.address.raw,
      queryClient: this.queryClient,
      tonapi: this.tonapi,
      sse: this.sse,
    };

    this.transactions = new TransactionsManager(context);
    this.nfts = new NftsManager(context);

    this.listenTransactions();
  }

  public async create({ name, passcode }: { passcode: string; name?: string }) {}

  public async import({
    words,
    passcode,
    name,
  }: {
    passcode: string;
    words: string;
    name: string;
  }) {}

  public async getPrivateKey(): Promise<string> {
    if (false) {
      return this.vault.exportWithBiometry('');
    } else {
      return this.vault.exportWithPasscode('');
    }
  }

  public destroy() {
    this.listener?.close();
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
}
