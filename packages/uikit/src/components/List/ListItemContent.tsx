import { useContentHighlightStyle } from './useContentHighlightStyle';
import Animated from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import { memo } from 'react';

interface ListItemContentProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ListItemContent = memo<ListItemContentProps>((props) => {
  const { style, children } = props;
  const highlightStyle = useContentHighlightStyle();

  return <Animated.View style={[highlightStyle, style]}>{children}</Animated.View>;
});
