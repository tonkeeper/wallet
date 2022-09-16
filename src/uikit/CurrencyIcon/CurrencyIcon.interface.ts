import { StyleProp, ViewStyle } from 'react-native';

import { CryptoCurrency } from '$shared/constants';

export interface CurrencyIconProps {
  currency?: CryptoCurrency;
  uri?: string;
  isJetton?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}
