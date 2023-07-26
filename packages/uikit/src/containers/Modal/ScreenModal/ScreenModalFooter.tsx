import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalFooterProps {
  children?: React.ReactNode;
}

export const ScreenModalFooter = memo<ScreenModalFooterProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
