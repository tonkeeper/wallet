import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { formatter } from '$utils/formatter';
import { useWalletCurrency } from '@tonkeeper/shared/hooks';
import { CellItemToRender } from '../content-providers/utils/types';

export type Rate = {
  percent: string;
  price: string;
  trend: string;
};

export const useBalance = (cellItems: CellItemToRender[]) => {
  const currency = useWalletCurrency();

  return useMemo(() => {
    const totalNumber = cellItems.reduce((total, item) => {
      const balance = item.fiatRate?.total.raw ?? '0';
      return total.plus(balance);
    }, new BigNumber(0));

    return formatter.format(totalNumber.toString(), {
      currency,
      forceRespectDecimalPlaces: true,
      decimals: totalNumber.gte(1000) ? 0 : 2,
    });
  }, [cellItems, currency]);
};
