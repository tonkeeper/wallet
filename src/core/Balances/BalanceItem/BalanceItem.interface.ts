import { CryptoCurrency } from '$shared/constants';
import { IconNames } from '$uikit/Icon/generated.types';
import { StyleProp, ViewStyle } from 'react-native';

export interface BalanceItemProps {
  currency: CryptoCurrency;
  showActions?: boolean;
  borderStart?: boolean;
  borderEnd?: boolean;
}

export interface ActionButtonProps {
  onPress: () => void;
  isLast?: boolean;
  icon: IconNames;
  iconStyle?: ViewStyle;
}
