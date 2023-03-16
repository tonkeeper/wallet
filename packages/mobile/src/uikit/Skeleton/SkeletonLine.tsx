import React from 'react';
import { View, StyleSheet, useWindowDimensions, ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

export const SkeletonLine: React.FC<SkeletonProps> = ({
  width = 80,
  height: heightProp = 20,
  style,
  ...viewProps
}) => {
  const animation = useSkeletonAnimation();
  const dimensions = useWindowDimensions();
  const xpos = useSharedValue(-1);
  const containerRef = React.useRef<View>(null);

  React.useEffect(() => {
    containerRef.current?.measureInWindow((x) => {
      xpos.value = x;
    });
  }, []);

  const indent = dimensions.width - (xpos.value + width);
  const start = dimensions.width - width - indent + flareWidth;
  const end = width + indent;

  const animationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(animation.gradientAnimation.value, [0, 1], [-start, end]),
      },
    ],
  }));

  const height = ns(heightProp);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { width, height }, style]}
      {...viewProps}
    >
      <Animated.View style={[styles.gradientContainer, { height }, animationStyle]}>
        <LinearGradient
          colors={['rgba(46, 56, 71, 0)', '#2e38478e', 'rgba(46, 56, 71, 0)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { height }]}
        />
      </Animated.View>
    </View>
  );
};
const flareWidth = ns(96);

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: 'rgba(46, 56, 71, 0.44)',
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    borderRadius: 6,
    overflow: 'hidden',
    width: flareWidth,
  },
  gradient: {
    width: flareWidth,
  },
});
