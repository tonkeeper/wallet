import { AmountFormatter } from '$libs/AmountFormatter';
import { getNumberFormatSettings } from 'react-native-localize';

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
