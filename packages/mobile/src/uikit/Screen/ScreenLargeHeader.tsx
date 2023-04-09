import React, { memo, useEffect } from 'react';
import { TouchableOpacity, Insets, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, SharedValue, Extrapolate } from 'react-native-reanimated';

import * as S from '../LargeNavBar/LargeNavBar.style';
import { deviceHeight, deviceWidth, hNs, ns } from '$utils';
import { Text } from '$uikit/Text/Text';
import { useScreenScroll } from './hooks';
import { useTheme } from '$hooks/useTheme';
import { ScreenHeaderHeight } from './ScreenHeader';

export const ScreenLargeHeaderDistance = ns(20);
export const ScreenLargeHeaderHeight = ns(88);

interface ScreenLargeHeaderProps {
  rightContent?: React.ReactNode;
  title: string;
  onPress?: () => void;
  hitSlop?: Insets;
  position?: 'absolute' | 'relative';
  safeArea?: boolean;
  border?: boolean;
  opacity?: SharedValue<number>;
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
  } = props;  

  const { scrollY, isLargeHeader, headerEjectionPoint } = useScreenScroll();
  const { top: topInset } = useSafeAreaInsets();

  useEffect(() => {
    isLargeHeader.value = 1;
  }, []);  

  const renderRightContent = React.useCallback(() => {
    if (rightContent) {
      return typeof rightContent === 'function' ? rightContent() : rightContent;
    }

    return null;
  }, [rightContent]);

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
        scale: interpolate(
          Math.min(0, scrollY.value),
          [0, -deviceHeight / 2],
          [1, 1.3],
        ),
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

  const theme = useTheme();

  return (
    <>
      <View style={{ height: topInset }} />
      <Animated.View
        style={[styles.container, ejectionShiftStyle, { paddingTop: safeArea ? topInset : 0, position }]}
        pointerEvents="box-none"
      >
        <Animated.View style={[
            backgroundStyle, 
            styles.background,
            { 
              height: ScreenHeaderHeight + topInset,
              backgroundColor: theme.colors.backgroundPrimary,
            }
          ]} 
        />
        <Animated.View style={[styles.innerContainer, ejectionOpacityStyle]}>
          {/* <Animated.View style={[
              backgroundStyle, 
              styles.background,
              { 
                height: ScreenHeaderHeight,
                backgroundColor: theme.colors.backgroundPrimary,
              }
            ]} 
          /> */}
          <S.LargeWrap style={largeWrapStyle}>
            <S.LargeTextWrap style={largeTitleStyle}>
              <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
                <Text variant="h1">{title}</Text>
              </TouchableOpacity>
            </S.LargeTextWrap>
          </S.LargeWrap>
          <S.SmallWrap style={smallWrapStyle}>
            <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
              <S.TextWrap style={smallTitleStyle}>
                <Text variant="h3">{title}</Text>
              </S.TextWrap>
            </TouchableOpacity>
            <S.NavBarDivider style={dividerStyle} />
          </S.SmallWrap>
          <S.RightContentWrap style={largeWrapStyle}>
            {renderRightContent()}
          </S.RightContentWrap>
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

  }
});
