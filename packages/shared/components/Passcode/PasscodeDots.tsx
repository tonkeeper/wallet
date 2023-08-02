import { StyleSheet, View } from 'react-native';
import { Haptics } from '@tonkeeper/uikit';
import {
  useImperativeHandle,
  useCallback,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Animated, {
  useAnimatedStyle,
  cancelAnimation,
  useSharedValue,
  withSequence,
  interpolate,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PasscodeDot } from './PasscodeDot';

interface PasscodeDotsProps {
  value: string;
}

export type PasscodeDotsRef = {
  triggerError: () => void;
  triggerSuccess: () => void;
  clearState: () => void;
};

export const PasscodeDots = forwardRef<PasscodeDotsRef, PasscodeDotsProps>(
  (props, ref) => {
    const { value } = props;

    const [isError, setError] = useState(false);
    const [isSuccess, setSuccess] = useState(false);

    const shake = useSharedValue(0);

    const onShakeCompleted = useCallback(() => {
      setTimeout(() => {
        setError(false);
      }, 200);
    }, []);

    useEffect(() => {
      if (isError) {
        const duration = 100;
        shake.value = withSequence(
          withTiming(1, { duration }),
          withTiming(-1, { duration }),
          withTiming(1, { duration }),
          withTiming(0, { duration }, () => {
            runOnJS(onShakeCompleted)();
          }),
        );
      } else {
        cancelAnimation(shake);
      }
    }, [isError, onShakeCompleted, shake]);

    useImperativeHandle(ref, () => ({
      triggerError() {
        setError(true);
        Haptics.notificationError();
      },
      triggerSuccess() {
        setSuccess(true);
        Haptics.notificationSuccess();
      },
      clearState() {
        setSuccess(false);
        setError(false);
      },
    }));

    const dotsCount = useMemo(() => {
      return new Array(4).fill(0);
    }, []);

    const style = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(shake.value, [-1, 0, 1], [-10, 0, 10], 'clamp'),
        },
      ],
    }));

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.dots, style]}>
          {dotsCount.map((_, i) => (
            <PasscodeDot
              key={i}
              index={i}
              isActive={value.length > i && !isError}
              isError={isError}
              isSuccess={isSuccess}
            />
          ))}
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dots: {
    flexDirection: 'row',
    width: 96,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
  },
});
