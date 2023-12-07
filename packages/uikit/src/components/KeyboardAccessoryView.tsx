import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../styles';

interface KeyboardAccessoryViewProps {
  visibleWithKeyboard?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  gradient?: boolean;
  safeArea?: boolean;
}

export type KeyboardAccessoryViewRef = {
  hide: () => void;
  show: () => void;
};

export const KeyboardAccessoryView = forwardRef<
  KeyboardAccessoryViewRef,
  KeyboardAccessoryViewProps
>((props, ref) => {
  const { children, style, visibleWithKeyboard, gradient, safeArea } = props;
  const visible = useSharedValue(visibleWithKeyboard ? 0 : 1);
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const theme = useTheme();

  const heightStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: safeArea
            ? -Math.max(keyboard.height.value, safeAreaBottom)
            : -keyboard.height.value,
        },
      ],
    }),
    [keyboard.height, safeAreaBottom],
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

  const indent = useAnimatedStyle(() => ({
    paddingBottom: safeAreaBottom,
  }));

  return (
    <Animated.View style={[styles.keyboardAccessory, heightStyle, opacityStyle]}>
      {gradient && (
        <LinearGradient
          style={styles.gradient}
          colors={['rgba(21, 28, 41, 0)', theme.backgroundPage]}
          locations={[0, 1]}
        />
      )}
      <View style={[styles.content, style]}>{children}</View>
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
  gradient: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    zIndex: 2,
  },
});
