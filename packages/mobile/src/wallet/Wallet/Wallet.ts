import { AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';

import { EventSourceListener } from '@tonkeeper/core/src/declarations/ServerSentEvents';

import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TonPriceManager } from '../managers/TonPriceManager';
import { State } from '@tonkeeper/core/src/utils/State';
import { WalletConfig } from '../WalletTypes';
import { WalletContent } from './WalletContent';

export interface WalletStatusState {
  isReloading: boolean;
  isLoading: boolean;
  updatedAt: number;
}

export class Wallet extends WalletContent {
  static readonly INITIAL_STATUS_STATE: WalletStatusState = {
    isReloading: false,
    isLoading: false,
    updatedAt: Date.now(),
  };

  public listener: EventSourceListener | null = null;

  public status = new State<WalletStatusState>(Wallet.INITIAL_STATUS_STATE);

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
    protected tonPrice: TonPriceManager,
  ) {
    super(config, tonAllAddresses, storage, tonPrice);

    const tonRawAddress = this.address.ton.raw;

    this.status.persist({
      partialize: ({ updatedAt }) => ({ updatedAt }),
      storage: this.storage,
      key: `${tonRawAddress}/status`,
    });

    this.listenTransactions();
  }

  public async rehydrate() {
    await super.rehydrate();

    this.status.rehydrate();
  }

  public async preload() {
    try {
      this.status.set({ isLoading: true });
      await super.preload();
      this.status.set({ isLoading: false, updatedAt: Date.now() });
    } catch {
      this.status.set({ isLoading: false });
    }
  }

  public async reload() {
    try {
      this.status.set({ isReloading: true });
      this.tonPrice.load();
      await super.reload();
      this.status.set({ isReloading: false, updatedAt: Date.now() });
    } catch {
      this.status.set({ isReloading: false });
    }
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
      this.preload();
    });
  }

  public destroy() {
    this.listener?.close();
    console.log('[Wallet]: stop listen transactions for', this.address.ton.short);
  }
}
