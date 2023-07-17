import { getNumberFormatSettings } from 'react-native-localize';
import { AmountFormatter } from '@tonkeeper/core';

export const formatter = new AmountFormatter({
  getLocaleFormat: () => getNumberFormatSettings(),
  getDefaultDecimals: (amount) => {
    let decimal = 2;
    if (amount.isNegative()) {
      decimal = 2;
    } else if (amount.isEqualTo('0')) {
      decimal = 0;
    } else if (amount.isLessThan('0.0001')) {
      decimal = 8;
    } else if (amount.isLessThan('0.01')) {
      decimal = 4;
    }

    return decimal;
  },
});

export const stakingFormatter = new AmountFormatter({
  getLocaleFormat: () => getNumberFormatSettings(),
  getDefaultDecimals: (amount) => {
    let decimal = 2;
    if (amount.isEqualTo('0')) {
      decimal = 0;
    } else if (amount.isLessThan('100')) {
      decimal = 4;
    }

    return decimal;
  },
});
