import { Text, isAndroid } from '@tonkeeper/uikit';
import { StyleSheet } from 'react-native';

export const InputNumberPrefix = ({ index }: { index: number }) => (
  <Text style={styles.inputNumberText} color="textSecondary" type="body1">
    {index + 1}:
  </Text>
);

const styles = StyleSheet.create({
  inputNumberText: {
    textAlignVertical: isAndroid ? 'top' : 'auto',
    textAlign: 'right',
    width: 28,
    left: 10,
  },
});
