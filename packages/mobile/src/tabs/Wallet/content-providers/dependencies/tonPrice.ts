import { DependencyPrototype } from './utils/prototype';
import { PricesState } from '$wallet/managers/TonPriceManager';
import { tk } from '$wallet';
import { FiatRate } from '../utils/types';
import { formatter } from '@tonkeeper/shared/formatter';
import BigNumber from 'bignumber.js';

export class TonPriceDependency extends DependencyPrototype<
  PricesState,
  Pick<PricesState, 'ton' | 'currency'>
> {
  constructor() {
    super(tk.tonPrice.state, (state) => ({ ton: state.ton, currency: state.currency }));
  }

  protected shouldEmit(
    prev: Pick<PricesState, 'ton' | 'currency'>,
    cur: Pick<PricesState, 'ton' | 'currency'>,
  ) {
    return prev.ton !== cur.ton;
  }

  setWallet(wallet) {
    this.dataProvider = wallet.tonPrice.state;
    super.setWallet(wallet);
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
      totalTon: {
        raw: balance,
        formatted: formatter.format(balance, { currency: 'TON' }),
      },
      total: {
        formatted: formatter.format(new BigNumber(balance).multipliedBy(rate.ton.fiat), {
          currency: rate.currency,
        }),
        raw: this.getRawTotal(balance),
      },
    };
  }
}
