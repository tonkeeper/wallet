import { PropsWithChildren, memo } from 'react';
import { View, StyleSheet } from 'react-native';

export const DetailedInfoContainer = memo<PropsWithChildren>((props) => {
  return (
    <View style={styles.container}>
      {props.children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  }
});
