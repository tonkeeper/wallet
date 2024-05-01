import { DependencyPrototype } from './utils/prototype';
import { PricesState } from '$wallet/managers/TonPriceManager';
import { FiatRate } from '../utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import BigNumber from 'bignumber.js';
import { State } from '@tonkeeper/core';

export class TonPriceDependency extends DependencyPrototype<
  PricesState,
  Pick<PricesState, 'ton' | 'currency'>
> {
  constructor(state: State<PricesState>) {
    super(state, (state) => ({ ton: state.ton, currency: state.currency }));
  }

  protected shouldEmit(
    prev: Pick<PricesState, 'ton' | 'currency'>,
    cur: Pick<PricesState, 'ton' | 'currency'>,
  ) {
    return prev.ton !== cur.ton;
  }

  public getRawTotal(balance: string): string {
    return new BigNumber(balance).multipliedBy(this.state.ton.fiat).toString();
  }

  public getFiatRate(balance: string): FiatRate | undefined {
    const rate = this.state;

    return {
      percent: rate.ton ? rate.ton.diff_24h : undefined,
      price: {
        raw: rate.ton.fiat.toString(),
        formatted: formatter.format(new BigNumber(rate.ton.fiat), {
          currency: rate.currency,
        }),
      },
      trend:
        rate.ton.diff_24h.startsWith('+') || rate.ton.diff_24h === '0'
          ? 'positive'
          : 'negative',
      total: {
        in_ton: balance,
        formatted: formatter.format(new BigNumber(balance).multipliedBy(rate.ton.fiat), {
          currency: rate.currency,
        }),
        raw: this.getRawTotal(balance),
      },
    };
  }
}
