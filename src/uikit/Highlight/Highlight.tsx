import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';

import { useTheme } from '$hooks';
import { isAndroid, ns } from '$utils';

import { HighlightProps } from './Highlight.interface';

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
    onPressOut,
  } = props;
  const theme = useTheme();
  const [isHighlighted, setHighlighted] = useState(false);

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
      <TouchableNativeFeedback
        delayPressIn={65}
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
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableHighlight
      delayPressIn={65}
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
    </TouchableHighlight>
  );
});
