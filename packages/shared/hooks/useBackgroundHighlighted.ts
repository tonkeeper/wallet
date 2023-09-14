import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@tonkeeper/uikit';

export const useBackgroundHighlighted = () => {
  const theme = useTheme();
  const isPressed = useSharedValue(0);
  const onPressIn = () => (isPressed.value = 1);
  const onPressOut = () => (isPressed.value = 0);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed.value,
      [0, 1],
      [theme.backgroundContentTint, theme.backgroundHighlighted],
    ),
  }));

  return {
    backgroundStyle,
    onPressOut,
    onPressIn,
  };
};
