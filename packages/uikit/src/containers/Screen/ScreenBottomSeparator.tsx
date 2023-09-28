import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScreenScroll } from './hooks';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../styles';
import { memo } from 'react';

export const ScreenBottomSeparator = memo(() => {
  const { isEndReached } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();

  const bottomSeparatorStyle = useAnimatedStyle(() => ({
    // bottom: tabBarHeight,
    height: StyleSheet.hairlineWidth,
    backgroundColor: interpolateColor(
      isEndReached.value,
      [0, 1],
      ['transparent', theme.separatorCommon],
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
