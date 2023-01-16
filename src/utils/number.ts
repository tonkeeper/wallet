import BigNumber from 'bignumber.js';
import { getNumberFormatSettings } from 'react-native-localize';
import * as _ from 'lodash';

export const NUMBER_DIVIDER = ' ';

export const getLocaleDecimalSeparator = () => {
  const { decimalSeparator } = getNumberFormatSettings();
  return decimalSeparator === ',' ? ',' : '.';
};

export function parseLocaleNumber(stringNumber: string) {
  const { decimalSeparator, groupingSeparator } = getNumberFormatSettings();
  return stringNumber
    .replace(groupingSeparator, '')
    .replace(new RegExp(`\\${NUMBER_DIVIDER}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.');
}

export function toLocaleNumber(value: string) {
  const { decimalSeparator } = getNumberFormatSettings();

  if (decimalSeparator === ',') {
    return `${value}`.replace('.', ',');
  } else {
    return value;
  }
}

export function formatInputAmount(raw: string, decimals: number) {
  // replace dots to commas
  raw = raw.replace(/\,/g, '.');
  // remove non-numeric charsets
  raw = raw.replace(/[^0-9\.]/g, '');
  // allow only one leading zero
  raw = raw.replace(/^([0]+)/, '0');
  // prepend zero before leading comma
  raw = raw.replace(/^([\.]+)/, '0.');

  if (raw.substr(0, 1) === '0' && raw.substr(1, 1) !== '.' && raw.length > 1) {
    raw = raw.substr(1);
  }

  // allow only one comma
  let commaFound = false;
  raw = raw.replace(/\./g, () => {
    if (!commaFound) {
      commaFound = true;
      return '.';
    } else {
      return '';
    }
  });

  // apply length limitations
  const exp = raw.split('.');
  exp[0] = exp[0].substr(0, 8).replace(/\B(?=(\d{3})+(?!\d))/g, NUMBER_DIVIDER);
  if (exp[1]) {
    exp[1] = exp[1].substr(0, decimals);
  }

  return toLocaleNumber(exp.join('.'));
}

export function formatAmount(amount: string, decimals: number, withGrouping?: boolean) {
  const bn = new BigNumber(amount ?? 0).decimalPlaces(decimals, BigNumber.ROUND_DOWN);
  let number = bn.toString();

  if (withGrouping) {
    number = new BigNumber(number).toFormat({
      groupSeparator: NUMBER_DIVIDER,
      groupSize: 3,
      decimalSeparator: '.',
    });
  }

  return number;
}

export function formatAmountAndLocalize(amount: string, decimals: number) {
  return toLocaleNumber(formatAmount(amount, decimals));
}

export function toNano(amount: number | string, decimals?: number) {
  let bn = new BigNumber(amount ?? 0);
  if (decimals) {
    bn = bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN);
  }
  return bn.shiftedBy(decimals ?? 8).toString(10);
}

export function fromNano(amount: number | string, decimals: number) {
  return new BigNumber(amount ?? 0)
    .shiftedBy(-decimals)
    .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    .toString(10);
}

export function truncateDecimal(
  nonLocalizedValue: string,
  decimal: number,
  ignoreLocaleSeparator = false,
  withGrouping = false,
): string {
  if (nonLocalizedValue === null || nonLocalizedValue === undefined) {
    return '?';
  }
  const comps = nonLocalizedValue.split('.');
  let intPart = comps[0];
  const fractionPart = comps[1];
  let zeroOffset = 0;

  if (withGrouping) {
    intPart = formatAmount(intPart, 0, true);
  }

  if (!fractionPart) {
    return intPart;
  }

  while (fractionPart[zeroOffset] === '0') {
    zeroOffset++;
  }

  const separator = !ignoreLocaleSeparator ? getLocaleDecimalSeparator() : '.';

  return intPart + separator + fractionPart.substring(0, zeroOffset + decimal);
}

export function fuzzifyNumber(input: string): number {
  const r = _.random(-1, 1, true);
  const multiplier = Math.pow(2, r);
  const res = new BigNumber(input).multipliedBy(multiplier).toPrecision(2);
  return new BigNumber(res).toNumber();
}
