import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalInputProps {
  children?: React.ReactNode;
}

export const ScreenModalInput = memo<ScreenModalInputProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
