import { useCallback, useEffect, useRef } from 'react';
import { Animated, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { isAndroid } from '$utils';

export const useKeyboardHeight = (): Animated.Value => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  let keyboardHeight = useRef(new Animated.Value(0)).current;

  const keyboardWillShow = useCallback(
    (event) => {
      const paddingBottom = 0;

      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: bottomInset
          ? event.endCoordinates.height - bottomInset + paddingBottom
          : event.endCoordinates.height,
        useNativeDriver: false,
      }).start();
    },
    [bottomInset, keyboardHeight],
  );

  const keyboardWillHide = useCallback(
    (event) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
    [keyboardHeight],
  );

  useEffect(() => {
    const keyboardWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    );
    const keyboardWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    );

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
  }, []);

  return keyboardHeight;
};

export const useReanimatedKeyboardHeight = (options?: {
  onWillShow?: (opts: { duration: number; height: number; }) => void;
  onWillHide?: () => void;
  enableOnAndroid?: boolean;
}) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  let keyboardHeight = useSharedValue(0);

  const keyboardWillShow = useCallback(
    (event) => {
      const paddingBottom = 0;
      const height = bottomInset
        ? event.endCoordinates.height - bottomInset + paddingBottom
        : event.endCoordinates.height;

      keyboardHeight.value = withTiming(
        height,
        {
          duration: event.duration,
        },
      );

      if (options?.onWillShow) {
        options.onWillShow({ duration: event.duration, height });
      }
    },
    [bottomInset, keyboardHeight],
  );

  const keyboardWillHide = useCallback(
    (event) => {
      keyboardHeight.value = withTiming(0, {
        duration: event.duration,
      });

      if (options?.onWillHide) {
        options.onWillHide();
      }
    },
    [keyboardHeight],
  );

  useEffect(() => {
    const showEventName = isAndroid && options?.enableOnAndroid 
      ? 'keyboardDidShow'
      : 'keyboardWillShow';

    const hideEventName = isAndroid && options?.enableOnAndroid 
      ? 'keyboardDidHide'
      : 'keyboardWillHide'

    const keyboardWillShowSub = Keyboard.addListener(
      showEventName,
      keyboardWillShow,
    );
    const keyboardWillHideSub = Keyboard.addListener(
      hideEventName,
      keyboardWillHide,
    );

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
  }, []);

  const keyboardHeightStyle = useAnimatedStyle(() => ({
    marginBottom: keyboardHeight.value,
  }));

  return { keyboardHeightStyle, keyboardHeight };
};
