import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface ScreenModalHeaderProps {
  children?: React.ReactNode;
}

export const ScreenModalHeader = memo<ScreenModalHeaderProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {},
});
