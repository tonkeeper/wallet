import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppState } from '$hooks';
import { FullWindowOverlay } from 'react-native-screens';
import { Steezy } from '$styles';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { View } from '$uikit';

export const BackgroundBlur: React.FC = () => {
  const state = useAppState();
  const [shouldHideOverlay, setShouldHideOverlay] = React.useState(true);

  useEffect(() => {
    if (state === 'active') {
      setTimeout(() => setShouldHideOverlay(true), 100);
    } else {
      setShouldHideOverlay(false);
    }
  }, [state]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      opacity: withTiming(state === 'active' ? 0 : 1, { duration: 100 }),
    };
  }, [state]);

  if (shouldHideOverlay) {
    return null;
  }

  return (
    <FullWindowOverlay style={styles.overlay.static}>
      <Animated.View style={containerStyle}>
        <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
        <View style={styles.whiteColor} />
      </Animated.View>
    </FullWindowOverlay>
  );
};

const styles = Steezy.create(({ colors }) => ({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  // additional color to make blur similar to primary background color
  whiteColor: {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    opacity: 0.32,
    position: 'absolute',
    backgroundColor: colors.backgroundPrimary,
    zIndex: 1000,
  },
}));
