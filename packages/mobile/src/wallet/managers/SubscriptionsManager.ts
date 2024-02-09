import { network } from '@tonkeeper/core/src/utils/network';
import { TonRawAddress } from '../WalletTypes';
import { State, Storage } from '@tonkeeper/core';
import { config } from '$config';

export interface Subscription {
  id?: string;
  productName: string;
  channelTgId: string;
  amountNano: string;
  intervalSec: number;
  address: string;
  status: string;
  merchantName: string;
  merchantPhoto: string;
  returnUrl: string;
  subscriptionId: number;
  subscriptionAddress: string;
  isActive?: boolean;
  chargedAt: number;
  fee: string;
  userReturnUrl: string;
}

export type Subscriptions = { [k: string]: Subscription };

export interface SubscriptionsState {
  subscriptions: Subscriptions;
  isLoading: boolean;
}

export interface SubscriptionsResponse {
  data: Subscriptions;
}

export class SubscriptionsManager {
  constructor(private tonRawAddress: TonRawAddress, private storage: Storage) {
    this.state.persist({
      partialize: ({ subscriptions }) => ({
        subscriptions,
      }),
      storage: this.storage,
      key: `${this.tonRawAddress}/subscriptions`,
    });
  }

  static readonly INITIAL_STATE: SubscriptionsState = {
    subscriptions: {},
    isLoading: false,
  };

  public state = new State<SubscriptionsState>(SubscriptionsManager.INITIAL_STATE);

  public async load() {
    this.state.set({ isLoading: true });
    const { data: subscriptions } = await network.get<SubscriptionsResponse>(
      `${config.get('subscriptionsHost')}/v1/subscriptions`,
      {
        params: { address: this.tonRawAddress },
      },
    );
    this.state.set({ isLoading: false, subscriptions: subscriptions.data });
  }

  public async reload() {
    await this.load();
  }

  public reset() {
    this.state.set(SubscriptionsManager.INITIAL_STATE);
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
