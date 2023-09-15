import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { usePressedItem } from './ListItemPressedContext';
import { useTheme } from '../../styles';

export const useContentHighlightStyle = () => {
  const isPressed = usePressedItem();
  const theme = useTheme();

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed.value,
      [0, 1],
      [theme.backgroundContentTint, theme.backgroundHighlighted],
    ),
  }));
};
