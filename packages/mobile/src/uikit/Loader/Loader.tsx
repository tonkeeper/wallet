import React, { FC, useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { LoaderProps, LoaderSizes } from './Loader.interface';
import * as S from './Loader.style';
import { ns } from '$utils';
import { useTheme } from '$hooks/useTheme';
import { Image, ImageRequireSource } from 'react-native';

const loaderSize: { [key in LoaderSizes]: number } = {
  xlarge: ns(64),
  large:  ns(32),
  medium: ns(24),
  small:  ns(16),
};

const loaderIcon: { [key in LoaderSizes]: ImageRequireSource } = {
  small: require('$assets/icons/png/ic-loader-small-16.png'),
  medium: require('$assets/icons/png/ic-loader-medium-24.png'),
  large: require('$assets/icons/png/ic-loader-large-32.png'),
  xlarge: require('$assets/icons/png/ic-loader-xlarge-64.png')
};

export const Loader: FC<LoaderProps> = (props) => {
  const rotate = useSharedValue(0);
  const theme = useTheme();

  const { size = 'medium', color = 'foregroundSecondary' } = props;

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      Infinity,
    );

    return () => cancelAnimation(rotate);
  }, [rotate]);


  const style = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: interpolate(rotate.value, [0, 1], [0, 360]) + 'deg',
      },
    ],
  }));

  const icon = loaderIcon[size];
  const sizePx = loaderSize[size];
  const sizeStyle = { width: sizePx, height: sizePx };
  const imageStyle = { 
    tintColor: theme.colors[color], 
  };

  return (
    <S.Wrap>
      <S.Loader style={[sizeStyle, style]}>
        <Image
          style={[sizeStyle, imageStyle]} 
          source={icon} 
        />
      </S.Loader>
    </S.Wrap>
  );
};
