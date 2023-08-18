import Animated from 'react-native-reanimated';

import { Steezy, Text } from '@tonkeeper/uikit';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

interface BubbleProps {
  children?: React.ReactNode;
  text?: string;
}

export const CommentBubble = memo<BubbleProps>((props) => {
  const { text, children } = props;

  return (
    <Animated.View style={[styles.comment]}>
      {!!text ? <Text type="body2">{text}</Text> : children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  comment: {

  }
});
