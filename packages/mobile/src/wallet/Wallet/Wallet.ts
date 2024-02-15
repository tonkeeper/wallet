import { AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';

import { EventSourceListener } from '@tonkeeper/core/src/declarations/ServerSentEvents';

import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TonPriceManager } from '../managers/TonPriceManager';
import { State } from '@tonkeeper/core/src/utils/State';
import { WalletConfig } from '../WalletTypes';
import { WalletContent } from './WalletContent';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';

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
  private appStateListener: NativeEventSubscription | null = null;
  private prevAppState: AppStateStatus = 'active';
  private lastTimeAppActive = Date.now();

  public status = new State<WalletStatusState>(Wallet.INITIAL_STATUS_STATE);

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
    protected tonPrice: TonPriceManager,
  ) {
    super(config, tonAllAddresses, storage, tonPrice);

    this.status.persist({
      partialize: ({ updatedAt }) => ({ updatedAt }),
      storage: this.storage,
      key: `${this.persistPath}/status`,
    });

    this.listenTransactions();
    this.listenAppState();
  }

  public async rehydrate() {
    await super.rehydrate();

    this.status.rehydrate();
  }

  public async preload() {
    this.logger.debug('preload wallet data');
    try {
      this.status.set({ isLoading: true });
      await super.preload();
      this.status.set({ isLoading: false, updatedAt: Date.now() });
    } catch {
      this.status.set({ isLoading: false });
    }
  }

  public async reload() {
    this.logger.debug('reload wallet data');
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
      this.logger.debug('start listen transactions');
    });
    this.listener.addEventListener('error', (err) => {
      this.logger.error('error listen transactions', err);
    });
    this.listener.addEventListener('message', () => {
      this.logger.info('message receive');
      this.preload();
    });
  }

  private stopListenTransactions() {
    this.listener?.close();
    this.logger.warn('stop listen transactions');
  }

  private listenAppState() {
    this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
      // close transactions listener if app was in background
      if (nextAppState === 'background') {
        this.lastTimeAppActive = Date.now();
      }
      // reload data if app was in background more than 5 minutes
      if (nextAppState === 'active' && this.prevAppState === 'background') {
        if (Date.now() - this.lastTimeAppActive > 1000 * 60 * 5) {
          this.preload();
          this.stopListenTransactions();
          this.listenTransactions();
        }
      }

      this.prevAppState = nextAppState;
    });
  }

  public destroy() {
    this.logger.warn('destroy wallet');
    this.tonProof.destroy();
    this.appStateListener?.remove();
    this.stopListenTransactions();
  }
}
