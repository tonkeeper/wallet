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

export interface AccountKeyParam {
  kind: 'tonconnect-v2';
  wallet: 'tonkeeper';
  config: {
    address: string;
    proof: {
      timestamp: number;
      domain: {
        lengthBytes: number;
        value: string;
      };
      signature: string;
      payload: string;
      publicKey: string;
      walletStateInit: string;
    };
  };
}

export enum HoldersAccountState {
  NeedEnrollment = 'need-enrollment',
  NeedPhone = 'need-phone',
  NoRef = 'no-ref',
  NeedKyc = 'need-kyc',
  NeedEmail = 'need-email',
  Ok = 'ok',
}

export type IAccountState =
  | {
      state: HoldersAccountState.NeedPhone | HoldersAccountState.NoRef;
      suspended?: boolean;
    }
  | {
      state: HoldersAccountState.NeedKyc;
      kycStatus: any;
      notificationSettings: {
        enabled: boolean;
      };
      suspended: boolean;
    }
  | {
      state:
        | HoldersAccountState.Ok
        | HoldersAccountState.NeedEmail
        | HoldersAccountState.NeedPhone;
      notificationSettings: {
        enabled: boolean;
      };
      suspended: boolean;
    };

export interface CardsState {
  onboardBannerDismissed: boolean;
  accounts: AccountState[];
  token?: string;
  accountsLoading: boolean;
  accountState?: IAccountState;
  accountStateLoading: boolean;
  accountsPrivate: any;
  accountsPrivateLoading: boolean;
}

export class CardsManager {
  static readonly INITIAL_STATE: CardsState = {
    onboardBannerDismissed: false,
    accounts: [],
    accountsLoading: false,
    accountStateLoading: false,
    accountsPrivate: null,
    accountsPrivateLoading: false,
  };
  public state = new State<CardsState>(CardsManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private isTestnet: boolean,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({
        onboardBannerDismissed,
        accounts,
        accountState,
        accountsPrivate,
        token,
      }) => ({
        onboardBannerDismissed,
        accounts,
        token,
        accountState,
        accountsPrivate,
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

  public async fetchAccountState() {
    try {
      if (!this.state.data.token) {
        return null;
      }

      this.state.set({ accountStateLoading: true });
      const resp = await fetch(`${config.get('holdersService')}/account/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.state.data.token,
        }),
      });

      const data = await resp.json();
      this.state.set({ accountStateLoading: false, accountState: data.state });
    } catch {
      this.state.set({ accountsLoading: false });
    }
  }

  public async fetchToken(key: AccountKeyParam) {
    try {
      const requestParams = {
        stack: 'ton',
        network: this.isTestnet ? 'ton-testnet' : 'ton-mainnet',
        key,
      };
      const resp = await fetch(`${config.get('holdersService')}/v2/user/wallet/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParams),
      });
      const data = await resp.json();
      if (!data.ok) {
        return null;
      }
      this.state.set({ token: data.token });
      return data.token;
    } catch {
      return null;
    }
  }

  public async fetchAccountsPrivate() {
    try {
      if (!this.state.data.token) {
        return null;
      }
      this.state.set({ accountsPrivateLoading: true });
      const resp = await fetch(`${config.get('holdersService')}/v2/account/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.state.data.token,
        }),
      });
      const data = await resp.json();

      if (!data.ok) {
        this.state.set({ accountsPrivateLoading: false, accountsPrivate: undefined });
        return null;
      }
      this.state.set({ accountsPrivateLoading: false, accountsPrivate: data.list });
    } catch {
      this.state.set({ accountsPrivateLoading: false });
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
