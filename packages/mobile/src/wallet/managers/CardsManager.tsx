import { Storage } from '@tonkeeper/core';
import { State } from '@tonkeeper/core/src/utils/State';
import { TonRawAddress } from '$wallet/WalletTypes';

export interface CardsState {
  onboardBannerDismissed: boolean;
  accounts: any[];
  accountsLoading: boolean;
}

export const cardsState = new State<CardsState>({
  onboardBannerDismissed: false,
  accounts: [],
  accountsLoading: false,
});

export class CardsManager {
  public state = cardsState;

  constructor(private tonRawAddress: TonRawAddress, private storage: Storage) {
    this.state.persist({
      partialize: ({ onboardBannerDismissed, accounts }) => ({
        onboardBannerDismissed,
        accounts,
      }),
      storage: this.storage,
      key: `${tonRawAddress}/cards`,
    });
  }

  public async fetchAccounts() {
    this.state.set({ accounts: [], accountsLoading: true });
    const resp = await fetch('https://card-staging.whales-api.com/v2/public/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletKind: 'tonkeeper',
        network: 'ton-testnet',
        address: this.tonRawAddress,
      }),
    });
    const data = await resp.json();
    this.state.set({ accountsLoading: false, accounts: data.accounts });
  }

  public async prefetch() {
    return await this.fetchAccounts();
  }

  public async load() {
    return await this.fetchAccounts();
  }

  public async dismissOnboardBanner() {
    this.state.set({ onboardBannerDismissed: true });
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async clear() {
    return this.state.clear();
  }
}
