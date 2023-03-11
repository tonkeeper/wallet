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

type BalanceRate = {
  percent: string;
  price: string;
  trend: string;
}

export const useBalance = () => {
  const { amount, fiatInfo, amountToUsd } = useWalletInfo(CryptoCurrencies.Ton);
  const { oldWalletBalances, balances } = useSelector(walletSelector);

  const currency = CryptoCurrencies.Ton;
  const charts = useSelector(ratesChartsSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const rates = useSelector(ratesRatesSelector);

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

  const fiatPrice = useMemo(() => {
    const points = charts['ton'] || [];

    const fiatRate =
      fiatCurrency === FiatCurrencies.Usd
        ? 1
        : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);

    const price = points.length > 0 ? points[points.length - 1].y * fiatRate : 0;

    return formatFiatCurrencyAmount(price.toFixed(2), fiatCurrency);
  }, [charts, fiatCurrency, rates]);
    
  const formattedAmount = useMemo(() => {
    return formatCryptoCurrency(
      amount,
      '',
      Decimals[currencyPrepared],
      2,
      true,
    )
  }, [amount, currencyPrepared]);

  const amountToFiat = useCallback((amount: string) => {
    const amountInUsd = amountToUsd(amount);
    if (+amount > 0) {
      return amountInUsd === '-'
        ? amountInUsd
        : formatFiatCurrencyAmount(amountInUsd, fiatCurrency);
    }

    return formatFiatCurrencyAmount('0.00', fiatCurrency);
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
          value: Ton.fromNano(item.amount),
          formatted: truncateDecimal(Ton.fromNano(item.amount), 2),
          fiat: amountToFiat(Ton.fromNano(item.amount))
        },
        percent: price.fiatInfo.percent,
        price: price.fiatInfo.amount,
        trend: price.fiatInfo.trend
      }
    });
  }, [balances, getPrice]);

  return {
    fiatValue: fiatInfo.amount,
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    formattedAmount,
    fiatPrice,
    amount,
    oldVersions,
    lockup
  };
};
