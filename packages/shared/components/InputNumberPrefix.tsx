import { Steezy, Text, View, isAndroid } from '@tonkeeper/uikit';
import { StyleSheet } from 'react-native';

export const InputNumberPrefix = ({ index }: { index: number }) => (
  <View style={styles.container}>
    <Text color="textSecondary" type="body1" textAlign="right">
      {index + 1}:
    </Text>
  </View>
);

const styles = Steezy.create({
  container: {
    flex: 1,
    width: 50,
    paddingRight: 12,
    justifyContent: 'center',
  },
});
