import React, { memo } from 'react';
import { View } from '../View';
import { Steezy } from '../../styles';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  triggerImpactLight,
  triggerImpactMedium,
  triggerNotificationSuccess,
} from '@tonkeeper/mobile/src/utils';

export interface SlideButtonProps {
  onSuccessSlide: () => void;
  text: string;
}

const BUTTON_WIDTH = 76;

export const SlideButton = memo<SlideButtonProps>((props) => {
  const buttonStyle = Steezy.useStyle(styles.button);
  const leftOffset = useSharedValue(0);
  const maxOffset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(triggerImpactMedium)();
    })
    .onUpdate((e) => {
      leftOffset.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > maxOffset.value - BUTTON_WIDTH) {
        runOnJS(triggerNotificationSuccess)();
        leftOffset.value = withDelay(
          300,
          withTiming(0, { duration: e.translationX / 0.4 }),
        );
        return runOnJS(props.onSuccessSlide)();
      }
      runOnJS(triggerImpactLight)();
      leftOffset.value = withTiming(0, { duration: e.translationX / 0.4 });
    });

  const animatedButtonOffset = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: clamp(leftOffset.value, 0, maxOffset.value - BUTTON_WIDTH) },
      ],
    };
  });

  const textContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(leftOffset.value ? 0 : 1, { duration: 175 }),
    };
  });

  return (
    <View
      onLayout={(e) => (maxOffset.value = e.nativeEvent.layout.width)}
      style={styles.container}
    >
      <Animated.View style={textContainerStyle}>
        <Text color="textTertiary" fontWeight={'600'} type={'body1'}>
          {props.text}
        </Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[buttonStyle, animatedButtonOffset]}>
          <Icon name={'ic-arrow-right-outline-28'} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  button: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    width: BUTTON_WIDTH,
    backgroundColor: colors.accentBlue,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    height: 56,
    backgroundColor: colors.backgroundContent,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
