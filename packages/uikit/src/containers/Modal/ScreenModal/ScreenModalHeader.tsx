import { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalHeaderProps {}

export const ScreenModalHeader = memo<ScreenModalHeaderProps>((props) => {
  return <View style={styles.container}></View>;
});

const styles = StyleSheet.create({
  container: {},
});
