import { CryptoCurrencies, Decimals, FiatCurrencies } from '$shared/constants';
import { formatCryptoCurrency, formatFiatCurrencyAmount } from '$utils/currency';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import { useSelector } from 'react-redux';
import { fiatCurrencySelector } from '$store/main';
import { getRate } from '$hooks/useFiatRate';
import { useWalletInfo } from '$hooks';
import { useCallback, useMemo } from 'react';
import { walletSelector } from '$store/wallet';
import { truncateDecimal } from '$utils';
import { Ton } from '$libs/Ton';
import { useGetPrice } from '$hooks/useWalletInfo';
import BigNumber from 'bignumber.js';

type Rate = {
  percent: string;
  price: string;
  trend: string;
}


export const useRates = () => {
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

    return formatFiatCurrencyAmount(price.toFixed(2), fiatCurrency, true);
  }, [charts, fiatCurrency, rates]);

  const ton = {
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    price: fiatPrice,
  };

  return { ton };
}

export const useBalance = () => {
  const { amountToUsd } = useWalletInfo(CryptoCurrencies.Ton);
  const { oldWalletBalances, balances } = useSelector(walletSelector);

  const currency = CryptoCurrencies.Ton;
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const getPrice = useGetPrice();

  const currencyPrepared = useMemo(() => {
    let result = currency;
    if (
      [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
    ) {
      result = CryptoCurrencies.Ton;
    }

    return result;
  }, [currency]);
    
  const amountToFiat = useCallback((amount: string) => {
    const amountInUsd = amountToUsd(amount);
    if (+amount > 0) {
      return amountInUsd === '-'
        ? amountInUsd
        : formatFiatCurrencyAmount(amountInUsd, fiatCurrency, true);
    } else {
      return formatFiatCurrencyAmount(amountInUsd.replace('-', ''), fiatCurrency, true, true);
    }
  }, [amountToUsd, fiatCurrency]);

  const oldVersions = useMemo(() => {
    return oldWalletBalances.reduce((acc, item) => {
      acc.push({
        version: item.version,
        amount: {
          value: Ton.fromNano(item.balance),
          formatted: truncateDecimal(Ton.fromNano(item.balance), 2),
          fiat: amountToFiat(Ton.fromNano(item.balance))
        },
      });

      return acc;
    }, [] as any);
  }, [oldWalletBalances]);

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
        amount: locked
      });
    }

    return lockupList.map((item) => {
      const price = getPrice(item.type);

      return {
        type: item.type,
        amount: {
          nano: item.amount,
          formatted: price.amount,
          fiat: price.fiatInfo.amount
        },
      }
    });
  }, [balances, getPrice]);

  const ton = useMemo(() => {
    const balance = balances[CryptoCurrencies.Ton];

    return {
      amount: { 
        nano: balance,
        fiat: amountToFiat(balance),
        formatted: formatCryptoCurrency(
          balance,
          '',
          Decimals[currencyPrepared],
          2,
          true,
        )
      }
    };
  }, [balances, currencyPrepared, amountToFiat]);

  const total = useMemo(() => {
    const amounts = [
      ton,
      ...lockup
    ];

    const balanceNano = amounts.reduce((total, balance) => {
      const nano = Ton.toNano(balance.amount.nano);
      return total.plus(nano);
    }, new BigNumber(0)).toString();

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
