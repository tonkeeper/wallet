import { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { Haptics, Text } from '@tonkeeper/uikit';
import { StyleSheet, View } from 'react-native';
import { PasscodeDot } from './PasscodeDot';
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

interface PasscodeInputProps {
  length?: WithDefault<number, 4>;
  value: string;
  label: string;
}

export type PasscodeInputRef = {
  triggerError: () => void;
  triggerSuccess: () => void;
  clearState: () => void;
};

export const PasscodeInput = forwardRef<PasscodeInputRef, PasscodeInputProps>(
  (props, ref) => {
    const { value, label, length = 4 } = props;

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
      return new Array(length).fill(0);
    }, [length]);

    const style = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(shake.value, [-1, 0, 1], [-10, 0, 10], 'clamp'),
        },
      ],
    }));

    return (
      <View style={styles.container}>
        <Text type="h3">{label}</Text>
        <View style={styles.dotsContainer}>
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
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
    height: 12,
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
