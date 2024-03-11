import { ReactNode } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import { TextProps } from '../Text/Text';

export interface NavBarProps {
  children?: ReactNode;
  subtitle?: ReactNode;
  isModal?: boolean;
  title?: string | React.ReactNode;
  rightContent?: ReactNode;
  subtitleProps?: TextProps;
  hideBackButton?: boolean;
  hideTitle?: boolean;
  forceBigTitle?: boolean;
  isClosedButton?: boolean;
  isBottomButton?: boolean;
  onBackPress?: () => void;
  onClosePress?: () => void;
  onGoBack?: () => void;
  isTransparent?: boolean;
  isForceBackIcon?: boolean;
  isCancelButton?: boolean;
  withBackground?: boolean;
  scrollTop?: SharedValue<number>;
  titleProps?: TextProps;
  fillBackground?: boolean;
  innerAnimatedStyle?: ViewStyle;
}
