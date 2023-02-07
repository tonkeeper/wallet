import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { CryptoCurrency, Decimals } from '$shared/constants';
import { walletBalancesSelector } from '$store/wallet';
import { useFiatRate } from '$hooks/useFiatRate';
import { formatAmount, toLocaleNumber } from '$utils';
import { TonThemeColor } from '$styled';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { useTheme } from '$hooks/useTheme';
import { fiatCurrencySelector } from '$store/main';

export function useWalletInfo(currency: CryptoCurrency) {
  const theme = useTheme();
  const balances = useSelector(walletBalancesSelector);
  const fiatRate = useFiatRate(currency);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const amount = useMemo(() => {
    return formatAmount(balances[currency], Decimals[currency]);
  }, [balances, currency]);

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
      return new BigNumber(balances[currency] || 0)
        .multipliedBy(fiatRate.today)
        .toFormat(2, { decimalSeparator: '.', groupSeparator: '' });
    } else {
      return '-';
    }
  }, [balances, currency, fiatRate]);

  const fiatInfo = useMemo(() => {
    let percent = '0.0%';
    let color: TonThemeColor = 'foregroundSecondary';
    let amountResult: string;

    if (+amount > 0) {
      percent = priceDiff === null ? '-' : (+priceDiff > 0 ? '+ ' : '– ') + Math.abs(Number(priceDiff)) + '%';
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
  }, [amount, priceDiff, amountInUsd, theme.colors, fiatCurrency]);

  return {
    amount,
    priceDiff,
    fiatInfo,
  };
}
