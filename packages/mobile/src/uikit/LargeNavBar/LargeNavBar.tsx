import React, { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { TouchableOpacity, View } from 'react-native';

import * as S from './LargeNavBar.style';
import { LargeNavBarProps } from './LargeNavBar.interface';
import { deviceHeight, deviceWidth, hNs } from '$utils';
import { useTheme } from '$hooks';
import { Text } from '$uikit/Text/Text';

export const LargeNavBarInteractiveDistance = hNs(20);

export const LargeNavBar: FC<LargeNavBarProps> = (props) => {
  const {
    children,
    scrollTop,
    rightContent,
    bottomComponent,
    onPress,
    hitSlop,
    position = 'relative',
    safeArea = true,
    border = true,
  } = props;
  const { top: topInset } = useSafeAreaInsets();
  const theme = useTheme();

  const renderRightContent = React.useCallback(() => {
    if (rightContent) {
      return typeof rightContent === 'function' ? rightContent() : rightContent;
    }

    return null;
  }, [rightContent]);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollTop.value > 0 ? 1 : 0,
    };
  });

  const largeWrapStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          scrollTop.value > 0
            ? -Math.min(scrollTop.value, LargeNavBarInteractiveDistance)
            : position === 'absolute'
            ? -scrollTop.value
            : 0,
      },
    ],
  }));

  const largeTitleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -deviceWidth / 2,
      },
      {
        scale: interpolate(
          Math.min(0, scrollTop.value),
          [0, -deviceHeight / 2],
          [1, 1.3],
        ),
      },
      {
        translateX: deviceWidth / 2,
      },
    ],
    opacity: interpolate(
      Math.max(0, Math.min(scrollTop.value, LargeNavBarInteractiveDistance)),
      [0, LargeNavBarInteractiveDistance * 0.5, LargeNavBarInteractiveDistance],
      [1, 0, 0],
    ),
  }));

  const smallWrapStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor:
        border && scrollTop.value >= LargeNavBarInteractiveDistance + 1
          ? theme.colors.border
          : 'transparent',
      transform: [
        {
          translateY: interpolate(
            Math.min(Math.max(0, scrollTop.value), LargeNavBarInteractiveDistance),
            [0, LargeNavBarInteractiveDistance],
            [LargeNavBarInteractiveDistance, 0],
          ),
        },
      ],
      zIndex: scrollTop.value > LargeNavBarInteractiveDistance ? 5 : 1,
      opacity: interpolate(
        Math.max(0, Math.min(scrollTop.value, LargeNavBarInteractiveDistance)),
        [0, LargeNavBarInteractiveDistance * 0.5, LargeNavBarInteractiveDistance],
        [0, 0, 1],
      ),
    };
  });

  return (
    <>
      <S.Wrap
        style={{ paddingTop: safeArea ? topInset : 0, position }}
        pointerEvents="box-none"
      >
        <S.Background style={[backgroundStyle, { top: safeArea ? topInset : 0 }]} />
        <S.Cont>
          <S.LargeWrap style={largeWrapStyle}>
            <S.LargeTextWrap style={largeTitleStyle}>
              <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
                {bottomComponent ? (
                  <Text variant="h3" color="foregroundPrimary">
                    {children}
                  </Text>
                ) : (
                  <Text variant="h1">{children}</Text>
                )}
                {bottomComponent ? (
                  <S.LargeBottomComponentWrap>
                    {bottomComponent}
                  </S.LargeBottomComponentWrap>
                ) : null}
              </TouchableOpacity>
            </S.LargeTextWrap>
          </S.LargeWrap>
          <S.SmallWrap style={smallWrapStyle}>
            <TouchableOpacity disabled={!onPress} onPress={onPress} hitSlop={hitSlop}>
              <S.TextWrap>
                <Text variant="h3">{children}</Text>
                {bottomComponent ? (
                  <S.BottomComponentWrap>{bottomComponent}</S.BottomComponentWrap>
                ) : null}
              </S.TextWrap>
            </TouchableOpacity>
          </S.SmallWrap>
          <S.RightContentWrap style={largeWrapStyle}>
            {renderRightContent()}
          </S.RightContentWrap>
        </S.Cont>
      </S.Wrap>
      {safeArea ? <View style={{ height: topInset }} /> : false}
    </>
  );
};
