import React from 'react';
import Animated from 'react-native-reanimated';

export interface ISkeletonContext {
  gradientAnimation: Animated.SharedValue<number>;
  opacityAnimation: Animated.SharedValue<number>;
}

export const SkeletonContext = React.createContext<ISkeletonContext | null>(null);

export const useSkeletonAnimation = () => {
  const value = React.useContext(SkeletonContext);

  if (value === null) {
    throw new Error(' No SkeletonProvider');
  }

  return value;
};
