import { useTheme } from '$hooks/useTheme';
import React, { memo, useCallback } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface IScrollPositionContext {
  changeEnd: (_: boolean) => void;
  bottomSeparatorStyle: ViewStyle;
}

export const ScrollPositionContext = React.createContext<IScrollPositionContext>({
  bottomSeparatorStyle: {},
  changeEnd: () => {}
});

export const ScrollPositionProvider = memo(({ children }) => {
  const theme = useTheme();
  const isEnd = useSharedValue(0);

  const changeEnd = useCallback((newEnd: boolean) => {
    isEnd.value = newEnd ? 1 : 0;
  }, []);

  const bottomSeparatorStyle = useAnimatedStyle(() => ({
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: interpolateColor(
      isEnd.value,
      [0, 1],
      ['transparent', theme.colors.border],
    ),
  }), [isEnd.value, theme.colors.border]);

  const value = { changeEnd, bottomSeparatorStyle };

  return (
    <ScrollPositionContext.Provider value={value}>
      {children}
    </ScrollPositionContext.Provider>
  );
});
