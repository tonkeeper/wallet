import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

export const useRingAnimation = (delay: number = 0) => {
  const scale = useSharedValue(0);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.8 + scale.value,
    transform: [
      {
        scale: interpolate(scale.value, [0, 1], [0.4, 1]),
      },
    ],
  }));

  const start = () => {
    scale.value = withDelay(delay, withTiming(1, { duration: 700 }));
  };
  const restart = () => {
    scale.value = withTiming(-0.2, { duration: 400 }, () => {
      scale.value = withTiming(1, { duration: 800 });
    });
  };

  useEffect(() => {
    start();
  }, []);

  return {
    ringStyle,
    restart,
    start,
  };
};
