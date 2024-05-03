import { TouchableWithoutFeedback, TextInput } from 'react-native';
import { memo } from 'react';
import { View } from '../../../components/View';
import { Steezy } from '../../../styles';

const onRelease = () => TextInput?.State?.currentlyFocusedInput()?.blur?.();

export interface ScreenModalProps {
  children?: React.ReactNode;
  blurOnBackgroundPress?: boolean;
  alternateBackground?: boolean;
}

export const ScreenModal = memo<ScreenModalProps>((props) => {
  if (props.blurOnBackgroundPress) {
    return (
      <View
        style={[
          styles.container,
          props.alternateBackground && styles.alternateBackground,
        ]}
      >
        <TouchableWithoutFeedback
          style={styles.touchableContainer.static}
          onPress={onRelease}
          accessible={false}
        >
          <View style={styles.touchableContainer}>{props.children}</View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
  return (
    <View
      style={[styles.container, props.alternateBackground && styles.alternateBackground]}
    >
      {props.children}
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flex: 1,
  },
  alternateBackground: {
    backgroundColor: colors.backgroundPageAlternate,
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
  },
}));
