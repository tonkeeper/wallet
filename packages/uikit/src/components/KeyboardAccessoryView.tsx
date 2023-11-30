import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReanimatedKeyboardHeight } from '../utils/keyboard';
import { StyleProp } from '@bogoslavskiy/react-native-steezy';
import { ViewStyle, StyleSheet } from 'react-native';
import { View } from './View';
import { memo } from 'react';

interface KeyboardAccessoryViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  hidden?: boolean;
  height: number;
}

export const KeyboardAccessoryView = memo<KeyboardAccessoryViewProps>((props) => {
  const { children, style, height, hidden } = props;
  const keyboard = useReanimatedKeyboardHeight();
  const safeArea = useSafeAreaInsets();

  const heightStyle = useAnimatedStyle(
    () => ({
      height: keyboard.height.value + height + safeArea.bottom,
    }),
    [keyboard.height, height, safeArea.bottom],
  );

  const opacityStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(!hidden ? 1 : 0, { duration: 100 }),
    }),
    [hidden],
  );

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
