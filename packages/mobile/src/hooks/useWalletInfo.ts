import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';

import { CryptoCurrency, Decimals } from '$shared/constants';
import { walletBalancesSelector } from '$store/wallet';
import { getRate, useFiatRate } from '$hooks/useFiatRate';
import { formatAmount, toLocaleNumber, truncateDecimal } from '$utils';
import { TonThemeColor } from '$styled';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { useTheme } from '$hooks/useTheme';
import { fiatCurrencySelector } from '$store/main';
import { ratesRatesSelector, ratesYesterdayRatesSelector } from '$store/rates';

export function useWalletInfo(currency: CryptoCurrency) {
  const theme = useTheme();
  const balances = useSelector(walletBalancesSelector);
  const fiatRate = useFiatRate(currency);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amount = useMemo(() => {
    return formatAmount(balances[currency], Decimals[currency]);
  }, [balances, currency]);

  const formattedRate = useMemo(() => formatFiatCurrencyAmount(truncateDecimal(fiatRate.today.toString(), 2), fiatCurrency), [fiatCurrency, fiatRate]);

  const priceDiff = useMemo(() => {
    if (fiatRate.yesterday) {
      return (((fiatRate.today - fiatRate.yesterday) / fiatRate.yesterday) * 100).toFixed(
        2,
      );
    } else {
      return null;
    }
  }, [fiatRate]);

  const amountToUsd = useCallback((amount: string | number) => {
    if (fiatRate && +fiatRate.today > 0) {
      return new BigNumber(amount)
        .multipliedBy(fiatRate.today)
        .toFormat(2, { decimalSeparator: '.', groupSeparator: '' });
    } else {
      return '-';
    }
  }, [currency, fiatRate]);

  const amountInUsd = useMemo(() => {
    return amountToUsd(balances[currency] || 0);
  }, [balances, currency, amountToUsd]);

  const fiatInfo = useMemo(() => {
    let percent = '0.0%';
    let color: TonThemeColor = 'foregroundSecondary';
    let trend: 'unknown' | 'positive' | 'negative' = 'unknown';
    let amountResult: string;

    if (+amount > 0) {
      percent = priceDiff === null ? '-' : (+priceDiff > 0 ? '+ ' : '– ') + Math.abs(Number(priceDiff)) + '%';
      if (priceDiff !== null) {
        color = +priceDiff > 0 ? 'accentPositive' : 'accentNegative';
        trend = +priceDiff > 0 ? 'positive' : 'negative';
      }
      amountResult =
        amountInUsd === '-'
          ? amountInUsd
          : formatFiatCurrencyAmount(amountInUsd, fiatCurrency);
    } else {
      amountResult = formatFiatCurrencyAmount('0.00', fiatCurrency);
    }

    percent = toLocaleNumber(percent);

    return {
      percent,
      percentAbs: percent !== '-' ? percent.replace(/[-–]/, '') : percent,
      color,
      trend,
      amount: amountResult,
    };
  }, [amount, priceDiff, amountInUsd, theme.colors, fiatCurrency]);

  return {
    amount,
    priceDiff,
    fiatInfo,
    amountToUsd,
    rate: formattedRate,
  };
}

export function useGetPrice() {
  const balances = useSelector(walletBalancesSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const rates = useSelector(ratesRatesSelector);
  const yesterdayRates = useSelector(ratesYesterdayRatesSelector);

  const getPrice = useCallback((currency: string) => {
    const fiatRate = {
      today: getRate(rates, currency, fiatCurrency),
      yesterday: getRate(yesterdayRates, currency, fiatCurrency),
    };

    const amount = formatAmount(balances[currency], Decimals[currency]);

    const formattedRate = formatFiatCurrencyAmount(truncateDecimal(fiatRate.today.toString(), 2), fiatCurrency);

    let priceDiff: string | null = null;
    if (fiatRate.yesterday) {
      priceDiff = (((fiatRate.today - fiatRate.yesterday) / fiatRate.yesterday) * 100).toFixed(
        2,
      );
    }

    const amountToUsd = (amount: string | number) => {
      if (fiatRate && +fiatRate.today > 0) {
        return new BigNumber(amount)
          .multipliedBy(fiatRate.today)
          .toFormat(2, { decimalSeparator: '.', groupSeparator: '' });
      } else {
        return '-';
      }
    };

    const amountInUsd = amountToUsd(balances[currency] || 0);

    let percent = '0.0%';
    let color: TonThemeColor = 'foregroundSecondary';
    let trend: 'unknown' | 'positive' | 'negative' = 'unknown';
    let amountResult: string;

    if (+amount > 0) {
      percent = priceDiff === null ? '-' : (+priceDiff > 0 ? '+ ' : '– ') + Math.abs(Number(priceDiff)) + '%';
      if (priceDiff !== null) {
        color = +priceDiff > 0 ? 'accentPositive' : 'accentNegative';
        trend = +priceDiff > 0 ? 'positive' : 'negative';
      }
      amountResult =
        amountInUsd === '-'
          ? amountInUsd
          : formatFiatCurrencyAmount(amountInUsd, fiatCurrency);
    } else {
      amountResult = formatFiatCurrencyAmount('0.00', fiatCurrency);
    }

    percent = toLocaleNumber(percent);

    const fiatInfo = {
      percent,
      percentAbs: percent !== '-' ? percent.replace(/[-–]/, '') : percent,
      color,
      trend,
      amount: amountResult,
    };

    return {
      amount,
      priceDiff,
      fiatInfo,
      amountToUsd,
      rate: formattedRate,
    };
  }, [
    balances,
    fiatCurrency,
    rates,
    yesterdayRates
  ]);

  return getPrice;
}