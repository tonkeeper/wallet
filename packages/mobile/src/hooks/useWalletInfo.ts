import { useMemo } from 'react';

import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatAmount } from '$utils';
import { useTokenPrice } from './useTokenPrice';
import { useBalancesState } from '@tonkeeper/shared/hooks';

export function useWalletInfo() {
  const balances = useBalancesState();

  const amount = useMemo(() => {
    return formatAmount(balances.ton, Decimals[CryptoCurrencies.Ton]);
  }, [balances]);

  const tokenPrice = useTokenPrice(CryptoCurrencies.Ton, amount);

  return {
    amount,
    tokenPrice,
  };
}
