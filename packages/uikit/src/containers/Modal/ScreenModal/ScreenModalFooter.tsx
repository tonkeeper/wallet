import { ReactNode, memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalFooterProps {
  children?: ReactNode;
}

export const ScreenModalFooter = memo<ScreenModalFooterProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
