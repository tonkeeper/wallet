import { ReactNode } from 'react';
import { AnimateProps, SharedValue } from 'react-native-reanimated';
import { TextProps } from 'react-native';

export interface NavBarProps {
  isModal?: boolean;
  rightContent?: ReactNode;
  hideBackButton?: boolean;
  hideTitle?: boolean;
  isClosedButton?: boolean;
  isBottomButton?: boolean;
  onBackPress?: () => void;
  onGoBack?: () => void;
  isTransparent?: boolean;
  isForceBackIcon?: boolean;
  isCancelButton?: boolean;
  withBackground?: boolean;
  scrollTop?: SharedValue<number>;
  titleProps?: AnimateProps<TextProps>;
}
