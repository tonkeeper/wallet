import { useTheme } from '$hooks';
import { TonThemeColor } from '$styled';
import { isAndroid } from '$utils';
import React, { FC, memo } from 'react';
import { View, ViewProps, requireNativeComponent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface NativeProps extends ViewProps {
  isOn: boolean;
  color: string;
}

interface Props extends Omit<NativeProps, 'color'> {
  color?: TonThemeColor;
}

// TODO: implement SpoilerView on Android
const SpoilerNative = isAndroid
  ? View
  : requireNativeComponent<NativeProps>('SpoilerView');

const SpoilerViewComponent: FC<Props> = ({ children, ...props }) => {
  const theme = useTheme();
  const color = props.color ? theme.colors[props.color] : theme.colors.foregroundPrimary;

  const style = useAnimatedStyle(
    () => ({ opacity: withTiming(props.isOn ? 0 : 1) }),
    [props.isOn],
  );

  return (
    <SpoilerNative {...props} color={color}>
      <Animated.View style={style}>{children}</Animated.View>
    </SpoilerNative>
  );
};

export const SpoilerView = memo(SpoilerViewComponent);
