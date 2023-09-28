import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, TouchableNativeFeedback, TouchableHighlight } from 'react-native';

import { useTheme } from '$hooks/useTheme';
import { isAndroid, ns } from '$utils';

import { HighlightProps } from './Highlight.interface';
import {
  TouchableHighlight as RNGHTouchableHighlight,
  TouchableNativeFeedback as RNGHTouchableFeedback,
} from 'react-native-gesture-handler';

export const Highlight = forwardRef<any, HighlightProps>((props, ref) => {
  const {
    background = 'backgroundTertiary',
    highlightColor,
    onPress,
    style = {},
    children,
    contentViewStyle = {},
    isDisabled = false,
    onPressIn,
    useRNGHComponent = false,
    onPressOut,
  } = props;
  const theme = useTheme();
  const [isHighlighted, setHighlighted] = useState(false);
  const TouchableNativeFeedbackComponent = useMemo(() => useRNGHComponent ? RNGHTouchableFeedback : TouchableNativeFeedback, [useRNGHComponent]);
  const TouchableHighlightComponent = useMemo(() => useRNGHComponent ? RNGHTouchableHighlight : TouchableHighlight, [useRNGHComponent]);


  const preparedStyle = typeof style === 'object' ? [style] : style;

  // @ts-ignore
  preparedStyle.push({
    zIndex: 3,
    marginTop: -ns(0.5),
  });

  const handlePressIn = useCallback(() => {
    setHighlighted(true);
    onPressIn && onPressIn();
  }, [onPressIn]);

  const handlePressOut = useCallback(() => {
    setHighlighted(false);
    onPressOut && onPressOut();
  }, [onPressOut]);

  const content = useMemo(() => {
    if (typeof children === 'function') {
      return children(isHighlighted);
    } else {
      return children;
    }
  }, [children, isHighlighted]);

  const color = highlightColor ?? theme.colors[background];

  if (isAndroid) {
    return (
      <TouchableNativeFeedbackComponent
        delayPressIn={85}
        ref={ref}
        disabled={isDisabled}
        useForeground
        onPress={onPress}
        style={{ overflow: 'hidden' }}
        background={TouchableNativeFeedback.Ripple(color, false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={style}>{content}</View>
      </TouchableNativeFeedbackComponent>
    );
  }

  return (
    <TouchableHighlightComponent
      delayPressIn={useRNGHComponent ? 0 : 85}
      ref={ref}
      disabled={isDisabled}
      style={preparedStyle}
      onPress={onPress}
      activeOpacity={1}
      underlayColor={color}
      onShowUnderlay={handlePressIn}
      onHideUnderlay={handlePressOut}
    >
      <View style={contentViewStyle}>{content}</View>
    </TouchableHighlightComponent>
  );
});
