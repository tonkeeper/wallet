import React, {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { PinCodeProps, PinCodeRef, PointProps } from './PinCode.interface';
import * as S from './PinCode.style';
import { useTheme } from '$hooks/useTheme';
import { triggerNotificationError, triggerNotificationSuccess } from '$utils';

const Point: FC<PointProps> = ({ isActive, isError, isSuccess, index }) => {
  const theme = useTheme();

  const scale = useSharedValue(0);
  const colorVal = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(scale);
    if (isActive || isSuccess) {
      scale.value = withSequence(
        withTiming(1, {
          duration: 100,
          easing: Easing.ease,
        }),
        withDelay(
          100,
          withTiming(0, {
            duration: 100,
            easing: Easing.ease,
          }),
        ),
      );
    } else {
      scale.value = withTiming(0, {
        duration: 100,
        easing: Easing.ease,
      });
    }
  }, [isActive, scale, isSuccess]);

  useFocusEffect(
    useCallback(() => {
      colorVal.value = 0;
    }, [colorVal]),
  );

  useEffect(() => {
    if (isError) {
      colorVal.value = withSequence(
        withTiming(2, {
          duration: 100,
          easing: Easing.linear,
        }),
        withDelay(
          100 * (3 - index),
          withTiming(3, {
            duration: 100,
            easing: Easing.linear,
          }),
        ),
      );
    } else if (isSuccess) {
      colorVal.value = withTiming(2, {
        duration: 100,
        easing: Easing.linear,
      });
    } else if (isActive) {
      colorVal.value = withTiming(1, {
        duration: 100,
        easing: Easing.linear,
      });
    } else {
      if (colorVal.value === 3) {
        colorVal.value = 0;
      } else {
        colorVal.value = withTiming(0, {
          duration: 100,
          easing: Easing.linear,
        });
      }
    }
  }, [colorVal, index, isActive, isError, isSuccess]);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [1, 1.33]),
        },
      ],
      backgroundColor: interpolateColor(
        colorVal.value,
        [0, 1, 2, 3],
        [
          theme.colors.backgroundTertiary,
          theme.colors.accentPrimary,
          isSuccess ? theme.colors.accentPositive : theme.colors.accentNegative,
          theme.colors.backgroundTertiary,
        ],
      ),
    };
  });

  return <S.Point style={style} />;
};

export const PinCode = forwardRef<PinCodeRef, PinCodeProps>((props, ref) => {
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

  const length = useMemo(() => {
    return value.length;
  }, [value]);

  useImperativeHandle(ref, () => ({
    triggerError() {
      setError(true);
      triggerNotificationError();
    },
    triggerSuccess() {
      setSuccess(true);
      triggerNotificationSuccess();
    },
    clearState() {
      setSuccess(false);
      setError(false);
    },
  }));

  const points = useMemo(() => {
    return new Array(4).fill(0);
  }, []);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(shake.value, [-1, 0, 1], [-10, 0, 10], 'clamp'),
        },
      ],
    };
  });

  return (
    <S.Wrap>
      <S.Points style={style}>
        {points.map((_, i) => (
          <Point
            key={i}
            index={i}
            isActive={length > i && !isError}
            isError={isError}
            isSuccess={isSuccess}
          />
        ))}
      </S.Points>
    </S.Wrap>
  );
});
