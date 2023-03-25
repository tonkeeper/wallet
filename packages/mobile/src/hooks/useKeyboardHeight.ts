import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing as RNEasing, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { isAndroid, isIOS } from '$utils';

const IOS_CUBIC_BEZIER = [0.17, 0.59, 0.3, 0.9];

export const useKeyboardHeight = (): Animated.Value => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  let keyboardHeight = useRef(new Animated.Value(0)).current;

  const keyboardWillShow = useCallback(
    (event) => {
      const paddingBottom = 0;

      Animated.timing(keyboardHeight, {
        duration: event.duration,
        easing: RNEasing.bezier(
          IOS_CUBIC_BEZIER[0],
          IOS_CUBIC_BEZIER[1],
          IOS_CUBIC_BEZIER[2],
          IOS_CUBIC_BEZIER[3],
        ),
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
  onWillShow?: (opts: { duration: number; height: number }) => void;
  onWillHide?: () => void;
  enableOnAndroid?: boolean;
  animated: boolean;
}) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  let keyboardHeight = useSharedValue(0);

  const keyboardWillShow = useCallback(
    (event) => {
      const paddingBottom = 0;
      const height = bottomInset
        ? event.endCoordinates.height - bottomInset + paddingBottom
        : event.endCoordinates.height;

      if (options?.animated === false) {
        keyboardHeight.value = height;
      } else {
        keyboardHeight.value = withTiming(height, {
          duration: event.duration,
          easing: isIOS
            ? Easing.bezier(
                IOS_CUBIC_BEZIER[0],
                IOS_CUBIC_BEZIER[1],
                IOS_CUBIC_BEZIER[2],
                IOS_CUBIC_BEZIER[3],
              )
            : Easing.ease,
        });
      }

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
    const showEventName =
      isAndroid && options?.enableOnAndroid ? 'keyboardDidShow' : 'keyboardWillShow';

    const hideEventName =
      isAndroid && options?.enableOnAndroid ? 'keyboardDidHide' : 'keyboardWillHide';

    const keyboardWillShowSub = Keyboard.addListener(showEventName, keyboardWillShow);
    const keyboardWillHideSub = Keyboard.addListener(hideEventName, keyboardWillHide);

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
