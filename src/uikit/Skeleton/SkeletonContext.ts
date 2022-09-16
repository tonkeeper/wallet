import React from 'react';
import Animated from 'react-native-reanimated';

export const SkeletonContext = React.createContext<Animated.SharedValue<number> | null>(
  null,
);

export const useSkeletonAnimation = () => {
  const value = React.useContext(SkeletonContext);

  if (value === null) {
    throw new Error(' No SkeletonProvider');
  }

  return value;
};
