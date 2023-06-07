import { ReactNode, memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalContentProps {
  children?: ReactNode;
}

export const ScreenModalContent = memo<ScreenModalContentProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
