import React from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export const useTickerAnimation = () => {
  const ticker = useSharedValue(0);
  const start = React.useCallback(({ textWidth, targetWidth }: { 
    textWidth: number;
    targetWidth: number;
  }) => {
    ticker.value = withRepeat(
      withTiming(textWidth - targetWidth, {
        duration: textWidth * 30,
        easing: Easing.linear,
      }),
      Infinity
    );
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ticker.value }]
  }));

  return { textStyle, start };
};