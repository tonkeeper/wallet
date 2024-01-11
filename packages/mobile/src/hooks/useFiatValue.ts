import { useMemo } from 'react';

import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { formatAmount } from '$utils';
import { useTokenPrice } from './useTokenPrice';

export function useFiatValue(
  currency: CryptoCurrency,
  value: string,
  decimals?: number,
  symbol = 'TON',
) {
  const amountDecimals = decimals ?? Decimals[currency];

  const amount = useMemo(() => {
    return formatAmount(value, amountDecimals);
  }, [value, amountDecimals]);

  const tokenPrice = useTokenPrice(
    currency === CryptoCurrencies.Usdt ? 'USDT' : currency,
    amount,
  );

  return {
    symbol,
    decimals: amountDecimals,
    amount,
    ...tokenPrice,
  };
}
