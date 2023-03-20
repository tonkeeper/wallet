import { CryptoCurrencies, FiatCurrencies } from '$shared/constants';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import { useSelector } from 'react-redux';
import { fiatCurrencySelector } from '$store/main';
import { getRate, useFiatRate } from '$hooks/useFiatRate';
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
export const useRates = (): { ton: Rate } => {
  const { fiatInfo } = useWalletInfo(CryptoCurrencies.Ton);

  const charts = useSelector(ratesChartsSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const rates = useSelector(ratesRatesSelector);

  const fiatPrice = useMemo(() => {
    const points = charts['ton'] || [];

    const fiatRate =
      fiatCurrency === FiatCurrencies.Usd
        ? 1
        : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);

    const price = points.length > 0 ? points[points.length - 1].y * fiatRate : 0;
    
    return formatter.format(price.toFixed(2), {
      ignoreZeroTruncate: true,
      currency: fiatCurrency,
      decimals: 2,
    });
  }, [charts, fiatCurrency, rates]);

  const ton = {
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    price: fiatPrice,
  };

  return { ton };
};

// TODO: rewrite
const useAmountToFiat = () => {
  const fiatRate = useFiatRate(CryptoCurrencies.Ton);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amountToFiat = useCallback((amount: string) => {
    if (fiatRate && +fiatRate.today > 0) {
      const fiat = new BigNumber(amount).multipliedBy(fiatRate.today);
      return formatter.format(fiat, { currency: fiatCurrency });
    } else {
      return '-';
    }
  }, [fiatRate, fiatCurrency]);

  return amountToFiat;
}

export const useBalance = () => {
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

    const balanceNano = amounts.reduce((total, balance) => {
      const nano = Ton.toNano(balance.amount.nano);
      return total.plus(nano);
    }, new BigNumber(0)).toString(10);

    const balance = Ton.fromNano(balanceNano);

    return {
      value: balance,
      fiat: amountToFiat(balance),
    };
  }, [amountToFiat, ton, lockup]);

  return {
    oldVersions,
    lockup,
    total,
    ton,
  };
};
