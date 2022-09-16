import React from 'react';
import { Animated } from 'react-native';
import { ThemeContext } from 'styled-components/native';

import { deviceHeight, isAndroid, ns, safeAreaInsets, statusBarHeight } from '$utils';
import { modalInterpolator, popoutInterpolator } from '$navigation/interpolators';
import { TonTheme } from '$styled';

export const TransparentModalOptions: any = {
  presentation: 'transparentModal',
  gestureEnabled: true,
  cardStyle: {
    backgroundColor: 'transparent',
  },
  gestureDirection: 'vertical',
  cardOverlayEnabled: true,
  animationEnabled: true,
  gestureResponseDistance: deviceHeight,
  cardStyleInterpolator: popoutInterpolator,
};

export const ModalOptions: any = ({ route, navigation }) => {
  return {

  };


  // @ts-ignore
  const theme = ThemeContext._currentValue! as TonTheme;
  const top = ns(10) + statusBarHeight + safeAreaInsets.top;
  return {
    presentation: 'modal',
    gestureEnabled: !isAndroid,
    gestureDirection: 'vertical',
    gestureResponseDistance: deviceHeight,
    animationEnabled: true,
    cardOverlayEnabled: true,
    cardShadowEnabled: true,
    cardStyleInterpolator: modalInterpolator,
    cardStyle: {
      backgroundColor: theme.colors.backgroundPrimary,
      marginTop: top,
      height: deviceHeight - top,
      overflow: 'hidden',
      borderTopLeftRadius: ns(16),
      borderTopRightRadius: ns(16),
    },
    cardOverlay: ({ style }) => {
      return (
        <Animated.View
          style={[
            {
              backgroundColor: 'rgba(0, 0, 0, 0.42)',
              flex: 1,
              // @ts-ignore
              opacity: style
                ? style.opacity.interpolate({
                    inputRange: [0, 0.2],
                    outputRange: [0, 1],
                  })
                : 1,
            },
          ]}
        />
      );
    },
  };
};
