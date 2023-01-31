import { StyleProp, ViewStyle } from 'react-native';
import { TonThemeColor } from '$styled';
import React from 'react';

type HighlightBackground = TonThemeColor;

type ChildFn = (isHighlighted: boolean) => React.ReactNode;

export interface HighlightProps {
  /**
   * Use TouchableHighlight from RNGH library
   * Q: Why we can't just use RNGH everywhere?
   * A: Well, now there is an issue with RNGH. 
   * Underlay color "stucks" even after press-out.
   * It's happens because we use delayPressIn
   */
  useRNGHComponent?: boolean;
  onPress?: () => void;
  background?: HighlightBackground;
  highlightColor?: string;
  style?: StyleProp<ViewStyle>;
  contentViewStyle?: StyleProp<ViewStyle>;
  isDisabled?: boolean;
  children?: React.ReactNode | ChildFn;
  onPressIn?: () => void;
  onPressOut?: () => void;

  withDelay?: boolean;
}
