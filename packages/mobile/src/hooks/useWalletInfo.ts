import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { CryptoCurrency, Decimals } from '$shared/constants';
import { walletBalancesSelector } from '$store/wallet';
import { formatAmount } from '$utils';
import { useTokenPrice } from './useTokenPrice';

export function useWalletInfo(currency: CryptoCurrency) {
  const balances = useSelector(walletBalancesSelector);

  const amount = useMemo(() => {
    return formatAmount(balances[currency], Decimals[currency]);
  }, [balances, currency]);

  const tokenPrice = useTokenPrice(currency, amount);

  return {
    amount,
    tokenPrice,
  };
}
