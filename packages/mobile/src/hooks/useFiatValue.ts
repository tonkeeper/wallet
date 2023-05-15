import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { CryptoCurrency, Decimals } from '$shared/constants';
import { useFiatRate } from '$hooks/useFiatRate';
import { formatAmount, toLocaleNumber } from '$utils';
import { TonThemeColor } from '$styled';
import { fiatCurrencySelector } from '$store/main';
import { formatter } from '$utils/formatter';

export function useFiatValue(
  currency: CryptoCurrency,
  value: string,
  decimals?: number,
  isJetton?: boolean,
) {
  const fiatRate = useFiatRate(currency, isJetton);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amount = useMemo(() => {
    return formatAmount(value, decimals ?? Decimals[currency]);
  }, [value, currency, decimals]);

  const formattedRate = useMemo(
    () => formatter.format(fiatRate.today.toString(), { currency: fiatCurrency }),
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
          : formatter.format(amountInUsd, { currency: fiatCurrency });
    } else {
      amountResult = formatter.format('0.00', { currency: fiatCurrency });
    }

    percent = toLocaleNumber(percent);

    return {
      avaivable: fiatRate.today > 0,
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
