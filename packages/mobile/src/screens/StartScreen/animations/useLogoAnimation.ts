import { Haptics } from '@tonkeeper/uikit';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export const useLogoAnimation = () => {
  const rotate = useSharedValue(0);
  const pos = useSharedValue(0);

  let iconRotate = useDerivedValue(() => {
    return interpolate(rotate.value, [0, 1], [0, 360]);
  });

  const logoRotateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: iconRotate.value + 'deg',
      },
    ],
  }));

  const logoPosStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pos.value, [0, 1], [-15, 0]),
      },
    ],
  }));

  // useEffect(() => {
  //   pos.value = withTiming(1, { duration: 400 });
  // }, [])

  return {
    logoRotateStyle,
    logoPosStyle,
    start: () => {
      Haptics.selection();
      const rand = (m: number) => Math.floor(Math.random() * m);
      rotate.value = withTiming(
        rand(10),
        {
          duration: 1000,
          easing: Easing.elastic(rand(4)),
        },
        () => runOnJS(Haptics.impactLight)(),
      );
    },
  };
};
