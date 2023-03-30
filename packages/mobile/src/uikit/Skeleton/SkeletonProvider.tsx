import React from 'react';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SkeletonContext } from './SkeletonContext';

export const SkeletonProvider: React.FC = ({ children }) => {
  const gradientAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);

  React.useEffect(() => {
    gradientAnimation.value = withRepeat(
      withDelay(
        400,
        withTiming(1, {
          duration: 1200,
          easing: Easing.linear,
        }),
      ),
      Infinity,
    );

    opacityAnimation.value = withRepeat(
      withSequence(
        withDelay(
          300,
          withTiming(1, {
            duration: 300,
          }),
        ),
        withDelay(
          300,
          withTiming(0, {
            duration: 300,
          }),
        ),
      ),
      Infinity,
    );

    return () => {
      cancelAnimation(gradientAnimation);
      cancelAnimation(opacityAnimation);
    };
  }, []);

  return (
    <SkeletonContext.Provider value={{ gradientAnimation, opacityAnimation }}>
      {children}
    </SkeletonContext.Provider>
  );
};

