import { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalInputProps {}

export const ScreenModalInput = memo<ScreenModalInputProps>((props) => {
  return <View style={styles.container}></View>;
});

const styles = StyleSheet.create({
  container: {},
});
