import React from 'react';
import { cancelAnimation, Easing, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { SkeletonContext } from './SkeletonContext';

export const SkeletonProvider: React.FC = ({ children }) => {
  const animation = useSharedValue(0);

  React.useEffect(() => {
    animation.value = withRepeat(
      withDelay(400, 
        withTiming(1, {
          duration: 1200,
          easing: Easing.linear,
        }),
      ),
      Infinity,
    );

    return () => cancelAnimation(animation);
  }, []);

  return (
    <SkeletonContext.Provider value={animation}>
      {children}
    </SkeletonContext.Provider>
  );
};

