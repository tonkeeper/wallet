import { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenModalScrollViewProps {}

export const ScreenModalScrollView = memo<ScreenModalScrollViewProps>((props) => {
  return <View style={styles.container}></View>;
});

const styles = StyleSheet.create({
  container: {},
});
