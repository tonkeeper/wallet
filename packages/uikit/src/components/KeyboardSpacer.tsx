import { memo } from 'react';

import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

interface KeyboardSpacerProps {}

export const KeyboardSpacer = memo<KeyboardSpacerProps>((props) => {
  const { height } = useAnimatedKeyboard();

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={style} />;
});
