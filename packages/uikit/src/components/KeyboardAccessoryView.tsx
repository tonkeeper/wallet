import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { ViewStyle, StyleSheet, Keyboard } from 'react-native';
import { StyleProp } from '@bogoslavskiy/react-native-steezy';
import { isAndroid } from '../utils';
import { View } from './View';
import Animated, {
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface KeyboardAccessoryViewProps {
  visibleWithKeyboard?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export type KeyboardAccessoryViewRef = {
  hide: () => void;
  show: () => void;
};

export const KeyboardAccessoryView = forwardRef<
  KeyboardAccessoryViewRef,
  KeyboardAccessoryViewProps
>((props, ref) => {
  const { children, style, visibleWithKeyboard } = props;
  const visible = useSharedValue(visibleWithKeyboard ? 0 : 1);
  const keyboard = useAnimatedKeyboard();

  const heightStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: -keyboard.height.value }],
    }),
    [keyboard.height],
  );

  const opacityStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(visible.value, { duration: 0 }),
    }),
    [visible.value],
  );

  useImperativeHandle(
    ref,
    () => ({
      show() {
        visible.value = 1;
      },
      hide() {
        visible.value = 0;
      },
    }),
    [],
  );

  useEffect(() => {
    const hideEventName = isAndroid ? 'keyboardDidHide' : 'keyboardWillHide';
    const keyboardWillHideSub = Keyboard.addListener(hideEventName, () => {
      if (visibleWithKeyboard) {
        visible.value = 0;
      }
    });

    return () => {
      keyboardWillHideSub.remove();
    };
  }, []);

  return (
    <Animated.View style={[styles.keyboardAccessory, heightStyle, opacityStyle]}>
      <View style={style}>{children}</View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  keyboardAccessory: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});
