import { AddressesByVersion } from '@tonkeeper/core/src/formatters/Address';

import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { TonPriceManager } from '../managers/TonPriceManager';
import { State } from '@tonkeeper/core/src/utils/State';
import { WalletConfig } from '../WalletTypes';
import { WalletContent } from './WalletContent';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { AccountsStream } from '../streaming';

export interface WalletStatusState {
  isReloading: boolean;
  isLoading: boolean;
  updatedAt: number;
}

export interface WalletSetupState {
  lastBackupAt: number | null;
  setupDismissed: boolean;
  hasOpenedTelegramChannel: boolean;
}

export class Wallet extends WalletContent {
  static readonly INITIAL_STATUS_STATE: WalletStatusState = {
    isReloading: false,
    isLoading: false,
    updatedAt: Date.now(),
  };

  static readonly INITIAL_SETUP_STATE: WalletSetupState = {
    lastBackupAt: null,
    setupDismissed: false,
    hasOpenedTelegramChannel: false,
  };

  private stopListenTransactions: Function | null = null;
  private appStateListener: NativeEventSubscription | null = null;
  private prevAppState: AppStateStatus = 'active';
  private lastTimeAppActive = Date.now();

  public status = new State<WalletStatusState>(Wallet.INITIAL_STATUS_STATE);

  public setup = new State<WalletSetupState>(Wallet.INITIAL_SETUP_STATE);

  constructor(
    public config: WalletConfig,
    public tonAllAddresses: AddressesByVersion,
    protected storage: Storage,
    protected tonPrice: TonPriceManager,
    private accountStream: AccountsStream,
  ) {
    super(config, tonAllAddresses, storage, tonPrice);

    this.status.persist({
      partialize: ({ updatedAt }) => ({ updatedAt }),
      storage: this.storage,
      key: `${this.persistPath}/status`,
    });

    this.setup.persist({
      storage: this.storage,
      key: `${this.persistPath}/setup`,
      version: 1,
      onUpdate: (lastVersion, prevData) => ({ ...prevData, setupDismissed: false }),
    });

    this.listenTransactions();
    this.listenAppState();
  }

  public saveLastBackupTimestamp() {
    this.setup.set({ lastBackupAt: Date.now() });
  }

  public dismissSetup() {
    this.setup.set({ setupDismissed: true });
  }

  public toggleTgJoined() {
    this.setup.set({ hasOpenedTelegramChannel: true });
  }

  public async rehydrate() {
    await super.rehydrate();

    await this.setup.rehydrate();
    this.status.rehydrate();
  }

  public async preload() {
    if (this.status.data.isLoading) {
      return;
    }
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
    if (this.status.data.isReloading) {
      return;
    }
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
    this.stopListenTransactions = this.accountStream.subscribe(
      this.address.ton.raw,
      (event) => {
        this.logger.debug('transaction event', event.params.tx_hash);
        setTimeout(() => {
          this.preload();
        }, 300);
      },
    );
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
        }
      }

      this.prevAppState = nextAppState;
    });
  }

  public destroy() {
    this.logger.warn('destroy wallet');
    this.tonProof.destroy();
    this.appStateListener?.remove();
    this.stopListenTransactions?.();
  }
}
