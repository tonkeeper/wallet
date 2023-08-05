import { memo, useCallback, useEffect } from 'react';
import { useTheme } from '@tonkeeper/uikit';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface PasscodeDotProps {
  isActive: boolean;
  isError: boolean;
  isSuccess: boolean;
  index: number;
}

export const PasscodeDot = memo<PasscodeDotProps>((props) => {
  const { isActive, isError, isSuccess, index } = props;
  const theme = useTheme();

  const scale = useSharedValue(0);
  const colorVal = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(scale);
    if (isActive || isSuccess) {
      scale.value = withSequence(
        withTiming(1, {
          duration: 100,
          easing: Easing.ease,
        }),
        withDelay(
          100,
          withTiming(0, {
            duration: 100,
            easing: Easing.ease,
          }),
        ),
      );
    } else {
      scale.value = withTiming(0, {
        duration: 100,
        easing: Easing.ease,
      });
    }
  }, [isActive, scale, isSuccess]);

  // useFocusEffect(
    useCallback(() => {
      colorVal.value = 0;
    }, [colorVal]),
  // );

  useEffect(() => {
    if (isError) {
      colorVal.value = withSequence(
        withTiming(2, {
          duration: 100,
          easing: Easing.linear,
        }),
        withDelay(
          100 * (3 - index),
          withTiming(3, {
            duration: 100,
            easing: Easing.linear,
          }),
        ),
      );
    } else if (isSuccess) {
      colorVal.value = withTiming(2, {
        duration: 100,
        easing: Easing.linear,
      });
    } else if (isActive) {
      colorVal.value = withTiming(1, {
        duration: 100,
        easing: Easing.linear,
      });
    } else {
      if (colorVal.value === 3) {
        colorVal.value = 0;
      } else {
        colorVal.value = withTiming(0, {
          duration: 100,
          easing: Easing.linear,
        });
      }
    }
  }, [colorVal, index, isActive, isError, isSuccess]);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [1, 1.33]),
        },
      ],
      backgroundColor: interpolateColor(
        colorVal.value,
        [0, 1, 2, 3],
        [
          theme.backgroundContentTint,
          theme.accentBlue,
          isSuccess ? theme.accentBlue : theme.accentRed,
          theme.backgroundContentTint,
        ],
      ),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
});

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
  },
});
