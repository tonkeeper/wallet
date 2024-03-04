import { View, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native';
import { memo } from 'react';

const onRelease = () => TextInput?.State?.currentlyFocusedInput()?.blur?.();

export interface ScreenModalProps {
  children?: React.ReactNode;
  blurOnBackgroundPress?: boolean;
}

export const ScreenModal = memo<ScreenModalProps>((props) => {
  if (props.blurOnBackgroundPress) {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          style={styles.touchableContainer}
          onPress={onRelease}
          accessible={false}
        >
          <View style={styles.touchableContainer}>{props.children}</View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
  return <View style={styles.container}>{props.children}</View>;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
  },
});
