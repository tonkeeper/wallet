import { CryptoCurrencies } from '$shared/constants';
import { useSelector } from 'react-redux';
import { fiatCurrencySelector } from '$store/main';
import { useFiatRate } from '$hooks/useFiatRate';
import { useGetTokenPrice, useTokenPrice, useWalletInfo } from '$hooks';
import { useCallback, useMemo } from 'react';
import {
  isLockupWalletSelector,
  walletBalancesSelector,
  walletOldBalancesSelector,
  walletVersionSelector,
} from '$store/wallet';
import { Ton } from '$libs/Ton';
import { useGetPrice } from '$hooks/useWalletInfo';
import BigNumber from 'bignumber.js';
import { formatter } from '$utils/formatter';
import { useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';

export type Rate = {
  percent: string;
  price: string;
  trend: string;
};

// TODO: rewrite
const useAmountToFiat = () => {
  const tonPrice = useTokenPrice(CryptoCurrencies.Ton);
  const fiatCurrency = useSelector(fiatCurrencySelector);

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

export const useBalance = (tokensTotal: number) => {
  const balances = useSelector(walletBalancesSelector);
  const walletVersion = useSelector(walletVersionSelector);
  const oldWalletBalances = useSelector(walletOldBalancesSelector);
  const isLockup = useSelector(isLockupWalletSelector);
  const amountToFiat = useAmountToFiat();
  const getTokenPrice = useGetTokenPrice();

  const stakingBalance = useStakingStore((s) => {
    const balance = s.stakingBalance;

    const formatted = formatter.format();
    return {
      amount: {
        nano: balance,
        fiat: amountToFiat(balance),
        formatted,
      },
    };
  }, shallow);

  const oldVersions = useMemo(() => {
    if (isLockup) {
      return [];
    }

    return oldWalletBalances.reduce((acc, item) => {
      if (walletVersion && walletVersion <= item.version) {
        return acc;
      }

      const balance = Ton.fromNano(item.balance);

      acc.push({
        version: item.version,
        amount: {
          value: balance,
          formatted: formatter.format(balance),
          fiat: amountToFiat(balance),
        },
      });

      return acc;
    }, [] as any);
  }, [isLockup, oldWalletBalances, walletVersion, amountToFiat]);

  const lockup = useMemo(() => {
    const lockupList: { type: CryptoCurrencies; amount: string }[] = [];
    const restricted = balances[CryptoCurrencies.TonRestricted];
    const locked = balances[CryptoCurrencies.TonLocked];

    if (restricted) {
      lockupList.push({
        type: CryptoCurrencies.TonRestricted,
        amount: restricted,
      });
    }

    if (locked) {
      lockupList.push({
        type: CryptoCurrencies.TonLocked,
        amount: locked,
      });
    }

    return lockupList.map((item) => {
      const amount = balances[item.type];
      const price = getTokenPrice(item.type, amount);

      return {
        type: item.type,
        amount: {
          nano: item.amount,
          formatted: formatter.format(amount),
          fiat: price.totalFiat,
        },
      };
    });
  }, [balances, getTokenPrice]);

  const ton = useMemo(() => {
    const balance = balances[CryptoCurrencies.Ton] ?? '0';

    const formatted = formatter.format(balance);
    return {
      amount: {
        nano: balance,
        fiat: amountToFiat(balance),
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

  return {
    oldVersions,
    lockup,
    total,
    ton,
  };
};
