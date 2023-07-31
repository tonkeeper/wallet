import { memo } from 'react';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardHeight,  } from '../utils/keyboard';

interface KeyboardSpacerProps {}

export const KeyboardSpacer = memo<KeyboardSpacerProps>((props) => {
  const { keyboardHeight } = useReanimatedKeyboardHeight();

  const style = useAnimatedStyle(() => ({
    height: keyboardHeight.value,
  }));

  return <Animated.View style={style} />;
});
