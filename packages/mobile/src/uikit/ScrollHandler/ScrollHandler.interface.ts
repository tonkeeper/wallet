import { ReactElement, ReactNode } from 'react';
import { Insets } from 'react-native';

export interface ScrollHandlerProps {
  children: ReactElement;
  navBarTitle?: string;
  isLargeNavBar?: boolean;
  navBarRight?: ReactNode;
  hideBackButton?: boolean;
  onPress?: () => void;
  hitSlop?: Insets;
  bottomComponent?: ReactNode;
}
