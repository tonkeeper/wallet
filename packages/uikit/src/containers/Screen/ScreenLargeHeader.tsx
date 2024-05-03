import {
  ScreenHeaderHeight,
  ScreenLargeHeaderDistance,
  ScreenLargeHeaderHeight,
} from './utils/constants';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
  Extrapolate,
} from 'react-native-reanimated';
import { TouchableOpacity, Insets, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deviceHeight, deviceWidth, ns } from '../../utils';
import React, { memo, useEffect, useLayoutEffect } from 'react';
import { Text } from '../../components/Text';
import { useScreenScroll } from './hooks';
import { useTheme } from '../../styles';

interface ScreenLargeHeaderProps {
  rightContent?: React.ReactNode;
  title: string;
  onPress?: () => void;
  hitSlop?: Insets;
  position?: 'absolute' | 'relative';
  safeArea?: boolean;
  border?: boolean;
  opacity?: SharedValue<number>;
  alternateBackground?: boolean;
}

export const ScreenLargeHeader = memo<ScreenLargeHeaderProps>((props) => {
  const {
    title,
    rightContent,
    onPress,
    hitSlop,
    position = 'absolute',
    safeArea = true,
    border = true,
    opacity,
    alternateBackground,
  } = props;

  const { scrollY, headerEjectionPoint } = useScreenScroll();
  const { top: topInset } = useSafeAreaInsets();
  const theme = useTheme();

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollY.value > 0 ? 1 : 0,
    };
  });

  const largeWrapStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          scrollY.value > 0
            ? -Math.min(scrollY.value, ScreenLargeHeaderDistance)
            : position === 'absolute'
            ? -scrollY.value
            : 0,
      },
    ],
    opacity: opacity ? opacity.value : 1,
  }));

  const largeTitleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -deviceWidth / 2,
      },
      {
        scale: interpolate(Math.min(0, scrollY.value), [0, -deviceHeight / 2], [1, 1.3]),
      },
      {
        translateX: deviceWidth / 2,
      },
    ],
    opacity: interpolate(
      Math.max(0, Math.min(scrollY.value, ScreenLargeHeaderDistance)),
      [0, ScreenLargeHeaderDistance * 0.5, ScreenLargeHeaderDistance],
      [1, 0, 0],
    ),
  }));

  const smallWrapStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            Math.min(Math.max(0, scrollY.value), ScreenLargeHeaderDistance),
            [0, ScreenLargeHeaderDistance],
            [ScreenLargeHeaderDistance, 0],
          ),
        },
      ],
      zIndex: scrollY.value > ScreenLargeHeaderDistance ? 5 : 1,
      opacity: interpolate(
        Math.max(0, Math.min(scrollY.value, ScreenLargeHeaderDistance)),
        [0, ScreenLargeHeaderDistance * 0.5, ScreenLargeHeaderDistance],
        [0, 0, 1],
      ),
    };
  });

  const smallTitleStyle = useAnimatedStyle(() => ({
    opacity: opacity ? opacity.value : 1,
  }));

  const dividerStyle = useAnimatedStyle(() => {
    if (!border || scrollY.value < ScreenLargeHeaderDistance + 1) {
      return {
        opacity: 0,
      };
    }

    return {
      opacity: opacity ? opacity.value : 1,
      backgroundColor: theme.separatorCommon,
    };
  });

  const ejectionOpacityStyle = useAnimatedStyle(() => {
    if (headerEjectionPoint.value > 0) {
      const start = headerEjectionPoint.value - ScreenHeaderHeight + 11;
      const opacity = interpolate(
        scrollY.value,
        [0, start, start + ScreenHeaderHeight / 3.5],
        [1, 1, 0],
        Extrapolate.CLAMP,
      );

      return { opacity };
    }

    return {};
  });

  const ejectionShiftStyle = useAnimatedStyle(() => {
    if (headerEjectionPoint.value > 0) {
      const start = headerEjectionPoint.value - ScreenHeaderHeight;

      const y = interpolate(
        Math.max(0, scrollY.value),
        [0, start, start + ScreenHeaderHeight / 3.5],
        [0, 0, -(ScreenHeaderHeight / 3.5)],
      );

      return {
        transform: [{ translateY: y }],
      };
    }

    return {};
  });

  return (
    <>
      <View style={{ height: topInset }} />
      <Animated.View
        style={[
          styles.container,
          ejectionShiftStyle,
          { paddingTop: safeArea ? topInset : 0, position },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            backgroundStyle,
            styles.background,
            {
              height: ScreenHeaderHeight + topInset,
              backgroundColor: alternateBackground
                ? theme.backgroundPageAlternate
                : theme.backgroundPage,
            },
          ]}
        />
        <Animated.View style={[styles.innerContainer, ejectionOpacityStyle]}>
          <Animated.View style={[styles.largeContainer, largeWrapStyle]}>
            <Animated.View style={[styles.largeTextContainer, largeTitleStyle]}>
              <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
                <Text type="h1">{title}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.smallContainer, smallWrapStyle]}>
            <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
              <Animated.View style={[styles.smallTextContainer, smallTitleStyle]}>
                <Text type="h3">{title}</Text>
              </Animated.View>
            </TouchableOpacity>
            <Animated.View style={[styles.divider, dividerStyle]} />
          </Animated.View>
          <Animated.View style={[styles.rightContent, largeWrapStyle]}>
            {rightContent}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  background: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
  },
  innerContainer: {
    flexDirection: 'row',
    height: ScreenHeaderHeight,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  largeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    height: ScreenLargeHeaderHeight,
    flexDirection: 'row',
    paddingHorizontal: ns(16),
    paddingTop: ns(32),
  },
  rightContent: {
    position: 'absolute',
    paddingTop: ns(16),
    height: ScreenLargeHeaderHeight,
    right: ns(16),
    zIndex: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  largeTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: -1,
  },
  smallContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    height: ScreenHeaderHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ns(16),
  },
  smallTextContainer: {
    alignItems: 'center',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -StyleSheet.hairlineWidth,
    height: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
});
