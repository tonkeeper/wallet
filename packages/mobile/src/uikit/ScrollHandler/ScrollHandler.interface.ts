import { TextProps } from '$uikit/Text/Text';
import { ReactElement, ReactNode } from 'react';
import { Insets } from 'react-native';

export interface ScrollHandlerProps {
  children: ReactElement;
  navBarTitle?: string;
  navBarSubtitle?: string;
  isLargeNavBar?: boolean;
  navBarRight?: ReactNode;
  hideBackButton?: boolean;
  onPress?: () => void;
  hitSlop?: Insets;
  bottomComponent?: ReactNode;
  titleProps?: TextProps;
  subtitleProps?: TextProps;
}
