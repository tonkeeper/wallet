import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalProps {
  children?: React.ReactNode;
}

export const ScreenModal = memo<ScreenModalProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
