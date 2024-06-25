import React, { memo, useEffect } from 'react';
import { View } from './View';
import { Steezy, useTheme } from '../styles';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface RadioProps {
  isSelected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export const Radio = memo<RadioProps>((props) => {
  const animationProgress = useSharedValue(props.isSelected ? 1 : 0);
  const colors = useTheme();

  useEffect(() => {
    animationProgress.value = withTiming(props.isSelected ? 1 : 0, { duration: 75 });
  }, [props.isSelected]);

  const dotStyle = useAnimatedStyle(
    () => ({
      height: 10,
      width: 10,
      borderRadius: 5,
      opacity: animationProgress.value,
      backgroundColor: colors.accentBlue,
    }),
    [],
  );

  const borderStyle = useAnimatedStyle(
    () => ({
      borderColor: interpolateColor(
        animationProgress.value,
        [0, 1],
        [colors.iconTertiary, colors.accentBlue],
      ),
    }),
    [],
  );

  return (
    <Animated.View
      style={[
        styles.container.static,
        props.disabled && styles.containerDisabled.static,
        borderStyle,
      ]}
    >
      <Animated.View style={dotStyle} />
    </Animated.View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  containerDisabled: {
    opacity: 0.3,
  },
}));
