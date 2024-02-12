import { WalletContext, WalletIdentity, WalletNetwork } from '../Wallet';
import { Storage } from '../declarations/Storage';
import { State } from '../utils/State';
import { Address } from '../formatters/Address';
import { config } from '@tonkeeper/shared/config';

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

export const cardsState = new State<CardsState>({
  onboardBannerDismissed: false,
  accounts: [],
  accountsLoading: false,
});

export class CardsManager {
  public state = cardsState;

  constructor(
    private ctx: WalletContext,
    private identity: WalletIdentity,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ onboardBannerDismissed, accounts }) => ({
        onboardBannerDismissed,
        accounts,
      }),
      storage: this.storage,
      key: `cards`,
    });
  }

  public async fetchAccount() {
    this.state.set({ accounts: [], accountsLoading: true });
    const resp = await fetch(`${config.get('holdersService')}/v2/public/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletKind: 'tonkeeper',
        network:
          this.identity.network === WalletNetwork.mainnet ? 'ton-mainnet' : 'ton-testnet',
        // Holder's API works only with user-friendly bounceable address
        address: new Address(this.ctx.address.ton.raw).toString({
          urlSafe: true,
          testOnly: this.identity.network === WalletNetwork.testnet,
          bounceable: true,
        }),
      }),
    });
    const data = await resp.json();
    this.state.set({ accountsLoading: false, accounts: data.accounts });
  }

  public async prefetch() {
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
