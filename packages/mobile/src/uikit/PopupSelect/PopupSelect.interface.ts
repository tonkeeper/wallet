import React from 'react';
import Animated from 'react-native-reanimated';
import { AnchorPosition } from './usePopupAnimation';
import { IconProps } from '$uikit/Icon/Icon';

export interface PopupSelectProps<T> {
  items: T[];
  selected?: T;
  children: React.ReactElement;
  width?: number;
  autoWidth?: boolean;
  minWidth?: boolean;
  maxHeight?: number;
  scrollY?: Animated.SharedValue<number>;
  anchor?: AnchorPosition;
  top?: number;
  asFullWindowOverlay?: boolean;
  onChange: (item: T) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

export interface PopupSelectItemProps {
  children?: React.ReactNode;
  icon?: IconProps['name'];
  value: any;
  onPress?: (value: any) => void;
  checked?: boolean;
  autoWidth?: boolean;
  onChangeWidth?: (width: number) => void;
}
