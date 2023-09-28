import React, { memo } from 'react';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useScreenScroll } from './context/ScreenScrollContext';
import { StyleSheet } from 'react-native';
import { useTheme } from '$hooks/useTheme';

export const ScreenBottomSeparator = memo(() => {
  const { isEndReached } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();

  const bottomSeparatorStyle = useAnimatedStyle(() => ({
    bottom: tabBarHeight,
    height: StyleSheet.hairlineWidth,
    backgroundColor: interpolateColor(
      isEndReached.value,
      [0, 1],
      ['transparent', theme.colors.border],
    ),
  }));

  if (tabBarHeight > 0) {
    return <Animated.View style={[styles.separator, bottomSeparatorStyle]} />;
  }

  return null;
});

const styles = StyleSheet.create({
  separator: {
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    right: 0,
    left: 0,
  },
});
