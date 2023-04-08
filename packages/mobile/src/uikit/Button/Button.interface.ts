import { ReactElement } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { fontKeys } from '$styled';

export interface ButtonProps {
  size?: 'small' | 'large' | 'navbar_small' | 'navbar_icon' | 'large_rounded' | 'medium_rounded';
  mode?: 'secondary' | 'primary' | 'primary_red' | 'tertiary' | 'light';
  titleFont?: fontKeys;
  children?: React.ReactNode;
  indent?: boolean;
  before?: ((opts: { isPressed: boolean }) => ReactElement) | ReactElement;
  after?: ((opts: { isPressed: boolean }) => ReactElement) | ReactElement;
  style?: StyleProp<ViewStyle>;
  withoutTextPadding?: boolean;
  withoutFixedHeight?: boolean;
  onPress?: any;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  inverted?: boolean; // pass true if button inside list cell
}
