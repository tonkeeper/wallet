import { FC, ReactNode, memo } from 'react';
import { useReanimatedKeyboardHeight } from '../../utils/keyboard';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export const KeyboardAvoidingContainer: FC<{ children: ReactNode }> = memo(
  ({ children }) => {
    const { height } = useReanimatedKeyboardHeight();

    const animatedStyle = useAnimatedStyle(() => ({
      flex: 1,
      marginBottom: height.value,
      position: 'relative',
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  },
);
