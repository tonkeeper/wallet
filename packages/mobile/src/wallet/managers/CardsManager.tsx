import { Storage, State, Address } from '@tonkeeper/core';
import { config } from '$config';
import { TonRawAddress } from '$wallet/WalletTypes';

export enum CardKind {
  VIRTUAL = 'virtual',
}

export interface AccountCard {
  lastFourDigits?: string | null;
  productId: string;
  personalizationCode: string;
  provider: string;
  kind: string;
}

export interface AccountState {
  id: string;
  address: string;
  state: string;
  name: string;
  balance: string;
  partner: string;
  tzOffset: number;
  cards: AccountCard[];
  contract: string;
  network: 'ton-mainnet' | 'ton-testnet';
}

export interface CardsState {
  onboardBannerDismissed: boolean;
  accounts: AccountState[];
  accountsLoading: boolean;
}

export class CardsManager {
  static readonly INITIAL_STATE: CardsState = {
    onboardBannerDismissed: false,
    accounts: [],
    accountsLoading: false,
  };
  public state = new State<CardsState>(CardsManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private isTestnet: boolean,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ onboardBannerDismissed, accounts }) => ({
        onboardBannerDismissed,
        accounts,
      }),
      storage: this.storage,
      key: `${this.persistPath}/cards`,
    });
  }

  public async fetchAccount() {
    try {
      this.state.set({ accountsLoading: true });
      const resp = await fetch(`${config.get('holdersService')}/v2/public/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletKind: 'tonkeeper',
          network: this.isTestnet ? 'ton-testnet' : 'ton-mainnet',
          // Holder's API works only with user-friendly bounceable address
          address: new Address(this.tonRawAddress).toString({
            urlSafe: true,
            testOnly: this.isTestnet,
            bounceable: true,
          }),
        }),
      });
      const data = await resp.json();
      this.state.set({ accountsLoading: false, accounts: data.accounts });
    } catch {
      this.state.set({ accountsLoading: false });
    }
  }

  public async load() {
    return await this.fetchAccount();
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
