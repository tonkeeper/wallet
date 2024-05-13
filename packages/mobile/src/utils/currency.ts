import { FiatCurrency, FiatCurrencySymbolsConfig } from '$shared/constants';
import BigNumber from 'bignumber.js';
import {
  formatAmount,
  formatInputAmount,
  parseLocaleNumber,
  toLocaleNumber,
  truncateDecimal,
} from './number';
import { getNumberFormatSettings } from 'react-native-localize';
import { WalletCurrency } from '$shared/constants';

export function formatFiatCurrencyAmount(
  amount: any,
  currency: FiatCurrency | WalletCurrency,
  hasThinSpace?: boolean,
  hasNegative?: boolean,
): string {
  const conf = FiatCurrencySymbolsConfig[currency];
  if (!conf) {
    return `${toLocaleNumber(amount)} ${currency?.toUpperCase()}`;
  }

  const maybeNegative = hasNegative ? '− ' : '';
  const maybeThinSpace = hasThinSpace ? ' ' : '';
  if (conf.side === 'start') {
    return `${maybeNegative}${conf.symbol}${maybeThinSpace}${toLocaleNumber(amount)}`;
  } else {
    return `${maybeNegative}${toLocaleNumber(amount)}${maybeThinSpace}${conf.symbol}`;
  }
}

// Formats amount in currency
export function formatCryptoCurrency(
  amount: string,
  currency: string,
  decimals: number,
  decimal?: number,
  withGrouping?: boolean,
): string {
  if (amount) {
    amount = amount.replace(',', '.');

    amount = formatAmount(amount, decimals, withGrouping);

    if (decimal !== undefined) {
      amount = truncateDecimal(amount, decimal);
    }

    if (+amount < 0) {
      amount = `${'− '}${amount.replace('-', '')}`;
    }
  }

  return `${toLocaleNumber(amount)} ${currency?.toUpperCase()}`;
}

export const trimZeroDecimals = (input: string) => {
  const { decimalSeparator } = getNumberFormatSettings();

  const exp = input.split(decimalSeparator);

  return exp[1] && exp[1].split('').every((s) => s === '0') ? exp[0] : input;
};

export const cryptoToFiat = (
  input: string,
  fiatRate: number,
  decimals: number,
  skipFormatting?: boolean,
  calculateFiatFrom: string | number = '0',
) => {
  if (!fiatRate || fiatRate <= 0) {
    return '0';
  }

  const bigNum = new BigNumber(parseLocaleNumber(input) || 0);

  const amount = Math.max(0, bigNum.minus(calculateFiatFrom).toNumber());

  if (amount === 0) {
    return '0';
  }

  const calculated = new BigNumber(amount).multipliedBy(fiatRate);

  const { decimalSeparator, groupingSeparator } = getNumberFormatSettings();

  const formatted = calculated.toFormat(decimals, undefined, {
    decimalSeparator: decimalSeparator,
    groupSeparator: groupingSeparator,
  });

  return formatInputAmount(formatted, decimals, skipFormatting);
};

export const fiatToCrypto = (
  input: string,
  fiatRate: number,
  decimals: number,
  skipFormatting?: boolean,
  calculateFiatFrom: string | number = '0',
) => {
  if (!fiatRate || fiatRate <= 0) {
    return '0';
  }

  const bigNum = new BigNumber(parseLocaleNumber(input) || 0);

  const calculated = bigNum.dividedBy(fiatRate).plus(calculateFiatFrom);

  const { decimalSeparator, groupingSeparator } = getNumberFormatSettings();

  const formatted = calculated.toFormat(decimals, undefined, {
    decimalSeparator: decimalSeparator,
    groupSeparator: groupingSeparator,
  });

  return formatInputAmount(formatted, decimals, skipFormatting);
};
