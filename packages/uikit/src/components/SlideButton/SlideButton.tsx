import React, { memo } from 'react';
import { View } from '../View';
import { Steezy, useTheme } from '../../styles';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  clamp,
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  triggerImpactLight,
  triggerImpactMedium,
  triggerNotificationSuccess,
} from '@tonkeeper/mobile/src/utils';

const GRADIENT_SOURCE = require('./gradient.png');
const GRADIENT_WIDTH = 168;

export interface SlideButtonProps {
  onSuccessSlide: () => void;
  text: string;
  disabled?: boolean;
}

const BUTTON_WIDTH = 92;

const SPRING_CONFIG = {
  mass: 1.5,
  damping: 90,
  stiffness: 300,
  overshootClamping: false,
  reduceMotion: ReduceMotion.Never,
};

export const SlideButton = memo<SlideButtonProps>((props) => {
  const buttonStyle = Steezy.useStyle(styles.button);
  const disabledButtonStyle = Steezy.useStyle(styles.buttonDisabled);
  const leftOffset = useSharedValue(0);
  const maxOffset = useSharedValue(0);
  const textWidth = useSharedValue(0);
  const theme = useTheme();

  const panGesture = Gesture.Pan()
    .enabled(!props.disabled)
    .onStart(() => {
      runOnJS(triggerImpactMedium)();
    })
    .onUpdate((e) => {
      leftOffset.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > maxOffset.value - BUTTON_WIDTH) {
        runOnJS(triggerNotificationSuccess)();
        leftOffset.value = withDelay(500, withSpring(0, SPRING_CONFIG));
        return runOnJS(props.onSuccessSlide)();
      }
      runOnJS(triggerImpactLight)();
      leftOffset.value = withSpring(0, SPRING_CONFIG);
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
      flex: 1,
      opacity: withTiming(props.disabled || leftOffset.value ? 0 : 1, { duration: 175 }),
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const startX = (maxOffset.value - textWidth.value) / 2 - GRADIENT_WIDTH;
    const endX = (maxOffset.value - textWidth.value) / 2 + textWidth.value;

    return {
      width: GRADIENT_WIDTH,
      height: '100%',
      transform: [
        {
          translateX: withRepeat(
            withSequence(
              withTiming(startX, { duration: 0 }),
              withDelay(
                1500,
                withTiming(endX, {
                  duration: 1000,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
              ),
            ),
            -1,
          ),
        },
      ],
    };
  });

  return (
    <View
      onLayout={(e) => (maxOffset.value = e.nativeEvent.layout.width)}
      style={styles.container}
    >
      <Animated.View style={textContainerStyle}>
        <MaskedView
          style={styles.flexOne.static}
          maskElement={
            <View style={styles.maskedTextContainer}>
              <Text
                color="textTertiary"
                fontWeight={'600'}
                type={'body1'}
                onLayout={(e) => (textWidth.value = e.nativeEvent.layout.width)}
              >
                {props.text}
              </Text>
            </View>
          }
        >
          <View style={styles.maskContainer}>
            <Animated.Image
              tintColor={theme.textPrimary}
              source={GRADIENT_SOURCE}
              style={gradientStyle}
            />
          </View>
        </MaskedView>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            buttonStyle,
            props.disabled && disabledButtonStyle,
            animatedButtonOffset,
          ]}
        >
          <Icon
            style={props.disabled && styles.iconDisabled.static}
            name={'ic-arrow-right-outline-28'}
            color="buttonPrimaryForeground"
          />
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
  },
  buttonDisabled: {
    backgroundColor: colors.buttonPrimaryBackgroundDisabled,
  },
  iconDisabled: {
    opacity: 0.48,
  },
  flexOne: {
    flex: 1,
  },
  maskedTextContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskContainer: {
    flex: 1,
    backgroundColor: colors.textTertiary,
  },
  gradient: {
    width: 168,
    height: '100%',
  },
}));
