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

export const useBalance = () => {
  const { amount, fiatInfo, priceDiff, amountToUsd } = useWalletInfo(CryptoCurrencies.Ton);
  const { oldWalletBalances } = useSelector(walletSelector);

  const currency = CryptoCurrencies.Ton;
  const charts = useSelector(ratesChartsSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const rates = useSelector(ratesRatesSelector);

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
  }, []);
    
  const formattedAmount = useMemo(() => {
    return formatCryptoCurrency(
      amount,
      '',
      Decimals[currencyPrepared],
      2,
      true,
    )
  }, []);

  const amountToFiat = useCallback((amount: string) => {
    const amountInUsd = amountToUsd(amount);
    if (+amount > 0) {
      return amountInUsd === '-'
        ? amountInUsd
        : formatFiatCurrencyAmount(amountInUsd, fiatCurrency);
    }

    return formatFiatCurrencyAmount('0.00', fiatCurrency);
  }, [amountToUsd]);

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

  return {
    fiatValue: fiatInfo.amount,
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    formattedAmount,
    fiatPrice,
    amount,
    oldVersions
  };
};
