import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalContentProps {
  children?: React.ReactNode;
}

export const ScreenModalContent = memo<ScreenModalContentProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
