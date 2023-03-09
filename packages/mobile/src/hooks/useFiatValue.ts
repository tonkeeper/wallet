import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { CryptoCurrency, Decimals } from '$shared/constants';
import { useFiatRate } from '$hooks/useFiatRate';
import { formatAmount, toLocaleNumber, truncateDecimal } from '$utils';
import { TonThemeColor } from '$styled';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { fiatCurrencySelector } from '$store/main';

export function useFiatValue(currency: CryptoCurrency, value: string) {
  const fiatRate = useFiatRate(currency);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amount = useMemo(() => {
    return formatAmount(value, Decimals[currency]);
  }, [value, currency]);

  const formattedRate = useMemo(
    () =>
      formatFiatCurrencyAmount(
        truncateDecimal(fiatRate.today.toString(), 2),
        fiatCurrency,
      ),
    [fiatCurrency, fiatRate],
  );

  const priceDiff = useMemo(() => {
    if (fiatRate.yesterday) {
      return (((fiatRate.today - fiatRate.yesterday) / fiatRate.yesterday) * 100).toFixed(
        2,
      );
    } else {
      return null;
    }
  }, [fiatRate]);

  const amountInUsd = useMemo(() => {
    if (fiatRate && +fiatRate.today > 0) {
      return new BigNumber(value || 0)
        .multipliedBy(fiatRate.today)
        .toFormat(2, { decimalSeparator: '.', groupSeparator: '' });
    } else {
      return '-';
    }
  }, [value, fiatRate]);

  const fiatInfo = useMemo(() => {
    let percent = '0.0%';
    let color: TonThemeColor = 'foregroundSecondary';
    let amountResult: string;

    if (+amount > 0) {
      percent =
        priceDiff === null
          ? '-'
          : (+priceDiff > 0 ? '+ ' : '– ') + Math.abs(Number(priceDiff)) + '%';
      if (priceDiff !== null) {
        color = +priceDiff > 0 ? 'accentPositive' : 'accentNegative';
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
      amount: amountResult,
    };
  }, [amount, priceDiff, amountInUsd, fiatCurrency]);

  return {
    amount,
    priceDiff,
    fiatInfo,
    rate: formattedRate,
  };
}
