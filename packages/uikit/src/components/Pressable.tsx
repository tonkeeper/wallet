import {
  GestureResponderEvent,
  Pressable as NativePressable,
  PressableProps as NativePressableProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleProp } from '@bogoslavskiy/react-native-steezy';
import { useCallback, useMemo, useRef } from 'react';
import { Steezy } from '../styles';

const { useStyle } = Steezy;

const AnimatedPressable = Animated.createAnimatedComponent(NativePressable);

type TouchPosition = { pageX: number; pageY: number };

interface PressableProps extends Omit<NativePressableProps, 'style'> {
  underlayColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const Pressable = (props: PressableProps) => {
  const {
    onPress,
    onPressIn,
    onPressOut,
    style: inputStyle,
    underlayColor,
    backgroundColor = 'transparent',
    ...other
  } = props;
  const style = useStyle(inputStyle);
  const activeTouchPositionRef = useRef<TouchPosition | null>(null);
  const moveTouchPositionRef = useRef<TouchPosition | null>(null);
  const isPressed = useSharedValue(0);

  // Fix press during swipe
  const setUnderlayColor = useCallback(() => {
    if (!moveTouchPositionRef.current || !activeTouchPositionRef.current) {
      return;
    }

    const { pageX, pageY } = moveTouchPositionRef.current;

    const absX = Math.abs(activeTouchPositionRef.current.pageX - pageX);
    const absY = Math.abs(activeTouchPositionRef.current.pageY - pageY);

    const dragged = absX > 2 || absY > 2;
    if (!dragged) {
      isPressed.value = 1;
    }
  }, []);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;

      activeTouchPositionRef.current = { pageX, pageY };
      moveTouchPositionRef.current = { pageX, pageY };

      setTimeout(setUnderlayColor, 50); // Delay 50 millisec

      onPressIn?.(event);
    },
    [onPressIn, setUnderlayColor, underlayColor],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      isPressed.value = 0;
      onPressOut?.(event);
    },
    [underlayColor],
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (!activeTouchPositionRef.current) {
        return;
      }

      const { pageX, pageY } = event.nativeEvent;

      const absX = Math.abs(activeTouchPositionRef.current.pageX - pageX);
      const absY = Math.abs(activeTouchPositionRef.current.pageY - pageY);

      const dragged = absX > 2 || absY > 2;
      if (!dragged) {
        onPress?.(event);
      }
    },
    [onPress],
  );

  const handleMove = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    moveTouchPositionRef.current = { pageX, pageY };
  }, []);

  const underlayStyle = useAnimatedStyle(() => {
    if (underlayColor) {
      return {
        backgroundColor: interpolateColor(
          isPressed.value,
          [0, 1],
          [backgroundColor, underlayColor],
        ),
      };
    }

    return {};
  }, [underlayColor, backgroundColor]);

  const pressableStyle = useMemo(() => [style, underlayStyle], [style, underlayStyle]);

  return (
    <AnimatedPressable
      style={pressableStyle}
      onPressOut={handlePressOut}
      onTouchMove={handleMove}
      onPressIn={handlePressIn}
      onPress={handlePress}
      {...other}
    />
  );
};
