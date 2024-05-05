import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { formatter } from '$utils/formatter';
import { useDangerLevel, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { CellItemToRender } from '../content-providers/utils/types';

export type Rate = {
  percent: string;
  price: string;
  trend: string;
};

export const useBalance = (cellItems: CellItemToRender[]) => {
  const currency = useWalletCurrency();
  const { inSelectedCurrency, inTonRaw } = useMemo(
    () =>
      cellItems.reduce(
        (total, item) => {
          const balance = item.fiatRate?.total.raw ?? '0';
          const tonBalance = item.fiatRate?.total.in_ton ?? '0';

          total.inSelectedCurrency = total.inSelectedCurrency.plus(balance);
          total.inTonRaw = total.inTonRaw.plus(tonBalance);

          return total;
        },
        { inSelectedCurrency: new BigNumber(0), inTonRaw: new BigNumber(0) },
      ),
    [cellItems],
  );

  const dangerLevel = useDangerLevel(inTonRaw.toString());

  return useMemo(() => {
    return {
      inSelectedCurrency: formatter.format(inSelectedCurrency.toString(), {
        currency,
        forceRespectDecimalPlaces: true,
        decimals: inSelectedCurrency.gte(1000) ? 0 : 2,
      }),
      dangerLevel,
    };
  }, [currency, dangerLevel, inSelectedCurrency]);
};
