import { memo } from 'react';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardHeight } from '../utils/keyboard';

interface KeyboardSpacerProps {}

export const KeyboardSpacer = memo<KeyboardSpacerProps>((props) => {
  const { height } = useReanimatedKeyboardHeight();

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={style} />;
});
