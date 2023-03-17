import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSkeletonAnimation } from './SkeletonContext';
import { ns } from '$utils';

interface SkeletonProps extends ViewProps {
  width?: number;
  height?: number;
}

export const SkeletonLineOpacityAnimation: React.FC<SkeletonProps> = ({
  width = 80,
  height: heightProp = 20,
  style,
  ...viewProps
}) => {
  const animation = useSkeletonAnimation();
  const xpos = useSharedValue(-1);
  const containerRef = React.useRef<View>(null);

  React.useEffect(() => {
    containerRef.current?.measureInWindow((x) => {
      xpos.value = x;
    });
  }, []);

  const animationStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animation.opacityAnimation.value, [0, 1], [0.32, 0.4]),
  }));

  const height = ns(heightProp);

  return (
    <Animated.View style={[styles.container, { width, height }, animationStyle, style]} />
  );
};
const flareWidth = ns(96);

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: '#2E3847',
    overflow: 'hidden',
  },
  gradient: {
    width: flareWidth,
  },
});
