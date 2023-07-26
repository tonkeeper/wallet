import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalScrollViewProps {
  children?: React.ReactNode;
}

export const ScreenModalScrollView = memo<ScreenModalScrollViewProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
