import { CryptoCurrencies } from '$shared/constants';
import { useSelector } from 'react-redux';
import { fiatCurrencySelector } from '$store/main';
import { useFiatRate } from '$hooks/useFiatRate';
import { useWalletInfo } from '$hooks';
import { useCallback, useMemo } from 'react';
import { walletSelector } from '$store/wallet';
import { Ton } from '$libs/Ton';
import { useGetPrice } from '$hooks/useWalletInfo';
import BigNumber from 'bignumber.js';
import { formatter } from '$utils/formatter';

export type Rate = {
  percent: string;
  price: string;
  trend: string;
};

// TODO: rewrite
export const useRates = (): Rate => {
  const { fiatInfo } = useWalletInfo(CryptoCurrencies.Ton);

  const fiatCurrency = useSelector(fiatCurrencySelector);

  const fiatPrice = useMemo(() => {
    const price = fiatInfo.fiatRate;

    return formatter.format(price.toFixed(2), {
      ignoreZeroTruncate: true,
      currency: fiatCurrency,
      decimals: 2,
    });
  }, [fiatCurrency, fiatInfo.fiatRate]);

  return {
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    price: fiatPrice,
  };
};

// TODO: rewrite
const useAmountToFiat = () => {
  const fiatRate = useFiatRate(CryptoCurrencies.Ton);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amountToFiat = useCallback(
    (amount: string, fiatAmountToSum?: number) => {
      if (fiatRate && +fiatRate.today > 0) {
        const fiat = new BigNumber(amount)
          .multipliedBy(fiatRate.today)
          .plus(fiatAmountToSum ?? 0);
        return formatter.format(fiat, { currency: fiatCurrency });
      } else {
        return '-';
      }
    },
    [fiatRate, fiatCurrency],
  );

  return amountToFiat;
};

export const useBalance = (tokensTotal: number) => {
  const { oldWalletBalances, balances } = useSelector(walletSelector);
  const amountToFiat = useAmountToFiat();
  const getPrice = useGetPrice();

  const oldVersions = useMemo(() => {
    return oldWalletBalances.reduce((acc, item) => {
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
  }, [oldWalletBalances, amountToFiat]);

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
      const price = getPrice(item.type);

      return {
        type: item.type,
        amount: {
          nano: item.amount,
          formatted: price.amount,
          fiat: price.fiatInfo.amount,
        },
      };
    });
  }, [balances, getPrice]);

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
    const amounts = [ton, ...lockup];

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
  }, [ton, lockup, tokensTotal, amountToFiat]);

  return {
    oldVersions,
    lockup,
    total,
    ton,
  };
};
