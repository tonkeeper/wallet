import { DependencyPrototype } from './utils/prototype';
import { tk } from '$wallet';

import { JettonsState } from '$wallet/managers/JettonsManager';
import { FiatRate } from '../utils/types';
import { Address } from '@tonkeeper/core';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';

export class JettonBalancesDependency extends DependencyPrototype<
  JettonsState,
  Pick<JettonsState, 'jettonBalances' | 'jettonRates'>
> {
  constructor() {
    super(tk.wallet.jettons.state, (state) => ({
      jettonBalances: state.jettonBalances,
      jettonRates: state.jettonRates,
    }));
  }

  public getJettonRate(
    jettonAddress: string,
    jettonBalance: string,
    currency: string,
  ): FiatRate | undefined {
    const rate = this.state.jettonRates[Address.parse(jettonAddress).toRaw()];

    if (!rate) {
      return;
    }

    const tonRaw = new BigNumber(jettonBalance).multipliedBy(rate.ton).toString();
    const fiatRaw = new BigNumber(jettonBalance)
      .multipliedBy(rate.fiat)
      .toString()
      .toString();

    const trendVariants = {
      '+': 'positive',
      '-': 'negative',
      default: 'unknown',
    };

    return {
      percent: rate.ton ? rate.diff_24h : undefined,
      price: {
        raw: rate.fiat.toString(),
        formatted: formatter.format(new BigNumber(rate.fiat), {
          currency,
        }),
      },
      trend: trendVariants[rate.diff_24h?.[0]] ?? trendVariants.default,
      totalTon: {
        formatted: formatter.format(tonRaw, {
          currency: 'TON',
        }),
        raw: tonRaw,
      },
      total: {
        formatted: formatter.format(fiatRaw, { currency }),
        raw: fiatRaw,
      },
    };
  }

  setWallet(wallet) {
    this.dataProvider = wallet.jettons.state;
    super.setWallet(wallet);
  }
}
