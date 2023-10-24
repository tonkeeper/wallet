import React, { ReactNode } from 'react';
import { Insets } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

export interface LargeNavBarProps {
  scrollTop: Animated.SharedValue<number>;
  rightContent?: React.ReactNode;
  bottomComponent?: React.ReactNode;
  onPress?: () => void;
  hitSlop?: Insets;
  position?: 'absolute' | 'relative';
  safeArea?: boolean;
  border?: boolean;
  opacity?: SharedValue<number>;
  children: ReactNode;
}
