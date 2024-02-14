import { CryptoCurrencies, Decimals } from '$shared/constants';
import { useGetTokenPrice, useTokenPrice } from '$hooks/useTokenPrice';
import { useCallback, useMemo } from 'react';
import { Ton } from '$libs/Ton';
import BigNumber from 'bignumber.js';
import { formatter } from '$utils/formatter';
import { getStakingJettons } from '@tonkeeper/shared/utils/staking';
import { Address } from '@tonkeeper/core';
import {
  useBalancesState,
  useJettons,
  useStakingState,
  useWallet,
  useWalletCurrency,
} from '@tonkeeper/shared/hooks';

export type Rate = {
  percent: string;
  price: string;
  trend: string;
};

// TODO: rewrite
const useAmountToFiat = () => {
  const tonPrice = useTokenPrice(CryptoCurrencies.Ton);
  const fiatCurrency = useWalletCurrency();

  const amountToFiat = useCallback(
    (amount: string, fiatAmountToSum?: number) => {
      if (tonPrice.fiat > 0) {
        const fiat = new BigNumber(amount)
          .multipliedBy(tonPrice.fiat)
          .plus(fiatAmountToSum ?? 0);
        return formatter.format(fiat, { currency: fiatCurrency });
      } else {
        return '-';
      }
    },
    [tonPrice.fiat, fiatCurrency],
  );

  return amountToFiat;
};

const useStakingBalance = () => {
  const _stakingBalance = useStakingState((s) => s.stakingBalance);
  const stakingJettons = useStakingState(getStakingJettons);
  const { jettonBalances } = useJettons();
  const amountToFiat = useAmountToFiat();
  const getTokenPrice = useGetTokenPrice();

  const stakingJettonsBalance = useMemo(() => {
    return jettonBalances
      .filter((item) =>
        stakingJettons.includes(Address.parse(item.jettonAddress).toRaw()),
      )
      .reduce((total, jetton) => {
        return total.plus(getTokenPrice(jetton.jettonAddress, jetton.balance).totalTon);
      }, new BigNumber('0'))
      .decimalPlaces(Decimals[CryptoCurrencies.Ton]);
  }, [getTokenPrice, jettonBalances, stakingJettons]);

  const stakingBalance = useMemo(() => {
    const balance = new BigNumber(_stakingBalance).plus(stakingJettonsBalance).toString();
    const formatted = formatter.format(balance);
    return {
      amount: {
        nano: balance,
        fiat: amountToFiat(balance),
        formatted,
      },
    };
  }, [_stakingBalance, amountToFiat, stakingJettonsBalance]);

  return stakingBalance;
};

export const useBalance = (tokensTotal: number) => {
  const balances = useBalancesState();
  const wallet = useWallet();
  const amountToFiat = useAmountToFiat();

  const stakingBalance = useStakingBalance();

  const lockup = useMemo(() => {
    const lockupList: {
      type: CryptoCurrencies;
      amount: {
        nano: string;
        fiat: string;
        formatted: string;
      };
    }[] = [];

    if (!wallet.isLockup) {
      return lockupList;
    }

    lockupList.push({
      type: CryptoCurrencies.TonRestricted,
      amount: {
        nano: balances.tonRestricted,
        formatted: formatter.format(balances.tonRestricted),
        fiat: amountToFiat(balances.tonRestricted),
      },
    });

    lockupList.push({
      type: CryptoCurrencies.TonLocked,
      amount: {
        nano: balances.tonLocked,
        formatted: formatter.format(balances.tonLocked),
        fiat: amountToFiat(balances.tonLocked),
      },
    });

    return lockupList;
  }, [amountToFiat, balances, wallet.isLockup]);

  const ton = useMemo(() => {
    const formatted = formatter.format(balances.ton);
    return {
      amount: {
        nano: balances.ton,
        fiat: amountToFiat(balances.ton),
        formatted,
      },
    };
  }, [balances, amountToFiat]);

  const total = useMemo(() => {
    const amounts = [ton, stakingBalance, ...lockup];

    const balanceNano = amounts
      .reduce((total, balance) => {
        const nano = Ton.toNano(balance.amount.nano);
        return total.plus(nano);
      }, new BigNumber(0))
      .toString(10);

    const balance = Ton.fromNano(balanceNano);

    return {
      value: balance,
      fiat: amountToFiat(balance, tokensTotal),
    };
  }, [ton, stakingBalance, lockup, amountToFiat, tokensTotal]);

  return useMemo(
    () => ({
      lockup,
      total,
      ton,
      staking: stakingBalance,
    }),
    [lockup, total, ton, stakingBalance],
  );
};
