import React from 'react';
import Animated from 'react-native-reanimated';

export interface PopupSelectProps<T> {
  items: T[];
  selected?: T;
  children: React.ReactElement;
  width?: number;
  autoWidth?: boolean;
  minWidth?: boolean;
  scrollY?: Animated.SharedValue<number>;
  onChange: (item: T) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

export interface PopupSelectItemProps {
  children?: React.ReactNode;
  value: any;
  onPress?: (value: any) => void;
  checked?: boolean;
  autoWidth?: boolean;
  onChangeWidth?: (width: number) => void;
}
