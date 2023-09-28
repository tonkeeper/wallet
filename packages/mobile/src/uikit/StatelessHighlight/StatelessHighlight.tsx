import React, { forwardRef } from 'react';
import { TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';

import { useTheme } from '$hooks/useTheme';
import { isAndroid, ns } from '$utils';

import { HighlightProps } from '../Highlight/Highlight.interface';

export const StatelessHighlight = forwardRef<any, HighlightProps>((props, ref) => {
  const {
    background = 'backgroundTertiary',
    highlightColor,
    onPress,
    style = {},
    children,
    contentViewStyle = {},
    isDisabled = false,
    withDelay = true,
  } = props;
  const theme = useTheme();

  const preparedStyle = typeof style === 'object' ? [style] : style;

  // @ts-ignore
  preparedStyle.push({
    zIndex: 3,
    marginTop: -ns(0.5),
  });

  const color = highlightColor ?? theme.colors[background];

  if (isAndroid) {
    return (
      <TouchableNativeFeedback
        delayPressIn={withDelay ? 65 : 0}
        ref={ref}
        disabled={isDisabled}
        useForeground
        onPress={onPress}
        style={{ overflow: 'hidden' }}
        background={TouchableNativeFeedback.Ripple(color, false)}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableHighlight
      delayPressIn={withDelay ? 65 : 0}
      ref={ref}
      disabled={isDisabled}
      style={preparedStyle}
      onPress={onPress}
      activeOpacity={1}
      underlayColor={color}
    >
      <View style={contentViewStyle}>{children}</View>
    </TouchableHighlight>
  );
});
