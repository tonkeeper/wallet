import { TonRawAddress } from '../WalletTypes';
import { Storage } from '../declarations/Storage';
import { network } from '../utils/network';

export class SubscriptionsManager {
  constructor(
    private address: TonRawAddress,
    private tonkeeperApi: any,
    private storage: Storage,
  ) {}

  public async fetch() {
    const { data: subscriptions } = await network.get<Subscriptions>(
      `https://api.tonkeeper.com/v1/subscriptions`,
      {
        params: { address: this.address },
      },
    );

    Object.values(subscriptions.data).map((subscription) => {
      // this.ctx.queryClient.setQueryData(
      //   ['subscription', subscription.subscriptionAddress],
      //   subscription,
      // );
    });

    return subscriptions.data;
  }

  public async preload() {}

  public getCachedByAddress(subscriptionAddress: string) {
    // const subscription = this.ctx.queryClient.getQueryData<Subscription>([
    //   'subscription',
    //   subscriptionAddress,
    // ]);

    // if (subscription) {
    //   return subscription;
    // }

    return null;
  }

  public async prefetch() {
    // return this.ctx.queryClient.fetchQuery({
    //   queryFn: () => this.fetch(),
    //   queryKey: this.cacheKey,
    //   staleTime: Infinity,
    // });
  }

  public async refetch() {
    // return this.ctx.queryClient.refetchQueries({
    //   queryKey: this.cacheKey,
    // });
  }
}

export type Subscriptions = { data: { [key: string]: Subscription } };

export type Subscription = {
  address: string;
  amountNano: string;
  chargedAt: number;
  fee: string;
  id: string;
  intervalSec: number;
  isActive: boolean;
  merchantName: string;
  merchantPhoto: string;
  productName: string;
  returnUrl: string;
  status: string;
  subscriptionAddress: string;
  subscriptionId: number;
  userReturnUrl: string;
};
