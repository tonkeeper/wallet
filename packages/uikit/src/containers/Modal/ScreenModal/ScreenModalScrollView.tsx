import { View, StyleSheet, ScrollView } from 'react-native';
import { memo } from 'react';

interface ScreenModalScrollViewProps {
  children?: React.ReactNode;
}

export const ScreenModalScrollView = memo<ScreenModalScrollViewProps>((props) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {props.children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
