import { ReactNode, memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalProps {
  children?: ReactNode;
}

export const ScreenModal = memo<ScreenModalProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
