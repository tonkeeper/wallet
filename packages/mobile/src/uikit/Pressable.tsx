import React, { useCallback, useMemo, useRef } from 'react';
import { 
  GestureResponderEvent,
  Pressable as NativePressable, 
  PressableProps as NativePressableProps,
  ViewStyle
} from 'react-native';

type TouchPosition = { pageX: number; pageY: number };

interface PressableProps extends NativePressableProps {
  underlayColor?: string;
}

export const Pressable = (props: PressableProps) => {
  const { onPress, onPressIn, onPressOut, style, underlayColor, ...other } = props;
  const [isPressed, setIsPressed] = React.useState(false); 
  const activeTouchPositionRef = useRef<TouchPosition | null>(null);

  // Fix press during swipe
  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;

    activeTouchPositionRef.current = { pageX, pageY };

    onPressIn?.(event);

    if (underlayColor) {
      setIsPressed(true);
    }
  }, [onPressIn, underlayColor]);

  const handlePressOut = useCallback((event: GestureResponderEvent) => {
    if (underlayColor) {
      setIsPressed(false);
    }

    onPressOut?.(event);
  }, [underlayColor]);

  const handlePress = useCallback((event: GestureResponderEvent) => {
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
  }, [onPress]);

  const pressableStyle = useMemo(() => {
    if (underlayColor && isPressed) {
      const bg = { backgroundColor: underlayColor };

      return [style, bg] as ViewStyle;
    }

    return style;
  }, [style, underlayColor, isPressed]);
  
  return (
    <NativePressable
      // onStartShouldSetResponder={() => true}
      style={pressableStyle}
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={handlePress} 
      {...other} 
    />
  );
};

